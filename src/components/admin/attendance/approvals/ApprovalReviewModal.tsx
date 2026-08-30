'use client';

import React from 'react';
import { clsx } from 'clsx';

interface ApprovalReviewModalProps {
  title: string;
  subtitle: string;
  reason: string;
  action: 'approved' | 'rejected';
  adminNote: string;
  setAdminNote: (note: string) => void;
  submittingReview: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ApprovalReviewModal({
  title,
  subtitle,
  reason,
  action,
  adminNote,
  setAdminNote,
  submittingReview,
  onClose,
  onConfirm,
}: ApprovalReviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
          <span className="font-semibold">Reason: </span>
          {reason}
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
            Admin Note / Remarks {action === 'rejected' && '(Optional)'}
          </label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder={
              action === 'approved'
                ? 'e.g. Approved as discussed. Safe travels!'
                : 'e.g. Please submit supporting document and re-apply.'
            }
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submittingReview}
            className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submittingReview}
            className={clsx(
              'cursor-pointer rounded-xl px-5 py-2 text-xs font-bold text-white shadow-xs transition-all',
              action === 'approved'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
            )}
          >
            {submittingReview ? 'Processing...' : `Confirm ${action}`}
          </button>
        </div>
      </div>
    </div>
  );
}
