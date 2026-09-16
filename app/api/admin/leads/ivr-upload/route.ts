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
      const file = formData.get('file');
      const nameField = formData.get('campaign_name');
      if (nameField && typeof nameField === 'string') {
        campaignName = nameField.trim();
      }

      if (file && typeof file === 'object' && 'text' in file) {
        csvText = await (file as Blob).text();
      } else {
        throw AppError.badRequest('No valid CSV file uploaded');
      }
    } else {
      const body = await request.json().catch(() => ({}));
      csvText = body.csvText || '';
      if (body.campaignName) {
        campaignName = String(body.campaignName).trim();
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
    const callRecordsToInsert = parsedRecords.map((r: ParsedIvrRecord) => {
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

    // 4. Batch insert into ivr_call_records in chunks of 500
    const CHUNK_SIZE = 500;
    for (let i = 0; i < callRecordsToInsert.length; i += CHUNK_SIZE) {
      const chunk = callRecordsToInsert.slice(i, i + CHUNK_SIZE);
      const { error: insertError } = await supabaseAdmin.from('ivr_call_records').insert(chunk);

      if (insertError) {
        // Log gracefully if table schema cache is pending or migration running
        console.warn(
          'ivr_call_records insert warning (continuing to chat_leads upsert):',
          insertError.message
        );
        break;
      }
    }

    // 5. Aggregate unique customer leads for CRM (highest engagement per number)
    const uniqueLeadMap = new Map<string, ParsedIvrRecord>();
    let countAnswered = 0;
    let countMissed = 0;

    for (const record of parsedRecords) {
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
      const status = u.call_duration >= 20 ? 'contacted' : 'captured';
      const keyNote = u.pressed_key ? `Key: ${u.pressed_key}` : 'No key';
      const notes = `IVR Call: ${u.call_duration}s, Status: ${u.dial_status}, ${keyNote}, Agent: ${u.agent_name}`;

      return {
        phone: u.customer_phone,
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

    // 6. Batch upsert into chat_leads (on conflict: phone, source)
    for (let i = 0; i < chatLeadsToUpsert.length; i += CHUNK_SIZE) {
      const chunk = chatLeadsToUpsert.slice(i, i + CHUNK_SIZE);
      const { error: upsertError } = await supabaseAdmin
        .from('chat_leads')
        .upsert(chunk, { onConflict: 'phone, source' });

      if (upsertError) {
        // Fallback without composite constraint if index only on phone
        await supabaseAdmin.from('chat_leads').upsert(chunk, { onConflict: 'phone' });
      }
    }

    const payload: UploadResponsePayload = {
      success: true,
      campaign_name: campaignName,
      processed_calls: parsedRecords.length,
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
