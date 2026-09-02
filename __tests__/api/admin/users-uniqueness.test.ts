import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockOr: vi.fn(),
  mockIlike: vi.fn(),
  mockMaybeSingle: vi.fn(),
  mockInsert: vi.fn(),
  mockSingle: vi.fn(),
  mockCreateUser: vi.fn(),
  mockDeleteUser: vi.fn(),
}));

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' }),
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: mocks.mockSelect,
      insert: mocks.mockInsert,
    })),
    auth: {
      admin: {
        createUser: mocks.mockCreateUser,
        deleteUser: mocks.mockDeleteUser,
      },
    },
  },
}));

import { POST } from '@/app/api/admin/users/route';

describe('POST /api/admin/users uniqueness checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mocks.mockSingle.mockResolvedValue({
      data: { id: 'user-new', email: 'new@sviinfra.com' },
      error: null,
    });
    mocks.mockInsert.mockReturnValue({ select: () => ({ single: mocks.mockSingle }) });
    mocks.mockCreateUser.mockResolvedValue({ data: { user: { id: 'user-new' } }, error: null });

    const chain: Record<string, unknown> = {
      or: mocks.mockOr,
      ilike: mocks.mockIlike,
      maybeSingle: mocks.mockMaybeSingle,
    };

    mocks.mockSelect.mockReturnValue(chain);
    mocks.mockOr.mockReturnValue(chain);
    mocks.mockIlike.mockReturnValue(chain);
  });

  it('rejects user creation when SVI Email is already registered', async () => {
    mocks.mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 'u1',
        full_name: 'Existing User',
        email: 'duplicate@sviinfra.com',
        role: 'client',
      },
      error: null,
    });

    const req = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        full_name: 'New Client',
        email: 'duplicate@sviinfra.com',
        real_email: 'unique@gmail.com',
        password: 'password123',
        phone: '+91 99999 11111',
        property_interest: 'Property A',
        notes: 'Test client',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.message).toContain('SVI Email "duplicate@sviinfra.com" already exists');
    expect(mocks.mockCreateUser).not.toHaveBeenCalled();
  });

  it('rejects user creation when Real Email is already registered', async () => {
    // SVI email check passes
    mocks.mockMaybeSingle
      .mockResolvedValueOnce({ data: null, error: null })
      // Real email check fails
      .mockResolvedValueOnce({
        data: {
          id: 'u2',
          full_name: 'Existing Client',
          real_email: 'taken.real@gmail.com',
          role: 'client',
        },
        error: null,
      });

    const req = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        full_name: 'New Client',
        email: 'unique.svi@sviinfra.com',
        real_email: 'taken.real@gmail.com',
        password: 'password123',
        phone: '+91 99999 11111',
        property_interest: 'Property A',
        notes: 'Test client',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.message).toContain('Real Email "taken.real@gmail.com" already exists');
    expect(mocks.mockCreateUser).not.toHaveBeenCalled();
  });

  it('rejects user creation when Phone Number is already registered', async () => {
    // SVI email check passes
    mocks.mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
    // Real email check passes
    mocks.mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
    // Phone check returns existing match
    mocks.mockIlike.mockResolvedValueOnce({
      data: [{ id: 'u3', full_name: 'Phone Owner', phone: '+91 9999911111', role: 'client' }],
    });

    const req = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        full_name: 'New Client',
        email: 'unique.svi@sviinfra.com',
        real_email: 'unique.real@gmail.com',
        password: 'password123',
        phone: '9999911111',
        property_interest: 'Property A',
        notes: 'Test client',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.message).toContain('Phone Number "9999911111" already exists');
    expect(mocks.mockCreateUser).not.toHaveBeenCalled();
  });
});
