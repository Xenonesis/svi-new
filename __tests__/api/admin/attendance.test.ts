import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Chainable mock that resolves with given result
function chainMock(resolveResult: { data?: unknown; count?: number; error?: unknown } = {}) {
  const result = {
    data: resolveResult.data ?? null,
    count: resolveResult.count ?? 0,
    error: resolveResult.error ?? null,
  };
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === 'then') return (cb: (v: typeof result) => unknown) => cb(result);
      if (prop === 'catch') return () => proxy;
      if (prop === 'finally')
        return (cb: () => void) => {
          cb();
          return proxy;
        };
      // Record method calls for assertions
      return (...args: unknown[]) => {
        callLog.push({ method: String(prop), args });
        return proxy;
      };
    },
  };
  const callLog: { method: string; args: unknown[] }[] = [];
  const proxy = new Proxy({} as Record<string, unknown>, handler);
  return { proxy, callLog };
}

const { mockVerifyAdmin } = vi.hoisted(() => ({
  mockVerifyAdmin: vi.fn(),
}));

// Track calls across tests
let recordsCallLog: { method: string; args: unknown[] }[] = [];
let reportCallLog: { method: string; args: unknown[] }[] = [];

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: mockVerifyAdmin,
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'attendance_records') {
        return {
          select: vi.fn(() => {
            const { proxy, callLog } = chainMock({
              data: [
                {
                  id: 'rec-1',
                  team_id: 'team-1',
                  user_id: 'user-1',
                  date: '2025-01-15',
                  status: 'present',
                  notes: null,
                  marked_by: 'admin-123',
                  created_at: '2025-01-15T10:00:00Z',
                  updated_at: '2025-01-15T10:00:00Z',
                  profiles: { full_name: 'John Doe', email: 'john@test.com' },
                },
                {
                  id: 'rec-2',
                  team_id: 'team-1',
                  user_id: 'user-1',
                  date: '2025-01-16',
                  status: 'absent',
                  notes: null,
                  marked_by: 'admin-123',
                  created_at: '2025-01-16T10:00:00Z',
                  updated_at: '2025-01-16T10:00:00Z',
                  profiles: { full_name: 'John Doe', email: 'john@test.com' },
                },
              ],
              error: null,
            });
            // Store callLog for later assertions
            recordsCallLog = callLog;
            reportCallLog = callLog;
            return proxy;
          }),
        };
      }
      return { select: vi.fn() };
    }),
  },
}));

import { GET as RecordsGET } from '@/app/api/admin/attendance/records/route';
import { GET as ReportGET } from '@/app/api/admin/attendance/report/route';

describe('GET /api/admin/attendance/records', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recordsCallLog = [];
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' });
  });

  it('should return 401 when not admin', async () => {
    mockVerifyAdmin.mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost/api/admin/attendance/records');
    const response = await RecordsGET(request);
    expect(response.status).toBe(401);
  });

  it('should apply default limit of 500', async () => {
    const request = new NextRequest('http://localhost/api/admin/attendance/records');
    await RecordsGET(request);

    const limitCall = recordsCallLog.find((c) => c.method === 'limit');
    expect(limitCall).toBeDefined();
    expect(limitCall!.args).toEqual([500]);
  });

  it('should accept custom limit parameter', async () => {
    const request = new NextRequest('http://localhost/api/admin/attendance/records?limit=100');
    await RecordsGET(request);

    const limitCall = recordsCallLog.find((c) => c.method === 'limit');
    expect(limitCall).toBeDefined();
    expect(limitCall!.args).toEqual([100]);
  });

  it('should cap limit at 1000', async () => {
    const request = new NextRequest('http://localhost/api/admin/attendance/records?limit=5000');
    await RecordsGET(request);

    const limitCall = recordsCallLog.find((c) => c.method === 'limit');
    expect(limitCall).toBeDefined();
    expect(limitCall!.args).toEqual([1000]);
  });

  it('should support team_id filter', async () => {
    const request = new NextRequest('http://localhost/api/admin/attendance/records?team_id=team-1');
    await RecordsGET(request);

    const eqCalls = recordsCallLog.filter((c) => c.method === 'eq');
    expect(eqCalls.some((c) => c.args[0] === 'team_id' && c.args[1] === 'team-1')).toBe(true);
  });

  it('should support date filter', async () => {
    const request = new NextRequest(
      'http://localhost/api/admin/attendance/records?date=2025-01-15'
    );
    await RecordsGET(request);

    const eqCalls = recordsCallLog.filter((c) => c.method === 'eq');
    expect(eqCalls.some((c) => c.args[0] === 'date' && c.args[1] === '2025-01-15')).toBe(true);
  });

  it('should format records with profile info', async () => {
    const request = new NextRequest('http://localhost/api/admin/attendance/records');
    const response = await RecordsGET(request);
    const data = await response.json();

    expect(data.records).toHaveLength(2);
    expect(data.records[0]).toMatchObject({
      id: 'rec-1',
      full_name: 'John Doe',
      email: 'john@test.com',
      status: 'present',
    });
    expect(data.records[1]).toMatchObject({
      id: 'rec-2',
      status: 'absent',
    });
  });
});

describe('GET /api/admin/attendance/report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reportCallLog = [];
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' });
  });

  it('should return 401 when not admin', async () => {
    mockVerifyAdmin.mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost/api/admin/attendance/report');
    const response = await ReportGET(request);
    expect(response.status).toBe(401);
  });

  it('should default to last 30 days when no date range specified', async () => {
    const request = new NextRequest('http://localhost/api/admin/attendance/report');
    await ReportGET(request);

    const gteCalls = reportCallLog.filter((c) => c.method === 'gte');
    expect(gteCalls.length).toBeGreaterThan(0);
    expect(gteCalls[0].args[0]).toBe('date');
    // Date should be ISO format
    expect(gteCalls[0].args[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should use explicit from date when provided', async () => {
    const request = new NextRequest('http://localhost/api/admin/attendance/report?from=2025-01-01');
    await ReportGET(request);

    const gteCalls = reportCallLog.filter((c) => c.method === 'gte');
    expect(gteCalls.some((c) => c.args[0] === 'date' && c.args[1] === '2025-01-01')).toBe(true);
  });

  it('should aggregate records by user correctly', async () => {
    const request = new NextRequest('http://localhost/api/admin/attendance/report');
    const response = await ReportGET(request);
    const data = await response.json();

    expect(data.report).toHaveLength(1);
    const userReport = data.report[0];
    expect(userReport.user_id).toBe('user-1');
    expect(userReport.present).toBe(1);
    expect(userReport.absent).toBe(1);
    expect(userReport.total_days).toBe(2);
    expect(userReport.attendance_percentage).toBe(50);
  });

  it('should support team_id filter', async () => {
    const request = new NextRequest('http://localhost/api/admin/attendance/report?team_id=team-1');
    await ReportGET(request);

    const eqCalls = reportCallLog.filter((c) => c.method === 'eq');
    expect(eqCalls.some((c) => c.args[0] === 'team_id' && c.args[1] === 'team-1')).toBe(true);
  });
});
