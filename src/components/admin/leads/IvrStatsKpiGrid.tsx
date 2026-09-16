'use client';

import React from 'react';
import { Clock, CheckCircle2, XCircle, Flame } from 'lucide-react';
import type { IvrSummaryStats } from './useIvrLeadsManagement';

export interface IvrStatsKpiGridProps {
  summary:
    | IvrSummaryStats
    | {
        total_calls: number;
        answered_calls: number;
        missed_calls: number;
        hot_count: number;
        warm_count?: number;
        cold_count?: number;
      };
}

export function IvrStatsKpiGrid({ summary }: IvrStatsKpiGridProps): React.JSX.Element {
  const totalCalls = summary?.total_calls ?? 0;
  const answeredCalls = summary?.answered_calls ?? 0;
  const missedCalls = summary?.missed_calls ?? 0;
  const hotCount = summary?.hot_count ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Total Calls */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-white/5 dark:bg-[#0f0f16]">
        <div className="flex items-center justify-between text-gray-400">
          <span className="text-[10px] font-bold tracking-wider uppercase">Total Calls</span>
          <Clock className="text-brand-gold h-4 w-4" />
        </div>
        <div className="text-brand-navy mt-2 text-2xl font-bold dark:text-white">
          {totalCalls.toLocaleString()}
        </div>
        <span className="text-[10px] text-gray-400">All campaign logs</span>
      </div>

      {/* Answered */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-colors duration-300">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span className="text-[10px] font-bold tracking-wider uppercase">Answered</span>
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
          {answeredCalls.toLocaleString()}
        </div>
        <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
          {totalCalls > 0
            ? `${Math.round((answeredCalls / totalCalls) * 100)}% connection rate`
            : 'Connected calls'}
        </span>
      </div>

      {/* Not Answered */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 transition-colors duration-300">
        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
          <span className="text-[10px] font-bold tracking-wider uppercase">Not Answered</span>
          <XCircle className="h-4 w-4" />
        </div>
        <div className="mt-2 text-2xl font-bold text-rose-700 dark:text-rose-300">
          {missedCalls.toLocaleString()}
        </div>
        <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80">
          Missed / Unanswered
        </span>
      </div>

      {/* Hot Leads */}
      <div className="border-brand-gold/30 bg-brand-gold/10 rounded-2xl border p-4 transition-colors duration-300">
        <div className="text-brand-gold flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase">Hot Intent</span>
          <Flame className="h-4 w-4 text-rose-500" />
        </div>
        <div className="text-brand-navy mt-2 text-2xl font-bold dark:text-white">
          {hotCount.toLocaleString()}
        </div>
        <span className="text-brand-gold-dark dark:text-brand-gold-light text-[10px]">
          &ge; 60s talk or Key 1 pressed
        </span>
      </div>
    </div>
  );
}
