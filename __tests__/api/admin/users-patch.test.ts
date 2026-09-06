import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' }),
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      update: mockUpdate,
      select: vi.fn(() => ({
        neq: vi.fn(() => ({
          or: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          })),
          ilike: vi.fn().mockResolvedValue({ data: [] }),
        })),
      })),
    })),
  },
}));

import { PATCH } from '@/app/api/admin/users/[id]/route';

describe('PATCH /api/admin/users/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSingle.mockResolvedValue({
      data: { id: 'target-456', full_name: 'Test User', is_active: false },
      error: null,
    });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ select: mockSelect });
    mockUpdate.mockReturnValue({ eq: mockEq });
  });

  it('blocks admin from deactivating their own account', async () => {
    const request = new NextRequest('http://localhost/api/admin/users/admin-123', {
      method: 'PATCH',
      body: JSON.stringify({ is_active: false }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'admin-123' }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.message).toContain('Cannot deactivate your own account');
  });

  it('allows updating is_active for other accounts', async () => {
    const request = new NextRequest('http://localhost/api/admin/users/target-456', {
      method: 'PATCH',
      body: JSON.stringify({ is_active: false }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'target-456' }),
    });

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ is_active: false }));
  });
});
