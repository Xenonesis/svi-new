import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
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

vi.mock('@/src/lib/supabase/admin', () => {
  const sampleReceipts = [
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
  ];

  const sampleLeads = [
    {
      id: 'lead-1',
      name: 'Suresh Patel',
      phone: '+919876543210',
      temperature: 'hot',
      lifecycle_status: 'new',
      created_at: '2026-09-22T08:00:00Z',
    },
  ];

  const sampleProperties = [
    { name: 'Shyam Aangan Phase 1', slug: 'shyam-aangan-phase-1' },
    { name: 'Shyam Aangan', slug: 'shyam-aangan' },
  ];

  const sampleDues = [
    {
      id: 'bba-1',
      document_type: 'bba',
      created_at: '2026-09-20T10:00:00Z',
      form_data: {
        clientName: 'Aura Retail Pvt Ltd',
        unitNumber: 'A-101',
        within15DaysAmount: '52220',
        bookingDate: '2026-09-12',
      },
    },
  ];

  return {
    supabaseAdmin: {
      from: vi.fn((table: string) => {
        let returnData: unknown = [];
        let returnCount: number | null = 10;

        if (table === 'documents') {
          returnData = sampleReceipts;
        } else if (table === 'chat_leads') {
          returnData = sampleLeads;
          returnCount = 25;
        } else if (table === 'profiles') {
          returnData = [{ id: 'p-1', role: 'employee' }];
          returnCount = 15;
        } else if (table === 'attendance_records') {
          returnData = [{ id: 'att-1', status: 'present' }];
          returnCount = 1;
        } else if (table === 'properties') {
          returnData = sampleProperties;
          returnCount = 2;
        }

        interface MockQueryChain {
          select: Mock;
          eq: Mock;
          in: Mock;
          order: Mock;
          limit: Mock;
          then: (
            resolve: (val: { data: unknown; count: number | null; error: null }) => unknown
          ) => Promise<unknown>;
        }

        const chain: MockQueryChain = {
          select: vi.fn().mockImplementation(() => chain),
          eq: vi.fn().mockImplementation((_field: string, val: unknown) => {
            if (val === 'payment_receipt') returnData = sampleReceipts;
            return chain;
          }),
          in: vi.fn().mockImplementation((_field: string, values: string[]) => {
            if (values.includes('bba') && values.includes('quotation')) returnData = sampleDues;
            return chain;
          }),
          order: vi.fn().mockImplementation(() => chain),
          limit: vi.fn().mockImplementation(() => chain),
          then: (resolve) =>
            Promise.resolve({ data: returnData, count: returnCount, error: null }).then(resolve),
        };

        return chain;
      }),
    },
  };
});

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
    expect(json).toHaveProperty('inventoryByProperty');
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
