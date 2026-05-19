import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' }),
}));

const mockRange = vi.fn();
const mockOr = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: mockOrder,
      })),
    })),
  },
}));

import { GET } from '@/app/api/admin/users/route';

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Build the query chain
    mockOrder.mockReturnValue({ range: mockRange });
    mockRange.mockResolvedValue({
      data: [
        { id: '1', full_name: 'User 1', email: 'u1@test.com', role: 'client' },
        { id: '2', full_name: 'User 2', email: 'u2@test.com', role: 'client' },
      ],
      error: null,
      count: 50,
    });
  });

  it('should return 401 when not admin', async () => {
    const { verifyAdmin } = await import('@/src/lib/supabase/verifyAdmin');
    (verifyAdmin as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost/api/admin/users');
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('should use default pagination (page=1, limit=50)', async () => {
    const request = new NextRequest('http://localhost/api/admin/users');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.page).toBe(1);
    expect(data.limit).toBe(50);
    expect(data.total).toBe(50);
    expect(mockRange).toHaveBeenCalledWith(0, 49);
  });

  it('should support custom page and limit', async () => {
    const request = new NextRequest('http://localhost/api/admin/users?page=3&limit=10');
    const response = await GET(request);
    const data = await response.json();

    expect(data.page).toBe(3);
    expect(data.limit).toBe(10);
    // page 3, limit 10 = offset 20, range 20-29
    expect(mockRange).toHaveBeenCalledWith(20, 29);
  });

  it('should cap limit at 100', async () => {
    const request = new NextRequest('http://localhost/api/admin/users?limit=500');
    const response = await GET(request);
    const data = await response.json();

    expect(data.limit).toBe(100);
    expect(mockRange).toHaveBeenCalledWith(0, 99);
  });

  it('should enforce minimum page of 1', async () => {
    const request = new NextRequest('http://localhost/api/admin/users?page=-5');
    const response = await GET(request);
    const data = await response.json();

    expect(data.page).toBe(1);
  });

  it('should support server-side search', async () => {
    mockOrder.mockReturnValue({
      range: vi.fn().mockReturnValue({
        or: mockOr.mockResolvedValue({
          data: [{ id: '1', full_name: 'John', email: 'john@test.com' }],
          error: null,
          count: 1,
        }),
      }),
    });

    const request = new NextRequest('http://localhost/api/admin/users?search=john');
    const response = await GET(request);
    const data = await response.json();

    expect(data.users).toHaveLength(1);
    expect(mockOr).toHaveBeenCalledWith(expect.stringContaining('john'));
  });

  it('should return hasMore=true when more results exist', async () => {
    mockRange.mockResolvedValue({
      data: [{ id: '1', full_name: 'User 1' }],
      error: null,
      count: 100, // total 100, page 1 limit 50 = hasMore
    });

    const request = new NextRequest('http://localhost/api/admin/users?page=1&limit=50');
    const response = await GET(request);
    const data = await response.json();

    expect(data.hasMore).toBe(true);
    expect(data.total).toBe(100);
  });

  it('should return hasMore=false on last page', async () => {
    mockRange.mockResolvedValue({
      data: [{ id: '1', full_name: 'User 1' }],
      error: null,
      count: 50, // exactly 50 results, page 1 limit 50 = no more
    });

    const request = new NextRequest('http://localhost/api/admin/users?page=1&limit=50');
    const response = await GET(request);
    const data = await response.json();

    expect(data.hasMore).toBe(false);
  });

  it('should handle database errors gracefully', async () => {
    mockRange.mockResolvedValue({
      data: null,
      error: { message: 'Connection timeout' },
      count: null,
    });

    const request = new NextRequest('http://localhost/api/admin/users');
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Connection timeout');
  });
});
