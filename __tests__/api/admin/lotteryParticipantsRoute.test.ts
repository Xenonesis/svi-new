import { describe, it, expect, vi, beforeEach } from 'vitest';

const rpcMock = vi.fn();
const fromMock = vi.fn();
const selectMock = vi.fn();
const eqMock = vi.fn();
const orderMock = vi.fn();
const limitMock = vi.fn();

const verifyAdminMock = vi.fn();

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: (...args: unknown[]) => verifyAdminMock(...args),
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    rpc: (...args: unknown[]) => rpcMock(...args),
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

import { GET } from '@/app/api/admin/lottery/participants/route';

const LOTTERY_ID = 'lottery-1';

function makeRequest(search: string): Request {
  return new Request(`http://localhost/api/admin/lottery/participants?${search}`);
}

describe('GET /api/admin/lottery/participants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdminMock.mockResolvedValue({ id: 'admin-1', email: 'admin@svi.in' });

    selectMock.mockReturnThis();
    eqMock.mockReturnThis();
    orderMock.mockReturnThis();
    limitMock.mockResolvedValue({ data: [], error: null });
    fromMock.mockReturnValue({
      select: selectMock,
      eq: eqMock,
      order: orderMock,
      limit: limitMock,
    });
  });

  it('rejects unauthenticated callers', async () => {
    verifyAdminMock.mockResolvedValue(null);

    const res = await GET(makeRequest(`lotteryId=${LOTTERY_ID}`) as never);

    expect(res.status).toBe(401);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('requires a lotteryId', async () => {
    const res = await GET(makeRequest('') as never);

    expect(res.status).toBe(400);
  });

  it('reads PII through the admin RPC when it exists', async () => {
    rpcMock.mockResolvedValue({
      data: [
        {
          id: 'p-1',
          lottery_id: LOTTERY_ID,
          name: 'Alice Smith',
          ticket_number: 'SVI6001',
          phone: '+91 98765 44000',
          email: 'alice@example.com',
          is_winner: true,
          prize_rank: 1,
          created_at: '2026-10-20T00:00:00Z',
        },
      ],
      error: null,
    });

    const res = await GET(makeRequest(`lotteryId=${LOTTERY_ID}`) as never);
    const body = (await res.json()) as { participants: Array<{ email: string }> };

    expect(res.status).toBe(200);
    expect(rpcMock).toHaveBeenCalledWith('get_lottery_participants_admin', {
      p_lottery_id: LOTTERY_ID,
      p_search: null,
      p_limit: 200,
    });
    expect(body.participants[0].email).toBe('alice@example.com');
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('falls back to a service-role read when the RPC is not yet installed', async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { code: 'PGRST202', message: 'function not found' },
    });
    limitMock.mockResolvedValue({
      data: [
        {
          id: 'p-1',
          lottery_id: LOTTERY_ID,
          name: 'Alice Smith',
          ticket_number: 'SVI6001',
          phone: '+91 98765 44000',
          email: 'alice@example.com',
          is_winner: false,
          prize_rank: null,
          created_at: '2026-10-20T00:00:00Z',
        },
      ],
      error: null,
    });

    const res = await GET(makeRequest(`lotteryId=${LOTTERY_ID}`) as never);
    const body = (await res.json()) as { participants: Array<{ email: string }> };

    expect(res.status).toBe(200);
    expect(fromMock).toHaveBeenCalledWith('lottery_participants');
    expect(body.participants).toHaveLength(1);
    expect(body.participants[0].email).toBe('alice@example.com');
  });

  it('filters to winners only when requested', async () => {
    rpcMock.mockResolvedValue({
      data: [
        { id: 'p-1', name: 'Winner', ticket_number: 'SVI6001', is_winner: true },
        { id: 'p-2', name: 'Loser', ticket_number: 'SVI6002', is_winner: false },
      ],
      error: null,
    });

    const res = await GET(makeRequest(`lotteryId=${LOTTERY_ID}&winnersOnly=true`) as never);
    const body = (await res.json()) as { participants: Array<{ name: string }> };

    expect(body.participants).toHaveLength(1);
    expect(body.participants[0].name).toBe('Winner');
  });

  it('propagates a non-missing-function RPC error', async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { code: '42501', message: 'permission denied for function' },
    });

    const res = await GET(makeRequest(`lotteryId=${LOTTERY_ID}`) as never);

    expect(res.status).toBe(500);
    expect(fromMock).not.toHaveBeenCalled();
  });
});
