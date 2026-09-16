import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' }),
}));

const mockOrder = vi.fn();
const mockRange = vi.fn();

vi.mock('@/src/lib/supabase/admin', () => {
  const createMockBuilder = () => {
    const builder: Record<string, unknown> = {
      eq: vi.fn().mockImplementation(() => builder),
      ilike: vi.fn().mockImplementation(() => builder),
      or: vi.fn().mockImplementation(() => builder),
      order: mockOrder.mockImplementation(() => ({
        range: mockRange.mockResolvedValue({
          data: [
            {
              id: 'rec-1',
              customer_phone: '8744875331',
              agent_name: 'Shivam Yadav',
              agent_phone: '9311290543',
              dial_status: 'NOANSWER',
              call_duration: 103,
              pressed_key: '2',
              dial_time: '2026-09-15T15:55:29Z',
            },
          ],
          error: null,
          count: 1,
        }),
      })),
      then: (resolve: (value: { data: unknown[]; error: null; count: number }) => void) =>
        resolve({ data: [], error: null, count: 1 }),
    };
    return builder;
  };

  return {
    supabaseAdmin: {
      from: vi.fn(() => ({
        select: vi.fn(() => createMockBuilder()),
      })),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  };
});

import { GET } from '@/app/api/admin/leads/ivr-records/route';

describe('GET /api/admin/leads/ivr-records', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthorized requests with 401', async () => {
    (verifyAdmin as Mock).mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost/api/admin/leads/ivr-records');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('fetches paginated ivr records with dial status support', async () => {
    const req = new NextRequest(
      'http://localhost/api/admin/leads/ivr-records?page=1&limit=10&dial_status=NOANSWER'
    );
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.records).toBeDefined();
    expect(json.records.length).toBeGreaterThanOrEqual(1);
    expect(json.records[0].dial_status).toBe('NOANSWER');
  });
});
