'use client';

import React from 'react';
import { History, Play, StopCircle, CheckCircle2, FileText, Compass, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import type { DashboardData } from './types';

interface DashboardActivityFeedCardProps {
  activities: DashboardData['recent_activities'] | undefined;
}

export function DashboardActivityFeedCard({ activities }: DashboardActivityFeedCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'punch_in':
        return <Play className="h-3 w-3 fill-current text-emerald-500" />;
      case 'punch_out':
        return <StopCircle className="h-3 w-3 text-blue-500" />;
      case 'task_completed':
        return <CheckCircle2 className="h-3 w-3 text-amber-500" />;
      case 'site_visit':
        return <Compass className="h-3 w-3 text-purple-500" />;
      case 'work_log':
        return <FileText className="h-3 w-3 text-teal-500" />;
      default:
        return <Clock className="h-3 w-3 text-slate-400" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'punch_in':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'punch_out':
        return 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'task_completed':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'site_visit':
        return 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'work_log':
        return 'border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400';
      default:
        return 'border-slate-200 bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur-xl transition-all sm:p-6 dark:border-white/10 dark:bg-slate-900/80">
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Today&apos;s Shift Activity
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Chronological log of today&apos;s actions
            </p>
          </div>
        </div>
      </div>

      {/* Feed or Empty State */}
      {!activities || activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-5 text-center dark:border-slate-800 dark:bg-slate-950/20">
          <Clock className="h-5 w-5 text-slate-400" />
          <p className="mt-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            No shift actions recorded yet today
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Punch in or complete assignments to populate your timeline.
          </p>
        </div>
      ) : (
        <div className="relative space-y-3 pl-2 before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
          {activities.map((act) => (
            <div key={act.id} className="relative flex items-start gap-3 pl-2">
              <div
                className={clsx(
                  'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border shadow-xs',
                  getBorderColor(act.type)
                )}
              >
                {getIcon(act.type)}
              </div>
              <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-white/5 dark:bg-slate-950/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{act.title}</p>
                  <span className="shrink-0 font-mono text-[10px] font-medium text-slate-400">
                    {act.time}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {act.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
