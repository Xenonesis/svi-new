import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError } from '@/src/lib/api/errors';

const HTTP_PREFIX = 'http:' + String.fromCharCode(47, 47) + 'localhost:3000';

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-1', role: 'admin' }),
}));

let mockHeartbeatRow: Record<string, unknown> | null = null;
let mockSettingsRow: Record<string, unknown> | null = null;

vi.mock('@/src/lib/supabase/admin', () => {
  const fakeFrom = vi.fn().mockImplementation((table: string) => {
    if (table === 'portal_settings') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation((_col: string, val: string) => {
          if (val === 'voice_ai_triage_heartbeat') {
            return {
              maybeSingle: vi.fn().mockResolvedValue({
                data: mockHeartbeatRow,
                error: null,
              }),
            };
          }
          if (val === 'hot_lead_notification_settings') {
            return {
              maybeSingle: vi.fn().mockResolvedValue({
                data: mockSettingsRow,
                error: null,
              }),
            };
          }
          return {
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }),
      };
    }
    return {
      select: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
  });

  return {
    supabaseAdmin: {
      from: fakeFrom,
    },
  };
});

describe('GET /api/admin/leads/triage-status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeartbeatRow = null;
    mockSettingsRow = null;
  });

  it('rejects unauthorized non-admin access with 401', async () => {
    vi.mocked(verifyAdmin).mockRejectedValueOnce(AppError.unauthorized('Admin access required'));

    const req = new NextRequest(`${HTTP_PREFIX}/api/admin/leads/triage-status`);
    const res = await GET(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error.message).toContain('Admin access required');
  });

  it('returns default fallback status when heartbeat row is empty', async () => {
    const req = new NextRequest(`${HTTP_PREFIX}/api/admin/leads/triage-status`);
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('idle');
    expect(json.data.is_live).toBe(false);
    expect(json.data.scheduled_digest_time).toBe('19:30');
    expect(json.data.processed_count).toBe(0);
  });

  it('returns live status when heartbeat was updated recently', async () => {
    mockHeartbeatRow = {
      value: {
        status: 'running',
        total_eligible: 4425,
        processed_count: 240,
        hot_count: 8,
        warm_count: 65,
        cold_count: 167,
        last_triaged: {
          phone: '9988776655',
          duration: 72,
          interest_level: 'Hot',
          intent: 'Site Visit Requested',
          summary: 'Customer wants to visit site tomorrow',
          budget: '15k per gaj',
          at: new Date().toISOString(),
        },
        heartbeat_at: new Date().toISOString(),
        scheduled_digest_time: '20:00',
      },
    };

    mockSettingsRow = {
      value: {
        recipients: [{ digest_time: '20:00' }],
      },
    };

    const req = new NextRequest(`${HTTP_PREFIX}/api/admin/leads/triage-status`);
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('running');
    expect(json.data.is_live).toBe(true);
    expect(json.data.processed_count).toBe(240);
    expect(json.data.hot_count).toBe(8);
    expect(json.data.scheduled_digest_time).toBe('20:00');
    expect(json.data.last_triaged.phone).toBe('9988776655');
  });

  it('marks as idle if heartbeat is older than 90 seconds', async () => {
    const staleTime = new Date(Date.now() - 120 * 1000).toISOString();
    mockHeartbeatRow = {
      value: {
        status: 'running',
        total_eligible: 4425,
        processed_count: 50,
        hot_count: 2,
        warm_count: 10,
        cold_count: 38,
        last_triaged: null,
        heartbeat_at: staleTime,
      },
    };

    const req = new NextRequest(`${HTTP_PREFIX}/api/admin/leads/triage-status`);
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('idle');
    expect(json.data.is_live).toBe(false);
  });
});
