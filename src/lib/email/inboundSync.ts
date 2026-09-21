import type { Resend } from 'resend';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { ensureAttachmentBucket } from './attachments';

let lastInboundSyncAt = 0;
export const INBOUND_SYNC_COOLDOWN_MS = 30_000; // 30s cooldown between Resend API inbound syncs

interface ResendReceivedEmail {
  id: string;
  created_at?: string;
  from?: string;
  to?: string[] | string;
  subject?: string;
  html?: string;
  text?: string;
  thread_id?: string;
  message_id?: string;
  attachments?: Array<{
    filename?: string;
    name?: string;
    content_type?: string;
    type?: string;
    size?: number;
    content?: string;
  }>;
}

interface NormalizedAttachment {
  filename: string;
  content_type: string;
  size: number | null;
  content: string | null;
  url: string | null;
}

/**
 * Synchronizes inbound emails from Resend receiving API into Supabase email_inbox and email_attachments.
 * Deduplicates against existing records and uploads base64 attachments to Supabase Storage.
 */
export async function syncInboundEmails(resend: Resend, force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastInboundSyncAt < INBOUND_SYNC_COOLDOWN_MS) {
    return;
  }
  lastInboundSyncAt = now;

  try {
    await ensureAttachmentBucket();
    const resendEmails = await resend.emails.receiving.list();
    const rawData = resendEmails.data as
      { data?: ResendReceivedEmail[] } | ResendReceivedEmail[] | null;
    const emails: ResendReceivedEmail[] = Array.isArray(rawData)
      ? rawData
      : rawData && 'data' in rawData && Array.isArray(rawData.data)
        ? rawData.data
        : [];

    if (emails.length === 0) return;

    const emailIds = emails.map((e) => e.id).filter(Boolean);
    if (emailIds.length === 0) return;

    const { data: existingRecords, error: checkError } = await supabaseAdmin
      .from('email_inbox')
      .select('email_id')
      .in('email_id', emailIds);

    if (checkError) {
      console.error('[SYNC] Error checking existing emails in database:', checkError);
      return;
    }

    const existingIds = new Set(
      (existingRecords || []).map((r: { email_id: string }) => r.email_id)
    );
    const missingEmails = emails.filter((e) => !existingIds.has(e.id));

    if (missingEmails.length === 0) return;

    // Process missing emails in parallel batches (concurrency = 5)
    const CONCURRENCY = 5;
    const syncEmail = async (e: ResendReceivedEmail) => {
      const emailId = e.id;
      try {
        const { data: emailData, error: fetchError } = await resend.emails.receiving.get(emailId);
        if (fetchError || !emailData) {
          console.error(`[SYNC] Error fetching email details for ${emailId}:`, fetchError);
          return;
        }

        const receivedEmail = emailData as ResendReceivedEmail;
        const fromRaw = receivedEmail.from || '';
        let fromEmail = fromRaw;
        let fromName = '';
        const nameMatch = fromRaw.match(/^"?([^"<]*)"?\s*<([^>]+)>/);
        if (nameMatch) {
          fromName = nameMatch[1].trim();
          fromEmail = nameMatch[2].trim();
        }

        const toEmails: string[] = [];
        const rawTo = receivedEmail.to || [];
        (Array.isArray(rawTo) ? rawTo : [rawTo]).forEach((addr: string) => {
          const m = addr.match(/<([^>]+)>/);
          toEmails.push(m ? m[1] : addr);
        });

        const rawAttachments = receivedEmail.attachments;
        const normalizedAttachments: NormalizedAttachment[] = [];
        if (rawAttachments && Array.isArray(rawAttachments) && rawAttachments.length > 0) {
          for (const att of rawAttachments) {
            const filename = att.filename || att.name || 'unnamed_attachment';
            const content_type = att.content_type || att.type || 'application/octet-stream';
            const size = att.size || null;
            const content =
              att.content && typeof att.content === 'string' && att.content.length < 5_000_000
                ? att.content
                : null;

            let url = null;
            if (content) {
              const buffer = Buffer.from(content, 'base64');
              const filePath = `${emailId}/${filename}`;
              const { error: uploadError } = await supabaseAdmin.storage
                .from('email-attachments')
                .upload(filePath, buffer, { contentType: content_type, upsert: true });

              if (!uploadError) {
                const { data: publicUrlData } = supabaseAdmin.storage
                  .from('email-attachments')
                  .getPublicUrl(filePath);
                url = publicUrlData.publicUrl;
              } else {
                console.error(
                  `[SYNC] Failed to upload attachment ${filename} for email ${emailId}:`,
                  uploadError
                );
              }
            }

            normalizedAttachments.push({
              filename,
              content_type,
              size,
              content,
              url,
            });
          }
        }

        const insertData = {
          email_id: emailId,
          thread_id: receivedEmail.thread_id || receivedEmail.message_id || emailId,
          subject: receivedEmail.subject || '(No Subject)',
          from_email: fromEmail,
          from_name: fromName || null,
          to_emails: toEmails,
          html_content: receivedEmail.html || null,
          text_content: receivedEmail.text || null,
          received_at: receivedEmail.created_at || new Date().toISOString(),
          status: 'received',
          attachments: normalizedAttachments,
          is_read: false,
          is_archived: false,
          is_starred: false,
          tags: [],
        };

        const { error: insertError } = await supabaseAdmin.from('email_inbox').insert(insertData);
        if (insertError) {
          if (
            insertError.message?.includes('duplicate key') ||
            insertError.message?.includes('column "from_name" of relation') ||
            insertError.message?.includes('column "attachments" of relation')
          ) {
            const fallbackData: Record<string, unknown> = { ...insertData };
            delete fallbackData.from_name;
            delete fallbackData.attachments;
            const { error: insertError2 } = await supabaseAdmin
              .from('email_inbox')
              .insert(fallbackData);
            if (insertError2 && !insertError2.message?.includes('duplicate key')) {
              console.error(
                `[SYNC] Failed to insert email ${emailId} without from_name:`,
                insertError2
              );
            }
          } else {
            console.error(`[SYNC] Failed to insert email ${emailId}:`, insertError);
          }
        }

        if (normalizedAttachments.length > 0) {
          const attachmentRecords = normalizedAttachments.map((att) => ({
            email_id: emailId,
            filename: att.filename,
            content_type: att.content_type,
            size: att.size,
            url: att.url,
          }));
          const { error: attError } = await supabaseAdmin
            .from('email_attachments')
            .insert(attachmentRecords);
          if (attError && !attError.message?.includes('duplicate key')) {
            console.error(`[SYNC] Failed to insert attachments for email ${emailId}:`, attError);
          }
        }
      } catch (err) {
        console.error(`[SYNC] Exception syncing email ${emailId}:`, err);
      }
    };

    // Parallel batches with controlled concurrency
    for (let i = 0; i < missingEmails.length; i += CONCURRENCY) {
      const batch = missingEmails.slice(i, i + CONCURRENCY);
      await Promise.allSettled(batch.map(syncEmail));
    }
  } catch (err) {
    console.error('[SYNC] Exception during inbound email sync:', err);
  }
}
