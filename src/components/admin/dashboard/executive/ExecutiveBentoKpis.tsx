'use client';

import { Users, TrendingUp, Building2, PhoneCall, ArrowUpRight } from 'lucide-react';
import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

export interface ExecutiveBentoKpisProps {
  kpis: ExecutiveDashboardData['kpis'];
  isLoading?: boolean;
}

export function ExecutiveBentoKpis({ kpis, isLoading }: ExecutiveBentoKpisProps) {
  if (isLoading) {
    return (
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    );
  }

  const collectionsLakhs = (kpis.totalCollections / 100000).toFixed(2);
  const plotAllottedPercent =
    kpis.totalPlots > 0 ? Math.round((kpis.bookedPlots / kpis.totalPlots) * 100) : 0;
  const growthSign = kpis.collectionsGrowthPercent >= 0 ? '+' : '';

  const cards = [
    {
      label: 'Total Collections',
      value: `₹ ${collectionsLakhs} L`,
      subtext: `${growthSign}${kpis.collectionsGrowthPercent}% vs last cycle`,
      icon: TrendingUp,
      accent: 'border-brand-gold/30 text-brand-gold bg-brand-gold/10',
    },
    {
      label: 'Active Pipeline',
      value: `${kpis.activeLeads} Leads`,
      subtext: `${kpis.hotLeadsCount} hot leads priority`,
      icon: PhoneCall,
      accent: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    },
    {
      label: 'Plot Inventory',
      value: `${kpis.bookedPlots} / ${kpis.totalPlots} Units`,
      subtext: `${plotAllottedPercent}% plots allotted`,
      icon: Building2,
      accent: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    },
    {
      label: 'Team On-Duty',
      value: `${kpis.onDutyStaff} / ${kpis.totalStaff} Present`,
      subtext: `${kpis.attendanceRate}% daily attendance`,
      icon: Users,
      accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group hover:border-brand-gold/30 hover:shadow-brand-gold/5 relative overflow-hidden rounded-2xl border border-white/10 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">{card.label}</span>
              <div className={`rounded-xl border p-2 ${card.accent}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-serif text-2xl font-bold tracking-tight text-white">
                {card.value}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                <span>{card.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
