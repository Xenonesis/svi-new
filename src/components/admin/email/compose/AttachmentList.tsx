'use client';

import { AnimatePresence, motion } from 'motion/react';
import { FileIcon, X } from 'lucide-react';
import type { EmailAttachment } from '../types';

interface AttachmentListProps {
  attachments: EmailAttachment[];
  onRemove: (index: number) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function AttachmentList({ attachments, onRemove }: AttachmentListProps) {
  return (
    <AnimatePresence>
      {attachments.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-b border-gray-100 px-6 py-3 dark:border-gray-800"
        >
          <div className="flex flex-wrap gap-2">
            {attachments.map((att, i) => (
              <motion.div
                key={`${att.name}-${i}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 py-1.5 pr-2 pl-3 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <FileIcon className="h-3.5 w-3.5 text-gray-400" />
                <span className="max-w-[160px] truncate text-xs text-gray-700 dark:text-gray-300">
                  {att.name}
                </span>
                <span className="font-mono text-[10px] text-gray-400">
                  {formatFileSize(att.size)}
                </span>
                <button
                  onClick={() => onRemove(i)}
                  className="ml-0.5 rounded p-0.5 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
