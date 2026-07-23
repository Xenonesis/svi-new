'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase/client';

import {
  Notification,
  FilterType,
  ReadFilter,
  SortOption,
} from '@/src/components/admin/notifications/types';
import { NotificationHeader } from '@/src/components/admin/notifications/NotificationHeader';
import { NotificationFilters } from '@/src/components/admin/notifications/NotificationFilters';
import { NotificationBulkActions } from '@/src/components/admin/notifications/NotificationBulkActions';
import { NotificationList } from '@/src/components/admin/notifications/NotificationList';
import { NotificationPagination } from '@/src/components/admin/notifications/NotificationPagination';

const ITEMS_PER_PAGE = 20;

export default function AdminNotifications() {
  // ── Auth & Data State ──
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // ── Filter & Sort State ──
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // ── Pagination State ──
  const [currentPage, setCurrentPage] = useState(1);

  // ── Selection State ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Bulk Action Loading ──
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // ── Search debounce ref ──
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Get current user ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // ── Build Supabase query ──
  const buildQuery = useCallback(
    (page: number) => {
      if (!userId) return null;

      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Type filter
      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      // Read filter
      if (readFilter === 'read') {
        query = query.eq('is_read', true);
      } else if (readFilter === 'unread') {
        query = query.eq('is_read', false);
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        query = query.or(`title.ilike.%${q}%,message.ilike.%${q}%`);
      }

      // Sort
      if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'unread-first') {
        query = query
          .order('is_read', { ascending: true })
          .order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      return query;
    },
    [userId, typeFilter, readFilter, searchQuery, sortBy]
  );

  // ── Fetch notifications ──
  const fetchNotifications = useCallback(
    async (page: number = 1) => {
      if (!userId) return;
      setLoading(true);
      setError(null);

      try {
        const query = buildQuery(page);
        if (!query) return;

        const { data, error: fetchError, count } = await query;
        if (fetchError) throw fetchError;

        setNotifications(data || []);
        setTotalCount(count ?? 0);
        setCurrentPage(page);
        setSelectedIds(new Set());
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [userId, buildQuery]
  );

  // ── Fetch when filters/sort/page change ──
  useEffect(() => {
    fetchNotifications(currentPage);
  }, [userId, typeFilter, readFilter, sortBy, currentPage, fetchNotifications]);

  // ── Debounced search fetch ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchNotifications(1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, fetchNotifications]);

  // ── Real-time subscription ──
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('admin-notifications-page')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications(currentPage);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications(currentPage);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications(currentPage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, currentPage, fetchNotifications]);

  // ── Mark single as read ──
  const markAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // ── Mark single as unread ──
  const markAsUnread = async (id: string) => {
    try {
      await supabase.from('notifications').update({ is_read: false }).eq('id', id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
    } catch (err) {
      console.error('Error marking as unread:', err);
    }
  };

  // ── Delete single ──
  const deleteNotification = async (id: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // ── Toggle selection ──
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Select all on current page ──
  const toggleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    }
  };

  // ── Bulk mark as read ──
  const bulkMarkAsRead = async () => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await supabase.from('notifications').update({ is_read: true }).in('id', ids);
      setNotifications((prev) =>
        prev.map((n) => (selectedIds.has(n.id) ? { ...n, is_read: true } : n))
      );
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error bulk marking as read:', err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // ── Bulk mark as unread ──
  const bulkMarkAsUnread = async () => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await supabase.from('notifications').update({ is_read: false }).in('id', ids);
      setNotifications((prev) =>
        prev.map((n) => (selectedIds.has(n.id) ? { ...n, is_read: false } : n))
      );
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error bulk marking as unread:', err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // ── Bulk delete ──
  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} notification(s)? This cannot be undone.`)) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await supabase.from('notifications').delete().in('id', ids);
      setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
      setTotalCount((prev) => Math.max(0, prev - selectedIds.size));
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error bulk deleting:', err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // ── Mark all as read on server ──
  const markAllAsRead = async () => {
    if (!userId) return;
    setBulkActionLoading(true);
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // ── Computed values ──
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  // ── Sort options ──
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'unread-first', label: 'Unread First' },
  ];

  // ── Page numbers for pagination ──
  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="min-h-[400px]">
      <NotificationHeader
        totalCount={totalCount}
        unreadCount={unreadCount}
        bulkActionLoading={bulkActionLoading}
        loading={loading}
        markAllAsRead={markAllAsRead}
        fetchNotifications={() => fetchNotifications(currentPage)}
      />

      <NotificationFilters
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        readFilter={readFilter}
        setReadFilter={setReadFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        setCurrentPage={setCurrentPage}
        sortOptions={sortOptions}
      />

      <NotificationBulkActions
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        bulkActionLoading={bulkActionLoading}
        bulkMarkAsRead={bulkMarkAsRead}
        bulkMarkAsUnread={bulkMarkAsUnread}
        bulkDelete={bulkDelete}
      />

      <NotificationList
        notifications={notifications}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        typeFilter={typeFilter}
        readFilter={readFilter}
        selectedIds={selectedIds}
        toggleSelection={toggleSelection}
        toggleSelectAll={toggleSelectAll}
        markAsRead={markAsRead}
        markAsUnread={markAsUnread}
        deleteNotification={deleteNotification}
        fetchNotifications={fetchNotifications}
        setTypeFilter={setTypeFilter}
        setReadFilter={setReadFilter}
        setSearchQuery={setSearchQuery}
        setCurrentPage={setCurrentPage}
      />

      <NotificationPagination
        currentPage={currentPage}
        totalPages={totalPages}
        fetchNotifications={fetchNotifications}
        getPageNumbers={getPageNumbers}
      />
    </div>
  );
}
