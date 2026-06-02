'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  Settings,
  Calendar,
  Trophy,
  Mail,
  Download,
  Eye,
  Database,
  X,
  Code,
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'user' | 'document' | 'settings' | 'download' | 'attendance' | 'lottery' | 'campaign';
  title: string;
  description: string;
  timestamp: string;
  raw_timestamp: string;
  action_type: string;
  target_id: string | null;
  target_type: string | null;
  metadata: Record<string, any>;
  user: string;
}

interface LogsTabProps {
  token: string | null;
  isCompact: boolean;
  showToast: (type: 'success' | 'error', msg: string) => void;
}

const ACTION_TYPES = [
  { value: '', label: 'All Categories' },
  { value: 'user_created', label: 'User Created' },
  { value: 'user_deleted', label: 'User Deleted' },
  { value: 'document_generated', label: 'Document Generated' },
  { value: 'document_downloaded', label: 'Document Downloaded' },
  { value: 'settings_updated', label: 'Settings Updated' },
  { value: 'profile_updated', label: 'Profile Updated' },
  { value: 'team_created', label: 'Team Created' },
  { value: 'team_deleted', label: 'Team Deleted' },
  { value: 'attendance_marked', label: 'Attendance Marked' },
  { value: 'lottery_drawn', label: 'Lucky Draw Drawn' },
  { value: 'lottery_scheduled', label: 'Lucky Draw Scheduled' },
  { value: 'campaign_created', label: 'Campaign Created' },
  { value: 'campaign_sent', label: 'Campaign Sent' },
  { value: 'campaign_deleted', label: 'Campaign Deleted' },
];

export function LogsTab({ token, isCompact, showToast }: LogsTabProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionType, setActionType] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<Activity | null>(null);

  // Debounce search query to reduce API hits
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch activity logs from dynamic endpoint
  const fetchLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        search: debouncedSearch,
        action_type: actionType,
      });

      const response = await fetch(`/api/admin/activities?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch activity logs.');

      const json = await response.json();
      setActivities(json.activities || []);
      setTotal(json.total || 0);
      setTotalPages(json.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching logs:', err);
      showToast('error', err.message || 'Error fetching activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token, page, debouncedSearch, actionType]);

  // Map activity type to appropriate icon & background badge styling
  const getActivityMeta = (type: Activity['type']) => {
    switch (type) {
      case 'user':
        return {
          icon: User,
          bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
          title: 'User Operation',
        };
      case 'document':
        return {
          icon: FileText,
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
          title: 'Document System',
        };
      case 'download':
        return {
          icon: Download,
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
          title: 'Download Event',
        };
      case 'attendance':
        return {
          icon: Calendar,
          bg: 'bg-pink-500/10 border-pink-500/20 text-pink-500',
          title: 'Attendance marked',
        };
      case 'lottery':
        return {
          icon: Trophy,
          bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
          title: 'Lucky Draw',
        };
      case 'campaign':
        return {
          icon: Mail,
          bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500',
          title: 'Email Campaign',
        };
      default:
        return {
          icon: Settings,
          bg: 'bg-gray-500/10 border-gray-500/20 text-gray-500',
          title: 'System Settings',
        };
    }
  };

  const densityPadding = isCompact ? 'py-1.5 px-3' : 'py-2.5 px-4';
  const densitySecSpacing = isCompact ? 'space-y-4' : 'space-y-6';

  return (
    <div className={densitySecSpacing}>
      {/* Tab Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h2 className="text-brand-navy mb-1 flex items-center gap-2 font-serif text-xl font-bold dark:text-white">
            <History className="text-brand-gold h-5 w-5" /> Activity & Database Logs
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time audit log linked directly to the database of all user actions, document
            generation, and server tasks.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-[#111118] dark:text-gray-300 dark:hover:bg-white/5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* Filter and Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="text-brand-gold absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by keyword/description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`focus:border-brand-gold focus:ring-brand-gold/15 w-full rounded-lg border border-gray-200 bg-white pl-9 text-xs text-gray-900 placeholder-gray-400 transition-all outline-none focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white ${densityPadding}`}
          />
        </div>

        {/* Filter Type */}
        <div>
          <select
            value={actionType}
            onChange={(e) => {
              setActionType(e.target.value);
              setPage(1);
            }}
            className={`focus:border-brand-gold focus:ring-brand-gold/15 w-full rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 transition-all outline-none focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-gray-300 ${densityPadding}`}
          >
            {ACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Logs Table Container */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="relative overflow-hidden rounded-xl border border-gray-200/80 bg-white/50 dark:border-white/8 dark:bg-[#0e0e14]/50"
      >
        <div className="min-h-[350px] overflow-x-auto">
          {loading ? (
            <table className="w-full border-collapse animate-pulse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/20 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:border-white/5 dark:bg-white/2">
                  <th className="px-4 py-3.5">
                    <div className="bg-gray-250 h-3 w-16 rounded dark:bg-white/5" />
                  </th>
                  <th className="px-4 py-3.5">
                    <div className="bg-gray-250 h-3 w-12 rounded dark:bg-white/5" />
                  </th>
                  <th className="px-4 py-3.5">
                    <div className="bg-gray-255 h-3 w-40 rounded dark:bg-white/5" />
                  </th>
                  <th className="px-4 py-3.5">
                    <div className="bg-gray-250 h-3 w-20 rounded dark:bg-white/5" />
                  </th>
                  <th className="px-4 py-3.5">
                    <div className="bg-gray-250 h-3 w-16 rounded dark:bg-white/5" />
                  </th>
                  <th className="px-4 py-3.5 text-right">
                    <div className="bg-gray-250 ml-auto h-3 w-16 rounded dark:bg-white/5" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {[...Array(10)].map((_, i) => (
                  <tr key={i}>
                    {/* Category Skeleton */}
                    <td className="px-4 py-4">
                      <div className="h-5 w-20 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* User Skeleton */}
                    <td className="px-4 py-4">
                      <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Description Skeleton */}
                    <td className="px-4 py-4">
                      <div className="h-3.5 w-48 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Action Code Skeleton */}
                    <td className="px-4 py-4">
                      <div className="h-3 w-32 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Time Skeleton */}
                    <td className="px-4 py-4">
                      <div className="h-3 w-16 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Action button Skeleton */}
                    <td className="px-4 py-4 text-right">
                      <div className="ml-auto h-6 w-20 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <History className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-700" />
              <p className="text-xs font-medium">No activity records found matching filters.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:border-white/5">
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Description</th>
                  <th className="px-4 py-3.5">Action Code</th>
                  <th className="px-4 py-3.5">Time</th>
                  <th className="px-4 py-3.5 text-right">DB Raw</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 dark:divide-white/5 dark:text-gray-300">
                {activities.map((log) => {
                  const meta = getActivityMeta(log.type);
                  const TypeIcon = meta.icon;

                  return (
                    <tr
                      key={log.id}
                      className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.01]"
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${meta.bg}`}
                        >
                          <TypeIcon className="h-3 w-3" />
                          {log.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold whitespace-nowrap text-gray-900 dark:text-white">
                        {log.user}
                      </td>
                      <td
                        className="max-w-sm truncate px-4 py-3.5 font-medium text-gray-600 dark:text-gray-300"
                        title={log.description}
                      >
                        {log.description}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[10px] whitespace-nowrap text-gray-500">
                        {log.action_type}
                      </td>
                      <td
                        className="px-4 py-3.5 whitespace-nowrap text-gray-500"
                        title={new Date(log.raw_timestamp).toLocaleString()}
                      >
                        {log.timestamp}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="bg-brand-gold/10 hover:bg-brand-gold/20 border-brand-gold/20 text-brand-gold inline-flex items-center gap-1 rounded border px-2 py-1 text-[10px] font-bold transition-all"
                        >
                          <Database className="h-3 w-3" /> View DB Log
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-3.5 dark:border-white/5 dark:bg-[#09090f]/30">
            <p className="text-[11px] text-gray-500">
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total{' '}
              <strong>{total}</strong> log rows in DB)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-white/5 dark:bg-[#111118]"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-white/5 dark:bg-[#111118]"
              >
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Raw Database Log JSON Modal popup */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-md dark:bg-black/90">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e0e14]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/8">
                <div className="flex items-center gap-2">
                  <Database className="text-brand-gold h-5 w-5" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Raw DB Transaction Log
                    </h3>
                    <p className="font-mono text-[10px] text-gray-500">Log ID: {selectedLog.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Code Viewer Body */}
              <div className="flex-1 overflow-y-auto bg-gray-950 p-6 font-mono text-xs">
                <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-2 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Code className="text-brand-gold h-3.5 w-3.5" /> DATABASE ROW METADATA
                  </span>
                  <span className="rounded bg-white/5 px-2 py-0.5 uppercase">
                    {selectedLog.action_type}
                  </span>
                </div>

                {/* Print complete row object */}
                <pre className="overflow-x-auto leading-relaxed whitespace-pre-wrap text-emerald-400">
                  {JSON.stringify(
                    {
                      id: selectedLog.id,
                      user_agent_performer: selectedLog.user,
                      action_type: selectedLog.action_type,
                      category_classification: selectedLog.type,
                      description: selectedLog.description,
                      target_classification: {
                        target_id: selectedLog.target_id,
                        target_type: selectedLog.target_type,
                      },
                      transaction_metadata: selectedLog.metadata,
                      created_at_utc: selectedLog.raw_timestamp,
                      formatted_local_time: new Date(selectedLog.raw_timestamp).toLocaleString(),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* Footer */}
              <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-white/5 dark:bg-[#0e0e14]">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white uppercase transition-all hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  Close Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
