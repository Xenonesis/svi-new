import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Use vi.hoisted() to declare mocks before vi.mock is hoisted
const { mockGetUser, mockFrom, mockSelect, mockEq, mockSingle } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  const mockGetUser = vi.fn();
  return { mockGetUser, mockFrom, mockSelect, mockEq, mockSingle };
});

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    auth: { getUser: mockGetUser },
    from: mockFrom,
  },
}));

import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

describe('verifyAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup chain after clearAllMocks
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
  });

  it('should return null when no Authorization header', async () => {
    const request = new NextRequest('http://localhost/api/test');
    const result = await verifyAdmin(request);
    expect(result).toBeNull();
  });

  it('should return null when Authorization header is not Bearer', async () => {
    const request = new NextRequest('http://localhost/api/test', {
      headers: { Authorization: 'Basic abc123' },
    });
    const result = await verifyAdmin(request);
    expect(result).toBeNull();
  });

  it('should return null when token is invalid', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid token'),
    });

    const request = new NextRequest('http://localhost/api/test', {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    const result = await verifyAdmin(request);
    expect(result).toBeNull();
  });

  it('should return null when user role is not admin', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: { role: 'client' },
    });

    const request = new NextRequest('http://localhost/api/test', {
      headers: { Authorization: 'Bearer valid-token' },
    });
    const result = await verifyAdmin(request);
    expect(result).toBeNull();
  });

  it('should return user when role is admin', async () => {
    const mockUser = { id: 'admin-123', email: 'admin@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: { role: 'admin' },
    });

    const request = new NextRequest('http://localhost/api/test', {
      headers: { Authorization: 'Bearer valid-admin-token' },
    });
    const result = await verifyAdmin(request);
    expect(result).toEqual(mockUser);
  });

  it('should return null when profile has no role', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: null,
    });

    const request = new NextRequest('http://localhost/api/test', {
      headers: { Authorization: 'Bearer valid-token' },
    });
    const result = await verifyAdmin(request);
    expect(result).toBeNull();
  });
});
