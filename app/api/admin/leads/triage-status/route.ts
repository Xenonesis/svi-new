import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { handleApiError } from '@/src/lib/api/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface TriageHeartbeatData {
  status: 'running' | 'idle' | 'paused';
  total_eligible: number;
  processed_count: number;
  hot_count: number;
  warm_count: number;
  cold_count: number;
  last_triaged: {
    phone: string;
    duration?: number;
    interest_level?: string;
    intent?: string;
    summary?: string;
    budget?: string;
    at: string;
  } | null;
  heartbeat_at: string;
  scheduled_digest_time?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await verifyAdmin(request);

    const { data: heartbeatRow } = await supabaseAdmin
      .from('portal_settings')
      .select('value, updated_at')
      .eq('key', 'voice_ai_triage_heartbeat')
      .maybeSingle();

    const { data: settingsRow } = await supabaseAdmin
      .from('portal_settings')
      .select('value')
      .eq('key', 'hot_lead_notification_settings')
      .maybeSingle();

    const heartbeat: TriageHeartbeatData = (heartbeatRow?.value as TriageHeartbeatData) || {
      status: 'idle',
      total_eligible: 4425,
      processed_count: 0,
      hot_count: 0,
      warm_count: 0,
      cold_count: 0,
      last_triaged: null,
      heartbeat_at: new Date(0).toISOString(),
      scheduled_digest_time: '19:30',
    };

    const lastHeartbeatTime = new Date(heartbeat.heartbeat_at || 0).getTime();
    const isRecentlyActive = Date.now() - lastHeartbeatTime < 90 * 1000;
    const computedStatus: 'running' | 'idle' =
      isRecentlyActive && heartbeat.status === 'running' ? 'running' : 'idle';

    const settingsVal = settingsRow?.value as {
      recipients?: Array<{ digest_time?: string }>;
    } | null;
    const configuredDigestTime =
      settingsVal?.recipients?.[0]?.digest_time || heartbeat.scheduled_digest_time || '19:30';

    return NextResponse.json({
      success: true,
      data: {
        ...heartbeat,
        status: computedStatus,
        is_live: computedStatus === 'running',
        scheduled_digest_time: configuredDigestTime,
        seconds_since_heartbeat: Math.floor((Date.now() - lastHeartbeatTime) / 1000),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
