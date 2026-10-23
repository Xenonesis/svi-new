import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/admin/email/erp-documents/route';
import { NextRequest } from 'next/server';

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-1', email: 'admin@sviinfra.in' }),
}));

vi.mock('@/src/lib/supabase/verifyEmployee', () => ({
  verifyEmployee: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((_table: string) => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'allot-123',
            client_name: 'Sanjay Yadav',
            unit_no: 'B-102',
            created_at: '2026-10-20',
            client_email: 'sanjay@example.com',
          },
        ],
        error: null,
      }),
    })),
  },
}));

describe('GET /api/admin/email/erp-documents', () => {
  it('returns available ERP records for attachments', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/admin/email/erp-documents?type=allotment'
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.documents).toBeDefined();
    expect(body.documents.length).toBeGreaterThan(0);
    expect(body.documents[0].id).toBe('allot-123');
  });
});
