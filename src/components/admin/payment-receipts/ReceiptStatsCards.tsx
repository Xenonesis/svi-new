import React from 'react';
import { motion } from 'motion/react';
import { Receipt, IndianRupee, CreditCard, Banknote } from 'lucide-react';

export function StatCardSkeleton(): React.JSX.Element {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/[0.08] dark:bg-[#111622]">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="mt-3 h-7 w-28 rounded bg-slate-200 dark:bg-white/10" />
      <div className="mt-2 h-3.5 w-36 rounded bg-slate-200 dark:bg-white/10" />
    </div>
  );
}

export interface ReceiptStatsCardsProps {
  loading: boolean;
  totalCount: number;
  totalAmount: number;
  upiCount: number;
  cashCount: number;
  bankCount?: number;
}

export function ReceiptStatsCards({
  loading,
  totalCount,
  totalAmount,
  upiCount,
  cashCount,
}: ReceiptStatsCardsProps): React.JSX.Element {
  if (loading) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  const upiShare = totalCount > 0 ? Math.round((upiCount / totalCount) * 100) : 0;
  const cashShare = totalCount > 0 ? Math.round((cashCount / totalCount) * 100) : 0;

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {/* 1. Total Receipts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0, duration: 0.3 }}
        className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md dark:border-white/[0.08] dark:bg-[#111622] dark:hover:border-white/[0.15]"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Total Receipts
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-500/20 dark:border-blue-400/20 dark:bg-blue-500/15 dark:text-blue-400">
            <Receipt className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
          {totalCount.toLocaleString('en-IN')}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Active client transactions</span>
        </div>
      </motion.div>

      {/* 2. Total Collected (Hero Card) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className="border-brand-gold/30 from-brand-gold/15 hover:border-brand-gold/50 rounded-2xl border bg-gradient-to-br via-[#161D2C] to-[#111622] p-5 shadow-xs transition-all hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-brand-gold text-xs font-semibold tracking-wider uppercase">
            Total Collected
          </span>
          <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold dark:border-brand-gold/40 dark:bg-brand-gold/15 flex h-9 w-9 items-center justify-center rounded-xl border transition-colors">
            <IndianRupee className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-white tabular-nums">
          ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </div>
        <p className="text-brand-gold/80 dark:text-brand-gold/70 mt-1 text-xs">
          Audited real estate payments
        </p>
      </motion.div>

      {/* 3. UPI Receipts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md dark:border-white/[0.08] dark:bg-[#111622] dark:hover:border-white/[0.15]"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            UPI Receipts
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-600 transition-colors group-hover:bg-purple-500/20 dark:border-purple-400/20 dark:bg-purple-500/15 dark:text-purple-400">
            <CreditCard className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
          {upiCount.toLocaleString('en-IN')}
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{upiShare}% of receipts</p>
      </motion.div>

      {/* 4. Cash Receipts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md dark:border-white/[0.08] dark:bg-[#111622] dark:hover:border-white/[0.15]"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Cash Receipts
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/20 dark:border-emerald-400/20 dark:bg-emerald-500/15 dark:text-emerald-400">
            <Banknote className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
          {cashCount.toLocaleString('en-IN')}
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {cashShare}% direct branch receipts
        </p>
      </motion.div>
    </div>
  );
}
