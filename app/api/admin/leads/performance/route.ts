import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import type {
  AdvisorPerformanceMetric,
  CampaignPerformanceMetric,
} from '@/src/lib/types/telecalling';

export type { AdvisorPerformanceMetric, CampaignPerformanceMetric };
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'all'; // all, today, week, month
    const advisorFilter = searchParams.get('advisor_id') || 'all';

    // 1. Fetch active employees & advisors
    const { data: employees } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, role, is_active')
      .eq('is_active', true)
      .in('role', ['employee', 'admin']);

    const advisorMap = new Map<string, AdvisorPerformanceMetric>();
    const nameToId = new Map<string, string>();

    (employees || []).forEach((emp) => {
      advisorMap.set(emp.id, {
        advisor_id: emp.id,
        advisor_name: emp.full_name.trim(),
        phone: emp.phone || null,
        role: emp.role || 'employee',
        total_calls: 0,
        answered_calls: 0,
        missed_calls: 0,
        answer_rate: 0,
        total_talk_time_sec: 0,
        avg_talk_time_sec: 0,
        hot_leads: 0,
        site_visits_booked: 0,
        key1_count: 0,
      });
      nameToId.set(emp.full_name.toLowerCase().trim(), emp.id);
    });

    // 2. Fetch call records across all pages (Supabase PostgREST 1000 limit)
    const { count: totalCallCount } = await supabaseAdmin
      .from('ivr_call_records')
      .select('*', { count: 'exact', head: true });

    const totalCount = totalCallCount || 0;
    const PAGE_SIZE = 1000;
    const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    const pagePromises = Array.from({ length: Math.min(pageCount, 15) }, (_, i) =>
      supabaseAdmin
        .from('ivr_call_records')
        .select(
          'customer_phone, assigned_agent_id, agent_name, dial_status, call_duration, pressed_key, campaign_name, dial_time'
        )
        .range(i * PAGE_SIZE, (i + 1) * PAGE_SIZE - 1)
    );

    const pageResults = await Promise.all(pagePromises);
    const rawCallRecords = pageResults.flatMap((r) => r.data || []);

    // Date range filter cutoff
    let timeCutoff: number | null = null;
    const now = new Date();
    if (timeRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      timeCutoff = startOfDay.getTime();
    } else if (timeRange === 'week') {
      timeCutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    } else if (timeRange === 'month') {
      timeCutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    }

    let totalCalls = 0;
    let answeredCalls = 0;
    let missedCalls = 0;
    let totalTalkTimeSec = 0;
    let totalHotLeads = 0;
    let totalKey1 = 0;

    const campaignMap = new Map<string, CampaignPerformanceMetric>();
    const recentHotCalls: Array<{
      customer_phone: string;
      agent_name: string;
      call_duration: number;
      dial_status: string;
      pressed_key: string | null;
      dial_time: string;
    }> = [];

    for (const rec of rawCallRecords) {
      // Apply time filter
      if (timeCutoff && rec.dial_time) {
        const dialTs = new Date(rec.dial_time).getTime();
        if (dialTs < timeCutoff) continue;
      }

      // Apply advisor filter if specific advisor selected
      if (advisorFilter !== 'all') {
        const directMatch = rec.assigned_agent_id === advisorFilter;
        const nameMatch =
          nameToId.get((rec.agent_name || '').toLowerCase().trim()) === advisorFilter;
        if (!directMatch && !nameMatch) continue;
      }

      totalCalls++;
      const isAnswered = rec.dial_status === 'ANSWER';
      const duration = Number(rec.call_duration) || 0;
      const isHot = (duration >= 60 && isAnswered) || rec.pressed_key === '1';

      if (isAnswered) {
        answeredCalls++;
        totalTalkTimeSec += duration;
      } else {
        missedCalls++;
      }

      if (isHot) {
        totalHotLeads++;
        if (recentHotCalls.length < 10) {
          recentHotCalls.push({
            customer_phone: rec.customer_phone,
            agent_name: rec.agent_name || 'Advisor',
            call_duration: duration,
            dial_status: rec.dial_status,
            pressed_key: rec.pressed_key,
            dial_time: rec.dial_time,
          });
        }
      }

      if (rec.pressed_key === '1') totalKey1++;

      // Campaign aggregation
      const cName = rec.campaign_name || 'General IVR Campaign';
      if (!campaignMap.has(cName)) {
        campaignMap.set(cName, {
          name: cName,
          total_calls: 0,
          answered_calls: 0,
          missed_calls: 0,
          answer_rate: 0,
          hot_leads: 0,
        });
      }
      const camp = campaignMap.get(cName)!;
      camp.total_calls++;
      if (isAnswered) camp.answered_calls++;
      else camp.missed_calls++;
      if (isHot) camp.hot_leads++;

      // Advisor aggregation
      let empId = rec.assigned_agent_id;
      if (!empId || !advisorMap.has(empId)) {
        const normName = (rec.agent_name || '').toLowerCase().trim();
        if (nameToId.has(normName)) {
          empId = nameToId.get(normName);
        }
      }

      if (empId && advisorMap.has(empId)) {
        const metric = advisorMap.get(empId)!;
        metric.total_calls++;
        if (isAnswered) {
          metric.answered_calls++;
          metric.total_talk_time_sec += duration;
        } else {
          metric.missed_calls++;
        }
        if (isHot) metric.hot_leads++;
        if (rec.pressed_key === '1') metric.key1_count++;
      }
    }

    // 3. Count site visits from chat_leads
    const { data: siteVisitLeads } = await supabaseAdmin
      .from('chat_leads')
      .select('assigned_to')
      .not('site_visit_at', 'is', null);

    if (siteVisitLeads) {
      for (const lead of siteVisitLeads) {
        if (lead.assigned_to && advisorMap.has(lead.assigned_to)) {
          const metric = advisorMap.get(lead.assigned_to)!;
          metric.site_visits_booked++;
        }
      }
    }

    // 4. Calculate answer rates and averages for advisors
    const leaderboard: AdvisorPerformanceMetric[] = Array.from(advisorMap.values()).map((m) => {
      const answer_rate =
        m.total_calls > 0 ? Math.round((m.answered_calls / m.total_calls) * 100) : 0;
      const avg_talk_time_sec =
        m.answered_calls > 0 ? Math.round(m.total_talk_time_sec / m.answered_calls) : 0;
      return {
        ...m,
        answer_rate,
        avg_talk_time_sec,
      };
    });

    // Sort by answered_calls DESC, then hot_leads DESC
    leaderboard.sort((a, b) => {
      if (b.answered_calls !== a.answered_calls) {
        return b.answered_calls - a.answered_calls;
      }
      if (b.hot_leads !== a.hot_leads) {
        return b.hot_leads - a.hot_leads;
      }
      return b.total_calls - a.total_calls;
    });

    // Calculate campaign answer rates
    const campaigns: CampaignPerformanceMetric[] = Array.from(campaignMap.values()).map((c) => ({
      ...c,
      answer_rate: c.total_calls > 0 ? Math.round((c.answered_calls / c.total_calls) * 100) : 0,
    }));
    campaigns.sort((a, b) => b.total_calls - a.total_calls);

    const overallAnswerRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0;
    const overallAvgTalkTime = answeredCalls > 0 ? Math.round(totalTalkTimeSec / answeredCalls) : 0;

    return NextResponse.json({
      success: true,
      summary: {
        total_calls: totalCalls,
        answered_calls: answeredCalls,
        missed_calls: missedCalls,
        answer_rate: overallAnswerRate,
        total_talk_time_sec: totalTalkTimeSec,
        avg_talk_time_sec: overallAvgTalkTime,
        hot_leads: totalHotLeads,
        key1_count: totalKey1,
        active_advisors: leaderboard.filter((a) => a.total_calls > 0).length,
        total_roster_count: leaderboard.length,
      },
      leaderboard,
      campaigns,
      recent_hot_calls: recentHotCalls,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
