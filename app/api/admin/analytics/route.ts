import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import {
  getAnalyticsCache,
  setAnalyticsCache,
  type AnalyticsData,
  type DocumentStatItem,
} from '@/src/lib/cache/adminAnalyticsCache';

interface DocumentRecord {
  document_type: string | null;
}

const DOCUMENT_TYPE_KEYS = [
  'allotment_letter',
  'payment_receipt',
  'payment_plan',
  'offer_letter',
  'bba',
] as const;

type DocumentTypeKey = (typeof DOCUMENT_TYPE_KEYS)[number];

function isDocumentRecord(item: unknown): item is DocumentRecord {
  return typeof item === 'object' && item !== null && 'document_type' in item;
}

function isDocumentTypeKey(type: string): type is DocumentTypeKey {
  return (DOCUMENT_TYPE_KEYS as readonly string[]).includes(type);
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const cached = getAnalyticsCache();
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json(cached.data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Parallelize all data fetches
    const [growthResult, documentStats, trends] = await Promise.all([
      fetchUserGrowth(thirtyDaysAgo),
      fetchDocumentStats(),
      calculateTrends(),
    ]);

    const payload: AnalyticsData = {
      userGrowth: growthResult,
      documentStats,
      trends,
    };

    setAnalyticsCache(payload);

    return NextResponse.json(payload, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
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
 * Fetch document stats using a single query and in-memory tallying
 * instead of 5 separate count queries.
 */
async function fetchDocumentStats(): Promise<DocumentStatItem[]> {
  const { data: docs } = await supabaseAdmin
    .from('documents')
    .select('document_type')
    .eq('status', 'completed');

  const counts: Record<DocumentTypeKey, number> = {
    allotment_letter: 0,
    payment_receipt: 0,
    payment_plan: 0,
    offer_letter: 0,
    bba: 0,
  };

  if (Array.isArray(docs)) {
    for (const doc of docs) {
      if (
        isDocumentRecord(doc) &&
        typeof doc.document_type === 'string' &&
        isDocumentTypeKey(doc.document_type)
      ) {
        counts[doc.document_type] += 1;
      }
    }
  }

  return [
    { name: 'Allotment', count: counts.allotment_letter },
    { name: 'Receipt', count: counts.payment_receipt },
    { name: 'Plan', count: counts.payment_plan },
    { name: 'Offer', count: counts.offer_letter },
    { name: 'BBA', count: counts.bba },
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
