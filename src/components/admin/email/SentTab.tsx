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
  Reply,
  Forward,
  Star,
  ChevronDown,
  FileText,
  Code2,
  Users,
} from 'lucide-react';
import { SentEmail, EmailDetail, ForwardData, ReplyData } from './types';
import {
  formatTime,
  getToken,
  buildForwardHtml,
  buildReplyHtml,
  buildCopyText,
  buildCopyHtml,
} from './helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

interface SentTabProps {
  onForward?: (data: ForwardData) => void;
  onReply?: (data: ReplyData) => void;
}

export function SentTab({ onForward, onReply }: SentTabProps) {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EmailDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [starred, setStarred] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('svi-starred-emails');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);

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

  // Persist starred to localStorage
  useEffect(() => {
    localStorage.setItem('svi-starred-emails', JSON.stringify([...starred]));
  }, [starred]);

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

  const toggleStar = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Copy handlers ────────────────────────────────────────
  const copyText = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
    setCopyMenuOpen(false);
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // ─── Forward / Reply ──────────────────────────────────────
  const handleForward = () => {
    if (!selected || !onForward) return;
    onForward({
      subject: `Fwd: ${selected.subject}`,
      html: buildForwardHtml(selected),
      originalFrom: selected.from,
      originalTo: selected.to || [],
      originalDate: selected.created_at,
      originalSubject: selected.subject,
    });
  };

  const handleReply = () => {
    if (!selected || !onReply) return;
    onReply({
      to: selected.from,
      subject: `Re: ${selected.subject}`,
      html: buildReplyHtml(selected),
      originalFrom: selected.from,
      originalDate: selected.created_at,
      originalSubject: selected.subject,
      cc: selected.cc,
    });
  };

  // ─── Filters ──────────────────────────────────────────────
  const filtered = emails.filter((e) => {
    const matchesSearch =
      e.subject?.toLowerCase().includes(search.toLowerCase()) ||
      e.to?.join(',').toLowerCase().includes(search.toLowerCase());
    const matchesStar = !showStarredOnly || starred.has(e.id);
    return matchesSearch && matchesStar;
  });

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
      {/* ─── List ─── */}
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
            <div className="flex items-center gap-2">
              {/* Star filter */}
              <button
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  showStarredOnly
                    ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-400'
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${showStarredOnly ? 'fill-amber-400' : ''}`} />
                {showStarredOnly ? 'Starred' : 'Star'}
              </button>
              <button
                onClick={fetchEmails}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 dark:border-gray-600 dark:text-gray-400"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="text-brand-gold mb-3 h-7 w-7 animate-spin" />
              <p className="text-sm text-gray-500">Loading emails from Resend…</p>
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
              <p className="text-sm text-gray-500">
                {showStarredOnly ? 'No starred emails' : 'No sent emails found'}
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-gray-100 dark:divide-gray-700"
            >
              {filtered.map((email) => {
                const isCurrent = selected?.id === email.id;
                const isStarred = starred.has(email.id);
                return (
                  <motion.div variants={itemVariants} key={email.id}>
                    <button
                      onClick={() => fetchDetail(email.id)}
                      className={`group relative w-full px-5 py-4 text-left transition-all duration-300 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] ${isCurrent ? 'bg-brand-gold/[0.04]' : ''}`}
                    >
                      {isCurrent && (
                        <div className="bg-brand-gold absolute top-0 bottom-0 left-0 w-1" />
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {/* Star */}
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => toggleStar(email.id, e)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') toggleStar(email.id, e);
                              }}
                              className="inline-flex shrink-0 cursor-pointer items-center transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-3.5 w-3.5 ${
                                  isStarred
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300 group-hover:text-gray-400 dark:text-gray-600'
                                }`}
                              />
                            </span>
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
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase shadow-sm transition-all duration-300 ${getPremiumStatusStyle(email.last_event)}`}
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

      {/* ─── Detail panel ─── */}
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
              {/* Gold top bar */}
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
                  {/* ─── Action buttons ─── */}
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    {/* Reply */}
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleReply}
                      className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Reply
                    </motion.button>

                    {/* Forward */}
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleForward}
                      className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-600 transition-all hover:border-violet-300 hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20"
                    >
                      <Forward className="h-3.5 w-3.5" />
                      Forward
                    </motion.button>

                    {/* Copy dropdown */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setCopyMenuOpen(!copyMenuOpen)}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${copyMenuOpen ? 'rotate-180' : ''}`}
                        />
                      </motion.button>

                      <AnimatePresence>
                        {copyMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            className="absolute top-full left-0 z-50 mt-1 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-[#0e0e14]"
                          >
                            {[
                              {
                                key: 'text',
                                icon: FileText,
                                label: 'Copy as Text',
                                desc: 'Plain text version',
                                action: () => copyText(buildCopyText(selected), 'text'),
                              },
                              {
                                key: 'html',
                                icon: Code2,
                                label: 'Copy as HTML',
                                desc: 'Raw HTML source',
                                action: () => copyText(buildCopyHtml(selected), 'html'),
                              },
                              {
                                key: 'subject',
                                icon: Mail,
                                label: 'Copy Subject',
                                desc: selected.subject,
                                action: () => copyText(selected.subject, 'subject'),
                              },
                              {
                                key: 'recipients',
                                icon: Users,
                                label: 'Copy Recipients',
                                desc: `${selected.to?.length || 0} recipient(s)`,
                                action: () => {
                                  const all = [
                                    ...(selected.to || []),
                                    ...(selected.cc || []),
                                    ...(selected.bcc || []),
                                  ];
                                  copyText(all.join(', '), 'recipients');
                                },
                              },
                            ].map((item) => (
                              <button
                                key={item.key}
                                onClick={item.action}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                              >
                                <item.icon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {copiedType === item.key ? '✓ Copied!' : item.label}
                                  </p>
                                  <p className="truncate text-[10px] text-gray-400">{item.desc}</p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Star toggle */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => toggleStar(selected.id, e)}
                      className={`ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        starred.has(selected.id)
                          ? 'border border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400'
                          : 'border border-gray-200 text-gray-400 hover:text-amber-500 dark:border-gray-600'
                      }`}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${starred.has(selected.id) ? 'fill-amber-400' : ''}`}
                      />
                    </motion.button>
                  </div>

                  {/* ─── Meta ─── */}
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
                    {/* CC */}
                    {selected.cc && selected.cc.length > 0 && (
                      <div>
                        <p className="mb-0.5 text-[9px] font-extrabold tracking-widest text-gray-400 uppercase">
                          CC
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {selected.cc.map((addr, i) => (
                            <span
                              key={`cc-${addr}-${i}`}
                              className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                            >
                              {addr}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* BCC */}
                    {selected.bcc && selected.bcc.length > 0 && (
                      <div>
                        <p className="mb-0.5 text-[9px] font-extrabold tracking-widest text-gray-400 uppercase">
                          BCC
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {selected.bcc.map((addr, i) => (
                            <span
                              key={`bcc-${addr}-${i}`}
                              className="rounded-lg bg-violet-50 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
                            >
                              {addr}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
                          {copiedId === selected.id ? (
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

                  {/* ─── Body preview ─── */}
                  {selected.html && (
                    <div>
                      <p className="mb-2 text-[9px] font-extrabold tracking-widest text-gray-400 uppercase">
                        Preview
                      </p>
                      <div
                        className="email-preview-wrapper max-h-80 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-xs dark:border-gray-700 dark:bg-gray-900/30"
                        dangerouslySetInnerHTML={{
                          __html:
                            `<style>
                              .email-preview-wrapper div[style*="background-color: #f9f9f9"],
                              .email-preview-wrapper div[style*="background-color: #f9f9f9"] *,
                              .email-preview-wrapper div[style*="background-color:#f9f9f9"],
                              .email-preview-wrapper div[style*="background-color:#f9f9f9"] *,
                              .email-preview-wrapper div[style*="background:#f9f9f9"],
                              .email-preview-wrapper div[style*="background:#f9f9f9"] * {
                                color: #333333 !important;
                              }
                            </style>` + selected.html,
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
