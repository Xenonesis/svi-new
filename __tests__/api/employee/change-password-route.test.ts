import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/employee/profile/change-password/route';

const mockVerifyEmployee = vi.fn();
vi.mock('@/src/lib/supabase/verifyEmployee', () => ({
  verifyEmployee: (...args: unknown[]) => mockVerifyEmployee(...args),
}));

const mockUpdateUserById = vi.fn();
vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        updateUserById: (...args: unknown[]) => mockUpdateUserById(...args),
      },
    },
  },
}));

const mockSignInWithPassword = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
    },
  }),
}));

const mockCreateNotificationForAllAdmins = vi.fn();
vi.mock('@/src/lib/supabase/notifications', () => ({
  createNotificationForAllAdmins: (...args: unknown[]) =>
    mockCreateNotificationForAllAdmins(...args),
}));
describe('POST /api/employee/profile/change-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fake-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'fake-anon-key';
  });

  it('returns 401 if employee is not authenticated', async () => {
    mockVerifyEmployee.mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3001/api/employee/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: 'old',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 if new password and confirm password do not match', async () => {
    mockVerifyEmployee.mockResolvedValueOnce({
      user: { id: 'emp-123' },
      profile: { id: 'emp-123', email: 'shivam@sviinfra.com', full_name: 'Shivam yadav' },
    });

    const req = new NextRequest('http://localhost:3001/api/employee/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: 'CurrentPass123',
        newPassword: 'NewSecurePass2026!',
        confirmPassword: 'MismatchPassword!',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toContain('do not match');
  });

  it('returns 400 if current password is incorrect', async () => {
    mockVerifyEmployee.mockResolvedValueOnce({
      user: { id: 'emp-123' },
      profile: { id: 'emp-123', email: 'shivam@sviinfra.com', full_name: 'Shivam yadav' },
    });

    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid login credentials'),
    });

    const req = new NextRequest('http://localhost:3001/api/employee/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: 'WrongPassword123',
        newPassword: 'NewSecurePass2026!',
        confirmPassword: 'NewSecurePass2026!',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toContain('Current password is incorrect');
  });

  it('updates password and notifies admins when credentials are valid', async () => {
    mockVerifyEmployee.mockResolvedValueOnce({
      user: { id: 'emp-123' },
      profile: { id: 'emp-123', email: 'shivam@sviinfra.com', full_name: 'Shivam yadav' },
    });

    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'emp-123', email: 'shivam@sviinfra.com' } },
      error: null,
    });

    mockUpdateUserById.mockResolvedValueOnce({
      data: { user: { id: 'emp-123' } },
      error: null,
    });

    mockCreateNotificationForAllAdmins.mockResolvedValueOnce({ success: true });

    const req = new NextRequest('http://localhost:3001/api/employee/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: 'KimdH45K%$',
        newPassword: 'ShivamNewSecure2026!',
        confirmPassword: 'ShivamNewSecure2026!',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    expect(mockUpdateUserById).toHaveBeenCalledWith('emp-123', {
      password: 'ShivamNewSecure2026!',
    });

    expect(mockCreateNotificationForAllAdmins).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Staff Password Updated',
        message: expect.stringContaining('Shivam yadav (shivam@sviinfra.com)'),
      })
    );
  });
});
