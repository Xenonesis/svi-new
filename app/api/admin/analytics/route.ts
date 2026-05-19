import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Parallelize all data fetches
  const [growthResult, documentStats, trends] = await Promise.all([
    fetchUserGrowth(thirtyDaysAgo),
    fetchDocumentStats(),
    calculateTrends(),
  ]);

  const response = NextResponse.json({
    userGrowth: growthResult,
    documentStats,
    trends,
  });

  response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
  return response;
}

/**
 * Fetch user growth for last 30 days using count queries instead of fetching all rows.
 * Strategy: get total count, get profiles from last 30 days, bucket by day, compute cumulative.
 */
async function fetchUserGrowth(thirtyDaysAgo: Date) {
  // Get total profile count (head-only, very fast)
  const { count: totalCount } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get only profiles created in last 30 days (bounded query)
  const { data: recentProfiles } = await supabaseAdmin
    .from('profiles')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  // Count how many were created before the 30-day window
  const countBeforeWindow = (totalCount || 0) - (recentProfiles?.length || 0);

  // Bucket recent profiles by day
  const today = new Date();
  const dailyNewCounts = new Map<string, number>();

  for (const p of recentProfiles || []) {
    const dayKey = new Date(p.created_at).toISOString().split('T')[0];
    dailyNewCounts.set(dayKey, (dailyNewCounts.get(dayKey) || 0) + 1);
  }

  // Build cumulative growth data
  const result = [];
  let cumulative = countBeforeWindow;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    cumulative += dailyNewCounts.get(dateStr) || 0;

    result.push({
      date: i === 0 ? 'Today' : `${date.getMonth() + 1}/${date.getDate()}`,
      users: cumulative,
    });
  }

  return result;
}

/**
 * Fetch document stats using individual count queries instead of fetching all rows.
 * 5 head-only count queries are much faster than SELECT * on the entire table.
 */
async function fetchDocumentStats() {
  const types = ['allotment_letter', 'payment_receipt', 'payment_plan', 'offer_letter', 'bba'];

  const counts = await Promise.all(
    types.map(async (type) => {
      const { count } = await supabaseAdmin
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .eq('document_type', type);
      return count || 0;
    })
  );

  return [
    { name: 'Allotment', count: counts[0] },
    { name: 'Receipt', count: counts[1] },
    { name: 'Plan', count: counts[2] },
    { name: 'Offer', count: counts[3] },
    { name: 'BBA', count: counts[4] },
  ];
}

/**
 * Calculate trends using parallel count queries instead of sequential.
 */
async function calculateTrends() {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 86400000);
  const prev7Days = new Date(now.getTime() - 14 * 86400000);

  const [recentCount, prevCount, recentClients, prevClients] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7Days.toISOString()),
    supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', prev7Days.toISOString())
      .lt('created_at', last7Days.toISOString()),
    supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client')
      .gte('created_at', last7Days.toISOString()),
    supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client')
      .gte('created_at', prev7Days.toISOString())
      .lt('created_at', last7Days.toISOString()),
  ]);

  const userGrowthPercent =
    prevCount.count && prevCount.count > 0
      ? Math.round((((recentCount.count || 0) - prevCount.count) / prevCount.count) * 100)
      : 0;

  const clientGrowthPercent =
    prevClients.count && prevClients.count > 0
      ? Math.round((((recentClients.count || 0) - prevClients.count) / prevClients.count) * 100)
      : 0;

  return {
    userGrowth: `${userGrowthPercent >= 0 ? '+' : ''}${userGrowthPercent}%`,
    clientGrowth: `${clientGrowthPercent >= 0 ? '+' : ''}${clientGrowthPercent}%`,
    adminCount: '0%',
  };
}
