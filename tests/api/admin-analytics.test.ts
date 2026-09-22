import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { NextRequest as ConcreteNextRequest } from 'next/server';

interface UserGrowthPoint {
  date: string;
  users: number;
}

interface DocumentStatItem {
  name: string;
  count: number;
}

interface AnalyticsTrends {
  userGrowth: string;
  clientGrowth: string;
  adminCount: string;
}

interface AnalyticsResponseBody {
  userGrowth: UserGrowthPoint[];
  documentStats: DocumentStatItem[];
  trends: AnalyticsTrends;
}

interface DocumentRecord {
  document_type: string | null;
}

interface ProfileRecord {
  created_at: string;
  role?: string;
}

interface SupabaseQueryResult<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
  count?: number | null;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface SelectCallRecord {
  columns?: string;
  count?: string;
  head?: boolean;
}

interface EqCallRecord {
  col: string;
  val: unknown;
}

class MockQueryBuilder<T> implements PromiseLike<SupabaseQueryResult<T>> {
  private _data: T | null;
  private _error: { message: string; code?: string } | null;
  private _count?: number | null;

  public eqCalls: EqCallRecord[] = [];
  public gteCalls: Array<{ col: string; val: unknown }> = [];
  public ltCalls: Array<{ col: string; val: unknown }> = [];
  public orderCalls: Array<{ col: string; ascending?: boolean }> = [];
  public selectCalls: SelectCallRecord[] = [];

  constructor(
    data: T | null,
    error: { message: string; code?: string } | null = null,
    count?: number | null
  ) {
    this._data = data;
    this._error = error;
    this._count = count;
  }

  select(columns?: string, opts?: { count?: string; head?: boolean }): this {
    this.selectCalls.push({ columns, count: opts?.count, head: opts?.head });
    return this;
  }

  eq(col: string, val: unknown): this {
    this.eqCalls.push({ col, val });
    return this;
  }

  gte(col: string, val: unknown): this {
    this.gteCalls.push({ col, val });
    return this;
  }

  lt(col: string, val: unknown): this {
    this.ltCalls.push({ col, val });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }): this {
    this.orderCalls.push({ col, ascending: opts?.ascending });
    return this;
  }

  then<TResult1 = SupabaseQueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseQueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const result: SupabaseQueryResult<T> = {
      data: this._data,
      error: this._error,
      count: this._count ?? (Array.isArray(this._data) ? this._data.length : null),
    };
    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

let mockDocumentsQueryCount = 0;
let mockProfilesQueryCount = 0;
let mockDocumentsData: DocumentRecord[] = [];
let mockProfilesData: ProfileRecord[] = [];
let mockVerifiedAdmin: AdminUser | null = {
  id: 'admin-test-uuid',
  email: 'admin@sviinfrasolutions.com',
  role: 'admin',
};

let lastDocumentsBuilder: MockQueryBuilder<DocumentRecord[]> | null = null;

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn(async () => mockVerifiedAdmin),
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'documents') {
        mockDocumentsQueryCount++;
        const builder = new MockQueryBuilder<DocumentRecord[]>(mockDocumentsData, null, null);
        lastDocumentsBuilder = builder;
        return builder;
      }
      if (table === 'profiles') {
        mockProfilesQueryCount++;
        return new MockQueryBuilder<ProfileRecord[]>(mockProfilesData, null, 100);
      }
      return new MockQueryBuilder<unknown[]>([]);
    }),
  },
}));

import { GET } from '@/app/api/admin/analytics/route';
import { clearAnalyticsCache as _clearAnalyticsCacheForTesting } from '@/src/lib/cache/adminAnalyticsCache';

const sampleDocuments: DocumentRecord[] = [
  { document_type: 'allotment_letter' },
  { document_type: 'allotment_letter' },
  { document_type: 'allotment_letter' },
  { document_type: 'payment_receipt' },
  { document_type: 'payment_receipt' },
  { document_type: 'payment_receipt' },
  { document_type: 'payment_receipt' },
  { document_type: 'payment_receipt' },
  { document_type: 'payment_plan' },
  { document_type: 'payment_plan' },
  { document_type: 'offer_letter' },
  { document_type: 'bba' },
  { document_type: 'bba' },
  { document_type: 'bba' },
  { document_type: 'bba' },
  { document_type: 'custom_type' },
  { document_type: null },
];

describe('/api/admin/analytics - Consolidated Queries & In-Memory Cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _clearAnalyticsCacheForTesting();
    mockDocumentsQueryCount = 0;
    mockProfilesQueryCount = 0;
    mockDocumentsData = [...sampleDocuments];
    mockProfilesData = [{ created_at: new Date().toISOString(), role: 'client' }];
    mockVerifiedAdmin = {
      id: 'admin-test-uuid',
      email: 'admin@sviinfrasolutions.com',
      role: 'admin',
    };
    lastDocumentsBuilder = null;
  });

  afterEach(() => {
    vi.useRealTimers();
    _clearAnalyticsCacheForTesting();
  });

  it('consolidates document stats into a single query and calculates counts accurately in memory', async () => {
    const request = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response = await GET(request);
    const json = (await response.json()) as AnalyticsResponseBody;

    expect(response.status).toBe(200);

    // Verifies that 'documents' table was queried exactly once (consolidated from 5 queries down to 1)
    expect(mockDocumentsQueryCount).toBe(1);

    // Verifies the query targeted 'document_type' where status = 'completed'
    expect(lastDocumentsBuilder?.selectCalls).toEqual([
      { columns: 'document_type', count: undefined, head: undefined },
    ]);
    expect(lastDocumentsBuilder?.eqCalls).toEqual([{ col: 'status', val: 'completed' }]);

    // Verifies exact tally of document counts
    expect(json.documentStats).toEqual([
      { name: 'Allotment', count: 3 },
      { name: 'Receipt', count: 5 },
      { name: 'Plan', count: 2 },
      { name: 'Offer', count: 1 },
      { name: 'BBA', count: 4 },
    ]);
  });

  it('returns X-Cache: MISS on the first call and populates cache', async () => {
    const request = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Cache')).toBe('MISS');
    expect(response.headers.get('Cache-Control')).toBe(
      'private, max-age=30, stale-while-revalidate=60'
    );
    expect(mockDocumentsQueryCount).toBe(1);
    expect(mockProfilesQueryCount).toBeGreaterThan(0);
  });

  it('returns X-Cache: HIT on subsequent calls within TTL without re-querying Supabase', async () => {
    const request1 = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response1 = await GET(request1);
    const json1 = (await response1.json()) as AnalyticsResponseBody;

    expect(response1.status).toBe(200);
    expect(response1.headers.get('X-Cache')).toBe('MISS');
    expect(mockDocumentsQueryCount).toBe(1);
    const initialProfilesQueryCount = mockProfilesQueryCount;

    // Second call within TTL
    const request2 = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response2 = await GET(request2);
    const json2 = (await response2.json()) as AnalyticsResponseBody;

    expect(response2.status).toBe(200);
    expect(response2.headers.get('X-Cache')).toBe('HIT');
    expect(response2.headers.get('Cache-Control')).toBe(
      'private, max-age=30, stale-while-revalidate=60'
    );

    // Database must not have been queried again
    expect(mockDocumentsQueryCount).toBe(1);
    expect(mockProfilesQueryCount).toBe(initialProfilesQueryCount);
    expect(json2).toEqual(json1);

    // Third call within TTL
    const request3 = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response3 = await GET(request3);

    expect(response3.status).toBe(200);
    expect(response3.headers.get('X-Cache')).toBe('HIT');
    expect(mockDocumentsQueryCount).toBe(1);
    expect(mockProfilesQueryCount).toBe(initialProfilesQueryCount);
  });

  it('expires cache after 60 seconds TTL and queries Supabase again', async () => {
    vi.useFakeTimers();

    const request1 = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response1 = await GET(request1);
    expect(response1.headers.get('X-Cache')).toBe('MISS');
    expect(mockDocumentsQueryCount).toBe(1);

    // Advance by 30 seconds (still within TTL)
    vi.advanceTimersByTime(30_000);
    const request2 = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response2 = await GET(request2);
    expect(response2.headers.get('X-Cache')).toBe('HIT');
    expect(mockDocumentsQueryCount).toBe(1);

    // Advance by another 31 seconds (total 61s > 60s TTL)
    vi.advanceTimersByTime(31_000);
    const request3 = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response3 = await GET(request3);
    expect(response3.headers.get('X-Cache')).toBe('MISS');
    expect(mockDocumentsQueryCount).toBe(2);

    // Subsequent call within new TTL
    vi.advanceTimersByTime(10_000);
    const request4 = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response4 = await GET(request4);
    expect(response4.headers.get('X-Cache')).toBe('HIT');
    expect(mockDocumentsQueryCount).toBe(2);
  });

  it('resets cache when _clearAnalyticsCacheForTesting is invoked', async () => {
    const request1 = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response1 = await GET(request1);
    expect(response1.headers.get('X-Cache')).toBe('MISS');
    expect(mockDocumentsQueryCount).toBe(1);

    // Confirm cache HIT
    const request2 = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response2 = await GET(request2);
    expect(response2.headers.get('X-Cache')).toBe('HIT');
    expect(mockDocumentsQueryCount).toBe(1);

    // Manually clear cache
    _clearAnalyticsCacheForTesting();

    // Next request should be MISS and re-query database
    const request3 = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response3 = await GET(request3);
    expect(response3.headers.get('X-Cache')).toBe('MISS');
    expect(mockDocumentsQueryCount).toBe(2);
  });

  it('handles empty documents table gracefully', async () => {
    mockDocumentsData = [];

    const request = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response = await GET(request);
    const json = (await response.json()) as AnalyticsResponseBody;

    expect(response.status).toBe(200);
    expect(json.documentStats).toEqual([
      { name: 'Allotment', count: 0 },
      { name: 'Receipt', count: 0 },
      { name: 'Plan', count: 0 },
      { name: 'Offer', count: 0 },
      { name: 'BBA', count: 0 },
    ]);
  });

  it('blocks unauthorized access before checking or populating cache', async () => {
    mockVerifiedAdmin = null;

    const request = new ConcreteNextRequest('http://localhost/api/admin/analytics');
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(mockDocumentsQueryCount).toBe(0);
  });
});
