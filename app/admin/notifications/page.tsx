'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Check,
  Info,
  X,
  AlertTriangle,
  ChevronDown,
  Search,
  Trash2,
  Mail,
  MailOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BellOff,
  RefreshCw,
  CheckCheck,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';

import { supabase } from '@/src/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

type FilterType = 'all' | 'info' | 'success' | 'warning' | 'error';
type ReadFilter = 'all' | 'read' | 'unread';
type SortOption = 'newest' | 'oldest' | 'unread-first';

const ITEMS_PER_PAGE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-l-blue-500',
  },
  success: {
    icon: Check,
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-l-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-l-amber-500',
  },
  error: {
    icon: X,
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-l-red-500',
  },
};

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
  }, [userId, typeFilter, readFilter, sortBy]);

  // ── Debounced search fetch ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchNotifications(1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

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

  // ── Render ──
  return (
    <div className="min-h-[400px]">
      {/* ─── Page Header ─── */}
      <div className="mb-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-serif text-3xl text-gray-900 md:text-4xl dark:text-white">
              Notifications
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {totalCount} notification{totalCount !== 1 ? 's' : ''}
              {unreadCount > 0 && (
                <span className="text-brand-gold ml-1">· {unreadCount} unread</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={bulkActionLoading}
                className="hover:border-brand-gold hover:text-brand-gold flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold tracking-widest text-gray-700 uppercase transition-colors disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
              >
                <CheckCheck size={14} />
                Mark All Read
              </button>
            )}
            <button
              onClick={() => fetchNotifications(currentPage)}
              disabled={loading}
              className="hover:border-brand-gold hover:text-brand-gold flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold tracking-widest text-gray-700 uppercase transition-colors disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ─── Filters Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="dark:bg-brand-dark-surface mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-gray-700"
      >
        {/* Row 1: Type filter & search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Type filter pills */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'info', label: 'Info' },
                { key: 'success', label: 'Success' },
                { key: 'warning', label: 'Warning' },
                { key: 'error', label: 'Error' },
              ] as { key: FilterType; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setTypeFilter(key);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all ${
                  typeFilter === key
                    ? 'bg-brand-gold text-brand-navy'
                    : 'border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search
              size={14}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-8 pl-9 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Read filter & sort */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Read status filter */}
          <div className="flex gap-2">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'read', label: 'Read' },
              ] as { key: ReadFilter; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setReadFilter(key);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all ${
                  readFilter === key
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {key === 'read' ? (
                  <MailOpen size={12} />
                ) : key === 'unread' ? (
                  <Mail size={12} />
                ) : null}
                {label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setCurrentPage(1);
              }}
              className="focus:border-brand-gold appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2 pr-8 pl-3 text-xs text-gray-700 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="dark:bg-gray-800">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Bulk Actions Bar ─── */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-brand-gold/30 bg-brand-gold/5 mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
        >
          <span className="text-sm text-gray-700 dark:text-gray-200">
            <span className="font-bold">{selectedIds.size}</span> selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={bulkMarkAsRead}
              disabled={bulkActionLoading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-[10px] font-bold tracking-widest text-gray-700 uppercase transition-colors hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-emerald-400 dark:hover:text-emerald-400"
            >
              <Eye size={12} /> Mark Read
            </button>
            <button
              onClick={bulkMarkAsUnread}
              disabled={bulkActionLoading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-[10px] font-bold tracking-widest text-gray-700 uppercase transition-colors hover:border-amber-500 hover:text-amber-600 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-amber-400 dark:hover:text-amber-400"
            >
              <EyeOff size={12} /> Mark Unread
            </button>
            <button
              onClick={bulkDelete}
              disabled={bulkActionLoading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-[10px] font-bold tracking-widest text-gray-700 uppercase transition-colors hover:border-red-500 hover:text-red-600 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-red-400 dark:hover:text-red-400"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-[10px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Clear
          </button>
        </motion.div>
      )}

      {/* ─── Content Area ─── */}
      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="text-brand-gold mb-4 h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-500">Loading notifications...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <p className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Something went wrong
          </p>
          <p className="mb-6 max-w-md text-sm text-gray-500">{error}</p>
          <button
            onClick={() => fetchNotifications(1)}
            className="border-brand-gold text-brand-gold hover:bg-brand-gold flex items-center gap-2 rounded-lg border px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors hover:text-white"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            {searchQuery || typeFilter !== 'all' || readFilter !== 'all' ? (
              <BellOff className="h-10 w-10 text-gray-400" />
            ) : (
              <Bell className="h-10 w-10 text-gray-400" />
            )}
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            {searchQuery || typeFilter !== 'all' || readFilter !== 'all'
              ? 'No matching notifications'
              : 'No notifications yet'}
          </h3>
          <p className="max-w-sm text-sm text-gray-500">
            {searchQuery || typeFilter !== 'all' || readFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : "You're all caught up! Notifications will appear here when there's something new."}
          </p>
          {(searchQuery || typeFilter !== 'all' || readFilter !== 'all') && (
            <button
              onClick={() => {
                setTypeFilter('all');
                setReadFilter('all');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="hover:border-brand-gold hover:text-brand-gold mt-6 flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-xs font-bold tracking-widest text-gray-700 uppercase transition-colors dark:border-gray-600 dark:text-gray-300"
            >
              <X size={14} />
              Clear All Filters
            </button>
          )}
        </motion.div>
      )}

      {/* Notifications List */}
      {!loading && !error && notifications.length > 0 && (
        <>
          {/* Select all checkbox header */}
          <div className="mb-2 flex items-center gap-3 px-1">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.size === notifications.length && notifications.length > 0}
                onChange={toggleSelectAll}
                className="accent-brand-gold h-4 w-4 rounded border-gray-300"
              />
              <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Select All
              </span>
            </label>
          </div>

          {/* Notification items */}
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => {
                const isEmail = (notification as any).metadata?.subType === 'email';

                const config = isEmail
                  ? {
                      icon: Mail,
                      bg: 'bg-amber-500/10 dark:bg-brand-gold/15',
                      text: 'text-brand-gold',
                      border: 'border-l-brand-gold',
                    }
                  : TYPE_CONFIG[notification.type];

                const IconComponent = config.icon;

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.02 }}
                    className={`group relative flex items-start gap-3 rounded-lg border-l-4 p-4 transition-all md:p-5 ${
                      notification.is_read
                        ? isEmail
                          ? 'border-brand-gold/40 dark:bg-brand-gold/5 dark:hover:bg-brand-gold/10 bg-amber-500/[0.02] hover:bg-amber-500/[0.04]'
                          : 'dark:bg-brand-dark-surface border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/[0.03]'
                        : `${config.border} ${config.bg} shadow-sm`
                    } ${selectedIds.has(notification.id) ? 'ring-brand-gold/50 ring-2' : ''}`}
                  >
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-0.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(notification.id)}
                        onChange={() => toggleSelection(notification.id)}
                        className="accent-brand-gold h-4 w-4 rounded border-gray-300"
                      />
                    </div>

                    {/* Type Icon */}
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${config.bg}`}
                    >
                      <IconComponent className={`h-4 w-4 ${config.text}`} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h4
                            className={`flex items-center gap-2 text-sm font-semibold ${
                              notification.is_read
                                ? 'text-gray-500 dark:text-gray-400'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            <span className="truncate">{notification.title}</span>
                            {isEmail && (
                              <span className="bg-brand-gold/15 text-brand-gold border-brand-gold/20 inline-flex animate-pulse items-center rounded border px-1.5 py-0.5 text-[8px] font-bold tracking-widest uppercase">
                                Automated Email
                              </span>
                            )}
                          </h4>
                          <p
                            className={`mt-1 text-sm leading-relaxed ${
                              notification.is_read
                                ? 'text-gray-400 dark:text-gray-500'
                                : 'text-gray-600 dark:text-gray-300'
                            } line-clamp-2`}
                          >
                            {notification.message}
                          </p>
                          {isEmail && (notification as any).metadata?.subject && (
                            <div className="dark:bg-brand-gold/[0.03] border-brand-gold/10 mt-3 flex max-w-xl flex-col gap-1 rounded-lg border bg-amber-500/[0.03] p-3 text-xs text-gray-500 dark:text-gray-400">
                              <span className="text-brand-gold inline-flex items-center gap-2 font-semibold">
                                <Mail className="h-3.5 w-3.5" />
                                Subject:
                                <span className="font-normal text-gray-700 dark:text-gray-300">
                                  {(notification as any).metadata.subject}
                                </span>
                              </span>
                              <span className="inline-flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-gray-400" />
                                Recipient:
                                <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                                  {(notification as any).metadata.recipient}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="flex-shrink-0 text-right">
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                            <Clock size={11} />
                            {formatTime(notification.created_at)}
                          </div>
                          <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-600">
                            {formatFullDate(notification.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 flex items-center gap-2">
                        {notification.is_read ? (
                          <button
                            onClick={() => markAsUnread(notification.id)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
                          >
                            <EyeOff size={11} />
                            Mark Unread
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-brand-gold hover:bg-brand-gold/10 flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors"
                          >
                            <Eye size={11} />
                            Mark Read
                          </button>
                        )}

                        {notification.action_url && (
                          <a
                            href={notification.action_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold tracking-widest text-blue-600 uppercase transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/20"
                          >
                            View Details
                          </a>
                        )}

                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                          <Trash2 size={11} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ─── Pagination ─── */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => fetchNotifications(currentPage - 1)}
                disabled={currentPage <= 1}
                className="hover:border-brand-gold hover:text-brand-gold flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 transition-colors disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:text-gray-400"
              >
                <ChevronLeft size={14} />
                Prev
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => fetchNotifications(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    page === currentPage
                      ? 'bg-brand-gold text-brand-navy'
                      : 'hover:border-brand-gold hover:text-brand-gold border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => fetchNotifications(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="hover:border-brand-gold hover:text-brand-gold flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 transition-colors disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:text-gray-400"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <p className="mt-4 text-center text-xs text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </>
      )}
    </div>
  );
}
