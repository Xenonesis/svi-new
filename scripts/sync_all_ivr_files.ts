import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '../src/lib/supabase/admin.js';
import {
  parseIvrCsvText,
  normalizeCallKey,
  resolveAdvisorId,
  cleanPhoneNumber,
  calculateLeadTemperature,
  type AdvisorProfile,
  type ParsedIvrRecord,
} from '../src/lib/leads/ivrParser.js';

async function main() {
  console.log('🚀 Starting IVR folder sync into Supabase...');

  // 1. Fetch profiles
  const { data: profilesData, error: profErr } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, phone')
    .in('role', ['employee', 'admin']);

  if (profErr) {
    console.error('Error fetching profiles:', profErr);
    process.exit(1);
  }

  const profiles: AdvisorProfile[] = profilesData || [];
  console.log(`✅ Loaded ${profiles.length} profiles from database.`);

  // 2. Fetch existing call keys to avoid duplicates
  console.log('Fetching existing ivr_call_records keys...');
  const existingKeys = new Set<string>();
  let page = 0;
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('ivr_call_records')
      .select('customer_phone, dial_time')
      .range(page * 1000, (page + 1) * 1000 - 1);

    if (error) {
      console.error('Error fetching existing calls:', error);
      break;
    }
    if (!data || data.length === 0) break;
    data.forEach((r: { customer_phone: string; dial_time: string }) => {
      existingKeys.add(normalizeCallKey(r.customer_phone, r.dial_time));
    });
    if (data.length < 1000) break;
    page++;
  }
  console.log(`✅ Found ${existingKeys.size} existing calls in database.`);

  // 3. Scan ivr folder
  const ivrDir = path.resolve(process.cwd(), 'ivr');
  if (!fs.existsSync(ivrDir)) {
    console.error('Directory ivr/ not found');
    process.exit(1);
  }

  const allFiles = fs.readdirSync(ivrDir).filter((f) => f.endsWith('.csv'));
  console.log(`📂 Found ${allFiles.length} CSV files in ivr/`);

  const newCallsMap = new Map<string, any>();
  const uniqueLeadsMap = new Map<string, any>();
  let skippedDuplicates = 0;

  for (const file of allFiles) {
    const filePath = path.join(ivrDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    if (file.startsWith('report')) {
      const records = parseIvrCsvText(content);
      for (const r of records) {
        const key = normalizeCallKey(r.customer_phone, r.dial_time);
        if (existingKeys.has(key)) {
          skippedDuplicates++;
          continue;
        }
        if (!newCallsMap.has(key)) {
          const assignedId = resolveAdvisorId(r.agent_name, r.agent_number, profiles);
          newCallsMap.set(key, {
            customer_phone: r.customer_phone,
            agent_name: r.agent_name,
            agent_phone: r.agent_number,
            assigned_agent_id: assignedId,
            dial_time: r.dial_time,
            customer_ans_time: r.customer_ans_time,
            customer_hang_time: r.customer_hang_time,
            call_duration: r.call_duration,
            dial_status: r.dial_status,
            pressed_key: r.pressed_key,
            campaign_name: `IVR Report - ${file.replace('.csv', '')}`,
          });

          // Lead update
          const existingLead = uniqueLeadsMap.get(r.customer_phone);
          if (
            !existingLead ||
            r.call_duration > existingLead.call_duration ||
            (r.pressed_key === '1' && existingLead.pressed_key !== '1')
          ) {
            uniqueLeadsMap.set(r.customer_phone, {
              ...r,
              assigned_agent_id: assignedId,
            });
          }
        }
      }
    } else if (file.startsWith('CALL_LOGS')) {
      const lines = content.split(/\r?\n/).filter((l) => l.trim());
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/"/g, '').trim());
        if (parts.length >= 12) {
          const customerPhone = cleanPhoneNumber(parts[2]);
          const agentPhone = cleanPhoneNumber(parts[3]);
          const agentName = parts[4] || 'Unassigned';
          const dialTime = parts[5] || new Date().toISOString();
          const ansTime = parts[6] && !parts[6].startsWith('0000') ? parts[6] : null;
          const endTime = parts[7] && !parts[7].startsWith('0000') ? parts[7] : null;
          const duration = parseInt(parts[8], 10) || 0;
          const dialStatus = (parts[11] || '').toUpperCase().includes('ANSWER')
            ? 'ANSWER'
            : 'NOANSWER';

          if (!customerPhone) continue;
          const key = normalizeCallKey(customerPhone, dialTime);
          if (existingKeys.has(key)) {
            skippedDuplicates++;
            continue;
          }
          if (!newCallsMap.has(key)) {
            const assignedId = resolveAdvisorId(agentName, agentPhone, profiles);
            newCallsMap.set(key, {
              customer_phone: customerPhone,
              agent_name: agentName,
              agent_phone: agentPhone,
              assigned_agent_id: assignedId,
              dial_time: dialTime,
              customer_ans_time: ansTime,
              customer_hang_time: endTime,
              call_duration: duration,
              dial_status: dialStatus,
              pressed_key: null,
              campaign_name: `IVR CallLogs - ${file.replace('.csv', '')}`,
            });

            const existingLead = uniqueLeadsMap.get(customerPhone);
            if (!existingLead || duration > existingLead.call_duration) {
              uniqueLeadsMap.set(customerPhone, {
                customer_phone: customerPhone,
                agent_name: agentName,
                agent_number: agentPhone,
                assigned_agent_id: assignedId,
                dial_time: dialTime,
                call_duration: duration,
                dial_status: dialStatus,
                pressed_key: null,
                temperature: calculateLeadTemperature(duration, null),
              });
            }
          }
        }
      }
    }
  }

  const callsToInsert = Array.from(newCallsMap.values());
  console.log(
    `📊 Found ${callsToInsert.length} new calls to insert (${skippedDuplicates} duplicates skipped).`
  );

  // 4. Batch insert into ivr_call_records in chunks of 500
  const CHUNK_SIZE = 500;
  let insertedCalls = 0;
  for (let i = 0; i < callsToInsert.length; i += CHUNK_SIZE) {
    const chunk = callsToInsert.slice(i, i + CHUNK_SIZE);
    const { error: insErr } = await supabaseAdmin.from('ivr_call_records').insert(chunk);
    if (insErr) {
      console.error(`Error inserting chunk ${i} - ${i + CHUNK_SIZE}:`, insErr.message);
    } else {
      insertedCalls += chunk.length;
      if (insertedCalls % 2500 === 0 || insertedCalls === callsToInsert.length) {
        console.log(`  Inserted ${insertedCalls}/${callsToInsert.length} calls...`);
      }
    }
  }
  console.log(`🎉 Finished inserting ${insertedCalls} new IVR call records!`);

  // 5. Batch upsert unique customer leads into chat_leads
  const uniqueLeads = Array.from(uniqueLeadsMap.values());
  console.log(`📈 Upserting ${uniqueLeads.length} unique leads into chat_leads...`);
  const chatLeadsToUpsert = uniqueLeads.map((u) => {
    const status = u.call_duration >= 20 ? 'contacted' : 'new';
    const keyNote = u.pressed_key ? `Key: ${u.pressed_key}` : 'No key';
    const notes = `IVR Call: ${u.call_duration}s, Status: ${u.dial_status}, ${keyNote}, Agent: ${u.agent_name}`;
    const normalizedPhone = u.customer_phone.startsWith('+91')
      ? u.customer_phone
      : `+91${u.customer_phone.replace(/\D/g, '').slice(-10)}`;

    return {
      phone: u.customer_phone,
      normalized_phone: normalizedPhone,
      name: `IVR Lead - ${u.customer_phone}`,
      source: 'ivr',
      assigned_to: u.assigned_agent_id,
      temperature: u.temperature || calculateLeadTemperature(u.call_duration, u.pressed_key),
      lifecycle_status: status,
      notes,
      created_at: u.dial_time,
      updated_at: new Date().toISOString(),
    };
  });

  let upsertedLeads = 0;
  for (let i = 0; i < chatLeadsToUpsert.length; i += CHUNK_SIZE) {
    const chunk = chatLeadsToUpsert.slice(i, i + CHUNK_SIZE);
    const { error: upsertErr } = await supabaseAdmin.from('chat_leads').upsert(chunk, {
      onConflict: 'normalized_phone',
      ignoreDuplicates: false,
    });
    if (upsertErr) {
      console.warn(`Lead upsert chunk ${i} warning:`, upsertErr.message);
    } else {
      upsertedLeads += chunk.length;
      if (upsertedLeads % 2500 === 0 || upsertedLeads === chatLeadsToUpsert.length) {
        console.log(`  Upserted ${upsertedLeads}/${chatLeadsToUpsert.length} leads...`);
      }
    }
  }
  console.log(`🎉 Finished upserting ${upsertedLeads} chat_leads!`);
}

main()
  .then(() => {
    console.log('✅ All IVR files synced successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error syncing IVR files:', err);
    process.exit(1);
  });
