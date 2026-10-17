'use client';
import React from 'react';
import { TrendingUp, Wallet, Clock, BookOpen } from 'lucide-react';
import type { SalesRevenueStats } from '../portal-allotments/PortalAllotmentsStatsGrid';

export function PortalAllotmentsStatsGridV2({
  stats,
  onOpenLedgersModal,
}: {
  stats: SalesRevenueStats;
  onOpenLedgersModal: () => void;
}): React.JSX.Element {
  const formatNumberOnly = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const realizationRate = Math.min(100, Math.max(0, Math.round(stats.realizationRate || 0)));

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Sales Revenue */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 dark:border-white/[0.07] dark:bg-[#0c121e]">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-[#64748B]">
            Total Sales Revenue
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-500 dark:border-blue-400/20 dark:bg-[#101F38] dark:text-[#38BDF8]">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-[1.75rem] dark:text-white">
            {formatNumberOnly(stats.totalSalesRevenue)}
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-[#8E9BAE]">
            {stats.activeAccountsCount} Active Plot / Villa Allotments
          </p>
        </div>
      </div>

      {/* 2. Collected Revenue */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 dark:border-white/[0.07] dark:bg-[#0c121e]">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold tracking-wider text-emerald-600 uppercase dark:text-[#10B981]">
            Collected Revenue
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:border-emerald-400/20 dark:bg-[#0E2422] dark:text-[#34D399]">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="font-mono text-2xl font-bold tracking-tight text-emerald-600 tabular-nums sm:text-[1.75rem] dark:text-[#10B981]">
            {formatNumberOnly(stats.totalRevenueCollected)}
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-[#8E9BAE]">
            Verified received milestone receipts
          </p>
        </div>
      </div>

      {/* 3. Pending Receivables */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 dark:border-white/[0.07] dark:bg-[#0c121e]">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold tracking-wider text-amber-600 uppercase dark:text-[#EAB308]">
            Pending Receivables
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500 dark:border-amber-400/20 dark:bg-[#251F14] dark:text-[#FBBF24]">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="font-mono text-2xl font-bold tracking-tight text-amber-600 tabular-nums sm:text-[1.75rem] dark:text-[#FACC15]">
            {formatNumberOnly(stats.totalBalanceDue)}
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-[#8E9BAE]">
            Remaining uncollected deal balances
          </p>
        </div>
      </div>

      {/* 4. Realization Rate */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 dark:border-white/[0.07] dark:bg-[#0c121e]">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-amber-600 uppercase dark:text-[#EAB308]">
              Realization Rate
            </span>
            <span className="font-mono text-xs font-bold text-slate-900 tabular-nums dark:text-[#EAB308]">
              {realizationRate}%
            </span>
          </div>
          {/* Progress bar with glowing golden fill */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#1E293B]/70">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500 dark:bg-[#EAB308]"
              style={{ width: `${realizationRate}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenLedgersModal}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.98] dark:border-white/[0.08] dark:bg-[#101726]/60 dark:text-white dark:hover:border-white/[0.15] dark:hover:bg-[#161F33]"
        >
          <BookOpen className="h-3.5 w-3.5 text-amber-500 dark:text-[#EAB308]" />
          <span>Master Ledger Overview</span>
        </button>
      </div>
    </div>
  );
}
