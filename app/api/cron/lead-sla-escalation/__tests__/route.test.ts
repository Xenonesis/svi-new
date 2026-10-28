import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';

const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ error: null }),
});
const mockSelect = vi.fn();

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'lead_sla_tracking') {
        return {
          select: mockSelect,
          update: mockUpdate,
        };
      }
      return {
        insert: mockInsert,
      };
    }),
  },
}));

vi.mock('@/src/lib/leads/multiChannelDispatcher', () => ({
  dispatchSlaBreachEscalation: vi.fn().mockResolvedValue(true),
}));

describe('GET /api/cron/lead-sla-escalation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when authorization header is invalid and CRON_SECRET is configured', async () => {
    process.env.CRON_SECRET = 'secret_test';
    const req = new NextRequest('http://localhost:3000/api/cron/lead-sla-escalation', {
      headers: { authorization: 'Bearer wrong_secret' },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('processes breached records and marks them breached_escalated', async () => {
    process.env.CRON_SECRET = 'secret_test';
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        lt: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'row-1',
                lead_id: 'lead-1',
                customer_phone: '+919876543210',
                sla_threshold_minutes: 15,
                status: 'pending_contact',
              },
            ],
            error: null,
          }),
        }),
      }),
    });

    const req = new NextRequest('http://localhost:3000/api/cron/lead-sla-escalation', {
      headers: { authorization: 'Bearer secret_test' },
    });
    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.escalated_count).toBe(1);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'breached_escalated' })
    );
  });

  it('returns 200 with processed 0 when no breached records found', async () => {
    process.env.CRON_SECRET = 'secret_test';
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        lt: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    const req = new NextRequest('http://localhost:3000/api/cron/lead-sla-escalation', {
      headers: { authorization: 'Bearer secret_test' },
    });
    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.processed).toBe(0);
  });

  it('returns 500 when database select returns an error', async () => {
    process.env.CRON_SECRET = 'secret_test';
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        lt: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' },
          }),
        }),
      }),
    });

    const req = new NextRequest('http://localhost:3000/api/cron/lead-sla-escalation', {
      headers: { authorization: 'Bearer secret_test' },
    });
    const res = await GET(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Database connection failed');
  });
});
