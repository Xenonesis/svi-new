import React from 'react';
import { motion } from 'motion/react';
import { Receipt, IndianRupee, CreditCard, Calendar } from 'lucide-react';

export function StatCardSkeleton() {
  return (
    <div className="dark:bg-brand-dark-surface/50 animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-white/10" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-6 w-16 rounded bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

interface ReceiptStatsCardsProps {
  loading: boolean;
  totalCount: number;
  totalAmount: number;
  upiCount: number;
  cashCount: number;
}

export function ReceiptStatsCards({
  loading,
  totalCount,
  totalAmount,
  upiCount,
  cashCount,
}: ReceiptStatsCardsProps) {
  if (loading) {
    return (
      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className="mb-4 grid grid-cols-2 gap-2.5 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0, duration: 0.3 }}
        className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5"
      >
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
            <Receipt className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
              Total Receipts
            </p>
            <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
              {totalCount}
            </h3>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5"
      >
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
            <IndianRupee className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
              Total Collected
            </p>
            <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
              ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5"
      >
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
            <CreditCard className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
              UPI Receipts
            </p>
            <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
              {upiCount}
            </h3>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5"
      >
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
            <Calendar className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
              Cash Receipts
            </p>
            <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
              {cashCount}
            </h3>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
