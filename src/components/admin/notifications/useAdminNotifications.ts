'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase/client';
import { Notification, FilterType, ReadFilter, SortOption } from './types';

const ITEMS_PER_PAGE = 20;

export const NOTIFICATION_SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'unread-first', label: 'Unread First' },
];

interface QueryCacheData {
  notifications: Notification[];
  totalCount: number;
}

export interface UseAdminNotificationsReturn {
  // Data
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  queryError: unknown;
  refetch: () => void;
  fetchNotifications: (page?: number) => void;

  // Filters & Sorting
  typeFilter: FilterType;
  setTypeFilter: (filter: FilterType) => void;
  readFilter: ReadFilter;
  setReadFilter: (filter: ReadFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearch: string;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  sortOptions: { value: SortOption; label: string }[];

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  getPageNumbers: () => number[];

  // Selection
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  handleSelectAll: () => void;
  handleSelectOne: (id: string) => void;
  toggleSelectAll: () => void;
  toggleSelection: (id: string) => void;

  // Actions
  bulkActionLoading: boolean;
  handleMarkSelectedRead: () => Promise<void>;
  handleMarkSelectedUnread: () => Promise<void>;
  handleDeleteSelected: () => Promise<void>;
  handleMarkAllRead: () => Promise<void>;
  handleToggleRead: (id: string, currentRead: boolean) => Promise<void>;
  handleDeleteOne: (id: string) => Promise<void>;
  bulkMarkAsRead: () => Promise<void>;
  bulkMarkAsUnread: () => Promise<void>;
  bulkDelete: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export function useAdminNotifications(): UseAdminNotificationsReturn {
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
    let isMounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) {
        setUserId(data.user?.id ?? null);
      }
    });
    return () => {
      isMounted = false;
    };
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
      } else if (sortBy === 'unread-first' || (sortBy as string) === 'unread_first') {
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

      return { notifications: (data as Notification[]) || [], totalCount: count ?? 0 };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const notifications = data?.notifications || [];
  const totalCount = data?.totalCount || 0;
  const error =
    queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;

  // ── Real-time subscription ──
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('admin-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  // ── Reset selection when page or filters change ──
  useEffect(() => {
    setSelectedIds(new Set());
  }, [currentPage, typeFilter, readFilter, debouncedSearch, sortBy]);

  // ── Helper to optimistically update cache ──
  const updateCacheItem = useCallback(
    (id: string, updates: Partial<Notification>) => {
      queryClient.setQueriesData<QueryCacheData>({ queryKey: ['notifications', userId] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications.map((n) => (n.id === id ? { ...n, ...updates } : n)),
        };
      });
    },
    [queryClient, userId]
  );

  const removeCacheItem = useCallback(
    (id: string) => {
      queryClient.setQueriesData<QueryCacheData>({ queryKey: ['notifications', userId] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications.filter((n) => n.id !== id),
          totalCount: Math.max(0, old.totalCount - 1),
        };
      });
    },
    [queryClient, userId]
  );

  // ── Single item actions ──
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        updateCacheItem(id, { is_read: true });
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      } catch (err) {
        console.error('Error marking as read:', err);
        queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      }
    },
    [updateCacheItem, queryClient, userId]
  );

  const markAsUnread = useCallback(
    async (id: string) => {
      try {
        updateCacheItem(id, { is_read: false });
        await supabase.from('notifications').update({ is_read: false }).eq('id', id);
      } catch (err) {
        console.error('Error marking as unread:', err);
        queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      }
    },
    [updateCacheItem, queryClient, userId]
  );

  const handleToggleRead = useCallback(
    async (id: string, currentRead: boolean) => {
      if (currentRead) {
        await markAsUnread(id);
      } else {
        await markAsRead(id);
      }
    },
    [markAsRead, markAsUnread]
  );

  const handleDeleteOne = useCallback(
    async (id: string) => {
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
    },
    [removeCacheItem, queryClient, userId]
  );

  // ── Selection actions ──
  const handleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === notifications.length && notifications.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    }
  }, [notifications, selectedIds.size]);

  // ── Bulk Actions ──
  const handleMarkSelectedRead = useCallback(async () => {
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
  }, [selectedIds, updateCacheItem, queryClient, userId]);

  const handleMarkSelectedUnread = useCallback(async () => {
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
  }, [selectedIds, updateCacheItem, queryClient, userId]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Delete ${selectedIds.size} notification(s)? This cannot be undone.`)
    ) {
      return;
    }
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
  }, [selectedIds, removeCacheItem, queryClient, userId]);

  const handleMarkAllRead = useCallback(async () => {
    if (!userId) return;
    setBulkActionLoading(true);
    try {
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
  }, [userId, notifications, updateCacheItem, queryClient]);

  // ── Computed values ──
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const getPageNumbers = useCallback(() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const fetchNotifications = useCallback(
    (page?: number) => {
      if (typeof page === 'number') {
        setCurrentPage(page);
      } else {
        refetch();
      }
    },
    [refetch]
  );

  return {
    notifications,
    totalCount,
    unreadCount,
    loading,
    isLoading: loading,
    error,
    queryError,
    refetch,
    fetchNotifications,

    typeFilter,
    setTypeFilter,
    readFilter,
    setReadFilter,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    sortBy,
    setSortBy,
    sortOptions: NOTIFICATION_SORT_OPTIONS,

    currentPage,
    setCurrentPage,
    totalPages,
    getPageNumbers,

    selectedIds,
    setSelectedIds,
    handleSelectAll,
    handleSelectOne,
    toggleSelectAll: handleSelectAll,
    toggleSelection: handleSelectOne,

    bulkActionLoading,
    handleMarkSelectedRead,
    handleMarkSelectedUnread,
    handleDeleteSelected,
    handleMarkAllRead,
    handleToggleRead,
    handleDeleteOne,
    bulkMarkAsRead: handleMarkSelectedRead,
    bulkMarkAsUnread: handleMarkSelectedUnread,
    bulkDelete: handleDeleteSelected,
    markAllAsRead: handleMarkAllRead,
    markAsRead,
    markAsUnread,
    deleteNotification: handleDeleteOne,
  };
}
