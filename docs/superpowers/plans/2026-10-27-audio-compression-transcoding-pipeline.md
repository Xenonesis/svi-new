# Audio Compression & Transcoding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate 6,716 IVR call recordings in Supabase Storage (`call-recordings`) from 4.24 GB raw PCM WAV down to ~1.06 GB (75% savings / ~3.2 GB freed) using 32 kbps mono MP3 with zero audible quality loss, zero playback downtime in the CRM, and future-proof real-time ingestion.

**Architecture:**

1. Upgrade the API streaming gateway (`/api/admin/leads/recording`) with dual-format resolution (`.mp3` first, seamless fallback to `.wav`).
2. Build a high-performance, fault-tolerant batch transcoding worker (`scripts/compress_audio_archive.cjs`) using local FFmpeg 9.0.2 with 4 concurrent workers, strict verify-before-delete guarantees, and persistent checkpointing.
3. Update real-time ingestion (`syncRecordingToStorage.ts`, `archive_ivr_recordings.cjs`) and Groq Whisper AI triage (`callIntelligence.ts`) to natively use 32 kbps MP3.
4. Execute full migration across all 6,716 files and verify storage reduction and CRM playback.

**Tech Stack:** Node.js, FFmpeg 9.0.2 (`libmp3lame`), Supabase Storage & PostgREST, Next.js App Router, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-27-audio-compression-transcoding-pipeline.md`

## Global Constraints

- **Transcoding Standard**: MPEG Audio Layer III (`.mp3`), `libmp3lame`, 32 kbps CBR, 1 channel (mono), `audio/mpeg`.
- **Zero Loss Guarantee**: Telephony voice band (300 Hz – 3,400 Hz) must be 100% preserved.
- **Safety Rule**: Never delete an existing `.wav` file from Supabase Storage until the `.mp3` is uploaded, verified (>1KB), and the database row has confirmed the new `.mp3` path.
- **Zero Downtime**: Proxy must serve either `.mp3` or `.wav` transparently so CRM audio playback is never broken.
- **TypeScript**: Strict types, no `any`, `bun run typecheck` must pass with 0 errors.

---

### Task 1: Streaming Proxy Dual-Format Resolution & Player Compatibility

**Files:**

- Modify: `app/api/admin/leads/recording/route.ts:40-75`
- Modify: `src/lib/leads/syncRecordingToStorage.ts:30-86`
- Test: `__tests__/api/leads/recordingProxy.test.ts`

**Interfaces:**

- Consumes: `deriveStoragePath(customerPhone, upstreamUrl, callDate, format?: 'mp3' | 'wav')`
- Produces: Dual-format HTTP 307 CDN redirect favoring `.mp3` with fallback to `.wav`.

- [ ] **Step 1: Write unit tests for dual-format resolution**

In `__tests__/api/leads/recordingProxy.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { deriveStoragePath } from '@/src/lib/leads/syncRecordingToStorage';

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
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun run test -- __tests__/api/leads/recordingProxy.test.ts`  
Expected: FAIL because 4th parameter `format` is not yet supported.

- [ ] **Step 3: Update `deriveStoragePath` to support format option**

In `src/lib/leads/syncRecordingToStorage.ts`:

```typescript
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

  // Date parsing logic...
  // Returns `${year}/${month}/${cleanPhone}_${filename}`
}
```

- [ ] **Step 4: Update `/api/admin/leads/recording/route.ts` with dual-path resolution**

In `app/api/admin/leads/recording/route.ts`:

```typescript
const directStoragePath = request.nextUrl.searchParams.get('storage_path');
if (directStoragePath === 'expired_404') {
  return NextResponse.json(
    { error: 'Call recording has expired on the telephony server and is unavailable' },
    { status: 404 }
  );
}

const customerPhone =
  request.nextUrl.searchParams.get('phone') || extractPhoneFromUrl(targetUrl) || '';
const basePath = directStoragePath || deriveStoragePath(customerPhone, targetUrl);

// Dual-format check: Test .mp3 first, then fallback to .wav
const candidates = [
  basePath.replace(/\.wav$/i, '.mp3'),
  basePath.endsWith('.wav') ? basePath : basePath.replace(/\.mp3$/i, '.wav'),
];

for (const inHousePath of candidates) {
  try {
    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from(CALL_RECORDINGS_BUCKET)
      .createSignedUrl(inHousePath, 86400);

    if (!signedError && signedData?.signedUrl) {
      const redirectHeaders = new Headers();
      redirectHeaders.set('Location', signedData.signedUrl);
      redirectHeaders.set('Cache-Control', 'private, max-age=86400');
      redirectHeaders.set('X-Source', 'in-house-supabase-storage-cdn');
      redirectHeaders.set(
        'X-Audio-Format',
        inHousePath.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav'
      );

      return new Response(null, {
        status: 307,
        headers: redirectHeaders,
      });
    }
  } catch {
    // Continue to next candidate
  }
}
```

- [ ] **Step 5: Run tests and verify PASS**

Run: `bun run test -- __tests__/api/leads/recordingProxy.test.ts`  
Expected: PASS (2/2).

- [ ] **Step 6: Commit changes**

```bash
git add src/lib/leads/syncRecordingToStorage.ts app/api/admin/leads/recording/route.ts __tests__/api/leads/recordingProxy.test.ts
git commit -m "feat(audio): dual-format streaming proxy with mp3 first-class resolution"
```

---

### Task 2: High-Performance Batch Transcoding Worker (`scripts/compress_audio_archive.cjs`)

**Files:**

- Create: `scripts/compress_audio_archive.cjs`
- Output: `.transcode_progress.json` (auto-checkpoint)

**Interfaces:**

- Consumes: Existing files in Supabase `call-recordings` bucket ending with `.wav` and mapped in `ivr_call_records`.
- Produces: Uploaded `.mp3` files, updated `ivr_call_records.raw_payload.storage_path`, deleted obsolete `.wav` files.

- [ ] **Step 1: Write `scripts/compress_audio_archive.cjs`**

Implement complete worker with:

- Checkpoint loader/saver (`.transcode_progress.json`)
- FFmpeg transcode function:
  ```javascript
  execSync(`ffmpeg -y -i "${tempWav}" -codec:a libmp3lame -b:a 32k -ac 1 "${tempMp3}"`, {
    stdio: 'pipe',
  });
  ```
- Strict verification before deletion:
  1. Download `.wav`
  2. Transcode to `.mp3`
  3. Validate byte size > 1,024
  4. Upload `.mp3` with `contentType: 'audio/mpeg'`, `upsert: true`
  5. Update `ivr_call_records` DB row with `storage_path = mp3Path`
  6. Call `supabase.storage.from('call-recordings').remove([wavPath])`
  7. Delete local temp files
- Concurrency pool (default: 4 workers)
- Command-line flags: `--limit <N>`, `--all`, `--concurrency <N>`, `--reset`

- [ ] **Step 2: Test script on small sample (--limit 5)**

Run: `node scripts/compress_audio_archive.cjs --limit 5 --concurrency 2`  
Expected:

- 5 files downloaded, transcoded, uploaded as `.mp3`.
- Original `.wav` files safely removed from bucket.
- Database records updated to `.mp3`.
- Checkpoint file created.

- [ ] **Step 3: Verify converted audio files play via browser/curl**

Run throwaway verification to fetch signed URL of converted `.mp3` and confirm HTTP 200 with `Content-Type: audio/mpeg`.

- [ ] **Step 4: Commit worker script**

```bash
git add scripts/compress_audio_archive.cjs
git commit -m "feat(audio): add robust batch audio transcoding migration worker"
```

---

### Task 3: Realtime Ingestion & Voice AI Pipeline Modernization

**Files:**

- Modify: `scripts/archive_ivr_recordings.cjs`
- Modify: `src/lib/leads/syncRecordingToStorage.ts`
- Modify: `src/lib/leads/callIntelligence.ts`
- Test: Unit test for Whisper and Storage sync.

**Interfaces:**

- Consumes: Incoming calls from external telephony server.
- Produces: Directly transcodes raw WAV to MP3 before uploading to Supabase Storage.

- [ ] **Step 1: Update `syncRecordingToStorage.ts` to transcode on archival**

Add local or in-memory MP3 transcoding using `ffmpeg` when archiving newly received calls from telephony server.
Ensure Content-Type is set to `audio/mpeg` and filename ends in `.mp3`.

- [ ] **Step 2: Update `archive_ivr_recordings.cjs` to transcode on upload**

When downloading from `http://49.50.77.194/...`:

1. Save temporary buffer to `temp.wav`
2. Run `ffmpeg -y -i temp.wav -codec:a libmp3lame -b:a 32k -ac 1 temp.mp3`
3. Upload `temp.mp3` as `storage_path: '...wav'.replace(/\.wav$/i, '.mp3')`
4. Clean up temp files.

- [ ] **Step 3: Update `callIntelligence.ts` for MP3 support**

Ensure `transcribeCallAudio()` in `src/lib/leads/callIntelligence.ts` sends `audio/mpeg` with `filename.mp3` when receiving MP3 buffers.

- [ ] **Step 4: Run typecheck**

Run: `bun run typecheck`  
Expected: `tsc --noEmit` passes with 0 errors.

- [ ] **Step 5: Commit changes**

```bash
git add src/lib/leads/syncRecordingToStorage.ts scripts/archive_ivr_recordings.cjs src/lib/leads/callIntelligence.ts
git commit -m "feat(audio): modernize real-time audio ingestion and AI triage for MP3"
```

---

### Task 4: Complete Migration Execution, Storage Audit & Verification

**Files:**

- Monitor: `archive_worker.log` / `transcode.log`
- Read: Database `ivr_call_records` and Supabase Storage bucket metrics.

- [ ] **Step 1: Run benchmark batch (50 files)**

Run: `node scripts/compress_audio_archive.cjs --limit 50 --concurrency 4`  
Verify speed (~10-15 seconds) and verify 0 errors.

- [ ] **Step 2: Launch full migration in background**

Run: `node scripts/compress_audio_archive.cjs --all --concurrency 4 > transcode_worker.log 2>&1` in background.

- [ ] **Step 3: Monitor until completion**

Wait for background job to finish all 6,716 files.

- [ ] **Step 4: Verify database consistency**

Run verification query:

- Confirm count of records ending in `.wav`: **0**
- Confirm count of records ending in `.mp3`: **6,716**
- Confirm total byte size in bucket drops from ~4.24 GB to ~1.06 GB.

- [ ] **Step 5: Test audio playback in CRM**

Open `/admin/leads` and test playback of 3 converted recordings in `IvrAudioPlayerDock.tsx`. Confirm:

- Audio streams instantly without delay.
- Timeline scrub/seek works smoothly (HTTP 206 partial content).
- Sound quality is crisp and clear.

- [ ] **Step 6: Update roadmap and commit final status**

Update `docs/superpowers/plans/2026-10-26-system-audits-and-reconciliation-roadmap.md` with final storage metrics and commit.
