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
      className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5"
    >
      <div className="flex items-center gap-4">
        <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
          <Icon className="text-brand-gold h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        </div>
      </div>
    </motion.div>
  );
}
