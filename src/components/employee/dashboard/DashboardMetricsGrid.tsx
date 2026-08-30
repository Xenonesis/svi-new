'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, ListTodo, Users, Compass, ArrowUpRight } from 'lucide-react';
import type { DashboardData } from './types';

interface DashboardMetricsGridProps {
  metrics: DashboardData['metrics'] | undefined;
}

export function DashboardMetricsGrid({ metrics }: DashboardMetricsGridProps) {
  const weeklyHours = metrics?.weekly_hours ?? metrics?.hours_logged_this_week ?? 0;
  const pendingTasks = metrics?.pending_tasks ?? metrics?.pending_tasks_count ?? 0;
  const assignedLeads = metrics?.assigned_leads ?? metrics?.pending_leads_count ?? 0;
  const siteVisits = metrics?.upcoming_site_visits ?? metrics?.active_site_visits_count ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Weekly Hours Card */}
      <Link
        href="/employee/attendance/history"
        className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm transition-all hover:border-blue-500/40 hover:shadow-md active:scale-[0.99] dark:border-white/10 dark:bg-slate-900/80"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Weekly Hours
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-transform group-hover:scale-110 dark:text-blue-400">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <p className="font-mono text-2xl font-black tracking-tight text-slate-900 tabular-nums dark:text-white">
            {weeklyHours}
          </p>
          <span className="text-xs font-medium text-slate-400">hrs</span>
        </div>
        <p className="mt-1 flex items-center gap-0.5 text-[10px] font-medium text-slate-400 group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-blue-400">
          <span>Target 45h/wk</span>
          <ArrowUpRight className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </p>
      </Link>

      {/* Pending Tasks Card */}
      <Link
        href="/employee/work?tab=tasks"
        className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm transition-all hover:border-amber-500/40 hover:shadow-md active:scale-[0.99] dark:border-white/10 dark:bg-slate-900/80"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Pending Tasks
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 transition-transform group-hover:scale-110 dark:text-amber-400">
            <ListTodo className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <p className="font-mono text-2xl font-black tracking-tight text-slate-900 tabular-nums dark:text-white">
            {pendingTasks}
          </p>
          <span className="text-xs font-medium text-slate-400">active</span>
        </div>
        <p className="mt-1 flex items-center gap-0.5 text-[10px] font-medium text-slate-400 group-hover:text-amber-500 dark:text-slate-500 dark:group-hover:text-amber-400">
          <span>View assignments</span>
          <ArrowUpRight className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </p>
      </Link>

      {/* Assigned Leads Card */}
      <Link
        href="/employee/work?tab=leads"
        className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm transition-all hover:border-emerald-500/40 hover:shadow-md active:scale-[0.99] dark:border-white/10 dark:bg-slate-900/80"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Assigned Leads
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110 dark:text-emerald-400">
            <Users className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <p className="font-mono text-2xl font-black tracking-tight text-slate-900 tabular-nums dark:text-white">
            {assignedLeads}
          </p>
          <span className="text-xs font-medium text-slate-400">leads</span>
        </div>
        <p className="mt-1 flex items-center gap-0.5 text-[10px] font-medium text-slate-400 group-hover:text-emerald-500 dark:text-slate-500 dark:group-hover:text-emerald-400">
          <span>Customer pipeline</span>
          <ArrowUpRight className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </p>
      </Link>

      {/* Site Visits Card */}
      <Link
        href="/employee/work?tab=site-visits"
        className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm transition-all hover:border-purple-500/40 hover:shadow-md active:scale-[0.99] dark:border-white/10 dark:bg-slate-900/80"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Site Visits
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 transition-transform group-hover:scale-110 dark:text-purple-400">
            <Compass className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <p className="font-mono text-2xl font-black tracking-tight text-slate-900 tabular-nums dark:text-white">
            {siteVisits}
          </p>
          <span className="text-xs font-medium text-slate-400">visits</span>
        </div>
        <p className="mt-1 flex items-center gap-0.5 text-[10px] font-medium text-slate-400 group-hover:text-purple-500 dark:text-slate-500 dark:group-hover:text-purple-400">
          <span>Field inspections</span>
          <ArrowUpRight className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </p>
      </Link>
    </div>
  );
}
