'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MessageCircle,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Bot,
  User,
  Trash2,
  RefreshCw,
  Download,
  ArrowUpDown,
  Calendar,
  Filter,
  MessagesSquare,
  AlertCircle,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import { motion, AnimatePresence } from 'motion/react';
import DynamicSkeleton from '@/src/components/common/DynamicSkeleton';

// ─── Types ───────────────────────────────────────────────────────────────
interface ChatLog {
  id: string;
  session_id: string;
  messages: string;
  user_agent: string | null;
  message_count?: number;
  user_message_count?: number;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type SortField = 'updated_at' | 'created_at' | 'message_count' | 'user_message_count';
type SortOrder = 'desc' | 'asc';

// ─── Helpers ─────────────────────────────────────────────────────────────
function parseMessages(raw: string): any[] {
  try {
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

function formatTimeAgo(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function downloadCSV(logs: ChatLog[]) {
  const header = 'Session ID,Date,Messages,User Messages,Preview';
  const rows = logs.map((l) => {
    const msgs = parseMessages(l.messages);
    const preview = msgs
      .filter((m: any) => m.role === 'assistant')
      .slice(-1)[0]
      ?.parts?.map((p: any) => p.text || '')
      .join(' ')
      ?.replace(/"/g, '""')
      ?.slice(0, 200);
    return [
      l.session_id,
      l.created_at,
      l.message_count || msgs.length,
      l.user_message_count || msgs.filter((m: any) => m.role === 'user').length,
      `"${preview || ''}"`,
    ].join(',');
  });
  const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const TYPE_STYLES = {
  today: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  yesterday: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  older: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
} as const;

const DATE_PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'All Time', days: -1 },
] as const;

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'updated_at', label: 'Last Activity' },
  { value: 'created_at', label: 'Created' },
  { value: 'message_count', label: 'Total Messages' },
  { value: 'user_message_count', label: 'User Messages' },
];

// ─── Component ───────────────────────────────────────────────────────────
export default function ChatLogsPage() {
  const { token } = useAdminSession();
  const [mounted, setMounted] = useState(false);

  // Data
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minMsgs, setMinMsgs] = useState('');
  const [maxMsgs, setMaxMsgs] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('updated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // UI
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({ today: 0, week: 0, avgMessages: 0 });

  useEffect(() => { setMounted(true); }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ─── Fetch logs ────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async (pageNum: number) => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: String(pageNum), limit: '20',
        sort_by: sortBy, sort_order: sortOrder,
      });
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      if (minMsgs) params.set('min_messages', minMsgs);
      if (maxMsgs) params.set('max_messages', maxMsgs);

      const res = await fetch(`/api/chat/log?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      setLogs(data.logs || []);
      setPagination(data.pagination);

      // Fetch stats in parallel
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date(Date.now() - 7 * 86400000);

      const [todayRes, weekRes] = await Promise.all([
        fetch(`/api/chat/log?${new URLSearchParams({ page: '1', limit: '1', date_from: todayStart.toISOString(), sort_by: 'updated_at', sort_order: 'desc' })}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/chat/log?${new URLSearchParams({ page: '1', limit: '1', date_from: weekStart.toISOString(), sort_by: 'updated_at', sort_order: 'desc' })}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [todayData, weekData] = await Promise.all([todayRes.json(), weekRes.json()]);

      const logsList = data.logs || [];
      const avg = logsList.length > 0
        ? Math.round(logsList.reduce((s: number, l: ChatLog) => s + (l.message_count || parseMessages(l.messages).length), 0) / logsList.length)
        : 0;

      setStats({
        today: todayData.pagination?.total || 0,
        week: weekData.pagination?.total || 0,
        avgMessages: avg,
      });
    } catch {
      setError('Failed to load chat logs');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [token, sortBy, sortOrder, dateFrom, dateTo, minMsgs, maxMsgs]);

  useEffect(() => {
    if (token && mounted) fetchLogs(1);
  }, [token, mounted, fetchLogs]);

  // ─── Client-side search ────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    if (!debouncedSearch) return logs;
    const q = debouncedSearch.toLowerCase();
    return logs.filter((log) => {
      const msgs = parseMessages(log.messages);
      return msgs.some((m: any) => m.parts?.some((p: any) => p.text?.toLowerCase().includes(q)));
    });
  }, [logs, debouncedSearch]);

  // ─── Actions ────────────────────────────────────────────────────────────
  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/chat/log?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      }
      setSelectedIds(new Set());
      setShowConfirmDelete(false);
      fetchLogs(pagination.page);
    } catch { setError('Failed to delete some logs'); }
    finally { setDeleting(false); }
  }, [selectedIds, token, fetchLogs, pagination.page]);

  const handleDeleteSingle = useCallback(async (id: string) => {
    setDeleting(true);
    try {
      await fetch(`/api/chat/log?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (selectedLog === id) setSelectedLog(null);
      fetchLogs(pagination.page);
    } catch { setError('Failed to delete log'); }
    finally { setDeleting(false); }
  }, [token, fetchLogs, pagination.page, selectedLog]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredLogs.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredLogs.map((l) => l.id)));
  }, [filteredLogs, selectedIds]);

  const applyDatePreset = useCallback((days: number) => {
    if (days === -1) { setDateFrom(''); setDateTo(''); return; }
    const from = new Date(); from.setDate(from.getDate() - days); from.setHours(0, 0, 0, 0);
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(new Date().toISOString().split('T')[0]);
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────
  const hasActiveFilters = !!(dateFrom || minMsgs);
  const filterCount = (dateFrom ? 1 : 0) + (minMsgs ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-navy dark:text-white">
            Chat Logs
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and review AI chatbot conversations with your visitors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs(1)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => downloadCSV(logs)}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      {initialLoading ? (
        <DynamicSkeleton type="stat-cards" />
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={MessageCircle}
            label="Total Conversations"
            value={pagination.total}
            color="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
          />
          <StatCard
            icon={Clock}
            label="Today"
            value={stats.today}
            color="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          />
          <StatCard
            icon={MessagesSquare}
            label="Last 7 Days"
            value={stats.week}
            color="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          />
          <StatCard
            icon={Bot}
            label="Avg Msgs/Chat"
            value={stats.avgMessages || '—'}
            color="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
          />
        </div>
      )}

      {/* ── Actions Bar ─────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-sm font-medium text-brand-navy dark:text-gray-300">
                {selectedIds.size} selected
              </span>
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedLog(null); }}
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-9 pl-9 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 sm:w-64 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
              showFilters || hasActiveFilters
                ? 'border-brand-gold bg-brand-gold/10 text-brand-navy dark:bg-brand-gold/10 dark:text-brand-gold'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-white">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Filters Panel ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Date Range */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Date Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-brand-gold dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200" />
                    <span className="text-xs text-gray-400">—</span>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-brand-gold dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {DATE_PRESETS.map((p) => (
                      <button key={p.label} onClick={() => applyDatePreset(p.days)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          (p.days === -1 && !dateFrom) ||
                          (p.days > 0 && dateFrom === new Date(Date.now() - p.days * 86400000).toISOString().split('T')[0])
                            ? 'bg-brand-gold/15 text-brand-navy dark:bg-brand-gold/20 dark:text-brand-gold'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                        }`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Count */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Message Count
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={0} value={minMsgs} onChange={(e) => setMinMsgs(e.target.value)} placeholder="Min"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-brand-gold dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200" />
                    <span className="text-xs text-gray-400">—</span>
                    <input type="number" min={0} value={maxMsgs} onChange={(e) => setMaxMsgs(e.target.value)} placeholder="Max"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-brand-gold dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200" />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortField)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-brand-gold dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
                      {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <button onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                    </button>
                  </div>
                </div>

                {/* Apply */}
                <div className="flex items-end gap-2">
                  <button onClick={() => { setSelectedLog(null); fetchLogs(1); }}
                    className="flex-1 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold-light">
                    Apply Filters
                  </button>
                  <button onClick={() => { setDateFrom(''); setDateTo(''); setMinMsgs(''); setMaxMsgs(''); setSortBy('updated_at'); setSortOrder('desc'); }}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                    Reset
                  </button>
                </div>
              </div>

              {/* Active filter tags */}
              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-400">Active:</span>
                  {dateFrom && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold/10 px-2.5 py-1 text-xs font-medium text-brand-navy dark:bg-brand-gold/10 dark:text-brand-gold">
                      <Calendar className="h-3 w-3" />
                      {new Date(dateFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {dateTo ? ` → ${new Date(dateTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}
                      <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="ml-0.5 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {minMsgs && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
                      {minMsgs}{maxMsgs ? ` — ${maxMsgs}` : '+'} msgs
                      <button onClick={() => { setMinMsgs(''); setMaxMsgs(''); }} className="ml-0.5 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading (Dynamic Skeleton) ──────────────────────────────────── */}
      {loading && !initialLoading && (
        <DynamicSkeleton count={4} type="chat-log" />
      )}

      {initialLoading && (
        <DynamicSkeleton count={6} type="chat-log" />
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-20 dark:border-red-800 dark:bg-red-950/30">
          <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => fetchLogs(1)} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
            Retry
          </button>
        </div>
      )}

      {/* ── Empty ───────────────────────────────────────────────────────── */}
      {!loading && !error && filteredLogs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-24 dark:border-gray-700">
          <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            {search || hasActiveFilters
              ? <Search className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              : <MessageCircle className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            }
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {search || hasActiveFilters ? 'No conversations match your filters.' : 'No chat logs yet.'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {search || hasActiveFilters
              ? 'Try adjusting your search or filters.'
              : 'Chat logs will appear here once visitors interact with the AI chatbot.'}
          </p>
          {(search || hasActiveFilters) && (
            <button onClick={() => { setSearch(''); setDebouncedSearch(''); setDateFrom(''); setDateTo(''); setMinMsgs(''); setMaxMsgs(''); }}
              className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400">
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* ── Log List ─────────────────────────────────────────────────────── */}
      {!loading && !error && filteredLogs.length > 0 && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-500">
              <input type="checkbox" checked={filteredLogs.length > 0 && selectedIds.size === filteredLogs.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold" />
              Select all ({filteredLogs.length})
            </label>
            <span className="text-xs text-gray-400">
              Page {pagination.page} of {pagination.totalPages || 1}
              <span className="hidden sm:inline"> ({pagination.total} total)</span>
            </span>
          </div>

          <div className="space-y-2">
            {filteredLogs.map((log) => {
              const msgs = parseMessages(log.messages);
              const lastAiMsg = [...msgs].reverse().find((m: any) => m.role === 'assistant');
              const preview = lastAiMsg?.parts?.map((p: any) => p.text || '').join(' ').slice(0, 150) || '(empty)';
              const userCount = log.user_message_count ?? msgs.filter((m: any) => m.role === 'user').length;
              const totalCount = log.message_count ?? msgs.length;
              const isSelected = selectedLog === log.id;
              const isChecked = selectedIds.has(log.id);
              const dateLabel = formatDate(log.updated_at);
              const dateStyle = dateLabel === 'Today' ? TYPE_STYLES.today : dateLabel === 'Yesterday' ? TYPE_STYLES.yesterday : TYPE_STYLES.older;

              return (
                <div key={log.id} className="group">
                  <div className={`flex items-start gap-3 rounded-xl border bg-white p-4 transition-all dark:bg-gray-800 ${
                    isSelected
                      ? 'border-brand-gold shadow-md ring-1 ring-brand-gold/20'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-gray-600'
                  }`}>
                    <div className="flex items-center pt-1">
                      <input type="checkbox" checked={isChecked} onChange={() => {
                        const next = new Set(selectedIds);
                        if (next.has(log.id)) next.delete(log.id);
                        else next.add(log.id);
                        setSelectedIds(next);
                      }} onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold" />
                    </div>

                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedLog(isSelected ? null : log.id)}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                            <MessageCircle className="h-4.5 w-4.5 text-brand-gold" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                Session {log.session_id.slice(0, 12)}...
                              </span>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${dateStyle}`}>
                                {dateLabel}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(log.updated_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessagesSquare className="h-3 w-3" />
                                {totalCount} msgs
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3 text-blue-500" />
                                {userCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <Bot className="h-3 w-3 text-brand-gold" />
                                {totalCount - userCount}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(log.id).then(() => { setCopiedId(log.id); setTimeout(() => setCopiedId(null), 2000); }).catch(() => {}); }}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700" title="Copy ID">
                            {copiedId === log.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteSingle(log.id); }} disabled={deleting}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        {preview}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mx-3 mb-2 max-h-[480px] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                              Full Conversation ({msgs.length} messages)
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400">{formatFullDate(log.created_at)}</span>
                              <button onClick={() => setSelectedLog(null)}
                                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700">
                                <EyeOff className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {msgs.map((m: any, i: number) => {
                              const isUser = m.role === 'user';
                              const text = m.parts?.map((p: any) => p.text || '').join(' ');
                              return (
                                <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                    isUser
                                      ? 'rounded-tr-md bg-brand-navy text-white'
                                      : 'rounded-tl-md border border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                  }`}>
                                    <div className="mb-1 flex items-center gap-2">
                                      {isUser ? <User className="h-3 w-3 text-white/60" /> : <Bot className="h-3 w-3 text-brand-gold" />}
                                      <span className="text-[10px] opacity-60">{isUser ? 'Visitor' : 'AI Assistant'} · {formatTimeAgo(m.createdAt || log.created_at)}</span>
                                    </div>
                                    <p className="whitespace-pre-wrap">{text}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* ── Pagination ────────────────────────────────────────────── */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-xs text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => fetchLogs(pagination.page - 1)} disabled={pagination.page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4));
                  const pageNum = start + i;
                  if (pageNum > pagination.totalPages) return null;
                  return (
                    <button key={pageNum} onClick={() => fetchLogs(pageNum)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        pageNum === pagination.page
                          ? 'bg-brand-navy text-white dark:bg-brand-gold dark:text-brand-navy'
                          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                      {pageNum}
                    </button>
                  );
                })}
                <button onClick={() => fetchLogs(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Delete Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="mx-4 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Delete {selectedIds.size} conversation{selectedIds.size > 1 ? 's' : ''}?
              </h3>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone. The conversation data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmDelete(false)} disabled={deleting}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">
                  Cancel
                </button>
                <button onClick={handleDeleteSelected} disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60">
                  {deleting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Trash2 className="h-4 w-4" /> Delete</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Stat Card Sub-component ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: string | number; color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
