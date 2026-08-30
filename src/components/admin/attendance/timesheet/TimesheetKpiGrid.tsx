'use client';

import React from 'react';
import { Users, UserCheck, AlertTriangle, Hourglass, PhoneCall, Navigation } from 'lucide-react';
import type { TimesheetMetrics } from './types';

interface TimesheetKpiGridProps {
  metrics: TimesheetMetrics;
}

export function TimesheetKpiGrid({ metrics }: TimesheetKpiGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {/* Total Records */}
      <div className="dark:bg-brand-dark-surface/70 relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10">
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-slate-400/40 to-transparent" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Total Logs
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
            <Users className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
          {metrics.total}
        </div>
        <p className="mt-0.5 text-[10px] font-medium text-gray-400">Tracked records</p>
      </div>

      {/* Present */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-xs backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
            Present
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <UserCheck className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-300">
          {metrics.present}
        </div>
        <p className="mt-0.5 text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/80">
          {metrics.total > 0 ? `${metrics.presentRate}% on-duty` : 'No logs'}
        </p>
      </div>

      {/* Late Arrivals */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-xs backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-amber-500/20 dark:bg-amber-500/10">
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
            Late Arrivals
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-amber-700 dark:text-amber-300">
          {metrics.late}
        </div>
        <p className="mt-0.5 text-[10px] font-medium text-amber-600/80 dark:text-amber-400/80">
          {metrics.present > 0 ? `${metrics.lateRate}% late rate` : 'None marked'}
        </p>
      </div>

      {/* Total Hours */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 shadow-xs backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-blue-500/20 dark:bg-blue-500/10">
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
            Total Hours
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <Hourglass className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-blue-700 dark:text-blue-300">
          {metrics.totalHours}h
        </div>
        <p className="mt-0.5 text-[10px] font-medium text-blue-600/80 dark:text-blue-400/80">
          Cumulative work
        </p>
      </div>

      {/* Client Calls */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 shadow-xs backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-purple-500/20 dark:bg-purple-500/10">
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-purple-600 uppercase dark:text-purple-400">
            Client Calls
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
            <PhoneCall className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-purple-700 dark:text-purple-300">
          {metrics.totalCalls}
        </div>
        <p className="mt-0.5 text-[10px] font-medium text-purple-600/80 dark:text-purple-400/80">
          Shift calls logged
        </p>
      </div>

      {/* Site Visits */}
      <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-xs backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-rose-500/20 dark:bg-rose-500/10">
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
            Site Visits
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
            <Navigation className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-rose-700 dark:text-rose-300">
          {metrics.totalVisits}
        </div>
        <p className="mt-0.5 text-[10px] font-medium text-rose-600/80 dark:text-rose-400/80">
          Property visits
        </p>
      </div>
    </div>
  );
}
