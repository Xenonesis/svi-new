import { describe, it, expect } from 'vitest';
import {
  isAllowedRecordingUrl,
  buildRecordingProxyUrl,
  RECORDING_PATH_PREFIX,
} from '@/src/lib/leads/recordingProxy';
import { deriveStoragePath } from '@/src/lib/leads/syncRecordingToStorage';

describe('recordingProxy helpers', () => {
  const VALID_URL =
    'http://49.50.77.194/recordings/answered/673_8954636641_2026-10-14%2016:16:02.wav';

  it('validates genuine IVR recording URLs correctly', () => {
    expect(isAllowedRecordingUrl(VALID_URL)).toBe(true);
  });

  it('rejects empty, null, or non-string inputs', () => {
    expect(isAllowedRecordingUrl(null)).toBe(false);
    expect(isAllowedRecordingUrl(undefined)).toBe(false);
    expect(isAllowedRecordingUrl('')).toBe(false);
  });

  it('rejects unauthorized external hostnames (SSRF protection)', () => {
    expect(isAllowedRecordingUrl('http://malicious-server.com/recordings/answered/test.wav')).toBe(
      false
    );
    expect(isAllowedRecordingUrl('http://127.0.0.1/recordings/answered/test.wav')).toBe(false);
    expect(isAllowedRecordingUrl('http://169.254.169.254/latest/meta-data')).toBe(false);
  });

  it('rejects path traversal attempts', () => {
    expect(isAllowedRecordingUrl('http://49.50.77.194/recordings/../etc/passwd')).toBe(false);
    expect(isAllowedRecordingUrl('http://49.50.77.194/recordings/..\\windows\\win.ini')).toBe(
      false
    );
  });

  it('rejects paths that do not start with the recording prefix', () => {
    expect(isAllowedRecordingUrl('http://49.50.77.194/admin/secret.php')).toBe(false);
    expect(isAllowedRecordingUrl('http://49.50.77.194/')).toBe(false);
  });

  it('builds same-origin proxy URL for valid recordings', () => {
    const proxyUrl = buildRecordingProxyUrl(VALID_URL);
    expect(proxyUrl).toBeDefined();
    expect(proxyUrl).toContain('/api/admin/leads/recording?url=');
    expect(proxyUrl).toContain(encodeURIComponent(VALID_URL));
  });
  it('attaches sanitized customer phone query param when provided', () => {
    const proxyUrl = buildRecordingProxyUrl(VALID_URL, '+91 8954636641');
    expect(proxyUrl).toContain('&phone=8954636641');
  });

  it('omits phone query param when phone is empty or non-numeric', () => {
    const proxyUrl = buildRecordingProxyUrl(VALID_URL, '---');
    expect(proxyUrl).not.toContain('&phone=');
  });

  it('returns null proxy URL for invalid or rejected recordings', () => {
    expect(buildRecordingProxyUrl(null)).toBeNull();
    expect(buildRecordingProxyUrl('http://evil.com/file.wav')).toBeNull();
  });
});

describe('deriveStoragePath dual-format', () => {
  const url = 'http://49.50.77.194/recordings/answered/673_9891495316_2026-10-17%2014:19:19.wav';
  const phone = '9891495316';
  const date = '2026-10-17T08:49:10Z';

  it('derives wav path by default', () => {
    const path = deriveStoragePath(phone, url, date);
    expect(path).toBe('2026/10/9891495316_673_9891495316_2026-10-17_14_19_19.wav');
  });

  it('derives mp3 path when specified', () => {
    const path = deriveStoragePath(phone, url, date, 'mp3');
    expect(path).toBe('2026/10/9891495316_673_9891495316_2026-10-17_14_19_19.mp3');
  });
});
