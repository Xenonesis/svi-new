'use client';

import { Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import type { Registration } from './types';

interface DeleteConfirmModalProps {
  reg: Registration;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export function DeleteConfirmModal({ reg, onConfirm, onCancel, loading }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 dark:bg-brand-dark-surface relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
        <div className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-brand-navy mb-2 font-serif text-lg font-semibold dark:text-white">
            Delete Registration
          </h3>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this registration?
          </p>
          <p className="mb-6 text-sm font-semibold text-gray-900 dark:text-white">
            {reg.name} {reg.last_name || ''} ({reg.email})
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
        </div>
      </motion.div>
    </div>
  );
}
