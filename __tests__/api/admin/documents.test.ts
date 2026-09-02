import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Chainable mock helper
function chainMock(resolveResult: { data?: any; count?: number; error?: any } = {}) {
  const result = {
    data: resolveResult.data ?? null,
    count: resolveResult.count ?? 0,
    error: resolveResult.error ?? null,
  };
  const handler: ProxyHandler<Record<string, any>> = {
    get(_target, prop) {
      if (prop === 'then') return (cb: (v: typeof result) => any) => cb(result);
      if (prop === 'catch') return () => proxy;
      if (prop === 'finally')
        return (cb: () => void) => {
          cb();
          return proxy;
        };
      return (...args: any[]) => {
        callLog.push({ method: String(prop), args });
        return proxy;
      };
    },
  };
  const callLog: { method: string; args: any[] }[] = [];
  const proxy = new Proxy({} as Record<string, any>, handler);
  return { proxy, callLog };
}

const { mockVerifyAdmin } = vi.hoisted(() => ({
  mockVerifyAdmin: vi.fn(),
}));

let dbCallLog: { table: string; method: string; args: any[] }[] = [];

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: mockVerifyAdmin,
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      return {
        select: vi.fn(() => {
          const { proxy, callLog } = chainMock({
            data: [
              {
                id: 'doc-1',
                document_type: 'payment_receipt',
                user_id: 'user-123',
                created_by: 'admin-123',
                form_data: {
                  receiptNo: 'REC-001',
                  date: '2026-06-07',
                  salutation: 'Mrs.',
                  name: 'Jane Doe',
                  amount: 15000,
                  amountWords: 'Fifteen Thousand Only',
                },
                created_at: '2026-06-07T10:00:00Z',
              },
            ],
          });
          callLog.forEach((c) => dbCallLog.push({ table, method: c.method, args: c.args }));
          return proxy;
        }),
        insert: vi.fn((data: any) => {
          const insertedRow = Array.isArray(data) ? data[0] : data;
          const { proxy, callLog } = chainMock({
            data: {
              id: 'new-doc-id',
              ...insertedRow,
              created_at: new Date().toISOString(),
            },
          });
          callLog.forEach((c) => dbCallLog.push({ table, method: c.method, args: c.args }));
          return proxy;
        }),
      };
    }),
  },
}));

vi.mock('@/src/lib/supabase/notifications', () => ({
  NotificationHelper: {
    documentCreated: vi.fn().mockResolvedValue(true),
  },
}));

import { GET, POST } from '@/app/api/admin/documents/route';

describe('Documents API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbCallLog = [];
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' });
  });

  describe('GET /api/admin/documents', () => {
    it('should return 401 when not admin', async () => {
      mockVerifyAdmin.mockResolvedValueOnce(null);
      const request = new NextRequest('http://localhost/api/admin/documents');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return list of documents', async () => {
      const request = new NextRequest('http://localhost/api/admin/documents');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.documents).toHaveLength(1);
      expect(data.documents[0].form_data.salutation).toBe('Mrs.');
    });
  });

  describe('POST /api/admin/documents', () => {
    it('should return 401 when not admin', async () => {
      mockVerifyAdmin.mockResolvedValueOnce(null);
      const request = new NextRequest('http://localhost/api/admin/documents', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should reject with 400 when document_type is missing or invalid', async () => {
      const requestMissing = new NextRequest('http://localhost/api/admin/documents', {
        method: 'POST',
        body: JSON.stringify({ user_id: 'user-123' }),
      });
      const responseMissing = await POST(requestMissing);
      expect(responseMissing.status).toBe(400);

      const requestInvalid = new NextRequest('http://localhost/api/admin/documents', {
        method: 'POST',
        body: JSON.stringify({ user_id: 'user-123', document_type: 'invalid_type' }),
      });
      const responseInvalid = await POST(requestInvalid);
      expect(responseInvalid.status).toBe(400);
    });

    it('should successfully create a payment receipt document with correct salutation and form_data', async () => {
      const payload = {
        document_type: 'payment_receipt',
        user_id: 'user-123',
        status: 'draft',
        form_data: {
          receiptNo: 'REC-1002',
          date: '2026-06-07',
          salutation: 'M/s',
          name: 'Acme Corporation',
          amount: 2100,
          amountWords: 'Two Thousand One Hundred Only',
        },
      };

      const request = new NextRequest('http://localhost/api/admin/documents', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.document).toBeDefined();
      expect(data.document.id).toBe('new-doc-id');
      expect(data.document.form_data.salutation).toBe('M/s');
      expect(data.document.form_data.amount).toBe(2100);
    });

    it('should auto-generate unique quotation number from DB if not provided in quotation form_data', async () => {
      const payload = {
        document_type: 'quotation',
        user_id: 'user-123',
        status: 'draft',
        form_data: {
          customerName: 'Aarav Sharma',
          quotationDate: '2026-09-02',
          area: 120,
          basicRate: 8000,
        },
      };

      const request = new NextRequest('http://localhost/api/admin/documents', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.document).toBeDefined();
      expect(data.document.form_data.quotationNo).toMatch(/^SVI-QTN-\d{8}-\d{4,}$/);
    });
  });
});
