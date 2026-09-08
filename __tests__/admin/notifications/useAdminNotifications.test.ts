import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdminNotifications } from '@/src/components/admin/notifications/useAdminNotifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const { mockNotifications } = vi.hoisted(() => ({
  mockNotifications: [
    {
      id: 'notif-1',
      user_id: 'user-123',
      title: 'Test Notification 1',
      message: 'This is a test notification 1',
      type: 'info' as const,
      is_read: false,
      created_at: '2026-03-01T10:00:00Z',
    },
    {
      id: 'notif-2',
      user_id: 'user-123',
      title: 'Test Notification 2',
      message: 'This is a test notification 2',
      type: 'success' as const,
      is_read: true,
      created_at: '2026-03-02T10:00:00Z',
    },
  ],
}));

vi.mock('@/src/lib/supabase/client', () => {
  const channelMock = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  };

  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockNotifications,
          count: mockNotifications.length,
          error: null,
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
          in: vi.fn().mockResolvedValue({ error: null }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
          in: vi.fn().mockResolvedValue({ error: null }),
        }),
        or: vi.fn().mockReturnThis(),
      }),
      channel: vi.fn().mockReturnValue(channelMock),
      removeChannel: vi.fn(),
    },
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useAdminNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes default filter, pagination, and selection values', () => {
    const { result } = renderHook(() => useAdminNotifications(), {
      wrapper: createWrapper(),
    });

    expect(result.current.typeFilter).toBe('all');
    expect(result.current.readFilter).toBe('all');
    expect(result.current.searchQuery).toBe('');
    expect(result.current.sortBy).toBe('newest');
    expect(result.current.currentPage).toBe(1);
    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.bulkActionLoading).toBe(false);
  });

  it('toggles selection of single notification IDs', () => {
    const { result } = renderHook(() => useAdminNotifications(), {
      wrapper: createWrapper(),
    });

    // Select notif-1
    act(() => {
      result.current.handleSelectOne('notif-1');
    });
    expect(result.current.selectedIds.has('notif-1')).toBe(true);
    expect(result.current.selectedIds.size).toBe(1);

    // Select notif-2
    act(() => {
      result.current.handleSelectOne('notif-2');
    });
    expect(result.current.selectedIds.has('notif-2')).toBe(true);
    expect(result.current.selectedIds.size).toBe(2);

    // Deselect notif-1
    act(() => {
      result.current.handleSelectOne('notif-1');
    });
    expect(result.current.selectedIds.has('notif-1')).toBe(false);
    expect(result.current.selectedIds.has('notif-2')).toBe(true);
    expect(result.current.selectedIds.size).toBe(1);
  });

  it('updates filters and pagination state correctly', () => {
    const { result } = renderHook(() => useAdminNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setTypeFilter('warning');
      result.current.setReadFilter('unread');
      result.current.setSearchQuery('receipt');
      result.current.setSortBy('oldest');
      result.current.setCurrentPage(3);
    });

    expect(result.current.typeFilter).toBe('warning');
    expect(result.current.readFilter).toBe('unread');
    expect(result.current.searchQuery).toBe('receipt');
    expect(result.current.sortBy).toBe('oldest');
    expect(result.current.currentPage).toBe(3);
  });

  it('provides getPageNumbers calculation', () => {
    const { result } = renderHook(() => useAdminNotifications(), {
      wrapper: createWrapper(),
    });

    const pages = result.current.getPageNumbers();
    expect(Array.isArray(pages)).toBe(true);
    expect(pages).toContain(1);
  });

  it('handles select all and clear selection', async () => {
    const { result } = renderHook(() => useAdminNotifications(), {
      wrapper: createWrapper(),
    });

    // Wait for query to settle
    await vi.waitFor(() => {
      expect(result.current.notifications.length).toBe(2);
    });

    act(() => {
      result.current.handleSelectAll();
    });
    expect(result.current.selectedIds.size).toBe(2);
    expect(result.current.selectedIds.has('notif-1')).toBe(true);
    expect(result.current.selectedIds.has('notif-2')).toBe(true);

    // Toggle again should clear
    act(() => {
      result.current.handleSelectAll();
    });
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('handles toggle read and delete action without errors', async () => {
    const { result } = renderHook(() => useAdminNotifications(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.handleToggleRead('notif-1', false);
      await result.current.handleToggleRead('notif-2', true);
      await result.current.handleDeleteOne('notif-1');
    });

    expect(result.current.selectedIds.has('notif-1')).toBe(false);
  });

  it('executes bulk actions safely', async () => {
    const { result } = renderHook(() => useAdminNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleSelectOne('notif-1');
    });

    await act(async () => {
      await result.current.handleMarkSelectedRead();
    });
    expect(result.current.selectedIds.size).toBe(0);

    act(() => {
      result.current.handleSelectOne('notif-2');
    });

    await act(async () => {
      await result.current.handleMarkSelectedUnread();
    });
    expect(result.current.selectedIds.size).toBe(0);
  });
});
