import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' }),
}));

const mockOrder = vi.fn();
const mockRange = vi.fn();

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: mockOrder.mockReturnValue({
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
        }),
      })),
    })),
  },
}));

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
