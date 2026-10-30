'use client';

import type { ReactElement } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

interface PlotsAllotmentsTabsV2Props {
  activeTab: 'pending' | 'active';
  onTabChange: (tab: 'pending' | 'active') => void;
  candidatesCount: number;
  allotmentsCount: number;
}

export function PlotsAllotmentsTabsV2({
  activeTab,
  onTabChange,
  candidatesCount,
  allotmentsCount,
}: PlotsAllotmentsTabsV2Props): ReactElement {
  return (
    <div className="mb-6 flex items-center gap-8 border-b border-slate-200/80 text-sm font-bold dark:border-white/[0.08]">
      <button
        type="button"
        onClick={() => onTabChange('pending')}
        className={`relative flex items-center gap-2.5 pb-3.5 transition-all ${
          activeTab === 'pending'
            ? 'text-slate-900 dark:text-[#E5B842]'
            : 'text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-slate-200'
        }`}
      >
        <Clock
          className={`h-4 w-4 stroke-[2.2] ${
            activeTab === 'pending'
              ? 'text-slate-900 dark:text-[#E5B842]'
              : 'text-slate-400 dark:text-[#94A3B8]'
          }`}
        />
        <span className="tracking-wide">Pending Approvals</span>
        {candidatesCount > 0 && (
          <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-[#FF9800] px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
            {candidatesCount}
          </span>
        )}
        {activeTab === 'pending' && (
          <span className="absolute right-0 bottom-0 left-0 h-[2.5px] rounded-full bg-slate-900 dark:bg-[#E5B842]" />
        )}
      </button>

      <button
        type="button"
        onClick={() => onTabChange('active')}
        className={`relative flex items-center gap-2.5 pb-3.5 transition-all ${
          activeTab === 'active'
            ? 'text-slate-900 dark:text-[#E5B842]'
            : 'text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-slate-200'
        }`}
      >
        <CheckCircle2
          className={`h-4 w-4 stroke-[2.2] ${
            activeTab === 'active'
              ? 'text-slate-900 dark:text-[#E5B842]'
              : 'text-slate-400 dark:text-[#94A3B8]'
          }`}
        />
        <span className="tracking-wide">Active Allotments</span>
        <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-slate-200/90 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-[#253246] dark:text-[#CBD5E1]">
          {allotmentsCount}
        </span>
        {activeTab === 'active' && (
          <span className="absolute right-0 bottom-0 left-0 h-[2.5px] rounded-full bg-slate-900 dark:bg-[#E5B842]" />
        )}
      </button>
    </div>
  );
}
