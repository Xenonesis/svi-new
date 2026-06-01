'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { SentEmail, EmailDetail, ForwardData, ReplyData } from './types';
import {
  formatTime,
  getToken,
  buildForwardHtml,
  buildReplyHtml,
  buildCopyText,
  buildCopyHtml,
} from './helpers';
import { EmailListSkeleton } from './Skeletons';

const PAGE_SIZE = 50;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'sent', label: 'Sent' },
  { value: 'opened', label: 'Opened' },
  { value: 'clicked', label: 'Clicked' },
  { value: 'bounced', label: 'Bounced' },
  { value: 'failed', label: 'Failed' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 26 } },
};

interface SentTabProps {
  onForward?: (data: ForwardData) => void;
  onReply?: (data: ReplyData) => void;
}

function getInitials(email: string): string {
  const name = email.split('@')[0] || '';
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(email: string): string {
  const colors = [
    'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  ];
  let hash = 0;
  for (const ch of email) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

function StatusDot({ status }: { status: string }) {
  const s = status?.toLowerCase() || 'sent';
  const color =
    s === 'delivered'
      ? 'bg-emerald-500'
      : s === 'opened'
        ? 'bg-violet-500'
        : s === 'clicked'
          ? 'bg-indigo-500'
          : s === 'bounced' || s === 'failed'
            ? 'bg-red-500'
            : s === 'complained'
              ? 'bg-amber-500'
              : 'bg-blue-500';
  return <div className={`h-2 w-2 rounded-full ${color}`} />;
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const copyMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (copyMenuRef.current && !copyMenuRef.current.contains(e.target as Node)) {
        setCopyMenuOpen(false);
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchEmails = useCallback(async (offset = 0) => {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/email?limit=${PAGE_SIZE}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      const newEmails = data.emails || [];
      if (offset === 0) setEmails(newEmails);
      else setEmails((prev) => [...prev, ...newEmails]);
      setHasMore(newEmails.length === PAGE_SIZE);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

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
      if (!res.ok) throw new Error(data.error || 'Failed to load email');
      setSelected(data.email);
    } catch (e) {
      toast.error((e as Error).message);
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

  const copyText = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
    setCopyMenuOpen(false);
    toast.success('Copied to clipboard');
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    toast.success('Email ID copied');
  };

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

  const filtered = emails.filter((e) => {
    const matchesSearch =
      e.subject?.toLowerCase().includes(search.toLowerCase()) ||
      e.to?.join(',').toLowerCase().includes(search.toLowerCase());
    const matchesStar = !showStarredOnly || starred.has(e.id);
    const matchesStatus = statusFilter === 'all' || e.last_event?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStar && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase() || 'sent';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm lg:grid-cols-5 dark:border-gray-700/60 dark:bg-[#0e0e14]">
      {/* ─── Email List ─── */}
      <div
        className={`${selected ? 'lg:col-span-2' : 'lg:col-span-5'} flex flex-col transition-all duration-300`}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sent emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus-gold w-full rounded-lg border border-gray-200 bg-gray-50/80 py-2 pr-3 pl-9 text-xs text-gray-900 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {/* Status filter */}
            <div ref={statusMenuRef} className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  statusFilter !== 'all'
                    ? 'text-brand-gold bg-brand-gold/5'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {statusFilter === 'all'
                    ? 'Status'
                    : STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
                </span>
              </button>
              {showStatusMenu && (
                <div className="absolute top-full right-0 z-50 mt-1 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-[#0e0e14]">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setShowStatusMenu(false);
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${
                        statusFilter === opt.value
                          ? 'bg-brand-gold/5 text-brand-gold'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                showStarredOnly
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${showStarredOnly ? 'fill-amber-400' : ''}`} />
              <span className="hidden sm:inline">{showStarredOnly ? 'Starred' : 'Star'}</span>
            </button>
            <button
              onClick={() => fetchEmails(0)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div
          className="scrollbar-gold flex-1 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 260px)' }}
        >
          {loading ? (
            <EmailListSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle className="mb-3 h-7 w-7 text-red-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{error}</p>
              <button
                onClick={() => fetchEmails(0)}
                className="text-brand-gold mt-3 text-xs underline"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Inbox className="mb-3 h-7 w-7 text-gray-300 dark:text-gray-700" />
              <p className="text-sm text-gray-500">
                {showStarredOnly ? 'No starred emails' : 'No sent emails found'}
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-gray-100 dark:divide-gray-800"
            >
              {filtered.map((email) => {
                const isCurrent = selected?.id === email.id;
                const isStarred = starred.has(email.id);
                const firstTo = email.to?.[0] || '';
                return (
                  <motion.div variants={itemVariants} key={email.id}>
                    <button
                      onClick={() => fetchDetail(email.id)}
                      className={`group relative flex w-full items-start gap-3.5 px-5 py-4 text-left transition-all ${
                        isCurrent
                          ? 'bg-brand-gold/[0.04] dark:bg-brand-gold/[0.03]'
                          : 'hover:bg-gray-50/80 dark:hover:bg-white/[0.015]'
                      }`}
                    >
                      {/* Active indicator */}
                      {isCurrent && (
                        <div className="bg-brand-gold absolute top-0 bottom-0 left-0 w-[3px] rounded-r-full" />
                      )}

                      {/* Avatar */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${getAvatarColor(firstTo)}`}
                      >
                        {getInitials(firstTo)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <StatusDot status={email.last_event} />
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {email.subject || '(no subject)'}
                          </p>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-500">
                          To: {email.to?.join(', ')}
                        </p>
                        <div className="mt-1.5 flex items-center gap-3">
                          <span className="font-mono text-[10px] text-gray-400">
                            {formatTime(email.created_at)}
                          </span>
                          <span className="text-[10px] font-medium text-gray-400 capitalize">
                            {getStatusLabel(email.last_event)}
                          </span>
                        </div>
                      </div>

                      {/* Star */}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => toggleStar(email.id, e)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') toggleStar(email.id, e);
                        }}
                        className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            isStarred
                              ? 'fill-amber-400 text-amber-400 opacity-100'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Load more */}
          {hasMore && !search && statusFilter === 'all' && !showStarredOnly && !loading && (
            <div className="border-t border-gray-100 p-4 text-center dark:border-gray-800">
              <button
                onClick={() => fetchEmails(emails.length)}
                disabled={loadingMore}
                className="text-brand-gold inline-flex items-center gap-2 text-xs font-medium underline transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                Load more
              </button>
              <span className="ml-3 font-mono text-[10px] text-gray-400">
                Showing {filtered.length} emails
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Reading Pane ─── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="flex flex-col border-l border-gray-100 lg:col-span-3 dark:border-gray-800"
          >
            {/* Top accent */}
            <div className="from-brand-gold/60 via-brand-gold to-brand-gold/60 h-[2px] w-full bg-gradient-to-r" />

            {/* Close bar */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Mail className="text-brand-gold h-3.5 w-3.5" />
                <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Email Detail
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex flex-1 items-center justify-center py-20">
                <Loader2 className="text-brand-gold h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="scrollbar-gold flex-1 overflow-y-auto">
                <div className="p-6">
                  {/* Subject */}
                  <h2 className="font-serif text-xl leading-snug font-bold text-gray-900 dark:text-white">
                    {selected.subject}
                  </h2>

                  {/* Meta rows */}
                  <div className="mt-5 space-y-2.5">
                    {[
                      { label: 'From', value: selected.from },
                      { label: 'To', value: selected.to?.join(', ') },
                      selected.cc?.length ? { label: 'CC', value: selected.cc.join(', ') } : null,
                      selected.bcc?.length
                        ? { label: 'BCC', value: selected.bcc.join(', ') }
                        : null,
                    ]
                      .filter(Boolean)
                      .map((row) => (
                        <div key={row!.label} className="flex items-start gap-4">
                          <span className="w-10 shrink-0 text-right font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                            {row!.label}
                          </span>
                          <span className="min-w-0 flex-1 text-sm break-all text-gray-700 dark:text-gray-300">
                            {row!.value}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Status + ID + Date */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-wide text-gray-600 capitalize dark:bg-gray-800 dark:text-gray-400">
                      <StatusDot status={selected.last_event} />
                      {selected.last_event || 'sent'}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400">
                      {new Date(selected.created_at).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => copyId(selected.id)}
                      className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {copiedId === selected.id ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {selected.id.slice(0, 12)}...
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleReply}
                      className="flex items-center gap-1.5 rounded-lg border border-blue-200/60 bg-blue-50/80 px-3.5 py-2 text-xs font-medium text-blue-600 transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/15"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Reply
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleForward}
                      className="flex items-center gap-1.5 rounded-lg border border-violet-200/60 bg-violet-50/80 px-3.5 py-2 text-xs font-medium text-violet-600 transition-all hover:border-violet-300 hover:bg-violet-100 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/15"
                    >
                      <Forward className="h-3.5 w-3.5" />
                      Forward
                    </motion.button>

                    {/* Copy dropdown */}
                    <div ref={copyMenuRef} className="relative">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setCopyMenuOpen(!copyMenuOpen)}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200/60 bg-gray-50/80 px-3.5 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-700/80"
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
                            initial={{ opacity: 0, y: -4, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.96 }}
                            className="absolute top-full left-0 z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-[#0e0e14]"
                          >
                            {[
                              {
                                key: 'text',
                                icon: FileText,
                                label: 'Copy as Text',
                                action: () => copyText(buildCopyText(selected), 'text'),
                              },
                              {
                                key: 'html',
                                icon: Code2,
                                label: 'Copy as HTML',
                                action: () => copyText(buildCopyHtml(selected), 'html'),
                              },
                              {
                                key: 'subject',
                                icon: Mail,
                                label: 'Copy Subject',
                                action: () => copyText(selected.subject, 'subject'),
                              },
                              {
                                key: 'recipients',
                                icon: Users,
                                label: 'Copy Recipients',
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
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                              >
                                <item.icon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {copiedType === item.key ? 'Copied!' : item.label}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Star */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => toggleStar(selected.id, e)}
                      className={`ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        starred.has(selected.id)
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                          : 'text-gray-400 hover:bg-gray-50 hover:text-amber-500 dark:hover:bg-white/5'
                      }`}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${starred.has(selected.id) ? 'fill-amber-400' : ''}`}
                      />
                    </motion.button>
                  </div>

                  {/* Body preview */}
                  {selected.html && (
                    <div className="mt-6">
                      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/20">
                        <div
                          className="email-preview-wrapper"
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
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
