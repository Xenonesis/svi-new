'use client';

import Link from 'next/link';
import { ArrowLeft, X, Filter } from 'lucide-react';

interface CrossNavReturnBannerProps {
  searchQuery: string;
  onClear: () => void;
  returnHref?: string;
  returnLabel?: string;
  recordTypeLabel?: string;
}

export function CrossNavReturnBanner({
  searchQuery,
  onClear,
  returnHref = '/admin/plots-allotments',
  returnLabel = 'Return to Plots Allotments',
  recordTypeLabel = 'records',
}: CrossNavReturnBannerProps) {
  if (!searchQuery) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#111622] to-amber-500/5 px-4 py-2.5 text-xs shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-brand-gold flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/20">
          <Filter className="h-3 w-3" />
        </span>
        <span className="text-gray-400">Filtered {recordTypeLabel} for:</span>
        <span className="rounded-md border border-amber-500/30 bg-black/40 px-2 py-0.5 font-mono font-medium text-amber-200">
          {searchQuery}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={returnHref}
          className="text-brand-gold inline-flex items-center gap-1.5 font-medium underline underline-offset-4 transition-colors hover:text-amber-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {returnLabel}
        </Link>
        <button
          onClick={onClear}
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Clear search filter"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
