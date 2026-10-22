import { describe, it, expect } from 'vitest';
import { deriveStoragePath, CALL_RECORDINGS_BUCKET } from '@/src/lib/leads/syncRecordingToStorage';

describe('syncRecordingToStorage helper', () => {
  it('correctly derives structured year/month storage path', () => {
    const url = 'http://49.50.77.194/recordings/answered/673_8954636641_2026-10-14%2016:16:02.wav';
    const path = deriveStoragePath('+91 8954636641', url);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    expect(path).toContain(`${year}/${month}/8954636641_`);
    expect(path).toContain('.wav');
    expect(path).not.toContain('%20');
  });

  it('handles irregular phone numbers gracefully', () => {
    const url = 'http://49.50.77.194/recordings/answered/sample.wav';
    const path = deriveStoragePath('', url);
    expect(path).toContain('unknown_sample.wav');
  });

  it('uses constant bucket name', () => {
    expect(CALL_RECORDINGS_BUCKET).toBe('call-recordings');
  });
});
