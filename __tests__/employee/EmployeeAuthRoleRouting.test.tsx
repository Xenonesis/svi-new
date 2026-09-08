import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import React from 'react';
import EmployeeGuard from '@/src/components/employee/EmployeeGuard';
import EmployeeHeader from '@/src/components/employee/EmployeeHeader';
import { useEmployeeLoginForm } from '@/src/components/employee/login/useEmployeeLoginForm';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  usePathname: () => '/employee/dashboard',
}));

const mockGetSession = vi.fn();
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      getUser: (...args: unknown[]) => mockGetUser(...args),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('Employee Auth Role Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects admin to /admin/dashboard in EmployeeGuard', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-1' } } },
    });

    const mockSingle = vi.fn().mockResolvedValue({
      data: { role: 'admin', full_name: 'Admin User' },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    render(
      <EmployeeGuard>
        <div>Protected Staff Content</div>
      </EmployeeGuard>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/admin/dashboard');
    });

    expect(screen.queryByText('Protected Staff Content')).toBeNull();
  });

  it('allows employee to view protected content in EmployeeGuard', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'emp-1' } } },
    });

    const mockSingle = vi.fn().mockResolvedValue({
      data: { role: 'employee', full_name: 'Staff User' },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    render(
      <EmployeeGuard>
        <div>Protected Staff Content</div>
      </EmployeeGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Staff Content')).toBeDefined();
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows Switch to Admin Console link in EmployeeHeader when role is admin', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
    });

    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: { role: 'admin', full_name: 'Super Admin', email: 'admin@sviinfra.com' },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    });

    render(<EmployeeHeader />);

    await waitFor(() => {
      expect(screen.getByText(/Switch to Admin Console/i)).toBeDefined();
    });
  });

  it('redirects existing admin session to /admin/dashboard in useEmployeeLoginForm', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-1' } } },
    });

    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    });

    renderHook(() => useEmployeeLoginForm());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('redirects existing employee session to /employee/dashboard in useEmployeeLoginForm', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'emp-1' } } },
    });

    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: { role: 'employee' },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    });

    renderHook(() => useEmployeeLoginForm());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/employee/dashboard');
    });
  });
});
