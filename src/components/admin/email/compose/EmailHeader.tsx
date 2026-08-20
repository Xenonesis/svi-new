import { AnimatePresence, motion } from 'motion/react';
import { PenLine, Eye, EyeOff, CornerUpLeft, Forward, X } from 'lucide-react';
import type { ForwardData, ReplyData } from '../types';

interface EmailHeaderProps {
  forwardData?: ForwardData | null;
  replyData?: ReplyData | null;
  hasQuoted?: boolean;
  draftSaved: boolean;
  previewMode: boolean;
  onTogglePreview: () => void;
  onClearContext?: () => void;
}

export function EmailHeader({
  forwardData,
  replyData,
  hasQuoted,
  draftSaved,
  previewMode,
  onTogglePreview,
  onClearContext,
}: EmailHeaderProps) {
  const isReply = !!replyData || (!!hasQuoted && !forwardData);
  const isForward = !!forwardData;

  return (
    <div className="flex flex-col justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:gap-0 sm:px-6 dark:border-gray-800">
      <div className="flex flex-wrap items-center gap-3">
        {isReply ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <CornerUpLeft className="h-4 w-4" />
          </div>
        ) : isForward ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
            <Forward className="h-4 w-4" />
          </div>
        ) : (
          <div className="bg-brand-gold/10 text-brand-gold flex h-7 w-7 items-center justify-center rounded-lg">
            <PenLine className="h-4 w-4" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {isReply ? 'Reply to Email' : isForward ? 'Forward Email' : 'New Email'}
          </span>

          {replyData && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 py-0.5 pr-1.5 pl-2 text-[11px] font-medium text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              <span className="max-w-[200px] truncate sm:max-w-[300px]">
                {replyData.originalFrom || replyData.to}
              </span>
              {onClearContext && (
                <button
                  type="button"
                  onClick={onClearContext}
                  className="rounded-full p-0.5 hover:bg-blue-200/60 dark:hover:bg-blue-500/20"
                  title="Cancel reply"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {forwardData && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50/80 py-0.5 pr-1.5 pl-2 text-[11px] font-medium text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
              <span className="max-w-[200px] truncate sm:max-w-[300px]">
                {forwardData.originalSubject || 'Forward'}
              </span>
              {onClearContext && (
                <button
                  type="button"
                  onClick={onClearContext}
                  className="rounded-full p-0.5 hover:bg-violet-200/60 dark:hover:bg-violet-500/20"
                  title="Cancel forward"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
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
