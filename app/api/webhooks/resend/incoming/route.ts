import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import crypto from 'crypto';

/**
 * Resend Inbound Email Webhook
 *
 * Configure in Resend Dashboard:
 * 1. Go to https://resend.com/domains → Add inbound domain
 * 2. Set MX records in your DNS provider
 * 3. Set webhook URL: https://yourdomain.com/api/webhooks/resend/incoming
 * 4. Add signing secret to .env.local: RESEND_WEBHOOK_SECRET
 *
 * Resend sends POST with JSON body:
 * {
 *   "type": "email.received",
 *   "data": {
 *     "id": "...",
 *     "thread_id": "...",
 *     "subject": "...",
 *     "from": "Sender Name <sender@example.com>",
 *     "to": ["inbound@yourdomain.com"],
 *     "cc": [],
 *     "bcc": [],
 *     "html": "<html>...</html>",
 *     "text": "...",
 *     "created_at": "2025-06-10T10:00:00Z",
 *     "attachments": [...]
 *   }
 * }
 */

function verifyResendWebhook(payload: string, signature: string | null): boolean {
  if (!signature) return false;
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return true; // Skip if not configured — log warning
  try {
    // Resend uses HMAC-SHA256
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('resend-signature') || null;

    // Log if webhook secret is not configured
    if (!process.env.RESEND_WEBHOOK_SECRET) {
      console.warn(
        '[WEBHOOK] RESEND_WEBHOOK_SECRET not set — signatures not verified. Set it in .env.local for production.'
      );
    } else if (!verifyResendWebhook(rawBody, signature)) {
      console.error('[WEBHOOK] Invalid Resend webhook signature');
      throw AppError.unauthorized('Invalid webhook signature');
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    // Handle Resend inbound email format
    const data = payload.data || payload;
    const emailId = data.id;
    if (!emailId) {
      throw AppError.badRequest('Missing email ID in payload');
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

    // Store in database — only use columns that exist in email_inbox table
    const insertData: Record<string, any> = {
      email_id: emailId,
      thread_id: data.thread_id || emailId,
      subject: data.subject || '(No Subject)',
      from_email: fromEmail,
      to_emails: toEmails,
      html_content: data.html || null,
      text_content: data.text || null,
      received_at: data.created_at || new Date().toISOString(),
      status: 'received',
    };

    const { error } = await supabaseAdmin.from('email_inbox').insert(insertData);

    if (error) {
      if (error.message?.includes('duplicate key')) {
        return NextResponse.json({ received: true, duplicate: true });
      }
      console.error('[WEBHOOK] Failed to store email:', error);
      throw AppError.internal('Failed to store incoming email');
    }

    console.log(`[WEBHOOK] Received email: "${data.subject}" from ${fromEmail}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK] Error:', error);
    return handleApiError(error);
  }
}
