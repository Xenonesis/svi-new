import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface AdvisorPerformanceMetric {
  advisor_id: string;
  advisor_name: string;
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  answer_rate: number;
  total_talk_time_sec: number;
  avg_talk_time_sec: number;
  hot_leads: number;
  site_visits_booked: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    // 1. Fetch active employees/advisors
    const { data: employees } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role, is_active')
      .eq('is_active', true)
      .in('role', ['employee', 'admin']);

    const advisorMap = new Map<string, AdvisorPerformanceMetric>();

    (employees || []).forEach((emp) => {
      advisorMap.set(emp.id, {
        advisor_id: emp.id,
        advisor_name: emp.full_name,
        total_calls: 0,
        answered_calls: 0,
        missed_calls: 0,
        answer_rate: 0,
        total_talk_time_sec: 0,
        avg_talk_time_sec: 0,
        hot_leads: 0,
        site_visits_booked: 0,
      });
    });

    // 2. Aggregate from ivr_call_records
    const { data: callRecords } = await supabaseAdmin
      .from('ivr_call_records')
      .select('assigned_agent_id, agent_name, dial_status, call_duration, temperature');

    if (callRecords && callRecords.length > 0) {
      for (const rec of callRecords) {
        const id = rec.assigned_agent_id;
        if (!id) continue;

        let metric = advisorMap.get(id);
        if (!metric) {
          metric = {
            advisor_id: id,
            advisor_name: rec.agent_name || 'Advisor',
            total_calls: 0,
            answered_calls: 0,
            missed_calls: 0,
            answer_rate: 0,
            total_talk_time_sec: 0,
            avg_talk_time_sec: 0,
            hot_leads: 0,
            site_visits_booked: 0,
          };
          advisorMap.set(id, metric);
        }

        metric.total_calls++;
        if (rec.dial_status === 'ANSWER') {
          metric.answered_calls++;
          metric.total_talk_time_sec += Number(rec.call_duration) || 0;
        } else {
          metric.missed_calls++;
        }

        if (rec.temperature === 'hot') {
          metric.hot_leads++;
        }
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

    // 4. Calculate answer rates and averages
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
      return b.hot_leads - a.hot_leads;
    });

    return NextResponse.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
