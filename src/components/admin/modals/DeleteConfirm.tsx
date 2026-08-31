'use client';

import { motion } from 'motion/react';
import { Trash2, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/src/lib/supabase/types';

export interface DeleteConfirmProps {
  user?: Partial<UserProfile> | null;
  title?: string;
  itemName?: string;
  itemType?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  loading: boolean;
}

export function DeleteConfirm({
  user,
  title,
  itemName,
  itemType = 'record',
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
  loading,
}: DeleteConfirmProps) {
  const displayName = itemName || user?.full_name || 'this item';
  const modalTitle =
    title ||
    (user ? 'Delete User?' : `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}?`);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="dark:border-brand-gold/20 dark:bg-brand-dark-surface relative w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-2xl transition-colors duration-300"
      >
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-red-500/50" />
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
        <h3 className="text-brand-navy mb-2 font-serif text-lg tracking-tight transition-colors duration-300 dark:text-white">
          {modalTitle}
        </h3>
        <p className="mb-6 font-sans text-sm text-gray-500 transition-colors duration-300 dark:text-gray-400">
          {description || (
            <>
              This will permanently delete{' '}
              <span className="text-brand-navy font-semibold dark:text-white">{displayName}</span>{' '}
              and all associated data. This action cannot be undone.
            </>
          )}
        </p>
        <div className="flex gap-3 font-sans">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-gray-100 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-lg transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-75"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
