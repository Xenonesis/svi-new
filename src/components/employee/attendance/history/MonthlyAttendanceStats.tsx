'use client';

import React from 'react';
import type { MonthlyStats } from './types';

interface MonthlyAttendanceStatsProps {
  stats: MonthlyStats | null;
}

export function MonthlyAttendanceStats({ stats }: MonthlyAttendanceStatsProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-center dark:bg-emerald-950/20">
        <span className="text-[11px] font-bold text-emerald-600 uppercase dark:text-emerald-400">
          Present Days
        </span>
        <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
          {stats.present_count}
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-center dark:bg-amber-950/20">
        <span className="text-[11px] font-bold text-amber-600 uppercase dark:text-amber-400">
          Late Arrivals
        </span>
        <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
          {stats.late_count}
        </p>
      </div>

      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-center dark:bg-blue-950/20">
        <span className="text-[11px] font-bold text-blue-600 uppercase dark:text-blue-400">
          Total Hours
        </span>
        <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
          {stats.total_hours_worked} <span className="text-xs font-normal">hrs</span>
        </p>
      </div>

      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3.5 text-center dark:bg-purple-950/20">
        <span className="text-[11px] font-bold text-purple-600 uppercase dark:text-purple-400">
          Avg Daily
        </span>
        <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
          {stats.avg_daily_hours} <span className="text-xs font-normal">hrs</span>
        </p>
      </div>
    </div>
  );
}
