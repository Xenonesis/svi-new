import React from 'react';
import { BookOpen, Clock, TrendingUp, Wallet } from 'lucide-react';

export interface SalesRevenueStats {
  totalSalesRevenue: number;
  totalRevenueCollected: number;
  totalBalanceDue: number;
  realizationRate: number;
  activeAccountsCount: number;
}

export function PortalAllotmentsStatsGrid({
  stats,
  onOpenLedgersModal,
}: {
  stats: SalesRevenueStats;
  onOpenLedgersModal: () => void;
}): React.JSX.Element {
  const formatCurrency = (val: number) =>
    val.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: val % 1 === 0 ? 0 : 2,
    });

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Booked Sales Revenue */}
      <div className="group hover:border-brand-gold/40 dark:hover:border-brand-gold/30 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-white/[0.08] dark:bg-[#111622]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Total Sales Revenue
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-500/20 dark:border-blue-400/20 dark:bg-blue-500/15 dark:text-blue-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
          {formatCurrency(stats.totalSalesRevenue)}
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {stats.activeAccountsCount} Active Plot / Villa Allotments
        </p>
      </div>

      {/* Realized / Collected Revenue */}
      <div className="group hover:border-brand-gold/40 dark:hover:border-brand-gold/30 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-white/[0.08] dark:bg-[#111622]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
            Collected Revenue
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/20 dark:border-emerald-400/20 dark:bg-emerald-500/15 dark:text-emerald-400">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-emerald-600 tabular-nums dark:text-emerald-400">
          {formatCurrency(stats.totalRevenueCollected)}
        </div>
        <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">
          Verified received milestone receipts
        </p>
      </div>

      {/* Outstanding Balance */}
      <div className="group hover:border-brand-gold/40 dark:hover:border-brand-gold/30 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-white/[0.08] dark:bg-[#111622]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
            Pending Receivables
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-500/20 dark:border-amber-400/20 dark:bg-amber-500/15 dark:text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-amber-600 tabular-nums dark:text-amber-400">
          {formatCurrency(stats.totalBalanceDue)}
        </div>
        <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">
          Remaining uncollected deal balances
        </p>
      </div>

      {/* Realization Rate & Quick Master Ledger */}
      <div className="border-brand-gold/30 from-brand-gold/15 hover:border-brand-gold/50 flex flex-col justify-between rounded-2xl border bg-gradient-to-br via-[#161D2C] to-[#111622] p-5 shadow-xs transition-all hover:shadow-md">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-brand-gold text-xs font-bold tracking-wider uppercase">
              Realization Rate
            </span>
            <span className="dark:text-brand-gold font-mono text-xs font-bold text-slate-200 tabular-nums">
              {stats.realizationRate}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800/80 dark:bg-white/[0.08]">
            <div
              className="bg-brand-gold shadow-brand-gold/50 h-full rounded-full shadow-xs transition-all duration-500"
              style={{ width: `${Math.min(100, stats.realizationRate)}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenLedgersModal}
          className="group border-brand-gold/40 text-brand-gold hover:border-brand-gold hover:bg-brand-gold/15 hover:shadow-brand-gold/10 mt-3 flex items-center justify-center gap-2 rounded-xl border bg-[#161D2C] px-4 py-2.5 text-xs font-bold shadow-xs transition-all hover:shadow-md active:scale-[0.98]"
        >
          <BookOpen className="text-brand-gold h-3.5 w-3.5 transition-transform group-hover:scale-110" />
          <span>Master Ledger Overview</span>
        </button>
      </div>
    </div>
  );
}
