import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import {
  cleanPhoneNumber,
  normalizeCallKey,
  calculateLeadTemperature,
  resolveAdvisorId,
  type AdvisorProfile,
} from '@/src/lib/leads/ivrParser';
import { syncRecordingToInHouseStorage } from '@/src/lib/leads/syncRecordingToStorage';
import { generateCallIntelligence } from '@/src/lib/leads/callIntelligence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TelephonyRawInput {
  customer_phone?: string;
  CustomerNumber?: string;
  From?: string;
  caller_id?: string;
  caller?: string;
  phone?: string;
  mobile?: string;
  agent_phone?: string;
  AgentNumber?: string;
  To?: string;
  agent?: string;
  agent_name?: string;
  AgentName?: string;
  executive_name?: string;
  call_duration?: string | number;
  CallDuration?: string | number;
  Duration?: string | number;
  duration?: string | number;
  billsec?: string | number;
  dial_status?: string;
  Status?: string;
  CallStatus?: string;
  dialstatus?: string;
  status?: string;
  dial_time?: string;
  StartTime?: string;
  call_date?: string;
  time?: string;
  created_at?: string;
  customer_ans_time?: string;
  AnswerTime?: string;
  customer_hang_time?: string;
  EndTime?: string;
  pressed_key?: string;
  Digits?: string;
  dtmf?: string;
  input_key?: string;
  recording_url?: string;
  RecordingUrl?: string;
  audio_url?: string;
  recording?: string;
  campaign_name?: string;
  CampaignName?: string;
  campaign?: string;
  [key: string]: unknown;
}

function isAuthorized(request: NextRequest): boolean {
  const configuredSecret = process.env.TELEPHONY_WEBHOOK_SECRET || process.env.CRON_SECRET || '';
  if (!configuredSecret) {
    return true;
  }

  const headerSecret = request.headers.get('x-telephony-secret');
  if (headerSecret && headerSecret === configuredSecret) {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token === configuredSecret) {
      return true;
    }
  }

  const querySecret =
    request.nextUrl.searchParams.get('secret') || request.nextUrl.searchParams.get('token');
  if (querySecret && querySecret === configuredSecret) {
    return true;
  }

  return false;
}

async function extractPayload(request: NextRequest): Promise<TelephonyRawInput> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = (await request.json().catch(() => ({}))) as TelephonyRawInput;
    return json;
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const formData = await request.formData().catch(() => null);
    if (!formData) return {};
    const result: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      result[key] = typeof value === 'string' ? value : '';
    });
    return result as TelephonyRawInput;
  }

  const queryParams: Record<string, unknown> = {};
  request.nextUrl.searchParams.forEach((val, key) => {
    queryParams[key] = val;
  });
  return queryParams as TelephonyRawInput;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Telephony webhook active',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!isAuthorized(request)) {
      throw AppError.unauthorized('Invalid or missing telephony webhook secret');
    }

    const payload = await extractPayload(request);

    const rawPhone =
      payload.customer_phone ||
      payload.CustomerNumber ||
      payload.From ||
      payload.caller_id ||
      payload.caller ||
      payload.phone ||
      payload.mobile ||
      '';

    const customerPhone = cleanPhoneNumber(String(rawPhone));
    if (!customerPhone) {
      throw AppError.badRequest('Missing customer phone number in payload');
    }

    const rawAgentPhone =
      payload.agent_phone || payload.AgentNumber || payload.To || payload.agent || '';
    const agentPhone = cleanPhoneNumber(String(rawAgentPhone));

    const agentName = String(
      payload.agent_name || payload.AgentName || payload.executive_name || 'Telecaller'
    ).trim();

    const rawDuration =
      payload.call_duration ??
      payload.CallDuration ??
      payload.Duration ??
      payload.duration ??
      payload.billsec ??
      0;
    const callDuration = Math.max(0, parseInt(String(rawDuration), 10) || 0);

    const rawStatus = String(
      payload.dial_status ||
        payload.Status ||
        payload.CallStatus ||
        payload.dialstatus ||
        payload.status ||
        ''
    )
      .trim()
      .toUpperCase();

    const isAnswered =
      rawStatus.includes('ANS') ||
      rawStatus.includes('SUCCESS') ||
      rawStatus.includes('COMPLETED') ||
      (rawStatus === '' && callDuration > 0);

    const dialStatus: 'ANSWER' | 'NOANSWER' = isAnswered ? 'ANSWER' : 'NOANSWER';

    const dialTime = String(
      payload.dial_time ||
        payload.StartTime ||
        payload.call_date ||
        payload.time ||
        payload.created_at ||
        new Date().toISOString()
    ).trim();

    const customerAnsTime =
      payload.customer_ans_time || payload.AnswerTime
        ? String(payload.customer_ans_time || payload.AnswerTime)
        : null;

    const customerHangTime =
      payload.customer_hang_time || payload.EndTime
        ? String(payload.customer_hang_time || payload.EndTime)
        : null;

    const pressedKey =
      payload.pressed_key || payload.Digits || payload.dtmf || payload.input_key
        ? String(payload.pressed_key || payload.Digits || payload.dtmf || payload.input_key).trim()
        : null;

    const recordingUrl =
      payload.recording_url || payload.RecordingUrl || payload.audio_url || payload.recording
        ? String(
            payload.recording_url || payload.RecordingUrl || payload.audio_url || payload.recording
          ).trim()
        : null;

    const campaignName = String(
      payload.campaign_name || payload.CampaignName || payload.campaign || 'Live Telephony Webhook'
    ).trim();

    const callKey = normalizeCallKey(customerPhone, dialTime);

    const { data: existingRecords } = await supabaseAdmin
      .from('ivr_call_records')
      .select('id, raw_payload')
      .eq('customer_phone', customerPhone)
      .order('created_at', { ascending: false })
      .limit(5);

    const existingRecord = (existingRecords || []).find((rec) => {
      const recPayload = rec.raw_payload as Record<string, unknown> | null;
      return recPayload?.call_key === callKey;
    });

    if (existingRecord) {
      const currentPayload = (existingRecord.raw_payload as Record<string, unknown>) || {};
      if (recordingUrl && !currentPayload.recording_url) {
        await supabaseAdmin
          .from('ivr_call_records')
          .update({
            raw_payload: {
              ...currentPayload,
              recording_url: recordingUrl,
            },
          })
          .eq('id', existingRecord.id);
      }

      return NextResponse.json({
        success: true,
        deduplicated: true,
        id: existingRecord.id,
        customer_phone: customerPhone,
        queued_ai_triage: false,
      });
    }

    const { data: advisors } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone')
      .in('role', ['telecaller', 'sales_manager', 'admin', 'superadmin']);

    const advisorProfiles: AdvisorProfile[] = (advisors || []).map((a) => ({
      id: a.id,
      full_name: a.full_name || '',
      phone: a.phone || null,
    }));

    const assignedAgentId = resolveAdvisorId(agentName, agentPhone, advisorProfiles);

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('ivr_call_records')
      .insert({
        customer_phone: customerPhone,
        agent_name: agentName,
        agent_phone: agentPhone || null,
        assigned_agent_id: assignedAgentId,
        dial_time: dialTime,
        customer_ans_time: customerAnsTime,
        customer_hang_time: customerHangTime,
        call_duration: callDuration,
        dial_status: dialStatus,
        pressed_key: pressedKey,
        campaign_name: campaignName,
        pipeline_stage: 'New Lead',
        raw_payload: {
          recording_url: recordingUrl,
          provider_payload: payload,
          call_key: callKey,
        },
      })
      .select('id')
      .single();

    if (insertError) {
      throw AppError.internal(`Failed to record call: ${insertError.message}`);
    }

    const temperature = calculateLeadTemperature(callDuration, pressedKey);
    await supabaseAdmin.from('chat_leads').upsert(
      {
        phone: customerPhone,
        full_name: `Lead +91 ${customerPhone}`,
        source: 'ivr',
        temperature,
        status: 'open',
        last_active: new Date().toISOString(),
      },
      { onConflict: 'phone' }
    );

    const shouldTriage =
      Boolean(recordingUrl && recordingUrl.startsWith('http')) &&
      dialStatus === 'ANSWER' &&
      (callDuration >= 25 || pressedKey === '1');

    if (recordingUrl && recordingUrl.startsWith('http')) {
      Promise.resolve().then(async () => {
        try {
          const syncResult = await syncRecordingToInHouseStorage(customerPhone, recordingUrl);

          if (syncResult.success && syncResult.storagePath && inserted?.id) {
            await supabaseAdmin
              .from('ivr_call_records')
              .update({
                raw_payload: {
                  recording_url: recordingUrl,
                  storage_path: syncResult.storagePath,
                  archived_at: new Date().toISOString(),
                  provider_payload: payload,
                  call_key: callKey,
                },
              })
              .eq('id', inserted.id);
          }

          if (shouldTriage && inserted?.id) {
            await generateCallIntelligence({
              customerPhone,
              recordingUrl,
              callRecordId: inserted.id,
            });
          }
        } catch (bgErr) {
          console.warn('Telephony background processing notice:', bgErr);
        }
      });
    }

    return NextResponse.json({
      success: true,
      deduplicated: false,
      id: inserted?.id || null,
      customer_phone: customerPhone,
      queued_ai_triage: shouldTriage,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
