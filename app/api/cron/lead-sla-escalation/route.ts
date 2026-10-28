import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { dispatchSlaBreachEscalation } from '@/src/lib/leads/multiChannelDispatcher';
import {
  SETTINGS_KEY,
  DEFAULT_HOT_LEAD_SETTINGS,
  type HotLeadNotificationSettings,
} from '@/src/lib/leads/hotLeadNotificationTypes';

export const dynamic = 'force-dynamic';

interface LeadSlaTrackingRow {
  id: string;
  lead_id: string;
  customer_phone: string;
  sla_threshold_minutes: number;
  status: string;
}

interface PortalSettingsRow {
  value: Partial<HotLeadNotificationSettings>;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const nowIso = new Date().toISOString();

  let settings: HotLeadNotificationSettings = DEFAULT_HOT_LEAD_SETTINGS;
  try {
    const { data: portalRow } = await supabaseAdmin
      .from('portal_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle<PortalSettingsRow>();

    if (portalRow?.value) {
      settings = { ...DEFAULT_HOT_LEAD_SETTINGS, ...portalRow.value };
    }
  } catch {
    void 0;
  }

  const { data: breachedRows, error } = await supabaseAdmin
    .from('lead_sla_tracking')
    .select('*')
    .eq('status', 'pending_contact')
    .lt('sla_expires_at', nowIso)
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = breachedRows as LeadSlaTrackingRow[] | null;

  if (!rows || rows.length === 0) {
    return NextResponse.json({ message: 'No SLA breaches found', processed: 0 });
  }

  const escalatedIds: string[] = [];

  for (const row of rows) {
    await dispatchSlaBreachEscalation({
      leadId: row.lead_id,
      customerPhone: row.customer_phone,
      slaThresholdMinutes: row.sla_threshold_minutes,
      escalationTarget: 'Sales Director',
      settings,
    });

    await supabaseAdmin
      .from('lead_sla_tracking')
      .update({
        status: 'breached_escalated',
        escalated_at: nowIso,
        escalation_target: 'Sales Director',
      })
      .eq('id', row.id);

    escalatedIds.push(row.id);
  }

  return NextResponse.json({
    message: 'SLA breach escalation processed',
    escalated_count: escalatedIds.length,
    ids: escalatedIds,
  });
}
