'use client';

import { motion } from 'motion/react';
import { RefreshCw, Trash2 } from 'lucide-react';
import type { SavedAllotment } from './types';

interface AllotmentDeleteModalProps {
  target: SavedAllotment | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AllotmentDeleteModal({
  target,
  loading,
  onCancel,
  onConfirm,
}: AllotmentDeleteModalProps) {
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="dark:bg-brand-dark-surface relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10"
      >
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Delete Allotment Record
        </h3>
        <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
          Are you sure you want to permanently delete the allotment record with Ticket ID{' '}
          <strong className="text-red-500">{target.form_data?.ticketId}</strong> generated for{' '}
          <strong>{target.form_data?.clientName}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 uppercase hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white uppercase hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
