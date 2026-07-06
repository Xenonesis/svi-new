import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// GET /api/admin/attendance/analytics — attendance stats and trends
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0];

    // Fetch recent records for trend (30 days) and today's stats (parallel)
    const [todayStats, recentRecords] = await Promise.all([
      supabaseAdmin.from('attendance_records').select('status').eq('date', today),
      supabaseAdmin
        .from('attendance_records')
        .select('date, status')
        .gte('date', thirtyDaysAgo)
        .lte('date', today),
    ]);

    let present = 0,
      absent = 0,
      halfDay = 0,
      leave = 0;
    for (const r of todayStats.data || []) {
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'half_day') halfDay++;
      else if (r.status === 'leave') leave++;
    }

    const total = present + absent + halfDay + leave;
    const rate = total > 0 ? Math.round(((present + halfDay * 0.5) / total) * 100) : 0;

    // Bucket 30-day data by date
    const dayMap = new Map<
      string,
      { present: number; absent: number; half_day: number; leave: number }
    >();
    for (const r of (recentRecords.data || []) as Array<{ date: string; status: string }>) {
      if (!dayMap.has(r.date)) dayMap.set(r.date, { present: 0, absent: 0, half_day: 0, leave: 0 });
      const d = dayMap.get(r.date)!;
      if (r.status === 'present') d.present++;
      else if (r.status === 'absent') d.absent++;
      else if (r.status === 'half_day') d.half_day++;
      else if (r.status === 'leave') d.leave++;
    }

    // 30-day trend
    const thirtyDayTrend: Array<{ date: string; rate: number }> = [];
    for (const [date, counts] of dayMap) {
      const dayTotal = counts.present + counts.absent + counts.half_day + counts.leave;
      thirtyDayTrend.push({
        date: date.slice(5),
        rate:
          dayTotal > 0
            ? Math.round(((counts.present + counts.half_day * 0.5) / dayTotal) * 100)
            : 0,
      });
    }
    thirtyDayTrend.sort((a, b) => a.date.localeCompare(b.date));

    const weeklyTrend = thirtyDayTrend.slice(-7);

    // Monthly breakdown
    const monthlyCounts = { present: 0, absent: 0, half_day: 0, leave: 0 };
    for (const [date, counts] of dayMap) {
      if (date >= firstOfMonth) {
        monthlyCounts.present += counts.present;
        monthlyCounts.absent += counts.absent;
        monthlyCounts.half_day += counts.half_day;
        monthlyCounts.leave += counts.leave;
      }
    }

    const monthlyBreakdown = [
      { name: 'Present', count: monthlyCounts.present },
      { name: 'Absent', count: monthlyCounts.absent },
      { name: 'Half Day', count: monthlyCounts.half_day },
      { name: 'Leave', count: monthlyCounts.leave },
    ];

    const response = NextResponse.json({
      today: { present, absent, half_day: halfDay, leave, total, rate },
      weeklyTrend,
      monthlyBreakdown,
      thirtyDayTrend,
    });
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
