import { AnimatePresence, motion } from 'motion/react';
import { PenLine, Eye, EyeOff } from 'lucide-react';
import type { ForwardData, ReplyData } from '../types';
interface EmailHeaderProps {
  forwardData?: ForwardData | null;
  replyData?: ReplyData | null;
  draftSaved: boolean;
  previewMode: boolean;
  onTogglePreview: () => void;
}

export function EmailHeader({
  forwardData,
  replyData,
  draftSaved,
  previewMode,
  onTogglePreview,
}: EmailHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:gap-0 sm:px-6 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <PenLine className="text-brand-gold h-4 w-4" />
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">New Email</span>
          {forwardData && (
            <span className="ml-2 rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-700 uppercase dark:bg-violet-500/15 dark:text-violet-400">
              Forwarding
            </span>
          )}
          {replyData && (
            <span className="ml-2 rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-700 uppercase dark:bg-blue-500/15 dark:text-blue-400">
              Replying
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <AnimatePresence>
          {draftSaved && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-500"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> saved
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={onTogglePreview}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            previewMode
              ? 'bg-brand-gold/10 text-brand-gold'
              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-400'
          }`}
        >
          {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{previewMode ? 'Edit' : 'Preview'}</span>
        </button>
      </div>
    </div>
  );
}
