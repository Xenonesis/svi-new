import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationList } from '@/src/components/admin/notifications/NotificationList';
import type { Notification } from '@/src/components/admin/notifications/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('NotificationList Component', () => {
  const mockFetchNotifications = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Revert Assignment button for bulk_reassign notification and calls revert API', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, action: 'revert', restored_count: 5 }),
    } as Response);

    const mockNotifications: Notification[] = [
      {
        id: 'notif-123',
        user_id: 'admin-1',
        title: 'Bulk Assigned 5 Leads',
        message: 'Assigned 5 leads to Shivam Yadav',
        type: 'info',
        is_read: false,
        created_at: new Date().toISOString(),
        metadata: {
          action_type: 'bulk_reassign',
          reverted: false,
          phone_count: 5,
        },
      },
    ];

    render(
      <NotificationList
        notifications={mockNotifications}
        loading={false}
        error={null}
        searchQuery=""
        typeFilter="all"
        readFilter="all"
        selectedIds={new Set()}
        toggleSelection={vi.fn()}
        toggleSelectAll={vi.fn()}
        markAsRead={vi.fn()}
        markAsUnread={vi.fn()}
        deleteNotification={vi.fn()}
        fetchNotifications={mockFetchNotifications}
        setTypeFilter={vi.fn()}
        setReadFilter={vi.fn()}
        setSearchQuery={vi.fn()}
        setCurrentPage={vi.fn()}
      />
    );

    const revertBtn = screen.getByRole('button', { name: /revert assignment/i });
    expect(revertBtn).toBeDefined();

    fireEvent.click(revertBtn);

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/admin/leads/bulk',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          action: 'revert',
          notification_id: 'notif-123',
        }),
      })
    );
  });

  it('renders Reverted badge when assignment has already been reverted', () => {
    const mockNotifications: Notification[] = [
      {
        id: 'notif-456',
        user_id: 'admin-1',
        title: 'Bulk Assigned 5 Leads',
        message: 'Assigned 5 leads to Shivam Yadav',
        type: 'info',
        is_read: true,
        created_at: new Date().toISOString(),
        metadata: {
          action_type: 'bulk_reassign',
          reverted: true,
          phone_count: 5,
        },
      },
    ];

    render(
      <NotificationList
        notifications={mockNotifications}
        loading={false}
        error={null}
        searchQuery=""
        typeFilter="all"
        readFilter="all"
        selectedIds={new Set()}
        toggleSelection={vi.fn()}
        toggleSelectAll={vi.fn()}
        markAsRead={vi.fn()}
        markAsUnread={vi.fn()}
        deleteNotification={vi.fn()}
        fetchNotifications={mockFetchNotifications}
        setTypeFilter={vi.fn()}
        setReadFilter={vi.fn()}
        setSearchQuery={vi.fn()}
        setCurrentPage={vi.fn()}
      />
    );

    expect(screen.getByText(/reverted/i)).toBeDefined();
    expect(screen.queryByRole('button', { name: /revert assignment/i })).toBeNull();
  });
});
