'use client';

import React from 'react';
import { Users, UserCheck, Clock, UserX } from 'lucide-react';

interface DirectoryStatsCardsProps {
  totalEmployees: number;
  punchedInCount: number;
  punchedOutCount: number;
  notPunchedCount: number;
  activeFilter: 'all' | 'punched_in' | 'punched_out' | 'not_punched';
  onSelectFilter: (filter: 'all' | 'punched_in' | 'punched_out' | 'not_punched') => void;
}

export function DirectoryStatsCards({
  totalEmployees,
  punchedInCount,
  punchedOutCount,
  notPunchedCount,
  activeFilter,
  onSelectFilter,
}: DirectoryStatsCardsProps) {
  const attendanceRate =
    totalEmployees > 0 ? Math.round((punchedInCount / totalEmployees) * 100) : 0;

  const cards = [
    {
      id: 'all' as const,
      label: 'Total Workforce',
      value: totalEmployees,
      subtext: 'Registered Staff',
      icon: Users,
      iconColor: 'text-brand-gold',
      iconBg: 'bg-brand-gold/10 border-brand-gold/20',
      badgeText: 'Directory',
      badgeClass: 'bg-brand-gold/10 text-brand-gold border-brand-gold/20',
      activeRing: 'ring-2 ring-brand-gold/40 border-brand-gold/50',
    },
    {
      id: 'punched_in' as const,
      label: 'Checked In Today',
      value: punchedInCount,
      subtext: `${attendanceRate}% Attendance Rate`,
      icon: UserCheck,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      badgeText: 'Active Now',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      activeRing: 'ring-2 ring-emerald-500/40 border-emerald-500/50',
    },
    {
      id: 'punched_out' as const,
      label: 'Punched Out',
      value: punchedOutCount,
      subtext: 'Shift Completed Today',
      icon: Clock,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      badgeText: 'Offline',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      activeRing: 'ring-2 ring-amber-500/40 border-amber-500/50',
    },
    {
      id: 'not_punched' as const,
      label: 'Not Checked In',
      value: notPunchedCount,
      subtext: 'Awaiting Punch / Absent',
      icon: UserX,
      iconColor: 'text-slate-400',
      iconBg: 'bg-slate-500/10 border-slate-500/20',
      badgeText: 'Unchecked',
      badgeClass: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
      activeRing: 'ring-2 ring-slate-400/40 border-slate-400/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const isActive = activeFilter === c.id;

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectFilter(c.id)}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 ${
              isActive
                ? `${c.activeRing} bg-white shadow-lg dark:bg-[#161622]`
                : 'border-gray-200 bg-white/70 shadow-xs hover:border-gray-300 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.06]'
            }`}
          >
            {/* Top Row: Icon + Badge */}
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-transform group-hover:scale-105 ${c.iconBg}`}
              >
                <Icon size={18} className={c.iconColor} />
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-colors ${c.badgeClass}`}
              >
                {c.badgeText}
              </span>
            </div>

            {/* Bottom Row: Number + Label */}
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                  {c.value}
                </span>
                {c.id === 'all' && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">staff</span>
                )}
              </div>
              <div className="mt-1">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{c.label}</p>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{c.subtext}</p>
              </div>
            </div>

            {/* Active Indicator Bar */}
            {isActive && (
              <div className="bg-brand-gold absolute right-0 bottom-0 left-0 h-1 transition-all" />
            )}
          </button>
        );
      })}
    </div>
  );
}
