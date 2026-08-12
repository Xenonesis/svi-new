import { AnimatePresence, motion } from 'motion/react';
import { Save, X } from 'lucide-react';

interface DraftRestoreBannerProps {
  hasDraft: boolean;
  onRestore: () => void;
  onClear: () => void;
}

export function DraftRestoreBanner({ hasDraft, onRestore, onClear }: DraftRestoreBannerProps) {
  return (
    <AnimatePresence>
      {hasDraft && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className="border-brand-gold/20 bg-brand-gold/5 mb-4 flex flex-col items-start justify-between gap-3 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center sm:gap-0 sm:px-5"
        >
          <div className="flex items-center gap-3">
            <Save className="text-brand-gold h-4 w-4" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              You have an unsaved draft
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRestore}
              className="bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors"
            >
              Restore
            </button>
            <button
              onClick={onClear}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
