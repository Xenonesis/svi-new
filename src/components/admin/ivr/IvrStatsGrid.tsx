import React from 'react';

export interface IvrStatics {
  total: number;
  answered: number;
  missed: number;
}

export interface IvrStatsGridProps {
  statics: IvrStatics;
}

export function IvrStatsGrid({ statics }: IvrStatsGridProps) {
  const stats = [
    {
      label: 'Total Logs Found',
      value: statics.total,
      color: 'text-brand-gold',
      bg: 'bg-brand-gold/5',
    },
    {
      label: 'Answered Calls',
      value: statics.answered,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/5',
    },
    {
      label: 'Missed Calls',
      value: statics.missed,
      color: 'text-red-500',
      bg: 'bg-red-500/5',
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat, sidx) => (
        <div
          key={sidx}
          className={`dark:bg-brand-dark-surface/65 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-white/8 ${stat.bg}`}
        >
          <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            {stat.label}
          </p>
          <p className={`mt-1.5 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
