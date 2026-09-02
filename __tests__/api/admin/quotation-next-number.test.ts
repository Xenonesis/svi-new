import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockVerifyAdmin, mockGetNextQuotationNumberFromDb } = vi.hoisted(() => ({
  mockVerifyAdmin: vi.fn(),
  mockGetNextQuotationNumberFromDb: vi.fn(),
}));

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: mockVerifyAdmin,
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {},
}));

vi.mock('@/src/lib/quotation/quotationNumber', () => ({
  getNextQuotationNumberFromDb: mockGetNextQuotationNumberFromDb,
}));

import { GET } from '@/app/api/admin/quotation/next-number/route';

describe('GET /api/admin/quotation/next-number', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 Unauthorized if caller is not an admin', async () => {
    mockVerifyAdmin.mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/admin/quotation/next-number');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.message).toBe('Unauthorized');
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('returns next auto-generated unique quotation number for admin', async () => {
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1', role: 'admin' });
    mockGetNextQuotationNumberFromDb.mockResolvedValue('SVI-QTN-20260902-0001');

    const req = new NextRequest('http://localhost:3000/api/admin/quotation/next-number');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ quotationNo: 'SVI-QTN-20260902-0001' });
    expect(mockGetNextQuotationNumberFromDb).toHaveBeenCalledWith(expect.anything(), undefined);
  });

  it('passes target date query parameter to generator', async () => {
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1', role: 'admin' });
    mockGetNextQuotationNumberFromDb.mockResolvedValue('SVI-QTN-20260815-0004');

    const req = new NextRequest(
      'http://localhost:3000/api/admin/quotation/next-number?date=2026-08-15'
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ quotationNo: 'SVI-QTN-20260815-0004' });
    expect(mockGetNextQuotationNumberFromDb).toHaveBeenCalledWith(expect.anything(), '2026-08-15');
  });
});
