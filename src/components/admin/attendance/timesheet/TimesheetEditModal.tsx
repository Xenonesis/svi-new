'use client';

import React from 'react';
import type { TimesheetRecord } from './types';

interface TimesheetEditModalProps {
  editingRecord: TimesheetRecord | null;
  editStatus: 'present' | 'absent' | 'half_day' | 'leave';
  setEditStatus: (status: 'present' | 'absent' | 'half_day' | 'leave') => void;
  editNotes: string;
  setEditNotes: (notes: string) => void;
  submittingEdit: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function TimesheetEditModal({
  editingRecord,
  editStatus,
  setEditStatus,
  editNotes,
  setEditNotes,
  submittingEdit,
  onClose,
  onSave,
}: TimesheetEditModalProps) {
  if (!editingRecord) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="dark:bg-brand-dark-surface w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10">
        <h3 className="text-brand-navy font-serif text-base font-bold dark:text-white">
          Manual Attendance Adjustment
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Staff:{' '}
          <strong className="text-gray-800 dark:text-gray-200">{editingRecord.full_name}</strong> •
          Date: {editingRecord.date}
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-gray-300">
              Attendance Status
            </label>
            <select
              value={editStatus}
              onChange={(e) => {
                const val = e.target.value;
                if (
                  val === 'present' ||
                  val === 'absent' ||
                  val === 'half_day' ||
                  val === 'leave'
                ) {
                  setEditStatus(val);
                }
              }}
              className="focus:border-brand-gold focus:ring-brand-gold/30 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-800 transition-all focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-gray-200"
            >
              <option value="present">Present</option>
              <option value="half_day">Half Day</option>
              <option value="leave">On Leave</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-gray-300">
              Admin Audit Remarks / Reason
            </label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="e.g. Biometric system delay, marked manually after verification."
              rows={3}
              className="focus:border-brand-gold focus:ring-brand-gold/30 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-800 transition-all focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-gray-200"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={submittingEdit}
            className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={submittingEdit}
            className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy cursor-pointer rounded-xl px-5 py-2 text-xs font-bold shadow-xs transition-all disabled:opacity-50"
          >
            {submittingEdit ? 'Saving...' : 'Save Adjustments'}
          </button>
        </div>
      </div>
    </div>
  );
}
