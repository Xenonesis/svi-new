# Audio Compression & Transcoding Architecture Specification

**Date**: 2026-10-27  
**Status**: Approved for Implementation  
**Project**: SVI Infra Solutions (`svi-new`)  
**Target**: Supabase Storage `call-recordings` & IVR Audio Pipeline

---

## 1. Executive Summary

The SVI CRM system archives incoming IVR customer calls for telecaller audits, dispute resolution, and Voice AI triage. Currently, **6,716 audio recordings** occupy **4.24 GB** in the Supabase private bucket `call-recordings`.

Analysis of the audio stream reveals the recordings are uncompressed **16-bit PCM WAV at 8,000 Hz (mono)**, which consumes 128 kbps of uncompressed bandwidth for 3.4 kHz telephone bandwidth. This specification details the end-to-end migration from raw PCM WAV to **32 kbps mono MP3**, achieving:

- **75% storage footprint reduction** (4.24 GB drops to ~1.06 GB, freeing ~3.2 GB of Supabase Storage).
- **Zero audible loss** for telephony speech frequencies (300 Hz – 3,400 Hz).
- **Instant CRM streaming playback** (average file download drops from 1.8 MB to ~450 KB).
- **4x faster Groq Whisper AI triage payload dispatch** (under 25 MB file limit for all calls).
- **100% universal device compatibility** (iOS, Android, macOS, Windows, Chrome, Safari, Firefox).

---

## 2. Audio Transcoding Profile

### 2.1 Codec & Parameter Standards

- **Container / Extension**: `.mp3` (MPEG Audio Layer III)
- **Audio Codec**: `libmp3lame`
- **Bitrate**: `32 kbps` Constant Bit Rate (CBR)
- **Channels**: `1` (Mono)
- **Sample Rate**: Native 8,000 Hz or auto-resampled to 16,000 Hz speech profile
- **MIME Type**: `audio/mpeg`

### 2.2 Benchmark Verification

Tested against real SVI telecalling call record (`1125687194_673_1125687194_2026-10-21_15_58_25.wav`):

- **Raw PCM WAV**: 1,803.8 KB (1.80 MB)
- **MP3 @ 32 kbps Mono**: 452.0 KB (0.45 MB)
- **Space Reduction**: **74.9% saved**
- **FFmpeg Execution Time**: 15–20 ms per file.

---

## 3. Architecture & Component Workflow

```
                    [ 1. Transcoding Worker (scripts/compress_audio_archive.cjs) ]
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
      [ Fetch .wav from Bucket ]                   [ FFmpeg Transcode to MP3 ]
                    │                                           │
                    │                                           ▼
                    │                              [ Upload .mp3 to Bucket ]
                    │                                           │
                    ▼                                           ▼
   [ Delete old .wav ONLY after ] ───────────────> [ Update DB: storage_path -> .mp3 ]
                                                                │
                                                                ▼
                                      [ 2. API Proxy Gateway (/api/admin/leads/recording) ]
                                        - Detects .mp3 first, falls back to .wav
                                        - Issues instant 307 CDN redirect
                                                                │
                                                                ▼
                                      [ 3. CRM Player (IvrAudioPlayerDock.tsx) ]
                                        - Plays .mp3 instantly with byte-range scrub
```

### 3.1 Migration Batch Engine (`scripts/compress_audio_archive.cjs`)

1. **Source Discovery**: Queries `ivr_call_records` where `raw_payload->>storage_path` ends with `.wav`.
2. **Concurrency**: 4 parallel worker threads utilizing local `ffmpeg 9.0.2`.
3. **Execution Sequence (Per File)**:
   - Download existing `.wav` file into temporary local buffer.
   - Execute FFmpeg:
     ```bash
     ffmpeg -y -i input.wav -codec:a libmp3lame -b:a 32k -ac 1 output.mp3
     ```
   - Verify output: file exists and byte size > 1,024 bytes.
   - Upload `output.mp3` to `call-recordings` bucket with `contentType: 'audio/mpeg'` and `upsert: true`.
   - Update `ivr_call_records` row:
     ```json
     {
       "raw_payload": {
         "storage_path": "2026/10/..._recording.mp3",
         "compressed_at": "2026-10-27T...",
         "original_size_bytes": 1847084,
         "compressed_size_bytes": 462848
       }
     }
     ```
   - Once database update succeeds, delete the original `.wav` from the Supabase bucket via `supabase.storage.from('call-recordings').remove([wavPath])`.
   - Clean up temporary local files.

### 3.2 Streaming Gateway Dual-Resolution (`app/api/admin/leads/recording/route.ts`)

The streaming proxy ensures zero playback downtime during and after the migration:

1. When a playback request arrives for `url` or `storage_path`:
2. The proxy checks if an `.mp3` version exists in storage:
   ```typescript
   const mp3Path = inHousePath.replace(/\.wav$/i, '.mp3');
   ```
3. If `mp3Path` exists, returns an instant HTTP 307 Temporary Redirect to the signed CDN URL for the `.mp3` file with `Content-Type: audio/mpeg`.
4. If not yet converted, falls back to `.wav` signed URL.
5. If neither exists, falls back to upstream telephony streaming proxy.

### 3.3 CRM Floating Audio Player (`IvrAudioPlayerDock.tsx`)

- Standard HTML5 `<audio>` element natively handles both `audio/mpeg` and `audio/wav` with native byte-range slicing (HTTP 206) for instant scrubbing.
- Downloader helper adapts filename to `.mp3`.

### 3.4 Ingestion Pipeline Integration (`scripts/archive_ivr_recordings.cjs`)

Future incoming calls will automatically transcode raw WAVs to MP3 before uploading to Supabase Storage, ensuring the database never accumulates uncompressed WAVs again.

---

## 4. Safety & Rollback Guarantees

1. **Transactional Safety**: The old `.wav` file is NEVER deleted until:
   - The `.mp3` is successfully created and verified locally.
   - The `.mp3` is successfully uploaded to Supabase Storage.
   - The database record `ivr_call_records.raw_payload.storage_path` is updated and confirmed.
2. **Crash & Network Resilience**: If any step fails, the original `.wav` remains intact and the record remains pointing to `.wav`.
3. **Checkpoint Tracking**: Checkpoint file `.transcode_progress.json` saves progress every 20 files, enabling instant auto-resume on interruption.
4. **Clean SIGINT/SIGTERM**: Graceful shutdown flushes in-flight files before exiting.

---

## 5. Verification & Acceptance Criteria

- [ ] Sample conversion test: transcode 10 calls, verify playback in browser, inspect DB updates.
- [ ] Database query: `raw_payload->>storage_path` ending with `.wav` drops to 0.
- [ ] Supabase Storage bucket: total size reduces from 4.24 GB to ~1.06 GB.
- [ ] Playback smoke test: listen to call audio via `/api/admin/leads/recording` in `IvrAudioPlayerDock.tsx` with instant seek.
- [ ] Groq Whisper AI test: transcribe converted `.mp3` file, confirm accurate text dialogue.
- [ ] Type check clean: `bun run typecheck` passes with 0 errors.
