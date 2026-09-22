import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-123', email: 'admin@shreeji.com' }),
}));

vi.mock('@/src/lib/attendance/leaveStore', () => ({
  leaveStore: {
    getAllLeaves: vi.fn().mockResolvedValue([
      {
        id: 'leave-1',
        user_id: 'emp-1',
        leave_type: 'casual',
        start_date: '2026-09-24',
        end_date: '2026-09-25',
        status: 'pending',
        user: { full_name: 'Amit Verma' },
      },
    ]),
  },
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'documents') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'doc-1',
                    document_type: 'payment_receipt',
                    status: 'completed',
                    created_at: '2026-09-23T10:00:00Z',
                    form_data: {
                      receipt_number: 'REC-001',
                      customer_name: 'Ramesh Sharma',
                      amount_paid: 250000,
                      plot_number: 'A-12',
                      verified: false,
                    },
                  },
                ],
                error: null,
              }),
            }),
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'chat_leads') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'lead-1',
                    name: 'Suresh Patel',
                    phone: '+919876543210',
                    temperature: 'hot',
                    lifecycle_status: 'new',
                    created_at: '2026-09-22T08:00:00Z',
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ id: 'p-1', role: 'employee' }],
              count: 10,
              error: null,
            }),
          }),
        };
      }
      if (table === 'attendance_records') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ id: 'att-1', status: 'present' }],
              error: null,
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    }),
  },
}));

import { GET } from '@/app/api/admin/dashboard/executive/route';
import { clearExecutiveDashboardCache } from '@/src/lib/cache/adminExecutiveCache';

describe('Executive Dashboard Aggregator API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearExecutiveDashboardCache();
  });

  it('returns valid aggregated executive KPI and radar data', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/dashboard/executive');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('kpis');
    expect(json).toHaveProperty('target');
    expect(json).toHaveProperty('urgentActions');
    expect(json.urgentActions.pendingLeaves.length).toBe(1);
    expect(json.urgentActions.hotLeadsPending.length).toBe(1);
    expect(res.headers.get('X-Cache')).toBe('MISS');
  });

  it('serves cached data with X-Cache: HIT on second request', async () => {
    const req1 = new NextRequest('http://localhost:3000/api/admin/dashboard/executive');
    const res1 = await GET(req1);
    expect(res1.headers.get('X-Cache')).toBe('MISS');

    const req2 = new NextRequest('http://localhost:3000/api/admin/dashboard/executive');
    const res2 = await GET(req2);
    expect(res2.headers.get('X-Cache')).toBe('HIT');
  });
});
