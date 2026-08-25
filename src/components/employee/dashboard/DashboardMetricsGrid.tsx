'use client';

import React from 'react';
import { TrendingUp, ListTodo, Users, Compass } from 'lucide-react';
import type { DashboardData } from './types';

interface DashboardMetricsGridProps {
  metrics: DashboardData['metrics'] | undefined;
}

export function DashboardMetricsGrid({ metrics }: DashboardMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Weekly Hours
          </span>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </div>
        <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
          {metrics?.weekly_hours || 0}{' '}
          <span className="text-xs font-normal text-slate-400">hrs</span>
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Pending Tasks
          </span>
          <ListTodo className="h-4 w-4 text-amber-500" />
        </div>
        <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
          {metrics?.pending_tasks || 0}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Assigned Leads
          </span>
          <Users className="h-4 w-4 text-emerald-500" />
        </div>
        <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
          {metrics?.assigned_leads || 0}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Site Visits
          </span>
          <Compass className="h-4 w-4 text-purple-500" />
        </div>
        <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
          {metrics?.upcoming_site_visits || 0}
        </p>
      </div>
    </div>
  );
}
