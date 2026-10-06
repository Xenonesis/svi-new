'use client';

import React, { useEffect } from 'react';
import type { PlotData } from '@/src/data/shivaniVatika11Plots';
import {
  X,
  MessageCircle,
  Car,
  Maximize2,
  Compass,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export interface PlotDetailDrawerProps {
  plot: PlotData | null;
  onClose: () => void;
  onBookSiteVisit: (plot: PlotData) => void;
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

export function PlotDetailDrawer({
  plot,
  onClose,
  onBookSiteVisit,
}: PlotDetailDrawerProps): React.JSX.Element | null {
  useEffect(() => {
    if (!plot) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [plot, onClose]);

  if (!plot) {
    return null;
  }

  const plotTitle =
    plot.plotNo.startsWith('A-') || plot.plotNo.startsWith('Shop-')
      ? plot.plotNo
      : `Plot #${plot.plotNo}`;

  const statusInfo = STATUS_CONFIG[plot.status];

  const waMessage = `Namaste SVI Infra, I want to reserve Plot #${plot.plotNo} (${plot.sizeSqYd} Sq.Yds) in Shivani Vatika 11th. Please share allotment process.`;
  const waUrl = `https://wa.me/919218300589?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-label="Plot details dialog">
      {/* Backdrop overlay */}
      <div
        data-testid="drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plot-drawer-title"
        className="relative z-10 flex h-full w-full max-w-md flex-col justify-between overflow-y-auto border-l border-white/10 bg-[#0c1019] text-white shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#080b11]/95 px-6 py-4 backdrop-blur-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h2 id="plot-drawer-title" className="font-heading text-xl font-bold text-white">
                {plotTitle}
              </h2>
              <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-gray-300">
                {plot.block}
              </span>
            </div>
            <span className="mt-0.5 text-xs text-gray-400">
              Shivani Vatika 11th • Jaipur-Khatu Highway
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 space-y-6 px-6 py-5">
          {/* Status Alert Banner */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#080b11] p-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Current Allotment Status:</span>
              <span
                data-testid="plot-status-badge"
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase ${statusInfo.badgeClasses}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                {statusInfo.label}
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
          </div>

          {/* Specifications Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#d4af37]" />
              <h3 className="text-xs font-bold tracking-wider text-gray-300 uppercase">
                Demarcated Specifications
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Area */}
              <div className="rounded-xl border border-white/10 bg-[#080b11] p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Maximize2 className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span>Total Plot Area</span>
                </div>
                <div className="font-heading mt-1 text-base font-bold text-white">
                  {plot.sizeSqYd} Sq. Yds.
                </div>
                <div className="mt-0.5 text-[11px] text-gray-400">
                  {plot.sizeSqYd * 9} Sq. Ft. • {plot.sizeSqYd} Gaj
                </div>
              </div>

              {/* Dimensions */}
              <div className="rounded-xl border border-white/10 bg-[#080b11] p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span>Dimensions</span>
                </div>
                <div className="font-heading mt-1 text-base font-bold text-white">
                  {plot.dimensions}
                </div>
                <div className="mt-0.5 text-[11px] text-gray-400">Standard Demarcation</div>
              </div>

              {/* Road Width */}
              <div className="rounded-xl border border-white/10 bg-[#080b11] p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Car className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span>Road Width</span>
                </div>
                <div className="font-heading mt-1 text-base font-bold text-white">
                  {plot.roadWidth}
                </div>
                <div className="mt-0.5 text-[11px] text-gray-400">Direct Sector Access</div>
              </div>

              {/* Facing */}
              <div className="rounded-xl border border-white/10 bg-[#080b11] p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Compass className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span>Facing</span>
                </div>
                <div className="font-heading mt-1 text-base font-bold text-white">
                  {plot.facing}
                </div>
                <div className="mt-0.5 text-[11px] text-gray-400">Vastu-Compliant</div>
              </div>
            </div>
          </div>

          {/* Pricing Estimate & Milestone Structure */}
          <div className="rounded-2xl border border-[#d4af37]/30 bg-gradient-to-b from-[#d4af37]/10 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-gray-300 uppercase">
                  Estimated Deal Value
                </span>
                <div className="font-heading mt-0.5 flex items-center text-2xl font-bold text-[#d4af37]">
                  ₹{plot.priceEstimate.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold tracking-wider text-gray-300 uppercase">
                  Token Amount
                </span>
                <div className="font-heading mt-0.5 text-lg font-bold text-white">₹21,000</div>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-gray-300">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#d4af37]" />
              <span>
                <strong>Milestone Payment Schedule:</strong> Secure with ₹21,000 token booking.
                Balance structured transparently: 25% upon allotment agreement, subsequent milestone
                installments during sector development, and final payment at registry / possession.
              </span>
            </div>
          </div>
        </div>

        {/* Fixed Action Footer */}
        <div className="sticky bottom-0 z-20 space-y-2.5 border-t border-white/10 bg-[#080b11]/95 p-4 backdrop-blur-md">
          {/* Action 1: WhatsApp Reservation */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-[#20ba59] active:scale-[0.99]"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Reserve on WhatsApp</span>
          </a>

          {/* Action 2: Free Cab Site Visit */}
          <button
            type="button"
            onClick={() => onBookSiteVisit(plot)}
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c9a84c] px-4 py-2.5 font-bold text-[#080b11] shadow-lg shadow-amber-500/20 transition-all hover:from-[#e0be47] hover:to-[#d4af37] active:scale-[0.99]"
          >
            <Car className="h-5 w-5" />
            <span>Visit This Plot in Free Cab</span>
          </button>
        </div>
      </div>
    </div>
  );
}
