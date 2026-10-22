import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { isAllowedRecordingUrl } from '@/src/lib/leads/recordingProxy';

export const CALL_RECORDINGS_BUCKET = 'call-recordings';

export interface StorageSyncResult {
  success: boolean;
  storagePath?: string;
  error?: string;
  alreadyExists?: boolean;
}

/**
 * Derives a clean, collision-free storage path for a recording file.
 * Format: `<year>/<month>/<customerPhone>_<cleanFilename>.wav`
 */
export function deriveStoragePath(customerPhone: string, upstreamUrl: string): string {
  const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10) || 'unknown';
  let filename = 'recording.wav';
  try {
    const parsed = new URL(upstreamUrl);
    const rawName = parsed.pathname.split('/').pop() || 'recording.wav';
    filename = decodeURIComponent(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
  } catch {
    filename = `rec_${Date.now()}.wav`;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  return `${year}/${month}/${cleanPhone}_${filename}`;
}

/**
 * In-House Recording Archival Engine:
 * Fetches third-party IVR call recording from external telephony server
 * and permanently archives it into the private Supabase `call-recordings` storage bucket.
 *
 * Idempotent: If the file already exists in storage, skips redundant re-download.
 */
export async function syncRecordingToInHouseStorage(
  customerPhone: string,
  upstreamUrl: string | null | undefined
): Promise<StorageSyncResult> {
  if (!upstreamUrl) {
    return { success: false, error: 'Empty upstream URL' };
  }

  if (!isAllowedRecordingUrl(upstreamUrl)) {
    return { success: false, error: 'Unauthorized or invalid telephony recording host' };
  }

  const storagePath = deriveStoragePath(customerPhone, upstreamUrl);

  try {
    // 1. Check if already archived in storage
    const pathParts = storagePath.split('/');
    const folder = pathParts.slice(0, -1).join('/');
    const targetFile = pathParts[pathParts.length - 1];

    const { data: existingFiles } = await supabaseAdmin.storage
      .from(CALL_RECORDINGS_BUCKET)
      .list(folder, { search: targetFile, limit: 1 });

    if (existingFiles && existingFiles.some((f) => f.name === targetFile)) {
      return { success: true, storagePath, alreadyExists: true };
    }

    // 2. Fetch recording from third-party server
    const fetchController = new AbortController();
    const fetchTimeout = setTimeout(() => fetchController.abort(), 20000); // 20s timeout

    const upstreamRes = await fetch(upstreamUrl, {
      signal: fetchController.signal,
      cache: 'no-store',
    });
    clearTimeout(fetchTimeout);

    if (!upstreamRes.ok) {
      return {
        success: false,
        error: `Third-party telephony server returned HTTP ${upstreamRes.status}`,
      };
    }

    const arrayBuffer = await upstreamRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = upstreamRes.headers.get('content-type') || 'audio/x-wav';

    // 3. Upload to in-house private Supabase storage bucket
    const { error: uploadError } = await supabaseAdmin.storage
      .from(CALL_RECORDINGS_BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return {
        success: false,
        error: `Supabase storage upload failed: ${uploadError.message}`,
      };
    }

    return { success: true, storagePath, alreadyExists: false };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Archival exception: ${msg}` };
  }
}
