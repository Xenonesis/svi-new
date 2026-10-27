/**
 * Robust Historical Call Recording Archival Script (Third-Party -> In-House Supabase Storage)
 *
 * Features:
 *   - Concurrent workers (default: 3)
 *   - Persistent checkpointing (.archive_progress.json)
 *   - Auto-resume on restart
 *   - 15s download timeouts
 *   - Clean SIGINT/SIGTERM handling
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

  // 1. Check if already in bucket
  const { data: existingFiles } = await supabase.storage
    .from(BUCKET)
    .list(folder, { search: targetFile, limit: 1 });

  if (existingFiles && existingFiles.some((f) => f.name === targetFile)) {
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
  const buffer = Buffer.from(arrayBuffer);
  const contentType = res.headers.get('content-type') || 'audio/x-wav';

  // 3. Upload to Supabase bucket
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  return { status: 'uploaded', storagePath, bytes: buffer.length };
}

async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const maxLimit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 25;
  const isAll = args.includes('--all');
  const isReset = args.includes('--reset');

  const concurrencyIdx = args.indexOf('--concurrency');
  const concurrency = concurrencyIdx >= 0 ? Math.max(1, parseInt(args[concurrencyIdx + 1], 10)) : 3;

  if (isReset) {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      fs.unlinkSync(CHECKPOINT_FILE);
      console.log('Checkpoint file reset.');
    }
  }

  const state = loadCheckpoint();
  console.log(`=== In-House Call Recording Archival Worker ===`);
  console.log(`Target: ${isAll ? 'ALL' : maxLimit} calls | Concurrency: ${concurrency}`);
  if (state.processedIds.size > 0) {
    console.log(`Resuming from checkpoint: ${state.processedIds.size} already processed in previous runs.`);
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

  // Fetch candidate records using range pagination (bypassing PostgREST 1000 row cap)
  console.log('Fetching candidate call records from Supabase...');
  const records = [];
  const PAGE_SIZE = 1000;
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const to = from + PAGE_SIZE - 1;
    const { data: chunk, error } = await supabase
      .from('ivr_call_records')
      .select('id, customer_phone, dial_time, created_at, raw_payload')
      .not('raw_payload->>recording_url', 'is', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Failed to query records chunk:', error.message);
      process.exit(1);
    }

    if (!chunk || chunk.length === 0) {
      hasMore = false;
    } else {
      records.push(...chunk);
      if (chunk.length < PAGE_SIZE || (!isAll && records.length >= maxLimit + state.processedIds.size)) {
        hasMore = false;
      } else {
        from += PAGE_SIZE;
      }
    }
  }

  // Filter out records already in checkpoint
  const pendingRecords = records.filter((r) => {
    const url = r.raw_payload && r.raw_payload.recording_url;
    return url && !state.processedIds.has(r.id);
  });

  const recordsToProcess = isAll ? pendingRecords : pendingRecords.slice(0, maxLimit);

  console.log(`Total database candidates fetched: ${records.length}`);
  console.log(`Eligible to process in this run: ${recordsToProcess.length}\n`);

  if (recordsToProcess.length === 0) {
    console.log('No pending recordings to archive. All records up to date!');
    return;
  }

  let index = 0;
  let saveCounter = 0;

  async function processNext() {
    if (index >= recordsToProcess.length || isStopping) return;

    const r = recordsToProcess[index++];
    const phone = r.customer_phone;
    const url = r.raw_payload && r.raw_payload.recording_url;
    const callDate = r.dial_time || r.created_at;

    try {
      const result = await archiveSingleRecording(phone, url, callDate);
      state.processedIds.add(r.id);

      // Persist storage_path to Supabase record
      if (result.storagePath && (!r.raw_payload?.storage_path || r.raw_payload.storage_path !== result.storagePath)) {
        await supabase
          .from('ivr_call_records')
          .update({
            raw_payload: {
              ...(r.raw_payload || {}),
              storage_path: result.storagePath,
              archived_at: new Date().toISOString()
            }
          })
          .eq('id', r.id);
      }

      if (result.status === 'uploaded') {
        state.uploadedCount++;
        state.totalBytes += result.bytes || 0;
        console.log(`[${state.processedIds.size}/${records.length}] OK: ${phone} -> ${(result.bytes / 1024 / 1024).toFixed(2)} MB`);
      } else {
        state.skippedCount++;
        console.log(`[${state.processedIds.size}/${records.length}] SKIP: ${phone} (Already in storage)`);
      }
    } catch (err) {
      state.errorCount++;
      // Still mark ID as attempted so one broken URL doesn't stall the loop forever
      state.processedIds.add(r.id);
      console.warn(`[${state.processedIds.size}/${records.length}] FAIL: ${phone} (${err.message})`);
    }

    saveCounter++;
    if (saveCounter % 15 === 0) {
      saveCheckpoint(state);
    }
  }

  // Concurrency Pool Runner
  const pool = Array.from({ length: concurrency }, async () => {
    while (index < recordsToProcess.length && !isStopping) {
      await processNext();
    }
  });

  await Promise.all(pool);
  saveCheckpoint(state);

  console.log('\n=======================================');
  console.log('Archival Migration Summary');
  console.log('=======================================');
  console.log(`Total Attempted:   ${state.processedIds.size}`);
  console.log(`Newly Uploaded:    ${state.uploadedCount} (${(state.totalBytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Already In Storage:${state.skippedCount}`);
  console.log(`Failed / Inactive: ${state.errorCount}`);
  console.log('=======================================\n');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
