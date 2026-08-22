import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { Resend } from 'resend';

/**
 * Resend Webhook — Inbound + Full Lifecycle Ingestion
 *
 * Configure in Resend Dashboard:
 * 1. https://resend.com/emails/receiving → Add inbound address
 * 2. Webhook: https://www.sviinfrasolutions.com/api/webhooks/resend/incoming
 *    → Register events: email.sent, email.delivered, email.opened,
 *      email.clicked, email.bounced, email.complained
 *
 * Signature: Resend signs with svix (HMAC-SHA256). We verify against the RAW
 * body before parsing — fail closed when verification is unavailable.
 *
 * Event payloads handled:
 *   email.received   → stored in email_inbox (body fetched from Resend API)
 *   email.sent       → outbound tracking row (email_messages)
 *   email.delivered  → delivered_at + status
 *   email.opened     → open_count++, first_opened_at, logs IP / user-agent
 *   email.clicked    → click_count++, first_clicked_at, logs exact URL
 *   email.bounced    → bounced_at, hard-bounce recipient suppressed
 *   email.complained → complained_at, recipient suppressed from future mail
 *
 * All lifecycle events are persisted to email_events (idempotency-key
 * deduped) and aggregated onto email_messages so the admin UI never relies on
 * Resend rate limits for tracking history.
 */

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY environment variable');
  return new Resend(apiKey);
}

/** Event precedence — higher value wins as the message's canonical status. */
const EVENT_PRECEDENCE: Record<string, number> = {
  sent: 0,
  delivered: 1,
  opened: 2,
  clicked: 3,
  bounced: 4,
  complained: 5,
};

const LIFECYCLE_EVENT_TYPES = new Set([
  'email.sent',
  'email.delivered',
  'email.opened',
  'email.clicked',
  'email.bounced',
  'email.complained',
]);

/** Normalize a string/array of "Name <email>" recipients into bare emails. */
function extractRecipientEmails(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  const emails: string[] = [];
  for (const entry of raw) {
    if (typeof entry !== 'string') continue;
    const m = entry.match(/<([^>]+)>/);
    const email = (m ? m[1] : entry).trim().toLowerCase();
    if (email) emails.push(email);
  }
  return emails;
}

/**
 * Handle a lifecycle event (sent / delivered / opened / clicked / bounced /
 * complained). Idempotent: duplicate webhook deliveries are ignored via the
 * unique idempotency_key on email_events.
 */
async function handleLifecycleEvent(payload: any) {
  const data = payload.data;
  if (!data) throw AppError.badRequest('Missing data in payload');

  const emailId = data.email_id || data.id;
  if (!emailId) {
    console.error('[WEBHOOK] Missing email_id. Payload:', JSON.stringify(payload).slice(0, 500));
    throw AppError.badRequest('Missing email_id in payload');
  }

  const eventType = String(payload.type || '').replace(/^email\./, '');
  const occurredAt = payload.created_at || data.created_at || new Date().toISOString();
  const recipients = extractRecipientEmails(data.to ?? data.recipient);
  const toArray = data.to ?? data.recipient ?? [];

  // Per-event enrichment
  const ip = typeof data.ip === 'string' ? data.ip : null;
  const client = data.client || data.device;
  const userAgent =
    (typeof data.user_agent === 'string' && data.user_agent) ||
    (client ? [client.name, client.os, client.device].filter(Boolean).join(' / ') || null : null);
  const clickedUrl = typeof data.link === 'string' ? data.link : data.url || null;

  let bounceType: string | null = null;
  let bounceReason: string | null = null;
  if (eventType === 'bounced') {
    const bounce = data.bounce;
    if (bounce && typeof bounce === 'object') {
      bounceType = typeof bounce.type === 'string' ? bounce.type : null;
      bounceReason = bounce.message || bounce.reason || bounce.description || null;
    }
    bounceType = bounceType || data.bounce_type || null;
    bounceReason = bounceReason || data.reason || data.error || null;
  }

  // ── 1. Immutable audit log (idempotent) ─────────────────────────────────
  const idempotencyKey = clickedUrl
    ? `${emailId}:${eventType}:${occurredAt}:${clickedUrl}`
    : `${emailId}:${eventType}:${occurredAt}`;

  // Duplicate delivery of the same event → acknowledge, skip re-processing
  const { data: dedupeRow } = await supabaseAdmin
    .from('email_events')
    .select('id')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (dedupeRow) {
    return NextResponse.json({ received: true, event: eventType, duplicate: true });
  }

  const { error: eventError } = await supabaseAdmin.from('email_events').upsert(
    {
      idempotency_key: idempotencyKey,
      email_id: emailId,
      event_type: eventType,
      occurred_at: occurredAt,
      ip,
      user_agent: userAgent,
      url: clickedUrl,
      bounce_type: bounceType,
      bounce_reason: bounceReason,
      raw: payload,
    },
    { onConflict: 'idempotency_key' }
  );

  if (eventError) {
    console.error('[WEBHOOK] Failed to log event to email_events:', eventError);
  }

  // ── 2. Aggregate onto email_messages ────────────────────────────────────
  const { data: existing } = await supabaseAdmin
    .from('email_messages')
    .select('*')
    .eq('resend_id', emailId)
    .maybeSingle();

  const row: Record<string, any> = existing
    ? { ...existing }
    : {
        resend_id: emailId,
        subject: data.subject || null,
        from_email: data.from || null,
        to_emails: recipients,
        status: eventType,
        last_event: eventType,
        sent_at: occurredAt,
      };

  row.updated_at = new Date().toISOString();

  switch (eventType) {
    case 'sent':
      row.sent_at = row.sent_at || occurredAt;
      break;
    case 'delivered':
      row.delivered_at = occurredAt;
      break;
    case 'opened':
      row.open_count = (row.open_count || 0) + 1;
      if (!row.first_opened_at) row.first_opened_at = occurredAt;
      break;
    case 'clicked':
      row.click_count = (row.click_count || 0) + 1;
      if (!row.first_clicked_at) row.first_clicked_at = occurredAt;
      break;
    case 'bounced':
      row.bounced_at = occurredAt;
      break;
    case 'complained':
      row.complained_at = occurredAt;
      break;
  }

  // Keep metadata + recipients when the row predates this event
  if (!existing) {
    if (!row.from_email && data.from) row.from_email = data.from;
    if (!row.subject && data.subject) row.subject = data.subject;
    if (toArray && (!row.to_emails || row.to_emails.length === 0)) {
      row.to_emails = recipients;
    }
  }

  // Status precedence: complained > bounced > clicked > opened > delivered > sent
  const candidateRank = EVENT_PRECEDENCE[eventType] ?? 0;
  const currentRank = EVENT_PRECEDENCE[row.status] ?? 0;
  if (candidateRank >= currentRank) {
    row.status = eventType;
    row.last_event = eventType;
  }

  const { error: msgError } = await supabaseAdmin
    .from('email_messages')
    .upsert(row, { onConflict: 'resend_id' });

  if (msgError) {
    console.error('[WEBHOOK] Failed to upsert email_messages:', msgError);
  }

  // ── 3. Suppression side-effects ─────────────────────────────────────────
  if (recipients.length > 0) {
    // Complaint → always suppress from future marketing mail
    if (eventType === 'complained') {
      for (const email of recipients) {
        await supabaseAdmin
          .from('email_suppressions')
          .upsert(
            { email, reason: 'complained', source: 'resend-webhook' },
            { onConflict: 'email' }
          );
      }
      console.warn(`[WEBHOOK] Suppressed ${recipients.join(', ')} (complaint)`);
    }
    // Hard bounce → flag as undeliverable; soft bounces kept for retry
    else if (eventType === 'bounced' && bounceType === 'hard') {
      for (const email of recipients) {
        await supabaseAdmin
          .from('email_suppressions')
          .upsert(
            { email, reason: 'hard_bounce', source: 'resend-webhook' },
            { onConflict: 'email' }
          );
      }
      console.warn(`[WEBHOOK] Suppressed hard-bounced: ${recipients.join(', ')}`);
    }
  }

  return NextResponse.json({ received: true, event: eventType });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // ── Signature verification (REQUIRED) ─────────────────────────────────
    // Verify the webhook genuinely came from Resend (svix HMAC-SHA256).
    // Must use the RAW body — parsing JSON first would break verification.
    // Fail closed: reject unverifiable requests instead of processing them.
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[WEBHOOK] RESEND_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook verification not configured' }, { status: 503 });
    }

    let resend: Resend;
    try {
      resend = getResend();
    } catch (keyErr) {
      console.error('[WEBHOOK] Resend client unavailable:', keyErr);
      return NextResponse.json({ error: 'Webhook verification not configured' }, { status: 503 });
    }

    try {
      resend.webhooks.verify({
        payload: rawBody,
        headers: {
          id: request.headers.get('svix-id') ?? '',
          timestamp: request.headers.get('svix-timestamp') ?? '',
          signature: request.headers.get('svix-signature') ?? '',
        },
        webhookSecret,
      });
    } catch (verifyErr) {
      console.error('[WEBHOOK] Signature verification failed:', verifyErr);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    // ── Lifecycle events (delivered / opened / clicked / bounced / complained) ──
    if (LIFECYCLE_EVENT_TYPES.has(payload.type)) {
      return handleLifecycleEvent(payload);
    }

    // Only email.received handled below; anything else is acknowledged + ignored
    if (payload.type !== 'email.received') {
      return NextResponse.json({ received: true, ignored: true });
    }

    // Resend inbound webhook: email data is in payload.data
    const data = payload.data;
    if (!data) {
      throw AppError.badRequest('Missing data in payload');
    }

    // IMPORTANT: Resend uses "email_id" for inbound (not "id")
    const emailId = data.email_id || data.id;
    if (!emailId) {
      console.error('[WEBHOOK] Missing email_id. Payload:', JSON.stringify(data).slice(0, 500));
      throw AppError.badRequest('Missing email_id in payload');
    }

    // Check for duplicate
    const { data: existing } = await supabaseAdmin
      .from('email_inbox')
      .select('id')
      .eq('email_id', emailId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Extract sender name and email from "Name <email>" format
    const fromRaw = data.from || '';
    let fromEmail = fromRaw;
    let fromName = '';
    const nameMatch = fromRaw.match(/^"?([^"<]*)"?\s*<([^>]+)>/);
    if (nameMatch) {
      fromName = nameMatch[1].trim();
      fromEmail = nameMatch[2].trim();
    }

    // Extract recipient emails
    const toEmails: string[] = [];
    const rawTo = data.to || [];
    (Array.isArray(rawTo) ? rawTo : [rawTo]).forEach((addr: string) => {
      const m = addr.match(/<([^>]+)>/);
      toEmails.push(m ? m[1] : addr);
    });

    // Fetch the full email body from Resend API
    // (Resend webhook does NOT include html/text in the payload — must fetch separately)
    let htmlContent: string | null = null;
    let textContent: string | null = null;
    let attachments: any[] | null = null;

    try {
      // resend is already constructed and verified above
      const { data: emailData, error: fetchError } = await resend.emails.receiving.get(emailId);
      if (fetchError) {
        console.warn('[WEBHOOK] Resend API error fetching email body:', fetchError);
      } else {
        htmlContent = (emailData as any)?.html || null;
        textContent = (emailData as any)?.text || null;
        // Attachments may come from the full fetch or the webhook payload
        const fetchedAttachments = (emailData as any)?.attachments;
        const payloadAttachments = data.attachments;
        const rawAttachments = fetchedAttachments || payloadAttachments;
        if (rawAttachments && Array.isArray(rawAttachments) && rawAttachments.length > 0) {
          // Strip binary content for storage — keep only metadata
          attachments = rawAttachments.map((att: any) => ({
            filename: att.filename || att.name || null,
            content_type: att.content_type || att.type || null,
            size: att.size || null,
            // Keep base64 content if present (for download) — limit to 5 MB per attachment
            content:
              att.content && typeof att.content === 'string' && att.content.length < 5_000_000
                ? att.content
                : null,
          }));
        }
      }
    } catch (fetchErr) {
      // If fetching fails, still store the email metadata — body will be empty
      console.warn('[WEBHOOK] Could not fetch full email body:', fetchErr);
    }

    // Store in database
    const insertData: Record<string, any> = {
      email_id: emailId,
      thread_id: data.thread_id || data.message_id || emailId,
      subject: data.subject || '(No Subject)',
      from_email: fromEmail,
      from_name: fromName || null,
      to_emails: toEmails,
      html_content: htmlContent,
      text_content: textContent,
      received_at: data.created_at || payload.created_at || new Date().toISOString(),
      status: 'received',
      attachments: attachments && attachments.length > 0 ? attachments : null,
    };

    const { error } = await supabaseAdmin.from('email_inbox').insert(insertData);

    if (error) {
      const isColMissing = (msg: string) => msg?.includes('column') && msg?.includes('of relation');
      const isDuplicate = (msg: string) => msg?.includes('duplicate key');

      if (isDuplicate(error.message)) {
        return NextResponse.json({ received: true, duplicate: true });
      }

      if (isColMissing(error.message)) {
        // Some columns may not exist yet — fall back by removing optional ones
        const { from_name: _fn, attachments: _att, ...safeData } = insertData;
        const { error: error2 } = await supabaseAdmin.from('email_inbox').insert(safeData);
        if (error2 && !isDuplicate(error2.message)) {
          console.error('[WEBHOOK] Failed to store email (fallback):', error2);
          throw AppError.internal('Failed to store incoming email');
        }
        return NextResponse.json({ received: true });
      }

      console.error('[WEBHOOK] Failed to store email:', error);
      throw AppError.internal('Failed to store incoming email');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK] Error:', error);
    return handleApiError(error);
  }
}
