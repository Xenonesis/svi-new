import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as bulkPost } from '@/app/api/admin/leads/bulk/route';
import { GET as perfGet } from '@/app/api/admin/leads/performance/route';
import { PATCH as leadPatch } from '@/app/api/admin/leads/[phone]/route';

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' }),
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { phone: '8744875331', pipeline_stage: 'contacted' },
          error: null,
        }),
      })),
      update: vi.fn(() => ({
        in: vi.fn().mockResolvedValue({ error: null }),
        or: vi.fn(() => ({
          select: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { phone: '8744875331', pipeline_stage: 'visit_scheduled' },
              error: null,
            }),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

describe('CRM Suite Backend Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/admin/leads/bulk reassigns leads', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/leads/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_numbers: ['8744875331', '9870435702'],
        action: 'reassign',
        advisor_id: 'emp-shivam',
        advisor_name: 'Shivam Yadav',
      }),
    });

    const res = await bulkPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.affected_count).toBe(2);
    expect(json.advisor_name).toBe('Shivam Yadav');
  });

  it('POST /api/admin/leads/bulk changes stage', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/leads/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_numbers: ['8744875331'],
        action: 'stage',
        stage: 'visit_scheduled',
      }),
    });

    const res = await bulkPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.stage).toBe('visit_scheduled');
  });

  it('PATCH /api/admin/leads/[phone] updates lead stage and follow-up', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/leads/8744875331', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pipeline_stage: 'visit_scheduled',
        follow_up_at: '2026-09-20T10:00:00Z',
      }),
    });

    const res = await leadPatch(req, {
      params: Promise.resolve({ phone: '8744875331' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('GET /api/admin/leads/performance returns leaderboard', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/leads/performance');
    const res = await perfGet(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.leaderboard)).toBe(true);
  });
});
