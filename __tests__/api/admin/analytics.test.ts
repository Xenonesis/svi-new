import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Create a chainable mock that resolves with given result for any method chain
function chainMock(resolveResult: { data?: unknown; count?: number; error?: unknown } = {}) {
  const result = {
    data: resolveResult.data ?? null,
    count: resolveResult.count ?? 0,
    error: resolveResult.error ?? null,
  };
  const proxy = new Proxy({} as Record<string, unknown>, {
    get(_target, prop) {
      if (prop === 'then') return (cb: (v: typeof result) => unknown) => cb(result);
      if (prop === 'catch') return (cb: (e: unknown) => unknown) => proxy;
      if (prop === 'finally')
        return (cb: () => void) => {
          cb();
          return proxy;
        };
      return (..._args: unknown[]) => proxy;
    },
  });
  return proxy;
}

const { mockVerifyAdmin } = vi.hoisted(() => ({
  mockVerifyAdmin: vi.fn(),
}));

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: mockVerifyAdmin,
}));

// Track from() calls for assertions
const fromCalls: string[] = [];
vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      fromCalls.push(table);
      return {
        select: vi.fn((_cols: string, opts?: { count?: string; head?: boolean }) => {
          if (opts?.head) {
            // Head-only count queries return chain that resolves with count
            return chainMock({ count: 5 });
          }
          // Regular select queries
          return chainMock({ data: [] });
        }),
      };
    }),
  },
}));

import { GET } from '@/app/api/admin/analytics/route';

describe('GET /api/admin/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fromCalls.length = 0;
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' });
  });

  it('should return 401 when not admin', async () => {
    mockVerifyAdmin.mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost/api/admin/analytics');
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('should return analytics data structure', async () => {
    const request = new NextRequest('http://localhost/api/admin/analytics');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('userGrowth');
    expect(data).toHaveProperty('documentStats');
    expect(data).toHaveProperty('trends');
  });

  it('should return userGrowth as array of 30 days', async () => {
    const request = new NextRequest('http://localhost/api/admin/analytics');
    const response = await GET(request);
    const data = await response.json();

    expect(data.userGrowth).toHaveLength(30);
    // Last entry should be "Today"
    expect(data.userGrowth[29]).toHaveProperty('date', 'Today');
    expect(data.userGrowth[29]).toHaveProperty('users');
    // First entry should have a date like "M/D"
    expect(data.userGrowth[0]).toHaveProperty('date');
    expect(data.userGrowth[0]).toHaveProperty('users');
  });

  it('should return documentStats with all 5 document types', async () => {
    const request = new NextRequest('http://localhost/api/admin/analytics');
    const response = await GET(request);
    const data = await response.json();

    expect(data.documentStats).toHaveLength(5);
    const names = data.documentStats.map((s: { name: string }) => s.name);
    expect(names).toContain('Allotment');
    expect(names).toContain('Receipt');
    expect(names).toContain('Plan');
    expect(names).toContain('Offer');
    expect(names).toContain('BBA');
  });

  it('should set Cache-Control header', async () => {
    const request = new NextRequest('http://localhost/api/admin/analytics');
    const response = await GET(request);

    expect(response.headers.get('Cache-Control')).toBe(
      'private, max-age=30, stale-while-revalidate=60'
    );
  });

  it('should return trends with percentage format', async () => {
    const request = new NextRequest('http://localhost/api/admin/analytics');
    const response = await GET(request);
    const data = await response.json();

    expect(data.trends.userGrowth).toMatch(/[+-]\d+%/);
    expect(data.trends.clientGrowth).toMatch(/[+-]\d+%/);
  });

  it('should query both profiles and documents tables', async () => {
    const request = new NextRequest('http://localhost/api/admin/analytics');
    await GET(request);

    expect(fromCalls).toContain('profiles');
    expect(fromCalls).toContain('documents');
  });
});
