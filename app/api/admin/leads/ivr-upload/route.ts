import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import {
  parseIvrCsvText,
  resolveAdvisorId,
  type AdvisorProfile,
  type ParsedIvrRecord,
} from '@/src/lib/leads/ivrParser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface UploadResponsePayload {
  success: boolean;
  campaign_name: string;
  processed_calls: number;
  new_calls_inserted: number;
  duplicate_calls_skipped: number;
  unique_leads: number;
  answered_calls: number;
  missed_calls: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    let csvText = '';
    let campaignName = 'IVR Campaign';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const nameField = formData.get('campaign_name') as string | null;
      if (nameField && nameField.trim()) {
        campaignName = nameField.trim();
      }

      if (!file) {
        throw AppError.badRequest('No file uploaded');
      }
      csvText = await file.text();
    } else {
      const body = await request.json().catch(() => null);
      csvText = body?.csvText || body?.csvContent || body?.fileContent || '';
      if (body?.campaignName || body?.campaign_name) {
        campaignName = (body.campaignName || body.campaign_name).trim();
      }
    }

    if (!csvText || !csvText.trim()) {
      throw AppError.badRequest('CSV content cannot be empty');
    }

    // 1. Parse CSV
    const parsedRecords = parseIvrCsvText(csvText);
    if (parsedRecords.length === 0) {
      throw AppError.badRequest('No valid call records found in CSV file');
    }

    // Deduplicate within the uploaded CSV batch itself
    const batchKeyMap = new Map<string, ParsedIvrRecord>();
    for (const r of parsedRecords) {
      const key = `${r.customer_phone}_${r.dial_time}`;
      if (!batchKeyMap.has(key)) {
        batchKeyMap.set(key, r);
      }
    }
    const deduplicatedRecords = Array.from(batchKeyMap.values());

    // 2. Fetch Advisors for auto-resolution
    const { data: profilesData } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone')
      .in('role', ['employee', 'admin']);

    const profiles: AdvisorProfile[] = (profilesData || []).map(
      (p: { id: string; full_name: string; phone?: string | null }) => ({
        id: p.id,
        full_name: p.full_name,
        phone: p.phone,
      })
    );

    // 3. Prepare IVR Call Records
    const callRecordsToProcess = deduplicatedRecords.map((r: ParsedIvrRecord) => {
      const assignedId = resolveAdvisorId(r.agent_name, r.agent_number, profiles);
      return {
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
        campaign_name: campaignName,
      };
    });

    // 4. Batch insert into ivr_call_records with idempotent duplicate check
    const CHUNK_SIZE = 400;
    let newCallsInserted = 0;
    let duplicateCallsSkipped = 0;

    for (let i = 0; i < callRecordsToProcess.length; i += CHUNK_SIZE) {
      const chunk = callRecordsToProcess.slice(i, i + CHUNK_SIZE);
      const phones = Array.from(new Set(chunk.map((c) => c.customer_phone)));

      // Check which calls in this chunk already exist in ivr_call_records
      const { data: existingInDb } = await supabaseAdmin
        .from('ivr_call_records')
        .select('customer_phone, dial_time')
        .in('customer_phone', phones);

      const existingSet = new Set(
        (existingInDb || []).map((e) => `${e.customer_phone}_${e.dial_time}`)
      );

      const genuinelyNewCalls = chunk.filter(
        (c) => !existingSet.has(`${c.customer_phone}_${c.dial_time}`)
      );

      duplicateCallsSkipped += chunk.length - genuinelyNewCalls.length;

      if (genuinelyNewCalls.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('ivr_call_records')
          .insert(genuinelyNewCalls);

        if (insertError) {
          console.warn('ivr_call_records insert warning:', insertError.message);
        } else {
          newCallsInserted += genuinelyNewCalls.length;
        }
      }
    }

    // 5. Aggregate unique customer leads for CRM (highest engagement per number)
    const uniqueLeadMap = new Map<string, ParsedIvrRecord>();
    let countAnswered = 0;
    let countMissed = 0;

    for (const record of deduplicatedRecords) {
      if (record.dial_status === 'ANSWER') {
        countAnswered++;
      } else {
        countMissed++;
      }

      const existing = uniqueLeadMap.get(record.customer_phone);
      if (!existing) {
        uniqueLeadMap.set(record.customer_phone, record);
      } else {
        // Replace with higher engagement record
        if (
          record.call_duration > existing.call_duration ||
          (record.pressed_key === '1' && existing.pressed_key !== '1')
        ) {
          uniqueLeadMap.set(record.customer_phone, record);
        }
      }
    }

    const uniqueLeads = Array.from(uniqueLeadMap.values());
    let countHot = 0;
    let countWarm = 0;
    let countCold = 0;

    const chatLeadsToUpsert = uniqueLeads.map((u: ParsedIvrRecord) => {
      if (u.temperature === 'hot') countHot++;
      else if (u.temperature === 'warm') countWarm++;
      else countCold++;

      const assignedId = resolveAdvisorId(u.agent_name, u.agent_number, profiles);
      // Valid lifecycle_status check constraint values: 'new', 'qualified', 'contacted', 'visit_requested', 'won', 'lost', 'duplicate'
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
        assigned_to: assignedId,
        temperature: u.temperature,
        lifecycle_status: status,
        notes,
        created_at: u.dial_time,
        updated_at: new Date().toISOString(),
      };
    });

    // 6. Batch upsert into chat_leads using unique constraint on normalized_phone
    for (let i = 0; i < chatLeadsToUpsert.length; i += CHUNK_SIZE) {
      const chunk = chatLeadsToUpsert.slice(i, i + CHUNK_SIZE);
      const { error: upsertError } = await supabaseAdmin.from('chat_leads').upsert(chunk, {
        onConflict: 'normalized_phone',
        ignoreDuplicates: false,
      });

      if (upsertError) {
        console.warn('Chat leads IVR upsert warning chunk', i, upsertError.message);
      }
    }

    const payload: UploadResponsePayload = {
      success: true,
      campaign_name: campaignName,
      processed_calls: parsedRecords.length,
      new_calls_inserted: newCallsInserted,
      duplicate_calls_skipped: duplicateCallsSkipped,
      unique_leads: uniqueLeads.length,
      answered_calls: countAnswered,
      missed_calls: countMissed,
      hot_leads: countHot,
      warm_leads: countWarm,
      cold_leads: countCold,
    };

    return NextResponse.json(payload);
  } catch (error) {
    return handleApiError(error);
  }
}
