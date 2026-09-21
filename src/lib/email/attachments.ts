import { supabaseAdmin } from '@/src/lib/supabase/admin';

/**
 * Guess MIME content-type from filename extension.
 */
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

/**
 * Ensure the email-attachments Supabase storage bucket exists and is public.
 */
export async function ensureAttachmentBucket(): Promise<void> {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const emailBucket = buckets?.find(
      (b: { name: string; public?: boolean }) => b.name === 'email-attachments'
    );
    if (!emailBucket) {
      await supabaseAdmin.storage.createBucket('email-attachments', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10 MB
      });
    } else if (!emailBucket.public) {
      await supabaseAdmin.storage.updateBucket('email-attachments', {
        public: true,
      });
    }
  } catch (err) {
    console.warn('[STORAGE] Could not ensure email-attachments bucket:', err);
  }
}
