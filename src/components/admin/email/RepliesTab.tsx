'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { Inbox, Mail, Star, RefreshCw, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { getToken } from './helpers';
import { EmailDetailSkeleton } from './Skeletons';
import type { EmailDetail, ForwardData, ReplyData } from './types';
import { EmailDetailPanel } from './sections/EmailDetailPanel';
import { buildForwardHtml, buildReplyHtml } from './helpers';

interface ReplyItem {
  id: string;
  thread_id: string;
  subject: string;
  from: string;
  from_name?: string;
  to: string[];
  created_at: string;
  snippet: string;
  is_starred: boolean;
  has_attachments?: boolean;
}

interface RepliesTabProps {
  adminEmail?: string;
  onForward?: (data: ForwardData) => void;
  onReply?: (data: ReplyData) => void;
}

const POLL_INTERVAL = 30_000; // 30 seconds auto-refresh

export function RepliesTab({ adminEmail: propAdminEmail, onForward, onReply }: RepliesTabProps) {
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReply, setSelectedReply] = useState<EmailDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [adminEmail, setAdminEmail] = useState<string>(propAdminEmail || '');
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const copyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (copyMenuRef.current && !copyMenuRef.current.contains(target)) setCopyMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    if (!selectedReply || !onForward) return;
    onForward({
      subject: `Fwd: ${selectedReply.subject}`,
      html: buildForwardHtml(selectedReply as any),
      originalFrom: selectedReply.from || (selectedReply as any).from_email || '',
      originalTo: selectedReply.to || (selectedReply as any).to_emails || [],
      originalDate: selectedReply.created_at,
      originalSubject: selectedReply.subject,
    });
  };

  const handleReply = () => {
    if (!selectedReply || !onReply) return;
    onReply({
      to: selectedReply.from || (selectedReply as any).from_email || '',
      subject: `Re: ${selectedReply.subject}`,
      html: buildReplyHtml(selectedReply as any),
      originalFrom: selectedReply.from || (selectedReply as any).from_email || '',
      originalDate: selectedReply.created_at,
      originalSubject: selectedReply.subject,
      cc: selectedReply.cc,
    });
  };

  const fetchReplies = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) {
          setError('Not authenticated. Please sign in.');
          setReplies([]);
          return;
        }
        const res = await fetch('/api/admin/email?action=inbox', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error?.message || data?.error || 'Failed to load inbox');
          setReplies([]);
          return;
        }
        const emailList = data.emails || data.replies || [];
        const stored = localStorage.getItem('adminEmail');
        if (stored) setAdminEmail(stored);

        // Show toast only if new emails arrived during background refresh
        if (isBackground && emailList.length > replies.length) {
          const diff = emailList.length - replies.length;
          toast.success(`${diff} new email${diff > 1 ? 's' : ''} received!`);
        }

        setReplies(emailList);
        setLastFetched(new Date());
      } catch (e) {
        console.error('Failed to fetch replies:', e);
        if (!isBackground) setError('Network error. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [replies.length]
  );

  // Initial fetch
  useEffect(() => {
    fetchReplies(false);
  }, []);

  // Background polling every 30s
  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchReplies(true);
    }, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchReplies]);

  const handleManualRefresh = () => {
    fetchReplies(false);
  };

  const fetchDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/email?action=inbox_detail&id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setSelectedReply(data.email);
    } catch (e) {
      console.error('Failed to load email:', e);
      toast.error('Failed to load email content');
    } finally {
      setLoadingDetail(false);
    }
  };

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** Format sender display name */
  const formatSender = (item: ReplyItem) => {
    if (item.from_name) return item.from_name;
    return item.from;
  };

  /** Inbox header shared between views */
  const InboxHeader = () => (
    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Inbox Replies</h3>
        {adminEmail && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Logged in as:{' '}
            <span className="font-medium text-gray-600 dark:text-gray-300">{adminEmail}</span>
          </p>
        )}
        {lastFetched && (
          <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-600">
            Updated {lastFetched.toLocaleTimeString('en-IN')}
          </p>
        )}
      </div>
      <button
        onClick={handleManualRefresh}
        disabled={loading || refreshing}
        title="Refresh inbox"
        className="hover:border-brand-gold/40 hover:text-brand-gold flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-all disabled:opacity-50 dark:border-gray-700 dark:text-gray-400"
      >
        <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Refreshing…' : 'Refresh'}
      </button>
    </div>
  );

  if (!selectedReply) {
    return (
      <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-700/60 dark:bg-[#0e0e14]">
        <InboxHeader />

        {loading ? (
          <div className="p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3.5 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                  <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="flex gap-3 pt-1">
                      <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-gray-800" />
                      <div className="h-2.5 w-12 rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <Mail className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Failed to load inbox
            </h3>
            <p className="mt-2 max-w-sm text-sm text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={handleManualRefresh}
              className="bg-brand-gold text-brand-navy mt-4 rounded-lg px-4 py-2 text-xs font-bold uppercase transition-all hover:shadow-lg"
            >
              Retry
            </button>
          </div>
        ) : replies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Inbox className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-700" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No replies yet</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              When someone replies to your sent emails, they&apos;ll appear here automatically.
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
              Auto-refreshes every 30 seconds
            </p>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
            {replies.map((reply, i) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-gray-100 last:border-b-0 dark:border-gray-800"
              >
                <button
                  onClick={() => fetchDetail(reply.id)}
                  className={`flex w-full items-start gap-3.5 px-5 py-4 text-left transition-all hover:bg-gray-50/80 dark:hover:bg-white/[0.015] ${
                    starred.has(reply.id) ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''
                  }`}
                >
                  {/* Avatar with initials */}
                  <div className="from-brand-gold/30 to-brand-gold/10 text-brand-gold dark:from-brand-gold/20 dark:to-brand-gold/5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold">
                    {(reply.from_name || reply.from || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {reply.subject}
                      </p>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {starred.has(reply.id) && (
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(reply.id);
                          }}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${starred.has(reply.id) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                          />
                        </button>
                      </div>
                    </div>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {formatSender(reply)}
                      {reply.from_name && (
                        <span className="ml-1 text-gray-400 dark:text-gray-600">
                          &lt;{reply.from}&gt;
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-400">{reply.snippet}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="font-mono text-[10px] text-gray-400">
                        {new Date(reply.created_at).toLocaleString('en-IN')}
                      </span>
                      {reply.has_attachments && (
                        <div className="flex items-center text-gray-400">
                          <Paperclip className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm lg:grid-cols-5 dark:border-gray-700/60 dark:bg-[#0e0e14]">
      {/* Email List */}
      <div className="flex flex-col border-r border-gray-100 transition-all duration-300 lg:col-span-2 dark:border-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Inbox</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              title="Refresh"
              className="hover:text-brand-gold text-gray-400 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setSelectedReply(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Back
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {replies.map((reply, i) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="border-b border-gray-100 last:border-b-0 dark:border-gray-800"
            >
              <button
                onClick={() => fetchDetail(reply.id)}
                className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-all hover:bg-gray-50/80 dark:hover:bg-white/[0.015] ${
                  starred.has(reply.id)
                    ? 'bg-amber-50/50 dark:bg-amber-500/5'
                    : selectedReply?.id === reply.id
                      ? 'bg-brand-gold/5'
                      : ''
                }`}
              >
                <div className="from-brand-gold/20 to-brand-gold/5 text-brand-gold flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold">
                  {(reply.from_name || reply.from || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                    {reply.subject}
                  </p>
                  <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                    {formatSender(reply)}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-gray-400">{reply.snippet}</p>
                  {reply.has_attachments && (
                    <div className="mt-1.5 flex items-center text-gray-400">
                      <Paperclip className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {loadingDetail && !selectedReply ? (
        <EmailDetailSkeleton />
      ) : selectedReply ? (
        <EmailDetailPanel
          selected={selectedReply}
          loadingDetail={loadingDetail}
          copiedId={copiedId}
          copiedType={copiedType}
          copyMenuOpen={copyMenuOpen}
          copyMenuRef={copyMenuRef}
          starred={starred}
          onClose={() => setSelectedReply(null)}
          onReply={handleReply}
          onForward={handleForward}
          onCopyMenuToggle={() => setCopyMenuOpen(!copyMenuOpen)}
          onCopyText={copyText}
          onCopyId={copyId}
          onToggleStar={(id, e) => {
            e.stopPropagation();
            toggleStar(id);
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center lg:col-span-3">
          <Mail className="mb-4 h-12 w-12 text-gray-200 dark:text-gray-700" />
          <p className="text-sm text-gray-400">Select an email to view</p>
        </div>
      )}
    </div>
  );
}
