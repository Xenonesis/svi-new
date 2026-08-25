'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Loader2 } from 'lucide-react';

interface PunchOutWorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  workSummary: string;
  onWorkSummaryChange: (val: string) => void;
  clientCount: number;
  onClientCountChange: (val: number) => void;
  visitCount: number;
  onVisitCountChange: (val: number) => void;
  onConfirmPunchOut: () => Promise<void>;
  punching: boolean;
}

export function PunchOutWorkLogModal({
  isOpen,
  onClose,
  workSummary,
  onWorkSummaryChange,
  clientCount,
  onClientCountChange,
  visitCount,
  onVisitCountChange,
  onConfirmPunchOut,
  punching,
}: PunchOutWorkLogModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Shift Punch Out Summary
                </h3>
                <p className="text-xs text-slate-500">
                  Wrap up today&apos;s shift with a quick work log
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Today&apos;s Work Highlights (Optional)
                </label>
                <textarea
                  value={workSummary}
                  onChange={(e) => onWorkSummaryChange(e.target.value)}
                  placeholder="Briefly describe what you completed today..."
                  rows={3}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Client Calls / Interactions
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={clientCount}
                    onChange={(e) =>
                      onClientCountChange(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Site Visits Conducted
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={visitCount}
                    onChange={(e) => onVisitCountChange(Math.max(0, parseInt(e.target.value) || 0))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmPunchOut}
                disabled={punching}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {punching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm & Punch Out'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
