'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { WorkLogItem } from './types';

interface DailyLogsViewProps {
  workLogs: WorkLogItem[];
  onOpenSubmitModal: () => void;
}

export function DailyLogsView({ workLogs, onOpenSubmitModal }: DailyLogsViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Your submitted shift reports</p>
        <button
          onClick={onOpenSubmitModal}
          className="flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-purple-500"
        >
          <Plus className="h-3.5 w-3.5" /> Submit Log
        </button>
      </div>

      {workLogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {workLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{format(parseISO(log.date), 'EEEE, d MMMM yyyy')}</span>
                <span className="font-mono text-[11px]">
                  {format(parseISO(log.created_at), 'hh:mm a')}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-800 dark:text-slate-200">{log.summary_text}</p>

              <div className="mt-3 flex gap-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800">
                <span>📞 {log.client_interactions_count} Client Calls</span>
                <span>🏢 {log.site_visits_conducted_count} Visits</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 dark:border-slate-800">
          No daily work logs submitted yet.
        </div>
      )}
    </div>
  );
}
