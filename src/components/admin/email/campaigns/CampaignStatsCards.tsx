'use client';

import { Megaphone, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface CampaignStatsCardsProps {
  total: number;
  draft: number;
  scheduled: number;
  sent: number;
}

const STATS = [
  {
    key: 'total' as const,
    label: 'Total',
    icon: Megaphone,
    color: 'text-gray-600 dark:text-gray-300',
  },
  {
    key: 'draft' as const,
    label: 'Drafts',
    icon: FileText,
    color: 'text-gray-500 dark:text-gray-400',
  },
  { key: 'scheduled' as const, label: 'Scheduled', icon: Clock, color: 'text-blue-500' },
  { key: 'sent' as const, label: 'Sent', icon: CheckCircle2, color: 'text-emerald-500' },
];

export function CampaignStatsCards({ total, draft, scheduled, sent }: CampaignStatsCardsProps) {
  const values = { total, draft, scheduled, sent };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="dark:bg-brand-dark-surface rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-700/60"
        >
          <div className="flex items-center justify-between">
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
            <span className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
              {values[stat.key]}
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] tracking-wider text-gray-400 uppercase">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
