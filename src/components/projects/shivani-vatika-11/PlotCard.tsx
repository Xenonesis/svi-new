'use client';

import React from 'react';
import type { PlotData } from '@/src/data/shivaniVatika11Plots';
import { Compass, Maximize2, ShieldCheck } from 'lucide-react';

export interface PlotCardProps {
  plot: PlotData;
  onSelect: (plot: PlotData) => void;
}

const STATUS_CONFIG: Record<
  PlotData['status'],
  { label: string; dot: string; badgeClasses: string }
> = {
  AVAILABLE: {
    label: 'Available',
    dot: 'bg-emerald-400',
    badgeClasses: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  BOOKED: {
    label: 'Booked',
    dot: 'bg-rose-400',
    badgeClasses: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
  RESERVED: {
    label: 'Reserved',
    dot: 'bg-amber-400',
    badgeClasses: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
};

export function PlotCard({ plot, onSelect }: PlotCardProps): React.JSX.Element {
  const plotTitle =
    plot.plotNo.startsWith('A-') || plot.plotNo.startsWith('Shop-')
      ? plot.plotNo
      : `Plot #${plot.plotNo}`;
  const statusInfo = STATUS_CONFIG[plot.status];
  return (
    <button
      type="button"
      onClick={() => onSelect(plot)}
      aria-label={`${plotTitle} - ${plot.block} - ${plot.status}`}
      className="group relative flex w-full flex-col justify-between rounded-xl border border-white/10 bg-[#0c1019] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d4af37]/50 hover:shadow-lg hover:shadow-[#d4af37]/5 focus:ring-2 focus:ring-[#d4af37]/50 focus:outline-none active:scale-[0.99]"
    >
      {/* Top Header: Plot Label + Status Badge */}
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-heading text-base font-bold text-white transition-colors group-hover:text-[#d4af37]">
              {plotTitle}
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium tracking-wide text-gray-300">
              {plot.block}
            </span>
          </div>
          <span className="mt-0.5 text-[11px] text-gray-400">{plot.dimensions}</span>
        </div>

        {/* Status Badge */}
        <span
          data-testid="plot-card-status-badge"
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${statusInfo.badgeClasses}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
          {statusInfo.label}
        </span>
      </div>

      {/* Middle Specs: Area + Facing */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-xs text-gray-300">
        <div className="flex items-center gap-1.5">
          <Maximize2 className="h-3.5 w-3.5 text-[#d4af37]" />
          <span>
            {plot.sizeSqYd} Sq.Yd. / {plot.sizeSqYd} Gaj
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-[#d4af37]" />
          <span>{plot.facing}</span>
        </div>
      </div>

      {/* Footer: Road Width + Estimated Price */}
      <div className="mt-3 flex w-full items-center justify-between border-t border-white/5 pt-2.5 text-xs">
        <span className="text-[11px] text-gray-400">{plot.roadWidth}</span>
        <div className="flex items-center gap-1 text-right">
          <span className="text-[10px] text-gray-400 uppercase">Est.</span>
          <span className="font-semibold text-[#d4af37]">
            ₹{plot.priceEstimate.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </button>
  );
}
