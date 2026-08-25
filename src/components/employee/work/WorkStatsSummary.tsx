'use client';

import React from 'react';
import { ListTodo, Compass, Users, FileText } from 'lucide-react';

interface WorkStatsSummaryProps {
  pendingTasksCount: number;
  upcomingVisitsCount: number;
  assignedLeadsCount: number;
  logsSubmittedCount: number;
}

export function WorkStatsSummary({
  pendingTasksCount,
  upcomingVisitsCount,
  assignedLeadsCount,
  logsSubmittedCount,
}: WorkStatsSummaryProps) {
  const items = [
    {
      label: 'Pending Tasks',
      value: pendingTasksCount,
      icon: ListTodo,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Site Visits',
      value: upcomingVisitsCount,
      icon: Compass,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Active Leads',
      value: assignedLeadsCount,
      icon: Users,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Shift Logs',
      value: logsSubmittedCount,
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${item.bg}`}
            >
              <Icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
