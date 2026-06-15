'use client';

import { motion } from 'motion/react';
import { AlertTriangle, Clock, Search, XCircle, Loader2 } from 'lucide-react';
import { useScheduledEmails } from './hooks/useScheduledEmails';
import { containerVariants, itemVariants } from './sections/constants';

export function ScheduledTab() {
  const h = useScheduledEmails();

  return (
    <div className="dark:bg-brand-dark-surface grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/60">
      <div className="flex flex-col transition-all duration-300">
        {/* Toolbar */}
        <div className="dark:bg-brand-dark-surface/50 flex min-h-[56px] items-center justify-between border-b border-gray-100 bg-white/50 px-4 py-2 backdrop-blur-md dark:border-gray-800">
          <div className="flex w-full items-center gap-3">
            <div className="group relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="group-focus-within:text-brand-gold h-4 w-4 text-gray-400 transition-colors" />
              </div>
              <input
                type="text"
                value={h.search}
                onChange={(e) => h.setSearch(e.target.value)}
                placeholder="Search scheduled emails..."
                className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-full border border-gray-200 bg-gray-50/50 py-2 pr-4 pl-10 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:bg-white focus:ring-1 focus:outline-none dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:bg-gray-900"
              />
            </div>
            {h.loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>
        </div>

        {/* Results count */}
        {!h.loading && !h.error && (
          <div className="flex items-center justify-between border-b border-gray-50 px-4 py-1.5 dark:border-gray-800/50">
            <span className="font-mono text-[10px] text-gray-400">
              {h.processed.length === h.emails.length
                ? `${h.emails.length} scheduled email${h.emails.length !== 1 ? 's' : ''}`
                : `${h.processed.length} of ${h.emails.length} scheduled email${h.emails.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        )}

        {/* Email List */}
        <div
          className="scrollbar-gold flex-1 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        >
          {h.loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : h.error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle className="mb-3 h-7 w-7 text-red-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{h.error}</p>
              <button
                onClick={() => h.fetchEmails()}
                className="text-brand-gold mt-3 text-xs underline"
              >
                Retry
              </button>
            </div>
          ) : h.processed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Clock className="mb-3 h-7 w-7 text-gray-300 dark:text-gray-700" />
              <p className="text-sm text-gray-500">
                {h.search ? 'No scheduled emails match your search' : 'No scheduled emails'}
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-gray-100 dark:divide-gray-800"
            >
              {h.processed.map((email) => {
                const dateObj = new Date(email.scheduled_at);
                const timeString = dateObj.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const dateString = dateObj.toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });
                const isCancelling = h.cancelling === email.id;

                return (
                  <motion.div
                    key={email.id}
                    variants={itemVariants}
                    className="group flex flex-col gap-2 p-4 transition-colors hover:bg-gray-50/80 sm:flex-row sm:items-center sm:gap-4 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Clock className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                            {email.to_emails.join(', ')}
                          </p>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                              {dateString} • {timeString}
                            </span>
                          </div>
                        </div>

                        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                          {email.subject || '(No Subject)'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 sm:w-auto">
                      <button
                        onClick={() => {
                          if (
                            window.confirm('Are you sure you want to cancel this scheduled email?')
                          ) {
                            h.cancelScheduledEmail(email.id);
                          }
                        }}
                        disabled={isCancelling}
                        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                      >
                        {isCancelling ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        Cancel Send
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
