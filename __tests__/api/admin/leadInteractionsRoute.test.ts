import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/admin/leads/[phone]/interactions/route';

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' }),
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'int-123',
              lead_phone: '8744875331',
              type: 'note',
              content: 'Client requested 100 gaj plot details',
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        })),
      })),
      update: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

describe('Lead Interactions API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns interaction list for a phone number', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/leads/8744875331/interactions');
    const res = await GET(req, {
      params: Promise.resolve({ phone: '8744875331' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.phone).toBe('8744875331');
    expect(Array.isArray(json.interactions)).toBe(true);
  });

  it('POST records a new note interaction', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/leads/8744875331/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'note',
        content: 'Client requested 100 gaj plot details',
        advisor_name: 'Shivam Yadav',
      }),
    });

    const res = await POST(req, {
      params: Promise.resolve({ phone: '8744875331' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.interaction.content).toBe('Client requested 100 gaj plot details');
  });

  it('POST rejects invalid interaction type', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/leads/8744875331/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'invalid_type',
        content: 'Some note',
      }),
    });

    const res = await POST(req, {
      params: Promise.resolve({ phone: '8744875331' }),
    });

    expect(res.status).toBe(400);
  });
});
