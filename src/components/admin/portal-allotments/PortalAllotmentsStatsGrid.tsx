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
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-white/10 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Total Sales Revenue
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {formatCurrency(stats.totalSalesRevenue)}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {stats.activeAccountsCount} Active Plot / Villa Allotments
        </p>
      </div>

      {/* Realized / Collected Revenue */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-white/10 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
            Collected Revenue
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
          {formatCurrency(stats.totalRevenueCollected)}
        </div>
        <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">
          Verified received milestone receipts
        </p>
      </div>

      {/* Outstanding Balance */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-white/10 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
            Pending Receivables
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
          {formatCurrency(stats.totalBalanceDue)}
        </div>
        <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">
          Remaining uncollected deal balances
        </p>
      </div>

      {/* Realization Rate & Quick Master Ledger */}
      <div className="border-brand-gold/30 from-brand-gold/10 dark:border-brand-gold/20 dark:from-brand-gold/5 flex flex-col justify-between rounded-2xl border bg-gradient-to-br via-amber-500/5 to-transparent p-5 shadow-xs">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-brand-gold text-xs font-bold tracking-wider uppercase">
              Realization Rate
            </span>
            <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">
              {stats.realizationRate}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
            <div
              className="bg-brand-gold h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.realizationRate)}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenLedgersModal}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#0f2942] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#163b5f] active:scale-[0.98] dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <BookOpen className="text-brand-gold h-3.5 w-3.5" />
          <span>Master Ledger Overview</span>
        </button>
      </div>
    </div>
  );
}
