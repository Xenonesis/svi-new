'use client';

import {
  BarChart3,
  Calculator,
  CheckSquare,
  FileText,
  Plus,
  Receipt,
  Settings,
  TrendingUp,
} from 'lucide-react';

import Link from 'next/link';
import { motion } from 'motion/react';

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const actions: QuickAction[] = [
  {
    label: 'New User',
    icon: Plus,
    href: '/admin/dashboard?action=create-user',
    color: 'bg-green-500/20 text-green-400 hover:bg-green-500/30',
  },
  {
    label: 'Allotment Letter',
    icon: FileText,
    href: '/admin/allotment-letter',
    color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
  },
  {
    label: 'Payment Receipt',
    icon: Receipt,
    href: '/admin/payment-receipt',
    color: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
  },
  {
    label: 'Payment Plan',
    icon: Calculator,
    href: '/admin/payment-plan',
    color: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30',
  },
  {
    label: 'View Reports',
    icon: TrendingUp,
    href: '/admin/dashboard?tab=analytics',
    color: 'bg-brand-gold/20 text-brand-gold hover:bg-brand-gold/30',
  },
  {
    label: 'Mark Attendance',
    icon: CheckSquare,
    href: '/admin/attendance?tab=mark',
    color: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30',
  },
  {
    label: 'Attendance Report',
    icon: BarChart3,
    href: '/admin/attendance?tab=report',
    color: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/admin/settings',
    color: 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30',
  },
];

export default function QuickActions() {
  return (
    <div className="dark:bg-brand-dark-surface/65 rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Frequently used</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <Link key={action.label} href={action.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 ${action.color} cursor-pointer transition-all`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-center text-xs font-medium">{action.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
