'use client';

import React from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { TimesheetRecord } from './types';

interface TimesheetWorkLogModalProps {
  record: TimesheetRecord | null;
  onClose: () => void;
}

export function TimesheetWorkLogModal({ record, onClose }: TimesheetWorkLogModalProps) {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="dark:bg-brand-dark-surface w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-brand-navy font-serif text-base font-bold dark:text-white">
            Daily Work Summary
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Submitted by{' '}
          <strong className="text-gray-800 dark:text-gray-200">{record.full_name}</strong> for{' '}
          {format(new Date(record.date), 'dd MMMM yyyy')}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 dark:bg-purple-500/10">
            <span className="text-[10px] font-bold text-purple-600 uppercase dark:text-purple-400">
              Client Calls
            </span>
            <div className="text-xl font-black text-purple-700 dark:text-purple-300">
              {record.work_log.client_calls}
            </div>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 dark:bg-rose-500/10">
            <span className="text-[10px] font-bold text-rose-600 uppercase dark:text-rose-400">
              Site Visits
            </span>
            <div className="text-xl font-black text-rose-700 dark:text-rose-300">
              {record.work_log.site_visits}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <span className="block text-xs font-bold text-gray-700 dark:text-gray-300">
            Shift Activity Summary
          </span>
          <div className="mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-xs leading-relaxed text-gray-800 dark:border-white/10 dark:bg-[#111118] dark:text-gray-200">
            {record.work_log.summary || 'No summary text provided.'}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-brand-navy hover:bg-brand-navy-light cursor-pointer rounded-xl px-5 py-2 text-xs font-bold text-white transition-all dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
