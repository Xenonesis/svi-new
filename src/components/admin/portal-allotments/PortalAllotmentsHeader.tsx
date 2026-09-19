import React from 'react';
import { BookOpen, Loader2, Plus, ShieldCheck } from 'lucide-react';

export interface PortalAllotmentsHeaderProps {
  title: React.ReactNode;
  subtitle: string;
  activeAccountsCount: number;
  onOpenOverallLedger: () => void;
  activeTab: 'pending' | 'active';
  candidatesCount: number;
  onApproveAll: () => void;
  isApprovingAll: boolean;
  onAddAllotment: () => void;
  addAllotmentLabel: string;
}

export function PortalAllotmentsHeader({
  title,
  subtitle,
  activeAccountsCount,
  onOpenOverallLedger,
  activeTab,
  candidatesCount,
  onApproveAll,
  isApprovingAll,
  onAddAllotment,
  addAllotmentLabel,
}: PortalAllotmentsHeaderProps): React.JSX.Element {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-brand-navy mb-1.5 font-serif text-3xl font-bold tracking-tight dark:text-white">
          {title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onOpenOverallLedger}
          aria-label="Open Overall Ledger"
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <BookOpen className="text-brand-gold h-4 w-4" />
          <span>Overall Ledger</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-gray-700 dark:text-gray-300">
            {activeAccountsCount}
          </span>
        </button>

        {activeTab === 'pending' && candidatesCount > 0 && (
          <button
            type="button"
            onClick={onApproveAll}
            disabled={isApprovingAll}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
          >
            {isApprovingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Approving All...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Approve All ({candidatesCount})
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onAddAllotment}
          aria-label="Create Allotment"
          className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          {addAllotmentLabel}
        </button>
      </div>
    </div>
  );
}
