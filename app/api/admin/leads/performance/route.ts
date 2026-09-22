import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import type {
  AdvisorPerformanceMetric,
  CampaignPerformanceMetric,
} from '@/src/lib/types/telecalling';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export type { AdvisorPerformanceMetric, CampaignPerformanceMetric };

interface RpcAdvisorStat {
  advisor_id?: string | null;
  agent_name?: string;
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  total_talk_time_sec: number;
  hot_leads: number;
  key1_count: number;
}

interface RpcPerformanceResult {
  summary?: {
    total_calls: number;
    answered_calls: number;
    missed_calls: number;
    total_talk_time_sec: number;
    avg_talk_time_sec: number;
    hot_leads: number;
    key1_count: number;
  };
  campaigns?: CampaignPerformanceMetric[];
  advisors?: RpcAdvisorStat[];
  recent_hot_calls?: Array<{
    customer_phone: string;
    agent_name: string;
    call_duration: number;
    dial_status: string;
    pressed_key: string | null;
    dial_time: string;
  }>;
}

interface CachedPerformanceResponse {
  payload: Record<string, unknown>;
  timestamp: number;
}
const performanceCache = new Map<string, CachedPerformanceResponse>();
const PERFORMANCE_TTL_MS = 60_000; // 60s TTL

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'all'; // all, today, week, month
    const advisorFilter = searchParams.get('advisor_id') || 'all';

    const cacheKey = `${timeRange}_${advisorFilter}`;
    const cached = performanceCache.get(cacheKey);
    const requestNow = Date.now();
    if (cached && requestNow - cached.timestamp < PERFORMANCE_TTL_MS) {
      return NextResponse.json(cached.payload);
    }
    // 1. Fetch employees & advisors (including disabled ones so their historical data/leads are displayed)
    const { data: employees } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, role, is_active')
      .in('role', ['employee', 'admin']);
    const advisorMap = new Map<string, AdvisorPerformanceMetric>();
    const nameToId = new Map<string, string>();

    (employees || []).forEach((emp) => {
      advisorMap.set(emp.id, {
        advisor_id: emp.id,
        advisor_name: emp.full_name.trim(),
        phone: emp.phone || null,
        role: emp.role || 'employee',
        is_active: emp.is_active ?? true,
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

    // 2. Compute ISO cutoff timestamp for database filter push-down
    let timeCutoffIso: string | null = null;
    const now = new Date();
    if (timeRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      timeCutoffIso = startOfDay.toISOString();
    } else if (timeRange === 'week') {
      timeCutoffIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (timeRange === 'month') {
      timeCutoffIso = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    const advisorUuid = advisorFilter !== 'all' ? advisorFilter : null;

    // 3. Primary Path: Execute high-speed PostgreSQL RPC function
    let rpcData: RpcPerformanceResult | null = null;
    try {
      const { data, error } = await supabaseAdmin.rpc('get_telecalling_performance', {
        p_time_cutoff: timeCutoffIso,
        p_advisor_id: advisorUuid,
      });

      if (!error && data && typeof data === 'object') {
        rpcData = data as RpcPerformanceResult;
      }
    } catch {
      // Fall through to direct query fallback
    }

    // 4. If RPC succeeded, build response with site visits in <50ms
    if (rpcData && rpcData.summary) {
      // Fetch site visits from chat_leads
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

      // Merge RPC advisor metrics into advisorMap
      (rpcData.advisors || []).forEach((adv) => {
        let empId = adv.advisor_id;
        if (!empId || !advisorMap.has(empId)) {
          const norm = (adv.agent_name || '').toLowerCase().trim();
          if (nameToId.has(norm)) {
            empId = nameToId.get(norm);
          }
        }

        if (empId && advisorMap.has(empId)) {
          const m = advisorMap.get(empId)!;
          m.total_calls = adv.total_calls;
          m.answered_calls = adv.answered_calls;
          m.missed_calls = adv.missed_calls;
          m.total_talk_time_sec = adv.total_talk_time_sec;
          m.avg_talk_time_sec =
            adv.answered_calls > 0 ? Math.round(adv.total_talk_time_sec / adv.answered_calls) : 0;
          m.answer_rate =
            adv.total_calls > 0 ? Math.round((adv.answered_calls / adv.total_calls) * 100) : 0;
          m.hot_leads = adv.hot_leads;
          m.key1_count = adv.key1_count;
        } else if (empId) {
          // Unassigned or legacy profile
          advisorMap.set(empId, {
            advisor_id: empId,
            advisor_name: adv.agent_name || 'Advisor',
            phone: null,
            role: 'employee',
            total_calls: adv.total_calls,
            answered_calls: adv.answered_calls,
            missed_calls: adv.missed_calls,
            answer_rate:
              adv.total_calls > 0 ? Math.round((adv.answered_calls / adv.total_calls) * 100) : 0,
            total_talk_time_sec: adv.total_talk_time_sec,
            avg_talk_time_sec:
              adv.answered_calls > 0 ? Math.round(adv.total_talk_time_sec / adv.answered_calls) : 0,
            hot_leads: adv.hot_leads,
            site_visits_booked: 0,
            key1_count: adv.key1_count,
          });
        }
      });

      const leaderboard: AdvisorPerformanceMetric[] = Array.from(advisorMap.values());
      leaderboard.sort((a, b) => {
        if (b.answered_calls !== a.answered_calls) {
          return b.answered_calls - a.answered_calls;
        }
        if (b.hot_leads !== a.hot_leads) {
          return b.hot_leads - a.hot_leads;
        }
        return b.total_calls - a.total_calls;
      });

      const sum = rpcData.summary;
      const overallAnswerRate =
        sum.total_calls > 0 ? Math.round((sum.answered_calls / sum.total_calls) * 100) : 0;

      const payload = {
        success: true,
        summary: {
          total_calls: sum.total_calls,
          answered_calls: sum.answered_calls,
          missed_calls: sum.missed_calls,
          answer_rate: overallAnswerRate,
          total_talk_time_sec: sum.total_talk_time_sec,
          avg_talk_time_sec: sum.avg_talk_time_sec,
          hot_leads: sum.hot_leads,
          key1_count: sum.key1_count,
          active_advisors: leaderboard.filter((a) => a.total_calls > 0).length,
          total_roster_count: leaderboard.length,
        },
        leaderboard,
        campaigns: rpcData.campaigns || [],
        recent_hot_calls: rpcData.recent_hot_calls || [],
      };
      performanceCache.set(cacheKey, { payload, timestamp: Date.now() });
      return NextResponse.json(payload);
    }

    // 5. Fallback Path: Query with PUSH-DOWN filters and full range pagination
    let countQuery = supabaseAdmin
      .from('ivr_call_records')
      .select('*', { count: 'exact', head: true });

    if (timeCutoffIso) {
      countQuery = countQuery.gte('dial_time', timeCutoffIso);
    }
    if (advisorUuid) {
      countQuery = countQuery.eq('assigned_agent_id', advisorUuid);
    }

    const { count: filteredCount } = await countQuery;
    const totalToFetch = filteredCount || 0;

    const PAGE_SIZE = 1000;
    const pageCount = Math.max(1, Math.ceil(totalToFetch / PAGE_SIZE));

    // Fetch in parallel chunks of 1000 so PostgREST 1000-row limit is never hit
    const pagePromises = Array.from({ length: Math.min(pageCount, 50) }, (_, i) => {
      let q = supabaseAdmin
        .from('ivr_call_records')
        .select(
          'customer_phone, assigned_agent_id, agent_name, dial_status, call_duration, pressed_key, campaign_name, dial_time'
        )
        .order('dial_time', { ascending: false })
        .range(i * PAGE_SIZE, (i + 1) * PAGE_SIZE - 1);

      if (timeCutoffIso) {
        q = q.gte('dial_time', timeCutoffIso);
      }
      if (advisorUuid) {
        q = q.eq('assigned_agent_id', advisorUuid);
      }
      return q;
    });

    const pageResults = await Promise.all(pagePromises);
    const rawCallRecords = pageResults.flatMap((r) => r.data || []);
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

    // Site visits from chat_leads
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

    leaderboard.sort((a, b) => {
      if (b.answered_calls !== a.answered_calls) {
        return b.answered_calls - a.answered_calls;
      }
      if (b.hot_leads !== a.hot_leads) {
        return b.hot_leads - a.hot_leads;
      }
      return b.total_calls - a.total_calls;
    });

    const campaigns: CampaignPerformanceMetric[] = Array.from(campaignMap.values()).map((c) => ({
      ...c,
      answer_rate: c.total_calls > 0 ? Math.round((c.answered_calls / c.total_calls) * 100) : 0,
    }));
    campaigns.sort((a, b) => b.total_calls - a.total_calls);

    const overallAnswerRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0;
    const overallAvgTalkTime = answeredCalls > 0 ? Math.round(totalTalkTimeSec / answeredCalls) : 0;

    const fallbackPayload = {
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
    };
    performanceCache.set(cacheKey, { payload: fallbackPayload, timestamp: Date.now() });
    return NextResponse.json(fallbackPayload);
  } catch (error) {
    return handleApiError(error);
  }
}
