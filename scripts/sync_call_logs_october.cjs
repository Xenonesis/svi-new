/**
 * October IVR Call Logs Synchronizer
 * Ingests 5,761 call records from CALL_LOGS.csv into Supabase
 * Tables: `ivr_call_records` and `chat_leads`
 *
 * Usage:
 *   node scripts/sync_call_logs_october.cjs --dry-run   (Simulation mode, zero DB changes)
 *   node scripts/sync_call_logs_october.cjs --live      (Production batch insertion)
 */

const fs = require('fs');
const path = require('path');

// 1. Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
let supabaseUrl = 'https://rfvhjgetfbalndgtkpaa.supabase.co';
let supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdmhqZ2V0ZmJhbG5kZ3RrcGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk5Njc0MSwiZXhwIjoyMDk0NTcyNzQxfQ.kqsfbfNmq6oVspQ3LyEfdo97r0UixG1L2lrCPY-9zJY';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1].replace(/["']/g, '').trim();
    } else if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseKey = trimmed.split('=')[1].replace(/["']/g, '').trim();
    }
  }
}

const isLive = process.argv.includes('--live');
const isDryRun = process.argv.includes('--dry-run') || !isLive;

console.log('================================================================');
console.log(`MODE: ${isLive ? '🚀 LIVE DATABASE INSERTION' : '🔍 DRY-RUN SIMULATION (NO CHANGES)'}`);
console.log('================================================================');

function cleanPhone(raw) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits.slice(-10);
}

function normalizeKey(phone, dialTime) {
  const p = cleanPhone(phone);
  const t = (dialTime || '')
    .replace('T', ' ')
    .replace(/\+.*$/, '')
    .replace(/Z$/, '')
    .replace(/\.\d+$/, '')
    .trim();
  return `${p}_${t}`;
}

function calculateTemp(duration, key) {
  const k = key ? String(key).trim() : '';
  if (k === '1' || duration >= 60) return 'hot';
  if (duration >= 20 && duration < 60) return 'warm';
  return 'cold';
}

function parseCsvLine(line) {
  const res = [];
  let inQuote = false;
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuote = !inQuote;
    } else if (c === ',' && !inQuote) {
      res.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  res.push(cur.trim());
  return res.map(cell => cell.replace(/^["']|["']$/g, '').trim());
}

const aliasMap = {
  deepa: ['deepa', 'deepa sharma'],
  ruby: ['ruby'],
  riya: ['riya'],
  arbaaz: ['arbaaz', 'arwaz'],
  khushbu: ['khushbu', 'khusboo', 'kushbo'],
  ananya: ['ananya', 'anaya'],
  shubham: ['shubham'],
  raghvendra: ['raghvendra', 'ragvendra'],
  gaurav: ['gaurav', 'gagan', 'ganga'],
  javed: ['javed'],
  luv: ['luv'],
  piyush: ['piyush'],
  prateek: ['prateek', 'prteek'],
  suhan: ['suhan'],
  aryan: ['aryan'],
  dheeraj: ['dheeraj', 'dhiraj'],
  deepak: ['deepak'],
  santosh: ['santosh'],
  shashank: ['shashank'],
  shivam: ['shivam'],
  shikha: ['shikha', 'shikha tomer', 'shikha tomar'],
  khushi: ['khushi', 'khushi pal', 'khushi chodhary'],
  manish: ['manish', 'manish sharma'],
  soniya: ['soniya', 'sonia', 'sonia garg', 'soniya garg'],
  kajal: ['kajal', 'kajal singh', 'kajal vishu'],
  abhishek: ['abhishek', 'abhishek singh', 'abhishek kumar'],
  amarnath: ['amarnath', 'amarnath sharma'],
  vinod: ['vinod', 'vinod ji'],
  wasi: ['wasi', 'haider wasi', 'wasi haider'],
  rashmi: ['rashmi', 'rashmi shakya']
};

function resolveAdvisor(agentName, agentPhone, profiles) {
  const normName = (agentName || '').trim().toLowerCase();
  const normPhone = cleanPhone(agentPhone);

  // 1. Phone match first
  if (normPhone) {
    const matchByPhone = profiles.find(p => p.phone && cleanPhone(p.phone) === normPhone);
    if (matchByPhone) return matchByPhone.id;
  }

  // 2. Exact or partial full_name
  const matchByName = profiles.find(p => {
    const pn = (p.full_name || '').trim().toLowerCase();
    return pn === normName || pn.includes(normName) || normName.includes(pn);
  });
  if (matchByName) return matchByName.id;

  // 3. Alias map
  for (const [keyName, aliases] of Object.entries(aliasMap)) {
    if (aliases.some(a => normName.includes(a))) {
      const matchAlias = profiles.find(p => (p.full_name || '').toLowerCase().includes(keyName));
      if (matchAlias) return matchAlias.id;
    }
  }

  return null;
}

async function run() {
  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  };

  // 1. Fetch employee & admin profiles from Supabase
  console.log('1. Loading advisor profiles from Supabase...');
  const profRes = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id,full_name,phone,role`, { headers });
  const allProfiles = await profRes.json();
  const profiles = allProfiles.filter(p => p.role === 'employee' || p.role === 'admin');
  console.log(`   Loaded ${profiles.length} active staff profiles.`);

  // 2. Fetch existing call keys from ivr_call_records
  console.log('2. Fetching existing call keys from ivr_call_records...');
  const existingKeys = new Set();
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const from = page * pageSize;
    const to = (page + 1) * pageSize - 1;
    const res = await fetch(`${supabaseUrl}/rest/v1/ivr_call_records?select=customer_phone,dial_time`, {
      headers: {
        ...headers,
        Range: `${from}-${to}`,
        'Range-Unit': 'items'
      }
    });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    for (const r of data) {
      existingKeys.add(normalizeKey(r.customer_phone, r.dial_time));
    }
    page++;
    if (data.length < pageSize) break;
  }
  console.log(`   Found ${existingKeys.size} existing calls in database.`);

  // 3. Read and parse CALL_LOGS.csv
  const csvPath = 'C:/Users/Acer/Desktop/svi-new/CALL_LOGS.csv';
  console.log(`3. Reading and parsing ${csvPath}...`);
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  console.log(`   Total CSV rows: ${lines.length - 1} calls.`);

  const callsToInsert = [];
  const uniqueLeadsMap = new Map();
  let duplicateCount = 0;
  let realRecordingsCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    if (parts.length < 12) continue;

    const customerPhone = cleanPhone(parts[2]);
    if (!customerPhone) continue;

    const virtualNumber = parts[1];
    const agentPhone = cleanPhone(parts[3]);
    const agentName = parts[4] || 'Unassigned';
    const dialTime = parts[5];
    const rawAnsTime = parts[6];
    const rawHangTime = parts[7];
    const duration = parseInt(parts[8], 10) || 0;
    const pulse = parseInt(parts[9], 10) || undefined;
    const rawStatus = parts[10] || 'NOANSWER';
    const dailStatus = (parts[11] || 'NOANSWER').toUpperCase();
    const dialStatus = dailStatus === 'ANSWER' ? 'ANSWER' : 'NOANSWER';
    const rawRecording = parts[12];

    const ansTime = rawAnsTime && rawAnsTime !== 'NA' && !rawAnsTime.startsWith('0000-00-00') ? rawAnsTime : null;
    const hangTime = rawHangTime && rawHangTime !== 'NA' && !rawHangTime.startsWith('0000-00-00') ? rawHangTime : null;

    const recordingUrl = rawRecording && !rawRecording.includes('0000-00-00') && rawRecording.startsWith('http')
      ? rawRecording
      : null;

    if (recordingUrl) realRecordingsCount++;

    const key = normalizeKey(customerPhone, dialTime);
    if (existingKeys.has(key)) {
      duplicateCount++;
      continue;
    }

    const assignedAgentId = resolveAdvisor(agentName, agentPhone, profiles);

    const rawPayload = {
      virtual_number: virtualNumber,
      pulse: pulse,
      status: rawStatus,
      raw_dail_status: parts[11],
      recording_url: recordingUrl
    };

    const callRecord = {
      customer_phone: customerPhone,
      agent_name: agentName,
      agent_phone: agentPhone,
      assigned_agent_id: assignedAgentId,
      dial_time: dialTime,
      customer_ans_time: ansTime,
      customer_hang_time: hangTime,
      call_duration: duration,
      dial_status: dialStatus,
      pressed_key: null,
      campaign_name: 'IVR Campaign - CALL_LOGS October 2026',
      raw_payload: rawPayload
    };

    callsToInsert.push(callRecord);

    // Track highest engagement for unique lead CRM upsert
    const existingLead = uniqueLeadsMap.get(customerPhone);
    const temp = calculateTemp(duration, null);
    if (!existingLead || duration > existingLead.call_duration) {
      uniqueLeadsMap.set(customerPhone, {
        customer_phone: customerPhone,
        agent_name: agentName,
        assigned_agent_id: assignedAgentId,
        dial_time: dialTime,
        call_duration: duration,
        dial_status: dialStatus,
        temperature: temp,
        recording_url: recordingUrl
      });
    }
  }

  console.log('\n=== PARSING & DEDUPLICATION METRICS ===');
  console.log(`Total CSV calls:             ${lines.length - 1}`);
  console.log(`Existing calls skipped:      ${duplicateCount}`);
  console.log(`Brand NEW calls to insert:   ${callsToInsert.length}`);
  console.log(`Calls with Audio Recordings: ${realRecordingsCount}`);
  console.log(`Unique customer leads:       ${uniqueLeadsMap.size}`);

  // Advisor breakdown
  const advMap = {};
  let resolvedCount = 0;
  for (const c of callsToInsert) {
    if (c.assigned_agent_id) resolvedCount++;
    advMap[c.agent_name] = (advMap[c.agent_name] || 0) + 1;
  }
  console.log(`\nAdvisor Resolution: ${resolvedCount} / ${callsToInsert.length} calls mapped to active profile UUIDs.`);
  console.log('Top Advisors in New Calls:');
  for (const [name, count] of Object.entries(advMap).sort((a,b) => b[1] - a[1]).slice(0, 10)) {
    console.log(`  - ${name}: ${count} calls`);
  }

  // Date breakdown
  const dateMap = {};
  for (const c of callsToInsert) {
    const d = c.dial_time.substring(0, 10);
    dateMap[d] = (dateMap[d] || 0) + 1;
  }
  console.log('\nDate Breakdown:');
  for (const [d, count] of Object.entries(dateMap).sort()) {
    console.log(`  - ${d}: ${count} calls`);
  }

  // Lead temperature breakdown
  let hotCount = 0;
  let warmCount = 0;
  let coldCount = 0;
  for (const l of uniqueLeadsMap.values()) {
    if (l.temperature === 'hot') hotCount++;
    else if (l.temperature === 'warm') warmCount++;
    else coldCount++;
  }
  console.log('\nUnique Leads Temperature Breakdown:');
  console.log(`  - Hot Leads (>= 60s):   ${hotCount}`);
  console.log(`  - Warm Leads (20s-59s): ${warmCount}`);
  console.log(`  - Cold Leads (< 20s):   ${coldCount}`);

  if (isDryRun) {
    console.log('\n================================================================');
    console.log('✅ DRY-RUN COMPLETED SUCCESSFULLY.');
    console.log('Zero database changes made. Ready for --live execution.');
    console.log('================================================================');
    return;
  }

  // 4. LIVE INSERTION INTO ivr_call_records
  console.log('\n🚀 Starting LIVE batch insertion into ivr_call_records...');
  const CHUNK_SIZE = 400;
  let insertedCalls = 0;

  for (let i = 0; i < callsToInsert.length; i += CHUNK_SIZE) {
    const chunk = callsToInsert.slice(i, i + CHUNK_SIZE);
    const res = await fetch(`${supabaseUrl}/rest/v1/ivr_call_records`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(chunk)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ Error inserting calls chunk ${i}-${i + chunk.length}:`, errText);
      throw new Error(`Failed to insert calls chunk: ${errText}`);
    }

    insertedCalls += chunk.length;
    console.log(`   Inserted ${insertedCalls} / ${callsToInsert.length} calls (${((insertedCalls / callsToInsert.length) * 100).toFixed(1)}%)...`);
  }
  console.log(`🎉 Successfully inserted all ${insertedCalls} new IVR call records!`);

  // 5. LIVE UPSERT INTO chat_leads
  console.log('\n🚀 Starting LIVE batch upsert into chat_leads...');
  const chatLeadsToUpsert = Array.from(uniqueLeadsMap.values()).map(u => {
    const status = u.call_duration >= 20 ? 'contacted' : 'new';
    const notes = `IVR Call: ${u.call_duration}s, Status: ${u.dial_status}, Agent: ${u.agent_name}`;
    const normalizedPhone = `+91${u.customer_phone}`;

    return {
      phone: u.customer_phone,
      normalized_phone: normalizedPhone,
      name: `IVR Lead - ${u.customer_phone}`,
      source: 'ivr',
      assigned_to: u.assigned_agent_id,
      temperature: u.temperature,
      lifecycle_status: status,
      notes,
      created_at: u.dial_time,
      updated_at: new Date().toISOString()
    };
  });

  let upsertedLeads = 0;
  for (let i = 0; i < chatLeadsToUpsert.length; i += CHUNK_SIZE) {
    const chunk = chatLeadsToUpsert.slice(i, i + CHUNK_SIZE);
    const res = await fetch(`${supabaseUrl}/rest/v1/chat_leads?on_conflict=normalized_phone`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(chunk)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ Error upserting leads chunk ${i}-${i + chunk.length}:`, errText);
      throw new Error(`Failed to upsert leads chunk: ${errText}`);
    }

    upsertedLeads += chunk.length;
    console.log(`   Upserted ${upsertedLeads} / ${chatLeadsToUpsert.length} leads (${((upsertedLeads / chatLeadsToUpsert.length) * 100).toFixed(1)}%)...`);
  }
  console.log(`🎉 Successfully upserted all ${upsertedLeads} chat leads!`);

  // 6. Verify final counts from database
  console.log('\n🔍 Verifying final counts directly from Supabase...');
  const finalCallsRes = await fetch(`${supabaseUrl}/rest/v1/ivr_call_records?select=id`, {
    headers: { ...headers, Range: '0-0', 'Range-Unit': 'items', Prefer: 'count=exact' }
  });
  const finalLeadsRes = await fetch(`${supabaseUrl}/rest/v1/chat_leads?select=id`, {
    headers: { ...headers, Range: '0-0', 'Range-Unit': 'items', Prefer: 'count=exact' }
  });

  console.log(`   Total ivr_call_records in DB: ${finalCallsRes.headers.get('content-range')}`);
  console.log(`   Total chat_leads in DB:        ${finalLeadsRes.headers.get('content-range')}`);
  console.log('\n✅ SYNC COMPLETE AND VERIFIED!');
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
