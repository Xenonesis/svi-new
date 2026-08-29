'use client';

import React from 'react';
import type { MonthlyStats } from './types';

interface MonthlyAttendanceStatsProps {
  stats: MonthlyStats | null;
}

export function MonthlyAttendanceStats({ stats }: MonthlyAttendanceStatsProps) {
  if (!stats) return null;

  const payableDays =
    (stats.present_count || 0) + (stats.half_day_count || 0) * 0.5 + (stats.leave_count || 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-center dark:bg-emerald-950/20">
        <span className="text-[11px] font-bold text-emerald-600 uppercase dark:text-emerald-400">
          Present Days
        </span>
        <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
          {stats.present_count}
        </p>
        <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
          100% Day Salary
        </span>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-center dark:bg-amber-950/20">
        <span className="text-[11px] font-bold text-amber-600 uppercase dark:text-amber-400">
          Half Days
        </span>
        <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
          {stats.half_day_count}
        </p>
        <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
          0.5 Day (50% Salary)
        </span>
      </div>

      <div className="border-brand-gold/30 bg-brand-gold/10 rounded-2xl border p-3.5 text-center">
        <span className="text-brand-gold text-[11px] font-bold uppercase">Payable Days</span>
        <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{payableDays}</p>
        <span className="text-[10px] text-slate-500">For Monthly Payroll</span>
      </div>

      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-center dark:bg-blue-950/20">
        <span className="text-[11px] font-bold text-blue-600 uppercase dark:text-blue-400">
          Late Arrivals
        </span>
        <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
          {stats.late_count}
        </p>
        <span className="text-[10px] text-slate-400">Recorded with notes</span>
      </div>

      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3.5 text-center dark:bg-purple-950/20">
        <span className="text-[11px] font-bold text-purple-600 uppercase dark:text-purple-400">
          Total Hours
        </span>
        <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
          {stats.total_hours_worked} <span className="text-xs font-normal">hrs</span>
        </p>
        <span className="text-[10px] text-slate-400">Avg {stats.avg_daily_hours} hrs/day</span>
      </div>

      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-center dark:bg-rose-950/20">
        <span className="text-[11px] font-bold text-rose-600 uppercase dark:text-rose-400">
          Leaves Taken
        </span>
        <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
          {stats.leave_count}
        </p>
        <span className="text-[10px] text-slate-400">Approved Leaves</span>
      </div>
    </div>
  );
}
