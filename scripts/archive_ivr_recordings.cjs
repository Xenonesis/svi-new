/**
 * Robust Historical Call Recording Archival Script (Third-Party -> In-House Supabase Storage)
 *
 * Features:
 *   - Concurrent workers (default: 4)
 *   - In-memory bucket directory cache (zero redundant storage list roundtrips)
 *   - Dynamic batching with Postgres `.is('raw_payload->>storage_path', null)` filter
 *   - Deterministic storage paths: `<YYYY>/<MM>/<phone>_<filename>.wav`
 *   - HTTP 404 permanent marking (`expired_404`) to prevent useless retries
 *   - Persistent checkpointing (.archive_progress.json) & auto-resume
 *   - 15s download timeouts with auto-retry
 *   - Clean SIGINT/SIGTERM graceful pause
 *
 * Usage:
 *   node scripts/archive_ivr_recordings.cjs --limit 100
 *   node scripts/archive_ivr_recordings.cjs --all --concurrency 4
 *   node scripts/archive_ivr_recordings.cjs --reset
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const getEnv = (key) => {
  const m = env.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const BUCKET = 'call-recordings';
const CHECKPOINT_FILE = path.resolve(__dirname, '../.archive_progress.json');

// In-memory cache for folder listings: folderName -> Set of filenames
const folderCache = new Map();

async function getFolderFiles(folder) {
  if (folderCache.has(folder)) {
    return folderCache.get(folder);
  }
  const fileSet = new Set();
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(folder, { limit: 1000, offset });
    if (error || !data || data.length === 0) break;
    for (const f of data) fileSet.add(f.name);
    if (data.length < 1000) break;
    offset += 1000;
  }
  folderCache.set(folder, fileSet);
  return fileSet;
}

function deriveStoragePath(customerPhone, upstreamUrl, callDate) {
  const cleanPhone = (customerPhone || '').replace(/\D/g, '').slice(-10) || 'unknown';
  let filename = 'recording.wav';
  try {
    const parsed = new URL(upstreamUrl);
    const rawName = parsed.pathname.split('/').pop() || 'recording.wav';
    filename = decodeURIComponent(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
  } catch {
    filename = `rec_${Date.now()}.wav`;
  }

  // Priority 1: Explicit callDate if valid
  if (callDate) {
    try {
      const d = new Date(callDate);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${year}/${month}/${cleanPhone}_${filename}`;
      }
    } catch {}
  }

  // Priority 2: Extract YYYY-MM from upstream URL
  try {
    const decoded = decodeURIComponent(upstreamUrl);
    const dateMatch = decoded.match(/(202[0-9])[-_](0[1-9]|1[0-2])/);
    if (dateMatch) {
      return `${dateMatch[1]}/${dateMatch[2]}/${cleanPhone}_${filename}`;
    }
  } catch {}

  // Priority 3: Fallback to current year/month
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}/${month}/${cleanPhone}_${filename}`;
}

// Load Checkpoint
function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
      return {
        processedIds: new Set(data.processedIds || []),
        uploadedCount: data.uploadedCount || 0,
        skippedCount: data.skippedCount || 0,
        errorCount: data.errorCount || 0,
        totalBytes: data.totalBytes || 0,
        lastUpdated: data.lastUpdated || null,
      };
    } catch {
      // corrupt file, start fresh
    }
  }
  return {
    processedIds: new Set(),
    uploadedCount: 0,
    skippedCount: 0,
    errorCount: 0,
    totalBytes: 0,
    lastUpdated: null,
  };
}

function saveCheckpoint(state) {
  const payload = {
    processedIds: Array.from(state.processedIds),
    uploadedCount: state.uploadedCount,
    skippedCount: state.skippedCount,
    errorCount: state.errorCount,
    totalBytes: state.totalBytes,
    lastUpdated: new Date().toISOString(),
  };
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

async function archiveSingleRecording(customerPhone, upstreamUrl, callDate) {
  const storagePath = deriveStoragePath(customerPhone, upstreamUrl, callDate);
  const pathParts = storagePath.split('/');
  const folder = pathParts.slice(0, -1).join('/');
  const targetFile = pathParts[pathParts.length - 1];

  // 1. Fast in-memory check if already in bucket
  const files = await getFolderFiles(folder);
  if (files.has(targetFile)) {
    return { status: 'skipped_exists', storagePath };
  }

  // 2. Fetch with 15s timeout and 1 automatic retry
  let res = null;
  let attempts = 0;
  while (attempts < 2) {
    attempts++;
    try {
      res = await fetch(upstreamUrl, {
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) break;
    } catch (fetchErr) {
      if (attempts >= 2) throw fetchErr;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!res || !res.ok) {
    throw new Error(`HTTP ${res ? res.status : 'FetchFailed'}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  let uploadBuffer = Buffer.from(arrayBuffer);
  let finalPath = storagePath;
  let finalContentType = res.headers.get('content-type') || 'audio/x-wav';

  // Transcode to MP3 using ffmpeg if available
  const tempDir = path.resolve(__dirname, '../.temp_transcode');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const inWav = path.join(tempDir, `in_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.wav`);
  const outMp3 = inWav.replace(/\.wav$/, '.mp3');

  try {
    fs.writeFileSync(inWav, uploadBuffer);
    const { execSync } = require('child_process');
    execSync(`ffmpeg -y -i "${inWav}" -codec:a libmp3lame -b:a 32k -ac 1 "${outMp3}"`, { stdio: 'pipe' });
    if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 512) {
      uploadBuffer = fs.readFileSync(outMp3);
      finalPath = storagePath.replace(/\.wav$/i, '.mp3');
      finalContentType = 'audio/mpeg';
    }
  } catch {
    // If FFmpeg fails, fallback to uploading original WAV buffer
  } finally {
    try {
      if (fs.existsSync(inWav)) fs.unlinkSync(inWav);
      if (fs.existsSync(outMp3)) fs.unlinkSync(outMp3);
    } catch {}
  }

  // 3. Upload to Supabase bucket
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(finalPath, uploadBuffer, {
      contentType: finalContentType,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  // Update in-memory cache
  files.add(finalPath.split('/').pop());

  return { status: 'uploaded', storagePath: finalPath, bytes: uploadBuffer.length };
}

async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const maxLimit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 25;
  const isAll = args.includes('--all');
  const isReset = args.includes('--reset');

  const concurrencyIdx = args.indexOf('--concurrency');
  const concurrency = concurrencyIdx >= 0 ? Math.max(1, parseInt(args[concurrencyIdx + 1], 10)) : 4;

  if (isReset) {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      fs.unlinkSync(CHECKPOINT_FILE);
      console.log('Checkpoint file reset.');
    }
  }

  const state = loadCheckpoint();
  console.log(`=== In-House Call Recording Archival Worker ===`);
  console.log(`Target: ${isAll ? 'ALL Pending' : maxLimit} calls | Concurrency: ${concurrency}`);

  // Fetch pending count directly from Postgres
  const { count: pendingCount, error: countErr } = await supabase
    .from('ivr_call_records')
    .select('id', { count: 'exact', head: true })
    .not('raw_payload->>recording_url', 'is', null)
    .is('raw_payload->>storage_path', null);

  if (countErr) {
    console.error('Failed to get pending count:', countErr.message);
  } else {
    console.log(`Pending in Database needing archival: ${pendingCount}`);
  }

  if (state.processedIds.size > 0) {
    console.log(`Resuming session: ${state.processedIds.size} total records recorded in checkpoint.`);
  }

  // Graceful shutdown handling
  let isStopping = false;
  const handleExit = () => {
    if (isStopping) return;
    isStopping = true;
    console.log('\nPausing worker... Saving checkpoint.');
    saveCheckpoint(state);
    console.log('Checkpoint saved successfully. Exiting.');
    process.exit(0);
  };
  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);

  const BATCH_SIZE = 100;
  let totalProcessedThisRun = 0;
  let hasMore = true;

  while (hasMore && !isStopping) {
    const fetchLimit = isAll ? BATCH_SIZE : Math.min(BATCH_SIZE, maxLimit - totalProcessedThisRun);
    if (fetchLimit <= 0) break;

    // Fetch batch of records where storage_path is still NULL (with retry for transient network drops)
    let chunk = null;
    let queryAttempts = 0;
    while (queryAttempts < 10 && !isStopping) {
      queryAttempts++;
      try {
        const { data, error } = await supabase
          .from('ivr_call_records')
          .select('id, customer_phone, dial_time, created_at, raw_payload')
          .not('raw_payload->>recording_url', 'is', null)
          .is('raw_payload->>storage_path', null)
          .order('created_at', { ascending: false })
          .limit(fetchLimit);

        if (!error && data) {
          chunk = data;
          break;
        }
        const waitSec = Math.min(30, 2 * queryAttempts);
        console.warn(`[Batch Query] Attempt ${queryAttempts}/10 failed (${error?.message || 'unknown'}). Retrying in ${waitSec}s...`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
      } catch (err) {
        const waitSec = Math.min(30, 2 * queryAttempts);
        console.warn(`[Batch Query] Attempt ${queryAttempts}/10 exception: ${err.message}. Retrying in ${waitSec}s...`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
      }
    }

    if (!chunk) {
      console.error('Failed to query records after 10 attempts.');
      break;
    }
    if (!chunk || chunk.length === 0) {
      console.log('No more pending records found in database!');
      hasMore = false;
      break;
    }

    let chunkIndex = 0;
    let saveCounter = 0;

    async function processNext() {
      if (chunkIndex >= chunk.length || isStopping) return;

      const r = chunk[chunkIndex++];
      const phone = r.customer_phone;
      const url = r.raw_payload && r.raw_payload.recording_url;
      const callDate = r.dial_time || r.created_at;

      try {
        const result = await archiveSingleRecording(phone, url, callDate);
        state.processedIds.add(r.id);
        totalProcessedThisRun++;

        // Persist storage_path to Supabase record
        if (result.storagePath) {
          await supabase
            .from('ivr_call_records')
            .update({
              raw_payload: {
                ...(r.raw_payload || {}),
                storage_path: result.storagePath,
                archived_at: new Date().toISOString(),
              },
            })
            .eq('id', r.id);
        }

        if (result.status === 'uploaded') {
          state.uploadedCount++;
          state.totalBytes += result.bytes || 0;
          console.log(`[#${totalProcessedThisRun}] OK: ${phone} -> ${(result.bytes / 1024 / 1024).toFixed(2)} MB (${result.storagePath})`);
        } else {
          state.skippedCount++;
          console.log(`[#${totalProcessedThisRun}] SKIP: ${phone} (Already in storage) -> ${result.storagePath}`);
        }
      } catch (err) {
        state.errorCount++;
        totalProcessedThisRun++;

        const is404 = err.message && (err.message.includes('404') || err.message.includes('FetchFailed'));
        if (is404) {
          state.processedIds.add(r.id);
          // Permanently mark in database as expired so it's excluded from future archival passes
          await supabase
            .from('ivr_call_records')
            .update({
              raw_payload: {
                ...(r.raw_payload || {}),
                storage_path: 'expired_404',
                storage_error: 'HTTP 404 - Expired on Telephony Server',
                archived_at: new Date().toISOString(),
              },
            })
            .eq('id', r.id);
          console.warn(`[#${totalProcessedThisRun}] EXPIRED (404): ${phone}`);
        } else {
          console.warn(`[#${totalProcessedThisRun}] RETRYABLE FAIL: ${phone} (${err.message})`);
        }
      }

      saveCounter++;
      if (saveCounter % 15 === 0) {
        saveCheckpoint(state);
      }
    }

    // Run chunk with concurrency pool
    const pool = Array.from({ length: concurrency }, async () => {
      while (chunkIndex < chunk.length && !isStopping) {
        await processNext();
      }
    });

    await Promise.all(pool);
    saveCheckpoint(state);

    if (!isAll && totalProcessedThisRun >= maxLimit) {
      break;
    }
  }

  saveCheckpoint(state);

  console.log('\n=======================================');
  console.log('Archival Migration Summary');
  console.log('=======================================');
  console.log(`Processed This Run:${totalProcessedThisRun}`);
  console.log(`Total In Checkpoint:${state.processedIds.size}`);
  console.log(`Newly Uploaded:    ${state.uploadedCount} (${(state.totalBytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Already In Storage:${state.skippedCount}`);
  console.log(`Failed / Expired:  ${state.errorCount}`);
  console.log('=======================================\n');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
