'use client';

import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface LotteryStatusBannersProps {
  errorMessage: string | null;
  successMessage: string | null;
  onDismissError: () => void;
  onDismissSuccess: () => void;
}

export function LotteryStatusBanners({
  errorMessage,
  successMessage,
  onDismissError,
  onDismissSuccess,
}: LotteryStatusBannersProps) {
  return (
    <AnimatePresence>
      {errorMessage && (
        <motion.div
          key="error-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 shadow-lg backdrop-blur-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
          <button
            onClick={onDismissError}
            aria-label="Dismiss error"
            className="ml-auto text-red-400 hover:text-red-600 dark:hover:text-white"
          >
            ✕
          </button>
        </motion.div>
      )}
      {successMessage && (
        <motion.div
          key="success-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 shadow-lg backdrop-blur-sm dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
          {successMessage.toLowerCase().includes('created') && (
            <a
              href="/lottery"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-100 px-4 py-2 text-xs font-bold tracking-wide text-green-800 transition-all hover:bg-green-200 dark:border-green-500/40 dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30"
            >
              Launch Arena ↗
            </a>
          )}
          <button
            onClick={onDismissSuccess}
            aria-label="Dismiss success message"
            className="ml-4 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-white"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
