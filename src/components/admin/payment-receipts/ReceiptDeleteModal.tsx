import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { SavedReceipt } from './ReceiptTypes';

interface ReceiptDeleteModalProps {
  deleteTarget: SavedReceipt | null;
  setDeleteTarget: (val: SavedReceipt | null) => void;
  deleteLoading: boolean;
  handleDelete: () => void;
}

export function ReceiptDeleteModal({
  deleteTarget,
  setDeleteTarget,
  deleteLoading,
  handleDelete,
}: ReceiptDeleteModalProps) {
  return (
    <AnimatePresence>
      {deleteTarget && (
        <motion.div
          key="delete-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="dark:border-brand-gold/20 dark:bg-brand-dark-surface relative w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-2xl transition-colors duration-300"
          >
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-red-500/50" />
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
            <h3 className="text-brand-navy mb-2 font-serif text-lg tracking-tight transition-colors duration-300 dark:text-white">
              Delete Receipt?
            </h3>
            <p className="mb-6 font-sans text-xs text-gray-500 transition-colors duration-300 dark:text-gray-400">
              Are you sure you want to permanently delete receipt number{' '}
              <strong className="text-red-500">{deleteTarget.form_data?.receiptNo}</strong>{' '}
              generated for <strong>{deleteTarget.form_data?.name}</strong>? This action is
              irreversible.
            </p>
            <div className="flex gap-3 font-sans">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-gray-100 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-lg transition-all hover:bg-red-500"
              >
                {deleteLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
