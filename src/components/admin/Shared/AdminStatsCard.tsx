import { motion } from 'motion/react';
import type { ElementType } from 'react';

interface AdminStatsCardProps {
  icon: ElementType;
  label: string;
  value: string | number;
  delay?: number;
}

export function AdminStatsCard({ icon: Icon, label, value, delay = 0 }: AdminStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5"
    >
      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
          <Icon className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
            {label}
          </p>
          <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
            {value}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}
