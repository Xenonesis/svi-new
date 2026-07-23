import React from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

interface NotificationBulkActionsProps {
  selectedIds: Set<string>;
  setSelectedIds: (val: Set<string>) => void;
  bulkActionLoading: boolean;
  bulkMarkAsRead: () => void;
  bulkMarkAsUnread: () => void;
  bulkDelete: () => void;
}

export function NotificationBulkActions({
  selectedIds,
  setSelectedIds,
  bulkActionLoading,
  bulkMarkAsRead,
  bulkMarkAsUnread,
  bulkDelete,
}: NotificationBulkActionsProps) {
  if (selectedIds.size === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="border-brand-gold/30 bg-brand-gold/5 mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
    >
      <span className="text-sm text-gray-700 dark:text-gray-200">
        <span className="font-bold">{selectedIds.size}</span> selected
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={bulkMarkAsRead}
          disabled={bulkActionLoading}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-[10px] font-bold tracking-widest text-gray-700 uppercase transition-colors hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-emerald-400 dark:hover:text-emerald-400"
        >
          <Eye size={12} /> Mark Read
        </button>
        <button
          onClick={bulkMarkAsUnread}
          disabled={bulkActionLoading}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-[10px] font-bold tracking-widest text-gray-700 uppercase transition-colors hover:border-amber-500 hover:text-amber-600 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-amber-400 dark:hover:text-amber-400"
        >
          <EyeOff size={12} /> Mark Unread
        </button>
        <button
          onClick={bulkDelete}
          disabled={bulkActionLoading}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-[10px] font-bold tracking-widest text-gray-700 uppercase transition-colors hover:border-red-500 hover:text-red-600 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-red-400 dark:hover:text-red-400"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
      <button
        onClick={() => setSelectedIds(new Set())}
        className="ml-auto text-[10px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        Clear
      </button>
    </motion.div>
  );
}
