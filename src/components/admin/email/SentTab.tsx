'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Check,
  Copy,
  Inbox,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { SentEmail, EmailDetail } from './types';
import { formatTime, getToken } from './helpers';

// Stagger Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export function SentTab() {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EmailDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setEmails(data.emails || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const fetchDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/email?action=email&id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelected(data.email);
    } catch {
      /* noop */
    } finally {
      setLoadingDetail(false);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const filtered = emails.filter(
    (e) =>
      e.subject?.toLowerCase().includes(search.toLowerCase()) ||
      e.to?.join(',').toLowerCase().includes(search.toLowerCase())
  );

  const getPremiumStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || 'sent';
    switch (s) {
      case 'delivered':
        return 'border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'opened':
        return 'border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-violet-500/5 text-violet-600 dark:text-violet-400 dark:border-violet-500/30';
      case 'clicked':
        return 'border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500/30';
      case 'bounced':
      case 'failed':
        return 'border-red-500/20 bg-gradient-to-r from-red-500/10 to-red-500/5 text-red-600 dark:text-red-400 dark:border-red-500/30';
      case 'complained':
        return 'border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 dark:border-amber-500/30';
      default:
        return 'border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 dark:border-blue-500/30';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 font-sans lg:grid-cols-5">
      {/* List */}
      <div
        className={`${selected ? 'lg:col-span-3' : 'lg:col-span-5'} transition-all duration-300`}
      >
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#0e0e14]">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-700">
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-sm text-gray-900 placeholder-gray-400 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>
            <button
              onClick={fetchEmails}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 dark:border-gray-600 dark:text-gray-400"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="text-brand-gold mb-3 h-7 w-7 animate-spin" />
              <p className="text-sm text-gray-500">
                {process.env.NODE_ENV === 'development' &&
                process.env.NEXT_PUBLIC_SHOW_RESEND !== 'false'
                  ? 'Loading emails from Resend…'
                  : 'Loading sent history…'}
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle className="mb-3 h-8 w-8 text-red-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{error}</p>
              <button
                onClick={fetchEmails}
                className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-500 hover:border-gray-300 dark:border-gray-600"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Inbox className="mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">No sent emails found</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-gray-100 dark:divide-gray-700"
            >
              {filtered.map((email) => {
                const statusStyleClass = getPremiumStatusStyle(email.last_event);
                const isCurrent = selected?.id === email.id;
                return (
                  <motion.div variants={itemVariants} key={email.id}>
                    <button
                      onClick={() => fetchDetail(email.id)}
                      className={`group relative w-full px-5 py-4 text-left transition-all duration-300 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] ${
                        isCurrent ? 'bg-brand-gold/[0.04]' : ''
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isCurrent && (
                        <div className="bg-brand-gold absolute top-0 bottom-0 left-0 w-1" />
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="group-hover:text-brand-gold truncate text-sm font-semibold text-gray-900 transition-colors dark:text-white">
                              {email.subject || '(no subject)'}
                            </p>
                          </div>
                          <p className="mt-1 truncate text-xs text-gray-500">
                            To: {email.to?.join(', ')}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase shadow-sm transition-all duration-300 ${statusStyleClass}`}
                          >
                            {email.last_event || 'sent'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatTime(email.created_at)}
                          </span>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="lg:col-span-2"
          >
            <div className="sticky top-4 overflow-hidden rounded-xl border border-gray-200 bg-white/95 shadow-xl backdrop-blur-xl dark:border-gray-700 dark:bg-[#0e0e14]/95">
              {/* Gold Top Highlight */}
              <div className="from-brand-gold/30 via-brand-gold to-brand-gold/30 h-[3px] w-full bg-gradient-to-r" />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Mail className="text-brand-gold h-4 w-4" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Email Detail
                  </span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {loadingDetail ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="text-brand-gold h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="p-5">
                  {/* Meta */}
                  <div className="mb-5 space-y-3">
                    <div>
                      <p className="mb-0.5 text-[9px] font-extrabold tracking-widest text-gray-400 uppercase">
                        Subject
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {selected.subject}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="mb-0.5 text-[9px] font-extrabold tracking-widest text-gray-400 uppercase">
                          From
                        </p>
                        <p className="truncate text-xs text-gray-600 dark:text-gray-300">
                          {selected.from}
                        </p>
                      </div>
                      <div>
                        <p className="mb-0.5 text-[9px] font-extrabold tracking-widest text-gray-400 uppercase">
                          Status
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase shadow-sm ${getPremiumStatusStyle(selected.last_event)}`}
                        >
                          {selected.last_event || 'sent'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="mb-0.5 text-[9px] font-extrabold tracking-widest text-gray-400 uppercase">
                        To
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selected.to?.map((addr, i) => (
                          <span
                            key={`${addr}-${i}`}
                            className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          >
                            {addr}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-0.5 text-[9px] font-extrabold tracking-widest text-gray-400 uppercase">
                        Email ID
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="truncate rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {selected.id}
                        </code>
                        <button
                          onClick={() => copyId(selected.id)}
                          className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          {copied === selected.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="mb-0.5 text-[9px] font-extrabold tracking-widest text-gray-400 uppercase">
                        Sent
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {new Date(selected.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Body preview */}
                  {selected.html && (
                    <div>
                      <p className="mb-2 text-[9px] font-extrabold tracking-widest text-gray-400 uppercase">
                        Preview
                      </p>
                      <div
                        className="email-preview-wrapper max-h-80 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-xs dark:border-gray-700 dark:bg-gray-900/30"
                        dangerouslySetInnerHTML={{
                          __html:
                            `
                            <style>
                              .email-preview-wrapper div[style*="background-color: #f9f9f9"],
                              .email-preview-wrapper div[style*="background-color: #f9f9f9"] *,
                              .email-preview-wrapper div[style*="background-color:#f9f9f9"],
                              .email-preview-wrapper div[style*="background-color:#f9f9f9"] *,
                              .email-preview-wrapper div[style*="background:#f9f9f9"],
                              .email-preview-wrapper div[style*="background:#f9f9f9"] * {
                                color: #333333 !important;
                              }
                            </style>
                          ` + selected.html,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
