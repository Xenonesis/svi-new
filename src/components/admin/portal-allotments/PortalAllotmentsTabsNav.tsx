import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export interface PortalAllotmentsTabsNavProps {
  activeTab: 'pending' | 'active';
  onTabChange: (tab: 'pending' | 'active') => void;
  candidatesCount: number;
  activeAllotmentsCount: number;
}

export function PortalAllotmentsTabsNav({
  activeTab,
  onTabChange,
  candidatesCount,
  activeAllotmentsCount,
}: PortalAllotmentsTabsNavProps): React.JSX.Element {
  return (
    <div className="mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={() => onTabChange('pending')}
        className={`relative flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all ${
          activeTab === 'pending'
            ? 'border-brand-gold dark:text-brand-gold border-b-2 text-[#0f2942]'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        <Clock className="h-4 w-4" />
        Pending Approvals
        {candidatesCount > 0 && (
          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
            {candidatesCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onTabChange('active')}
        className={`relative flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all ${
          activeTab === 'active'
            ? 'border-brand-gold dark:text-brand-gold border-b-2 text-[#0f2942]'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        <CheckCircle2 className="h-4 w-4" />
        Active Allotments
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-gray-700 dark:text-gray-300">
          {activeAllotmentsCount}
        </span>
      </button>
    </div>
  );
}
