'use client';

import { FileText, IndianRupee, TrendingUp, Building2 } from 'lucide-react';
import type { SavedAllotment } from '@/src/components/admin/allotment-records/types';
import { calculateTotalCost } from '@/src/components/admin/allotment-records/types';

interface PortalAllotmentsStatsProps {
  allotments: SavedAllotment[];
}

export function PortalAllotmentsStats({ allotments }: PortalAllotmentsStatsProps) {
  const totalCount = allotments.length;
  const totalValue = allotments.reduce(
    (sum, r) => sum + (r.form_data ? calculateTotalCost(r.form_data) : 0),
    0
  );
  const avgArea = allotments.length
    ? allotments.reduce((sum, r) => sum + (parseFloat(r.form_data?.area) || 0), 0) /
      allotments.length
    : 0;
  const shyamAanganCount = allotments.filter(
    (r) => r.form_data?.projectName === 'Shyam Aangan'
  ).length;

  const statCards = [
    {
      label: 'Total Letters',
      value: totalCount.toString(),
      icon: FileText,
    },
    {
      label: 'Total Unit Value',
      value: `₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: IndianRupee,
    },
    {
      label: 'Avg Area (Sq.Yds)',
      value: avgArea.toFixed(1),
      icon: TrendingUp,
    },
    {
      label: 'Shyam Aangan',
      value: shyamAanganCount.toString(),
      icon: Building2,
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-2.5 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5"
          >
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
                <Icon className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
                  {card.label}
                </p>
                <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
                  {card.value}
                </h3>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
