'use client';

import type { ReactElement } from 'react';
import { BookOpen, Plus } from 'lucide-react';

interface PlotsAllotmentsHeaderV2Props {
  activeAccountsCount: number;
  onOpenLedgersModal: () => void;
  onOpenCreateModal: () => void;
}

export function PlotsAllotmentsHeaderV2({
  activeAccountsCount,
  onOpenLedgersModal,
  onOpenCreateModal,
}: PlotsAllotmentsHeaderV2Props): ReactElement {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-normal tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          <span className="font-serif font-bold">Plots</span>{' '}
          <span className="font-serif text-amber-500 italic dark:text-[#E5B842]">Allotments</span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-[#8E9BAE]">
          Manage customer plot allotments and their payment schedules.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenLedgersModal}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white active:scale-[0.98] dark:border-white/[0.08] dark:bg-[#161D2C] dark:text-white dark:hover:border-white/[0.15] dark:hover:bg-[#1D263B]"
        >
          <BookOpen className="h-4 w-4 text-amber-500 dark:text-[#E5B842]" />
          <span className="font-medium">Overall Ledger</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {activeAccountsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98] dark:bg-[#E5B842] dark:hover:bg-[#f0c34e]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add Allotment</span>
        </button>
      </div>
    </div>
  );
}
