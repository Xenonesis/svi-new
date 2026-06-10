import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { Resend } from 'resend';

/**
 * Resend Inbound Email Webhook
 *
 * Configure in Resend Dashboard:
 * 1. Go to https://resend.com/emails/receiving → Add inbound address
 * 2. Set webhook URL: https://sviiinfrasolutions.com/api/webhooks/resend/incoming
 *
 * IMPORTANT: Resend's inbound webhook does NOT include email body/HTML.
 * It only sends metadata. We must call resend.emails.receiving.get() to fetch the body.
 *
 * Resend sends POST with JSON body:
 * {
 *   "type": "email.received",
 *   "created_at": "...",
 *   "data": {
 *     "email_id": "56761188-7520-42d8-8898-ff6fc54ce618",
 *     "created_at": "...",
 *     "from": "Sender Name <sender@example.com>",
 *     "to": ["inbound@sviiinfrasolutions.com"],
 *     "cc": [],
 *     "bcc": [],
 *     "subject": "...",
 *     "attachments": []
 *   }
 * }
 */

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY environment variable');
  return new Resend(apiKey);
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    // Only handle email.received events
    if (payload.type !== 'email.received') {
      console.log(`[WEBHOOK] Ignoring event type: ${payload.type}`);
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
      console.log(`[WEBHOOK] Duplicate email ignored: ${emailId}`);
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
      const resend = getResend();
      // resend.emails.receiving.get() fetches the full inbound email body
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
      console.log(
        `[WEBHOOK] Fetched email body for ${emailId}: html=${!!htmlContent}, text=${!!textContent}, attachments=${attachments?.length ?? 0}`
      );
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
      const isColMissing = (msg: string) =>
        msg?.includes('column') && msg?.includes('of relation');
      const isDuplicate = (msg: string) => msg?.includes('duplicate key');

      if (isDuplicate(error.message)) {
        console.log(`[WEBHOOK] Duplicate on insert, ignoring: ${emailId}`);
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

    console.log(`[WEBHOOK] ✅ Stored email: "${data.subject}" from ${fromEmail} (id: ${emailId})`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK] Error:', error);
    return handleApiError(error);
  }
}
