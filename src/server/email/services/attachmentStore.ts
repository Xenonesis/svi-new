import { supabaseAdmin } from '@/src/lib/supabase/admin';

/** Guess content-type from filename extension. */
export function mimeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mime: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    csv: 'text/csv',
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    html: 'text/html',
    json: 'application/json',
  };
  return mime[ext] || 'application/octet-stream';
}

/** Ensure the email-attachments storage bucket exists. Idempotent. */
export async function ensureAttachmentBucket(): Promise<void> {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.find((b: any) => b.name === 'email-attachments')) {
      await supabaseAdmin.storage.createBucket('email-attachments', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10 MB
      });
    }
  } catch (err) {
    console.warn('[STORAGE] Could not ensure email-attachments bucket:', err);
  }
}

export interface OutboundAttachment {
  filename: string;
  /** base64 string (no data: prefix). */
  content: string;
  /** Optional pre-known file size in bytes. */
  size?: number;
}

export interface PersistedAttachment {
  email_id: string;
  filename: string;
  content_type: string;
  size: number | null;
  url: string | null;
}

/**
 * Upload attachments to the email-attachments bucket and persist a record
 * for each one in `email_attachments`. Used by both immediate send and
 * scheduled send paths.
 *
 * Returns the persisted record summaries so callers can include them in
 * notification messages or DTOs.
 */
export async function saveAttachments(
  emailId: string,
  attachments: OutboundAttachment[]
): Promise<PersistedAttachment[]> {
  if (!Array.isArray(attachments) || attachments.length === 0) return [];
  await ensureAttachmentBucket();

  const persisted: PersistedAttachment[] = [];

  for (const att of attachments) {
    const buffer = Buffer.from(att.content, 'base64');
    const contentType = mimeFromFilename(att.filename);
    const filePath = `${emailId}/${att.filename}`;
    let url: string | null = null;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('email-attachments')
      .upload(filePath, buffer, { contentType, upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('email-attachments')
        .getPublicUrl(filePath);
      url = publicUrlData.publicUrl;
    } else {
      console.error(`[ATTACH] Failed to upload ${att.filename} for email ${emailId}:`, uploadError);
    }

    const { error: attInsertError } = await supabaseAdmin.from('email_attachments').insert({
      email_id: emailId,
      filename: att.filename,
      content_type: contentType,
      size: att.size ?? buffer.length,
      url,
    });

    if (attInsertError) {
      console.error(
        `[ATTACH] Failed to persist attachment record for ${att.filename}:`,
        attInsertError
      );
    }

    persisted.push({
      email_id: emailId,
      filename: att.filename,
      content_type: contentType,
      size: att.size ?? buffer.length,
      url,
    });
  }

  return persisted;
}

export interface InboundAttachment {
  filename: string;
  content_type: string;
  size: number | null;
  content: string | null;
  url: string | null;
}

/**
 * Used by syncInboundEmails: persists Resend inbound attachments to the
 * bucket (when base64 content is small enough) and returns a normalized record.
 */
export async function persistInboundAttachment(
  emailId: string,
  att: {
    filename?: string;
    name?: string;
    content_type?: string;
    type?: string;
    size?: number | null;
    content?: string;
  }
): Promise<InboundAttachment> {
  const filename = att.filename || att.name || 'unnamed_attachment';
  const content_type = att.content_type || att.type || 'application/octet-stream';
  const size = att.size || null;
  const content =
    att.content && typeof att.content === 'string' && att.content.length < 5_000_000
      ? att.content
      : null;

  let url: string | null = null;
  if (content) {
    try {
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
    } catch (err) {
      console.error(`[SYNC] Failed to upload ${filename}:`, err);
    }
  }

  return { filename, content_type, size, content, url };
}
