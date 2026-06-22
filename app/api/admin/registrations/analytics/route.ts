import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

/**
 * GET /api/admin/registrations/analytics
 * Returns:
 *  - dailyTrend: registrations per day for the last 30 days
 *  - statusDistribution: count breakdown by status
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Parallelize: daily trend + status counts
    const [trendResult, statusResult] = await Promise.all([
      // Fetch only created_at for last 30 days — minimal payload
      supabaseAdmin
        .from('registrations')
        .select('created_at, status')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true }),

      // Count-only queries per status via parallel execution
      Promise.all(
        ['pending', 'contacted', 'approved', 'rejected'].map(async (s) => {
          const { count } = await supabaseAdmin
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('status', s);
          return { status: s, count: count || 0 };
        })
      ),
    ]);

    // Build daily trend map from raw rows
    const dailyMap = new Map<string, number>();
    const today = new Date();

    // Pre-fill all 30 days with 0 so gaps show correctly in chart
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap.set(key, 0);
    }

    // Accumulate counts
    for (const row of trendResult.data || []) {
      const key = new Date(row.created_at).toISOString().split('T')[0];
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
      }
    }

    // Convert to chart-ready array with readable labels
    const dailyTrend = Array.from(dailyMap.entries()).map(([date, count]) => {
      const d = new Date(date);
      const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      return { date: label, count, fullDate: date };
    });

    // Status distribution for donut chart
    const statusDistribution = [
      { name: 'Pending', value: 0, color: '#f59e0b' },
      { name: 'Contacted', value: 0, color: '#3b82f6' },
      { name: 'Approved', value: 0, color: '#10b981' },
      { name: 'Rejected', value: 0, color: '#ef4444' },
    ];

    for (const { status, count } of statusResult) {
      const entry = statusDistribution.find((e) => e.name.toLowerCase() === status.toLowerCase());
      if (entry) entry.value = count;
    }

    const response = NextResponse.json({ dailyTrend, statusDistribution });
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
