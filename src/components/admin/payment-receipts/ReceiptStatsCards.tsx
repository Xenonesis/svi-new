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
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0, duration: 0.3 }}
        className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5"
      >
        <div className="flex items-center gap-4">
          <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <Receipt className="text-brand-gold h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Total Receipts
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</h3>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5"
      >
        <div className="flex items-center gap-4">
          <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <IndianRupee className="text-brand-gold h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Total Collected
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5"
      >
        <div className="flex items-center gap-4">
          <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <CreditCard className="text-brand-gold h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              UPI Receipts
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{upiCount}</h3>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5"
      >
        <div className="flex items-center gap-4">
          <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <Calendar className="text-brand-gold h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Cash Receipts
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{cashCount}</h3>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
