/**
 * Historical Call Recording Archival Script (Third-Party -> In-House Supabase Storage)
 *
 * Usage:
 *   node scripts/archive_ivr_recordings.cjs --limit 100
 *   node scripts/archive_ivr_recordings.cjs --all
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

function deriveStoragePath(customerPhone, upstreamUrl) {
  const cleanPhone = (customerPhone || '').replace(/\D/g, '').slice(-10) || 'unknown';
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

async function archiveSingleRecording(customerPhone, upstreamUrl) {
  const storagePath = deriveStoragePath(customerPhone, upstreamUrl);
  const pathParts = storagePath.split('/');
  const folder = pathParts.slice(0, -1).join('/');
  const targetFile = pathParts[pathParts.length - 1];

  // 1. Check if already uploaded
  const { data: existingFiles } = await supabase.storage
    .from(BUCKET)
    .list(folder, { search: targetFile, limit: 1 });

  if (existingFiles && existingFiles.some((f) => f.name === targetFile)) {
    return { status: 'skipped_exists', storagePath };
  }

  // 2. Fetch from third-party telephony server
  const res = await fetch(upstreamUrl);
  if (!res.ok) {
    throw new Error(`Upstream returned HTTP ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = res.headers.get('content-type') || 'audio/x-wav';

  // 3. Upload to in-house Supabase bucket
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

  console.log(`Starting in-house archival migration (Target: ${isAll ? 'ALL' : maxLimit} calls)...`);

  const { data: records, error } = await supabase
    .from('ivr_call_records')
    .select('id, customer_phone, raw_payload')
    .not('raw_payload->>recording_url', 'is', null)
    .limit(isAll ? 50000 : maxLimit);

  if (error) {
    console.error('Failed to query records:', error.message);
    process.exit(1);
  }

  console.log(`Found ${records.length} records with recording URLs.`);

  let uploadedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const phone = r.customer_phone;
    const url = r.raw_payload && r.raw_payload.recording_url;

    if (!url) continue;

    process.stdout.write(`[${i + 1}/${records.length}] Archiving ${phone}... `);
    try {
      const result = await archiveSingleRecording(phone, url);
      if (result.status === 'uploaded') {
        uploadedCount++;
        console.log(`OK (Uploaded ${(result.bytes / 1024 / 1024).toFixed(2)} MB to ${result.storagePath})`);
      } else {
        skippedCount++;
        console.log(`SKIPPED (Already in storage)`);
      }
    } catch (err) {
      errorCount++;
      console.log(`FAILED (${err.message})`);
    }
  }

  console.log('\n--- Archival Migration Summary ---');
  console.log(`Total Processed: ${records.length}`);
  console.log(`Newly Uploaded:  ${uploadedCount}`);
  console.log(`Already In-House:${skippedCount}`);
  console.log(`Failed:          ${errorCount}`);
}

main().catch((e) => {
  console.error('Fatal archival error:', e);
  process.exit(1);
});
