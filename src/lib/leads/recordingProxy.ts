/**
 * Pure helpers for IVR call recording URLs and same-origin streaming.
 * Keeps raw IP addresses and unauthenticated HTTP endpoints off the browser client.
 */

export const RECORDING_PATH_PREFIX = '/recordings/';

/**
 * Strict allowlist of hosts serving IVR recording WAV files.
 * Defaults to the production IVR telephony server (49.50.77.194),
 * but can be extended via the IVR_RECORDING_HOSTS environment variable (comma-separated).
 */
export function getAllowedRecordingHosts(): Set<string> {
  const hosts = new Set<string>(['49.50.77.194']);
  const envHosts = process.env.IVR_RECORDING_HOSTS;
  if (envHosts) {
    for (const h of envHosts.split(',')) {
      const trimmed = h.trim();
      if (trimmed) hosts.add(trimmed);
    }
  }
  return hosts;
}

/**
 * Validates that an upstream recording URL points to an allowed host and valid path.
 * Guards against SSRF and open redirect/proxy attacks.
 */
export function isAllowedRecordingUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const allowed = getAllowedRecordingHosts();
    if (!allowed.has(parsed.hostname)) return false;
    if (!parsed.pathname.startsWith(RECORDING_PATH_PREFIX)) return false;
    // Reject directory traversal
    if (parsed.pathname.includes('..') || parsed.pathname.includes('\\')) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Builds a same-origin proxy URL for streaming an IVR recording.
 * Returns null if the upstream URL is missing or not allowed.
 */
export function buildRecordingProxyUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || !isAllowedRecordingUrl(rawUrl)) return null;
  return `/api/admin/leads/recording?url=${encodeURIComponent(rawUrl)}`;
}
