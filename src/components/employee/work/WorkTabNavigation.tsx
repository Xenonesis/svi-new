'use client';

import React from 'react';
import { ListTodo, Compass, Users, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import type { WorkTabType } from './types';

interface WorkTabNavigationProps {
  activeTab: WorkTabType;
  onTabChange: (tab: WorkTabType) => void;
  counts?: {
    tasks?: number;
    siteVisits?: number;
    leads?: number;
    logs?: number;
  };
}

export function WorkTabNavigation({ activeTab, onTabChange, counts }: WorkTabNavigationProps) {
  const tabs: Array<{
    id: WorkTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    { id: 'tasks', label: 'Tasks', icon: ListTodo, count: counts?.tasks },
    { id: 'site-visits', label: 'Site Visits', icon: Compass, count: counts?.siteVisits },
    { id: 'leads', label: 'Leads', icon: Users, count: counts?.leads },
    { id: 'logs', label: 'Daily Logs', icon: FileText, count: counts?.logs },
  ];

  return (
    <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1.5 dark:border-slate-800 dark:bg-slate-900/60">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'flex items-center justify-center gap-1.5 rounded-xl px-1 py-2 text-xs font-semibold transition-all sm:gap-2',
              isActive
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={clsx(
                  'py-0.2 rounded-full px-1.5 text-[10px] font-bold',
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
