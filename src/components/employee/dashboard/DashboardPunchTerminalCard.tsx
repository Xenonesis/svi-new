'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import type { DashboardData } from './types';

interface DashboardPunchTerminalCardProps {
  today: DashboardData['today'] | undefined;
  elapsedTime: string;
}

export function DashboardPunchTerminalCard({
  today,
  elapsedTime,
}: DashboardPunchTerminalCardProps) {
  const punchStatus = today?.punch_status || 'not_punched';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'relative overflow-hidden rounded-3xl border p-6 shadow-sm transition-all',
        punchStatus === 'punched_in'
          ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:border-emerald-500/20 dark:from-emerald-950/30'
          : punchStatus === 'punched_out'
            ? 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent dark:border-blue-500/20 dark:from-blue-950/30'
            : 'border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900/70'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              'h-2.5 w-2.5 animate-pulse rounded-full',
              punchStatus === 'punched_in'
                ? 'bg-emerald-500'
                : punchStatus === 'punched_out'
                  ? 'bg-blue-500'
                  : 'bg-slate-400'
            )}
          />
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            {punchStatus === 'punched_in'
              ? 'Shift In Progress'
              : punchStatus === 'punched_out'
                ? 'Shift Completed'
                : 'Shift Not Started'}
          </span>
        </div>

        {today?.is_late && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            Late Arrival
          </span>
        )}
      </div>

      {/* Radar Center Dial */}
      <div className="my-6 flex flex-col items-center justify-center text-center">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-100 bg-slate-50 shadow-inner dark:border-slate-800 dark:bg-slate-950/80">
          {punchStatus === 'punched_in' && (
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          )}
          <div className="flex flex-col items-center">
            <Clock
              className={clsx(
                'h-6 w-6',
                punchStatus === 'punched_in'
                  ? 'text-emerald-500'
                  : punchStatus === 'punched_out'
                    ? 'text-blue-500'
                    : 'text-slate-400'
              )}
            />
            <span className="mt-1 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
              {punchStatus === 'punched_in'
                ? elapsedTime
                : punchStatus === 'punched_out'
                  ? `${(today?.total_hours || 0).toFixed(1)} hrs`
                  : '00:00:00'}
            </span>
            <span className="text-[9px] text-slate-400">
              {punchStatus === 'punched_in' ? 'Active' : 'Duration'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex w-full items-center justify-around border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
          <div>
            <p className="text-[10px] text-slate-400">Punch In</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {today?.punch_in_time ? format(new Date(today.punch_in_time), 'hh:mm a') : '--:--'}
            </p>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <p className="text-[10px] text-slate-400">Punch Out</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {today?.punch_out_time ? format(new Date(today.punch_out_time), 'hh:mm a') : '--:--'}
            </p>
          </div>
        </div>
      </div>

      <Link
        href="/employee/attendance"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white shadow-lg transition-all hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
      >
        Open GPS Attendance Terminal <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}
