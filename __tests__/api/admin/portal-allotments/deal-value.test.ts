import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockVerifyAdmin, mockSupabaseFrom } = vi.hoisted(() => ({
  mockVerifyAdmin: vi.fn(),
  mockSupabaseFrom: vi.fn(),
}));

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: mockVerifyAdmin,
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
  },
}));

import { POST } from '@/app/api/admin/portal-allotments/deal-value/route';

describe('POST /api/admin/portal-allotments/deal-value', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 if caller is not an admin', async () => {
    mockVerifyAdmin.mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3000/api/admin/portal-allotments/deal-value', {
      method: 'POST',
      body: JSON.stringify({ refId: 'SVI2051', dealValue: 500000 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 if refId is missing', async () => {
    mockVerifyAdmin.mockResolvedValueOnce({ id: 'admin-1', email: 'admin@svi.com' });

    const req = new NextRequest('http://localhost:3000/api/admin/portal-allotments/deal-value', {
      method: 'POST',
      body: JSON.stringify({ dealValue: 500000 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('updates matching allotment and portal_settings in database', async () => {
    mockVerifyAdmin.mockResolvedValueOnce({ id: 'admin-1', email: 'admin@svi.com' });

    const mockAllotment = {
      id: 'allot-1',
      unit_no: '01',
      metadata: { ticket_id: 'SVI002134', area: '193.90', total_cost: 430125 },
    };

    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const upsertMock = vi.fn().mockResolvedValue({ error: null });
    const insertMock = vi.fn().mockResolvedValue({ error: null });

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'allotments') {
        return {
          select: vi.fn().mockResolvedValue({ data: [mockAllotment], error: null }),
          update: updateMock,
        };
      }
      if (table === 'portal_settings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: { value: {} } }),
            }),
          }),
          upsert: upsertMock,
        };
      }
      if (table === 'activity_logs') {
        return {
          insert: insertMock,
        };
      }
      return {};
    });

    const req = new NextRequest('http://localhost:3000/api/admin/portal-allotments/deal-value', {
      method: 'POST',
      body: JSON.stringify({
        refId: 'SVI002134',
        dealValue: 1066450,
        area: 193.9,
        ratePerSqYd: 5500,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.dealValue).toBe(1066450);
    expect(json.area).toBe(193.9);
    expect(json.ratePerSqYd).toBe(5500);
    expect(json.updatedAllotmentsCount).toBe(1);

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          total_cost: 1066450,
          area: '193.9',
          rate_per_sq_yd: 5500,
        }),
      })
    );
  });
});
