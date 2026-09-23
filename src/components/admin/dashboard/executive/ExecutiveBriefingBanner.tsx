'use client';

import { Sparkles, FileDown, Search } from 'lucide-react';

export interface ExecutiveBriefingBannerProps {
  collectionsTotal: number;
  hotLeadsCount: number;
  onDutyCount: number;
  onOpenCommand: () => void;
  onExportPdf: () => void;
}

export function ExecutiveBriefingBanner({
  collectionsTotal,
  hotLeadsCount,
  onDutyCount,
  onOpenCommand,
  onExportPdf,
}: ExecutiveBriefingBannerProps) {
  const formattedCollections = (collectionsTotal / 100000).toFixed(1);

  return (
    <div className="border-brand-gold/25 relative mb-8 overflow-hidden rounded-2xl border bg-gradient-to-r from-[#0d131f] via-[#090d16] to-[#0d131f] p-6 shadow-xl backdrop-blur-xl">
      {/* Radial ambient glow */}
      <div
        className="bg-brand-gold/10 pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        className="bg-brand-gold/5 pointer-events-none absolute -right-24 -bottom-24 h-56 w-56 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-brand-gold/15 text-brand-gold flex h-6 w-6 items-center justify-center rounded-lg">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-brand-gold text-xs font-semibold tracking-wider uppercase">
              AI Daily Executive Pulse
            </span>
          </div>
          <h2 className="font-serif text-lg font-medium text-white">
            ₹{formattedCollections}L collected this cycle across projects with {hotLeadsCount} hot
            leads requiring triage.
          </h2>
          <p className="text-xs text-gray-400">
            {onDutyCount} team members actively deployed today. All core operational indicators are
            within expected parameters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenCommand}
            aria-label="Quick search (Ctrl+K)"
            className="group hover:border-brand-gold/40 focus:border-brand-gold/50 focus:ring-brand-gold/20 flex w-full items-center gap-3 rounded-full border border-white/10 bg-[#090d16]/80 px-4 py-2 text-xs text-gray-400 shadow-inner backdrop-blur-md transition-all hover:bg-[#0e1422] hover:text-gray-200 focus:ring-2 focus:outline-none sm:w-64"
          >
            <Search className="group-hover:text-brand-gold h-3.5 w-3.5 text-gray-400 transition-colors" />
            <span className="font-normal text-gray-400 transition-colors group-hover:text-gray-200">
              Quick search... (Ctrl+K)
            </span>
          </button>
          <button
            type="button"
            onClick={onExportPdf}
            className="border-brand-gold/40 bg-brand-gold/15 text-brand-gold shadow-brand-gold/10 hover:bg-brand-gold/25 focus:ring-brand-gold/50 flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-lg transition-colors focus:ring-2 focus:outline-none"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Export Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
