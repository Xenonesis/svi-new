'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  // ── Auth State ──
  const [userId, setUserId] = useState<string | null>(null);

  // ── Filter & Sort State ──
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // ── Debounced Search for the Query Key ──
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ── Pagination State ──
  const [currentPage, setCurrentPage] = useState(1);

  // ── Selection State ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Bulk Action Loading ──
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // ── Get current user ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // ── React Query: Fetch notifications ──
  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [
      'notifications',
      userId,
      typeFilter,
      readFilter,
      debouncedSearch,
      sortBy,
      currentPage,
    ],
    queryFn: async () => {
      if (!userId) return { notifications: [], totalCount: 0 };

      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Type filter
      if (typeFilter !== 'all') query = query.eq('type', typeFilter);

      // Read filter
      if (readFilter === 'read') query = query.eq('is_read', true);
      else if (readFilter === 'unread') query = query.eq('is_read', false);

      // Search
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.trim();
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
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return { notifications: data as Notification[], totalCount: count ?? 0 };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const notifications = data?.notifications || [];
  const totalCount = data?.totalCount || 0;
  const error = queryError ? queryError.message : null;

  // ── Real-time subscription ──
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('admin-notifications-page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Invalidate the cache to trigger a background refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  // ── Reset selection when page changes ──
  useEffect(() => {
    setSelectedIds(new Set());
  }, [currentPage, typeFilter, readFilter, debouncedSearch, sortBy]);

  // ── Helper to optimistically update cache ──
  const updateCacheItem = (id: string, updates: Partial<Notification>) => {
    queryClient.setQueriesData({ queryKey: ['notifications', userId] }, (old: any) => {
      if (!old) return old;
      return {
        ...old,
        notifications: old.notifications.map((n: Notification) =>
          n.id === id ? { ...n, ...updates } : n
        ),
      };
    });
  };

  const removeCacheItem = (id: string) => {
    queryClient.setQueriesData({ queryKey: ['notifications', userId] }, (old: any) => {
      if (!old) return old;
      return {
        ...old,
        notifications: old.notifications.filter((n: Notification) => n.id !== id),
        totalCount: Math.max(0, old.totalCount - 1),
      };
    });
  };

  // ── Actions ──
  const markAsRead = async (id: string) => {
    try {
      updateCacheItem(id, { is_read: true });
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } catch (err) {
      console.error('Error marking as read:', err);
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      updateCacheItem(id, { is_read: false });
      await supabase.from('notifications').update({ is_read: false }).eq('id', id);
    } catch (err) {
      console.error('Error marking as unread:', err);
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      removeCacheItem(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await supabase.from('notifications').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting notification:', err);
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
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

  const toggleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    }
  };

  // ── Bulk Actions ──
  const bulkMarkAsRead = async () => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedIds);
      ids.forEach((id) => updateCacheItem(id, { is_read: true }));
      await supabase.from('notifications').update({ is_read: true }).in('id', ids);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error bulk marking as read:', err);
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const bulkMarkAsUnread = async () => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedIds);
      ids.forEach((id) => updateCacheItem(id, { is_read: false }));
      await supabase.from('notifications').update({ is_read: false }).in('id', ids);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error bulk marking as unread:', err);
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} notification(s)? This cannot be undone.`)) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedIds);
      ids.forEach((id) => removeCacheItem(id));
      await supabase.from('notifications').delete().in('id', ids);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error bulk deleting:', err);
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    setBulkActionLoading(true);
    try {
      // Optimistic update all visible as read
      notifications.forEach((n) => updateCacheItem(n.id, { is_read: true }));
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setBulkActionLoading(false);
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
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
        fetchNotifications={() => refetch()}
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
        fetchNotifications={(page) => {
          setCurrentPage(page);
        }}
        setTypeFilter={setTypeFilter}
        setReadFilter={setReadFilter}
        setSearchQuery={setSearchQuery}
        setCurrentPage={setCurrentPage}
      />

      <NotificationPagination
        currentPage={currentPage}
        totalPages={totalPages}
        fetchNotifications={(page) => {
          setCurrentPage(page);
        }}
        getPageNumbers={getPageNumbers}
      />
    </div>
  );
}
