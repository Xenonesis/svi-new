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
 * Extracts an Indian 10-digit mobile number from an upstream recording filename if present.
 * Example: `673_8954636641_2026-10-14 16:16:02.wav` -> `8954636641`
 */
export function extractPhoneFromUrl(upstreamUrl: string): string | null {
  try {
    const parsed = new URL(upstreamUrl);
    const rawName = parsed.pathname.split('/').pop() || '';
    const decoded = decodeURIComponent(rawName);
    const match = decoded.match(/(?:^|[^0-9])([6-9]\d{9})(?:[^0-9]|$)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Derives a clean, collision-free storage path for a recording file.
 * Format: `<year>/<month>/<customerPhone>_<cleanFilename>.wav`
 */
export function deriveStoragePath(
  customerPhone: string,
  upstreamUrl: string,
  callDate?: string | Date | null,
  format: 'mp3' | 'wav' = 'wav'
): string {
  let cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
  let filename: string;
  try {
    const parsed = new URL(upstreamUrl);
    const rawName = parsed.pathname.split('/').pop() || 'recording.wav';
    filename = decodeURIComponent(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
    if (format === 'mp3') {
      filename = filename.replace(/\.wav$/i, '.mp3');
    }
  } catch {
    filename = `rec_${Date.now()}.${format}`;
  }
  if (!cleanPhone) {
    cleanPhone = extractPhoneFromUrl(upstreamUrl) || 'unknown';
  }

  // Priority 1: Explicit callDate if provided
  if (callDate) {
    try {
      const d = new Date(callDate);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${year}/${month}/${cleanPhone}_${filename}`;
      }
    } catch {
      // Fall through to URL extraction
    }
  }

  // Priority 2: Extract YYYY-MM from upstream URL or filename (e.g. 2026-10-14)
  try {
    const decoded = decodeURIComponent(upstreamUrl);
    const dateMatch = decoded.match(/(202[0-9])[-_](0[1-9]|1[0-2])/);
    if (dateMatch) {
      const year = dateMatch[1];
      const month = dateMatch[2];
      return `${year}/${month}/${cleanPhone}_${filename}`;
    }
  } catch {
    // Fall through to current date
  }

  // Priority 3: Fallback to current year/month
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
