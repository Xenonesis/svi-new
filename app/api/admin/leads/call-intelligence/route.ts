import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import {
  generateCallIntelligence,
  separateSpeakerTurns,
  type CallIntelligence,
} from '@/src/lib/leads/callIntelligence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/leads/call-intelligence?callRecordId=<id>
 * Fetches cached call intelligence from ivr_call_records.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin access required to access call intelligence');
    }

    const callRecordId = request.nextUrl.searchParams.get('callRecordId');
    if (!callRecordId) {
      throw AppError.badRequest('Missing callRecordId query parameter');
    }

    const { data: record, error } = await supabaseAdmin
      .from('ivr_call_records')
      .select('id, customer_phone, raw_payload')
      .eq('id', callRecordId)
      .single();

    if (error || !record) {
      throw AppError.notFound('Call record not found');
    }

    const intelligence = record.raw_payload?.ai_intelligence as CallIntelligence | undefined;
    if (!intelligence) {
      return NextResponse.json({
        success: true,
        cached: false,
        intelligence: null,
      });
    }

    return NextResponse.json({
      success: true,
      cached: true,
      intelligence,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/admin/leads/call-intelligence
 *
 * Runs full Voice AI Pipeline (Whisper Speech-to-Text + LLM Analysis)
 * and persists the result to ivr_call_records.
 *
 * Body:
 * {
 *   callRecordId?: string,
 *   customerPhone?: string,
 *   recordingUrl: string,
 *   forceRefresh?: boolean
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin access required to run call intelligence');
    }

    const body = await request.json().catch(() => ({}));
    const { callRecordId, customerPhone, recordingUrl, forceRefresh } = body;

    let targetUrl = recordingUrl;
    let targetPhone = customerPhone;
    if (body.action === 'separate_dialogue') {
      const dialogue = await separateSpeakerTurns({
        transcript: String(body.transcript || ''),
        agentName: body.agentName,
        customerPhone: targetPhone,
        callRecordId,
        duration: typeof body.duration === 'number' ? body.duration : undefined,
      });
      return NextResponse.json({
        success: true,
        dialogue,
      });
    }

    // If callRecordId provided, look up missing fields from DB
    if (callRecordId && (!targetUrl || !targetPhone)) {
      const { data: record } = await supabaseAdmin
        .from('ivr_call_records')
        .select('id, customer_phone, raw_payload')
        .eq('id', callRecordId)
        .single();

      if (record) {
        targetPhone = targetPhone || record.customer_phone;
        targetUrl = targetUrl || record.raw_payload?.recording_url;
      }
    }

    if (!targetUrl) {
      throw AppError.badRequest('recordingUrl or valid callRecordId with recording is required');
    }

    const intelligence = await generateCallIntelligence({
      customerPhone: targetPhone || 'unknown',
      recordingUrl: targetUrl,
      callRecordId,
      forceRefresh: Boolean(forceRefresh),
    });

    return NextResponse.json({
      success: true,
      intelligence,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
