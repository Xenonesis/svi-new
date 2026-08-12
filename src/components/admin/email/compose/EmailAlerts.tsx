import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Calendar, X } from 'lucide-react';

interface EmailAlertsProps {
  error: string | null;
  onErrorDismiss: () => void;
  followUpSuggestion: {
    suggestedDays: number;
    reason: string;
    message: string;
  } | null;
  onFollowUpDismiss: () => void;
}

export function EmailAlerts({
  error,
  onErrorDismiss,
  followUpSuggestion,
  onFollowUpDismiss,
}: EmailAlertsProps) {
  return (
    <>
      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 sm:mx-6 dark:border-red-800/40 dark:bg-red-900/15">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
              <button onClick={onErrorDismiss} className="ml-auto text-red-400 hover:text-red-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Follow-up Suggestion */}
      <AnimatePresence>
        {followUpSuggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-4 flex items-start gap-3 rounded-xl border border-blue-200/60 bg-blue-50/80 px-4 py-3 sm:mx-6 dark:border-blue-800/40 dark:bg-blue-900/15">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Follow up in {followUpSuggestion.suggestedDays} day
                  {followUpSuggestion.suggestedDays !== 1 ? 's' : ''}
                </p>
                <p className="mt-0.5 text-xs text-blue-600/80 dark:text-blue-300/80">
                  {followUpSuggestion.message}
                </p>
                <p className="mt-0.5 text-[10px] text-blue-500/60 dark:text-blue-400/60">
                  Reason: {followUpSuggestion.reason}
                </p>
              </div>
              <button
                onClick={onFollowUpDismiss}
                className="shrink-0 text-blue-400 hover:text-blue-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
