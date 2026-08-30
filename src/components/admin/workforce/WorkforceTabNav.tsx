'use client';

import React from 'react';
import { TABS, type WorkforceTab } from './types';

interface WorkforceTabNavProps {
  activeTab: WorkforceTab;
  pendingApprovalsCount: number;
  onTabChange: (tabId: WorkforceTab) => void;
}

export function WorkforceTabNav({
  activeTab,
  pendingApprovalsCount,
  onTabChange,
}: WorkforceTabNavProps) {
  return (
    <div className="border-b border-gray-200/80 pb-px dark:border-white/10">
      <div className="flex gap-2 overflow-x-auto pb-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all ${
                isActive
                  ? 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold border shadow-md'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge && pendingApprovalsCount > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
