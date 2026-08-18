'use client';

import { Users, Building2, Briefcase, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  bgCls: string;
  iconBg: string;
  iconColor: string;
  showLine: boolean;
  trend: string;
}

interface DashboardStatsCardsProps {
  totalUsers: number;
  clientCount: number;
  employeeCount: number;
  adminCount: number;
  trends?: {
    userGrowth?: string;
    clientGrowth?: string;
    adminCount?: string;
  };
  isLoading: boolean;
}

export function DashboardStatsCards({
  totalUsers,
  clientCount,
  employeeCount,
  adminCount,
  trends,
  isLoading,
}: DashboardStatsCardsProps) {
  const cards: StatItem[] = [
    {
      label: 'Total Accounts',
      value: totalUsers,
      icon: Users,
      bgCls:
        'bg-white/80 dark:bg-brand-dark-surface/65 backdrop-blur-xl border border-gray-200 dark:border-brand-gold/15 relative overflow-hidden transition-colors duration-300',
      iconBg: 'bg-brand-gold/10 border border-brand-gold/25',
      iconColor: 'text-brand-gold',
      showLine: true,
      trend: trends?.userGrowth || '+0%',
    },
    {
      label: 'User Profiles',
      value: clientCount,
      icon: Building2,
      bgCls:
        'bg-white/80 dark:bg-brand-dark-surface/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 hover:border-brand-gold/15 transition-colors relative overflow-hidden',
      iconBg: 'bg-white/5 border border-white/10',
      iconColor: 'text-gray-300',
      showLine: false,
      trend: trends?.clientGrowth || '+0%',
    },
    {
      label: 'Employees',
      value: employeeCount,
      icon: Briefcase,
      bgCls:
        'bg-white/80 dark:bg-brand-dark-surface/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 hover:border-brand-gold/15 transition-colors relative overflow-hidden',
      iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
      iconColor: 'text-emerald-500',
      showLine: false,
      trend: 'Active',
    },
    {
      label: 'Administrators',
      value: adminCount,
      icon: Shield,
      bgCls:
        'bg-white/80 dark:bg-brand-dark-surface/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 hover:border-brand-gold/15 transition-colors relative overflow-hidden',
      iconBg: 'bg-white/5 border border-white/10',
      iconColor: 'text-gray-300',
      showLine: false,
      trend: trends?.adminCount || '0%',
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, bgCls, iconBg, iconColor, showLine, trend }) => (
        <div key={label} className={`${bgCls} rounded-xl p-5 shadow-lg`}>
          {showLine && (
            <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
          )}
          <div className="mb-3 flex items-center justify-between">
            <div className={`h-11 w-11 rounded-lg ${iconBg} flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            {isLoading ? (
              <div className="h-5 w-12 animate-pulse rounded bg-gray-200 dark:bg-white/5" />
            ) : (
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-500">
                {trend}
              </span>
            )}
          </div>
          {isLoading ? (
            <div className="my-0.5 h-9 w-20 animate-pulse rounded bg-gray-200 dark:bg-white/5" />
          ) : (
            <p className="text-brand-navy text-3xl font-bold tracking-tight transition-colors duration-300 dark:text-white">
              {value}
            </p>
          )}
          <p className="mt-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
