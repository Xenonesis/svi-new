import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardUsersTable } from '@/src/components/admin/dashboard/DashboardUsersTable';
import type { UserProfile } from '@/src/lib/supabase/types';

const mockUsers: UserProfile[] = Array.from({ length: 25 }, (_, i) => ({
  id: `user-${i + 1}`,
  full_name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i < 5 ? 'admin' : i < 15 ? 'employee' : 'client',
  phone: `98765432${i < 10 ? '0' + i : i}`,
  property_interest: null,
  created_at: '2026-09-21T00:00:00Z',
  created_by: null,
  notes: null,
  is_active: true,
}));

describe('DashboardUsersTable Pagination', () => {
  const defaultProps = {
    users: mockUsers,
    loading: false,
    search: '',
    setSearch: vi.fn(),
    properties: [],
    roleLoading: {},
    currentAdminId: 'user-1',
    onRefresh: vi.fn(),
    onAddEmployee: vi.fn(),
    onManageTeam: vi.fn(),
    onAddUser: vi.fn(),
    onEditUser: vi.fn(),
    onDeleteUser: vi.fn(),
    onRoleChange: vi.fn(),
    onToggleActive: vi.fn(),
  };

  it('renders maximum 10 profiles on page 1 and shows pagination controls', () => {
    render(<DashboardUsersTable {...defaultProps} />);

    // User 1 should be visible, User 11 should not be rendered
    expect(screen.getAllByText('User 1')[0]).toBeInTheDocument();
    expect(screen.queryByText('User 11')).not.toBeInTheDocument();

    // Verify pagination controls presence
    expect(screen.getByRole('button', { name: /Next page/i })).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });

  it('navigates to page 2 when Next page button is clicked', () => {
    render(<DashboardUsersTable {...defaultProps} />);

    const nextBtn = screen.getByRole('button', { name: /Next page/i });
    fireEvent.click(nextBtn);

    // Page 2 should show User 11, and User 1 should not be rendered
    expect(screen.getAllByText('User 11')[0]).toBeInTheDocument();
    expect(screen.queryByText('User 1')).not.toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('resets to page 1 when role filter changes', () => {
    render(<DashboardUsersTable {...defaultProps} />);

    // Go to page 2
    fireEvent.click(screen.getByRole('button', { name: /Next page/i }));
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();

    // Switch to Clients filter (which has 10 clients: 1 page)
    fireEvent.click(screen.getByRole('button', { name: /Clients/i }));

    // Should reset to Page 1
    expect(screen.queryByText('Page 2 of 3')).not.toBeInTheDocument();
  });
});
