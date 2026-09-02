import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockOr: vi.fn(),
  mockNeq: vi.fn(),
  mockIlike: vi.fn(),
  mockMaybeSingle: vi.fn(),
}));

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' }),
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: mocks.mockSelect,
    })),
  },
}));

import { GET } from '@/app/api/admin/users/check-unique/route';

describe('GET /api/admin/users/check-unique', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const chain: Record<string, unknown> = {
      or: mocks.mockOr,
      neq: mocks.mockNeq,
      ilike: mocks.mockIlike,
      maybeSingle: mocks.mockMaybeSingle,
    };

    mocks.mockSelect.mockReturnValue(chain);
    mocks.mockOr.mockReturnValue(chain);
    mocks.mockNeq.mockReturnValue(chain);
    mocks.mockIlike.mockReturnValue(chain);
  });

  it('suggests a unique SVI email when full_name is provided', async () => {
    mocks.mockOr.mockResolvedValue({
      data: [{ email: 'rajesh.kumar@sviinfra.com', real_email: null }],
    });

    const req = new NextRequest(
      'http://localhost:3000/api/admin/users/check-unique?full_name=Rajesh+Kumar'
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.suggested_svi_email).toBe('rajesh.kumar2@sviinfra.com');
  });

  it('detects taken SVI email and returns email_available: false', async () => {
    mocks.mockMaybeSingle.mockResolvedValue({
      data: { id: 'u1', full_name: 'Existing User', role: 'client' },
    });

    const req = new NextRequest(
      'http://localhost:3000/api/admin/users/check-unique?email=taken@sviinfra.com'
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.email_available).toBe(false);
    expect(json.email_error).toContain('taken@sviinfra.com');
  });

  it('detects taken Real email and returns real_email_available: false', async () => {
    mocks.mockMaybeSingle.mockResolvedValue({
      data: { id: 'u2', full_name: 'Real User', role: 'client' },
    });

    const req = new NextRequest(
      'http://localhost:3000/api/admin/users/check-unique?real_email=real@gmail.com'
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.real_email_available).toBe(false);
    expect(json.real_email_error).toContain('real@gmail.com');
  });

  it('detects taken phone number and returns phone_available: false', async () => {
    mocks.mockIlike.mockResolvedValue({
      data: [{ id: 'u3', full_name: 'Phone User', phone: '+91 9876543210' }],
    });

    const req = new NextRequest(
      'http://localhost:3000/api/admin/users/check-unique?phone=%2B919876543210'
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.phone_available).toBe(false);
    expect(json.phone_error).toContain('9876543210');
  });
});
