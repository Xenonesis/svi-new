'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, MapPin, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import type { EmployeeLiveStatus } from '@/src/lib/supabase/types';

interface LiveStatusProps {
  token: string;
}

export default function LiveStatus({ token }: LiveStatusProps) {
  const [statuses, setStatuses] = useState<EmployeeLiveStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchLiveStatus = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/attendance/live', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStatuses(data.statuses || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch live status:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLiveStatus(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />
        ))}
      </div>
    );
  }

  const punchedIn = statuses.filter((s) => s.status === 'punched_in');
  const punchedOut = statuses.filter((s) => s.status === 'punched_out');
  const notPunched = statuses.filter((s) => s.status === 'not_punched');
  const lateCount = statuses.filter((s) => s.is_late).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-brand-navy font-serif text-xl font-semibold dark:text-white">
            Live Status
          </h2>
          <p className="flex items-center gap-2 text-xs text-gray-500">
            Last updated: {format(lastUpdated, 'hh:mm:ss a')}
            {refreshing && <RefreshCw size={12} className="text-brand-gold animate-spin" />}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            {punchedIn.length} Active
          </div>
          <div className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            {punchedOut.length} Completed
          </div>
          <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 font-semibold text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-400">
            {lateCount} Late
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-1">
        {statuses.map((emp) => (
          <motion.div
            key={emp.user_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-xl border p-5 transition-all ${
              emp.status === 'punched_in'
                ? 'border-emerald-200 bg-white shadow-lg shadow-emerald-500/5 dark:border-emerald-900/50 dark:bg-gray-900'
                : emp.status === 'punched_out'
                  ? 'border-gray-200 bg-gray-50 opacity-70 dark:border-gray-800 dark:bg-gray-900/50'
                  : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
            }`}
          >
            {/* Status indicator line */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1 ${
                emp.status === 'punched_in'
                  ? 'bg-emerald-500'
                  : emp.status === 'punched_out'
                    ? 'bg-gray-400'
                    : 'bg-transparent'
              }`}
            />

            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3
                  className="max-w-[150px] truncate font-bold text-gray-900 dark:text-white"
                  title={emp.full_name}
                >
                  {emp.full_name}
                </h3>
                <p className="max-w-[150px] truncate text-[10px] text-gray-500">{emp.email}</p>
              </div>
              <div className="text-right">
                {emp.status === 'punched_in' && (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-700 uppercase dark:bg-emerald-900/40 dark:text-emerald-400">
                    Active
                  </span>
                )}
                {emp.status === 'punched_out' && (
                  <span className="inline-flex items-center gap-1 rounded bg-gray-200 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gray-600 uppercase dark:bg-gray-800 dark:text-gray-400">
                    Done
                  </span>
                )}
                {emp.status === 'not_punched' && (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-600 uppercase dark:bg-amber-900/40 dark:text-amber-400">
                    No Show
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-gray-100/50 p-2 dark:bg-white/5">
                <p className="mb-1 text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                  Punch In
                </p>
                <div className="flex items-center gap-1.5 font-mono text-gray-700 dark:text-gray-300">
                  <Clock size={12} className={emp.is_late ? 'text-amber-500' : ''} />
                  <span className={emp.is_late ? 'text-amber-600 dark:text-amber-400' : ''}>
                    {emp.punch_in_time ? format(new Date(emp.punch_in_time), 'HH:mm') : '--:--'}
                  </span>
                </div>
              </div>
              <div className="rounded bg-gray-100/50 p-2 dark:bg-white/5">
                <p className="mb-1 text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                  Total
                </p>
                <div className="flex items-center gap-1.5 font-mono text-gray-700 dark:text-gray-300">
                  {emp.total_hours ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {emp.total_hours}h
                    </span>
                  ) : (
                    <span>--</span>
                  )}
                </div>
              </div>
            </div>

            {emp.punch_in_time && (
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-[10px] dark:border-white/5">
                <div className="flex items-center gap-1">
                  {emp.is_geofence_verified ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <MapPin size={10} /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500 dark:text-red-400">
                      <AlertCircle size={10} /> Out of Range
                    </span>
                  )}
                </div>
                {emp.is_late && <span className="font-bold text-amber-500">LATE PUNCH</span>}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {statuses.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
          <p className="text-gray-500">No employees found in the system.</p>
        </div>
      )}
    </div>
  );
}
