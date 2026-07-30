import { Resend } from 'resend';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { ensureAttachmentBucket, persistInboundAttachment } from './services/attachmentStore';

/** Lazy singleton for the Resend client. Returns null when the API key is missing. */
let _resendInstance: Resend | null = null;
let _resendMissing = false;
export function getResend(): Resend | null {
  if (_resendInstance) return _resendInstance;
  if (_resendMissing) return null;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    _resendMissing = true;
    return null;
  }
  _resendInstance = new Resend(apiKey);
  return _resendInstance;
}

interface SyncOptions {
  /** Override concurrency for batched fetching. */
  concurrency?: number;
}

/**
 * Sync inbound emails from Resend's Receiving API into the `email_inbox`
 * table. This is the long-lived helper extracted from the original route.
 *
 * Behavior is preserved bit-for-bit; only the control flow is reorganized.
 *
 * Returns `{ synced: 0, checked: 0 }` silently when the Resend API key is
 * not configured (e.g. local dev) so the inbox tab does not flood the
 * console with errors.
 */
export async function syncInboundEmails(
  resend: Resend | null = getResend(),
  options: SyncOptions = {}
): Promise<{ synced: number; checked: number }> {
  if (!resend) {
    // Resend API key not configured; nothing to sync. Skip silently.
    return { synced: 0, checked: 0 };
  }
  const concurrency = options.concurrency ?? 5;
  try {
    await ensureAttachmentBucket();
    const resendEmails = await resend.emails.receiving.list();
    const emails = (resendEmails.data as any)?.data || resendEmails.data || [];
    if (emails.length === 0) return { synced: 0, checked: 0 };

    const emailIds = emails.map((e: any) => e.id).filter(Boolean);
    if (emailIds.length === 0) return { synced: 0, checked: 0 };

    const { data: existingRecords, error: checkError } = await supabaseAdmin
      .from('email_inbox')
      .select('email_id')
      .in('email_id', emailIds);

    if (checkError) {
      console.error('[SYNC] Error checking existing emails in database:', checkError);
      return { synced: 0, checked: 0 };
    }

    const existingIds = new Set((existingRecords || []).map((r: any) => r.email_id));
    const missingEmails = emails.filter((e: any) => !existingIds.has(e.id));

    if (missingEmails.length === 0) return { synced: 0, checked: emailIds.length };

    console.log(`[SYNC] Found ${missingEmails.length} missing inbound emails. Syncing now...`);

    let synced = 0;

    const syncEmail = async (e: any) => {
      const emailId = e.id;
      try {
        const { data: emailData, error: fetchError } = await resend.emails.receiving.get(emailId);
        if (fetchError) {
          console.error(`[SYNC] Error fetching email details for ${emailId}:`, fetchError);
          return;
        }

        const fromRaw = (emailData as any).from || '';
        let fromEmail = fromRaw;
        let fromName = '';
        const nameMatch = fromRaw.match(/^"?([^"<]*)"?\s*<([^>]+)>/);
        if (nameMatch) {
          fromName = nameMatch[1].trim();
          fromEmail = nameMatch[2].trim();
        }

        const toEmails: string[] = [];
        const rawTo = (emailData as any).to || [];
        (Array.isArray(rawTo) ? rawTo : [rawTo]).forEach((addr: string) => {
          const m = addr.match(/<([^>]+)>/);
          toEmails.push(m ? m[1] : addr);
        });

        const rawAttachments = (emailData as any).attachments;
        const normalizedAttachments: any[] = [];
        if (rawAttachments && Array.isArray(rawAttachments) && rawAttachments.length > 0) {
          for (const att of rawAttachments) {
            const persisted = await persistInboundAttachment(emailId, att);
            normalizedAttachments.push(persisted);
          }
        }

        const insertData = {
          email_id: emailId,
          thread_id: (emailData as any).thread_id || (emailData as any).message_id || emailId,
          subject: (emailData as any).subject || '(No Subject)',
          from_email: fromEmail,
          from_name: fromName || null,
          to_emails: toEmails,
          html_content: (emailData as any).html || null,
          text_content: (emailData as any).text || null,
          received_at: (emailData as any).created_at || new Date().toISOString(),
          status: 'received',
          attachments: normalizedAttachments,
        };

        const { error: insertError } = await supabaseAdmin.from('email_inbox').insert(insertData);

        if (insertError) {
          if (
            insertError.message?.includes('duplicate key') ||
            insertError.message?.includes('column "from_name" of relation') ||
            insertError.message?.includes('column "attachments" of relation')
          ) {
            const fallbackData: any = { ...insertData };
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
        } else {
          synced += 1;
        }

        if (normalizedAttachments && normalizedAttachments.length > 0) {
          const attachmentRecords = normalizedAttachments.map((att: any) => ({
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

    for (let i = 0; i < missingEmails.length; i += concurrency) {
      const batch = missingEmails.slice(i, i + concurrency);
      await Promise.allSettled(batch.map(syncEmail));
    }

    return { synced, checked: emailIds.length };
  } catch (err) {
    console.error('[SYNC] Exception during inbound email sync:', err);
    return { synced: 0, checked: 0 };
  }
}
