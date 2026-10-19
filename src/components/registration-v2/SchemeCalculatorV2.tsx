'use client';

import React from 'react';
import { Calculator, Ruler, Calendar, Sparkles, Clock, CheckCircle2, Info } from 'lucide-react';
import { calculateSchemeDetails } from './schemeCalculator';
import type { SchemeCalculatorV2Props } from './types';

export type { SchemeCalculatorV2Props };

export function SchemeCalculatorV2({
  size,
  project,
  plan,
  className = '',
}: SchemeCalculatorV2Props) {
  const details = calculateSchemeDetails(size, project, plan);
  const formattedToken = details.tokenAmount.toLocaleString('en-IN');

  return (
    <div
      role="region"
      aria-label="Live Scheme Breakdown & Token Estimator"
      className={`border-brand-gold/30 ring-brand-gold/20 relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-950 via-slate-900 to-[#0b0c10] p-5 text-white shadow-2xl ring-1 backdrop-blur-xl sm:p-6 ${className}`}
    >
      {/* Luxury Ambient Gold Glow */}
      <div
        className="bg-brand-gold/15 pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full blur-2xl"
        aria-hidden="true"
      />
      <div
        className="bg-brand-gold/10 pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full blur-2xl"
        aria-hidden="true"
      />

      {/* Subtle Geometric Security Mesh Overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] opacity-10"
        aria-hidden="true"
      />

      {/* Card Content */}
      <div className="relative z-10 space-y-5">
        {/* Header: LIVE SCHEME BREAKDOWN & TOKEN ESTIMATOR with Calculator icon and Gold chip */}
        <div className="border-brand-gold/20 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="border-brand-gold/50 bg-brand-gold/15 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-[0_0_12px_rgba(212,175,55,0.25)]">
              <Calculator className="text-brand-gold h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-brand-gold text-[10px] font-bold tracking-widest uppercase">
                Interactive Estimate
              </p>
              <h3 className="text-xs font-extrabold tracking-wider text-slate-100 uppercase sm:text-sm">
                LIVE SCHEME BREAKDOWN &amp; TOKEN ESTIMATOR
              </h3>
            </div>
          </div>

          {/* Gold Chip */}
          <div
            className="border-brand-gold/40 bg-brand-gold/15 text-brand-gold flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase shadow-[0_0_10px_rgba(212,175,55,0.2)]"
            title="Official SVI Allotment Guarantee"
          >
            <Sparkles className="text-brand-gold h-3 w-3" aria-hidden="true" />
            <span>Official Scheme</span>
          </div>
        </div>

        {/* Highlight Banner: Registration Token Fee */}
        <div className="border-brand-gold/30 rounded-xl border bg-slate-900/80 p-4 shadow-inner">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
              Registration Token Fee
            </span>
            <span className="text-[11px] font-medium text-emerald-400">
              100% Adjustable Against Plot Cost
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-brand-gold text-2xl font-bold tracking-tight sm:text-3xl">
              ₹{formattedToken}
            </span>
            <span className="text-xs font-medium text-slate-400">INR (All-inclusive)</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Plot Dimensions */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 transition-colors hover:border-slate-700">
            <div className="flex items-center gap-2 text-slate-400">
              <Ruler className="text-brand-gold h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold tracking-wider uppercase">
                Plot Dimensions
              </span>
            </div>
            <p className="mt-1.5 text-sm font-bold text-white">
              {details.sqYards.toLocaleString('en-IN')} Sq. Yards
            </p>
            <p className="text-xs text-slate-400">
              ({details.sqFeet.toLocaleString('en-IN')} Sq. Ft)
            </p>
          </div>

          {/* Payment Term */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 transition-colors hover:border-slate-700">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="text-brand-gold h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold tracking-wider uppercase">Payment Term</span>
            </div>
            <p className="mt-1.5 text-sm font-bold text-white">{details.planDescription}</p>
            <p className="text-xs text-slate-400">Installment Schedule</p>
          </div>

          {/* Lottery Allotment Schedule */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 transition-colors hover:border-slate-700 sm:col-span-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="text-brand-gold h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold tracking-wider uppercase">
                Lottery Allotment Schedule
              </span>
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Upcoming Phase Draw &amp; Priority Queue
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Verified transparent computerized lottery draw allotment
            </p>
          </div>
        </div>

        {/* Subtle Disclaimer */}
        <div className="border-t border-slate-800/80 pt-3">
          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
            <Info className="text-brand-gold mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              Token amount confirms lottery participation and is fully adjustable against plot cost.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SchemeCalculatorV2;
