'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Inbox, Mail, Star } from 'lucide-react';
import { toast } from 'sonner';
import { getToken } from './helpers';
import { EmailDetailSkeleton } from './Skeletons';
import type { EmailDetail } from './types';

interface ReplyItem {
  id: string;
  thread_id: string;
  subject: string;
  from: string;
  to: string[];
  created_at: string;
  snippet: string;
  is_starred: boolean;
}

interface RepliesTabProps {
  adminEmail?: string;
}

export function RepliesTab({ adminEmail: propAdminEmail }: RepliesTabProps) {
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReply, setSelectedReply] = useState<EmailDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [adminEmail, setAdminEmail] = useState<string>(propAdminEmail || '');

  const fetchReplies = useCallback(async () => {
    setLoading(true);
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
      // Handle both 'emails' and 'replies' keys for compatibility
      const emailList = data.emails || data.replies || [];
      // Get admin email from storage
      const stored = localStorage.getItem('adminEmail');
      if (stored) setAdminEmail(stored);
      setReplies(emailList);
    } catch (e) {
      console.error('Failed to fetch replies:', e);
      setError('Network error. Please try again.');
      setReplies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

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

  if (!selectedReply) {
    return (
      <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-700/60 dark:bg-[#0e0e14]">
        {/* Header with Admin Email */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Inbox Replies</h3>
            {adminEmail && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Logged in as:{' '}
                <span className="font-medium text-gray-600 dark:text-gray-300">{adminEmail}</span>
              </p>
            )}
          </div>
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>

        {loading ? (
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Inbox Replies</h3>
              <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
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
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Failed to load inbox</h3>
            <p className="mt-2 max-w-sm text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
            <button
              onClick={fetchReplies}
              className="mt-4 rounded-lg bg-brand-gold px-4 py-2 text-xs font-bold text-brand-navy uppercase transition-all hover:shadow-lg"
            >
              Retry
            </button>
          </div>
        ) : replies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Inbox className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-700" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No replies yet</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              When someone replies to your sent emails, they'll appear here automatically.
            </p>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
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
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {reply.subject}
                      </p>
                      {starred.has(reply.id) && (
                        <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                      )}
                    </div>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {reply.from} → {reply.to?.[0] || ''}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-400">{reply.snippet}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="font-mono text-[10px] text-gray-400">
                        {new Date(reply.created_at).toLocaleString('en-IN')}
                      </span>
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
      <div className="flex flex-col transition-all duration-300 lg:col-span-2">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Inbox</h3>
          <button
            onClick={() => setSelectedReply(null)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Back
          </button>
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
                className={`flex w-full items-start gap-3.5 px-5 py-4 text-left transition-all hover:bg-gray-50/80 dark:hover:bg-white/[0.015] ${
                  starred.has(reply.id)
                    ? 'bg-amber-50/50 dark:bg-amber-500/5'
                    : selectedReply?.id === reply.id
                      ? 'bg-brand-gold/5'
                      : ''
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {reply.subject}
                    </p>
                    {starred.has(reply.id) && (
                      <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    From: {reply.from}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-400">{reply.snippet}</p>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {loadingDetail ? (
        <EmailDetailSkeleton />
      ) : selectedReply ? (
        <div className="flex flex-col overflow-hidden lg:col-span-3">
          {/* Email Header */}
          <div className="border-b border-gray-100 p-6 dark:border-gray-800">
            <h2 className="text-brand-navy mb-3 font-serif text-xl leading-tight dark:text-gray-100">
              {selectedReply.subject || '(No Subject)'}
            </h2>
            <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="w-12 shrink-0 text-xs font-semibold text-gray-400 uppercase">From</span>
                <span>{selectedReply.from || selectedReply.from_email || 'Unknown'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-12 shrink-0 text-xs font-semibold text-gray-400 uppercase">To</span>
                <span>{(selectedReply.to || selectedReply.to_emails || []).join(', ')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-12 shrink-0 text-xs font-semibold text-gray-400 uppercase">Date</span>
                <span>{new Date(selectedReply.created_at || selectedReply.received_at || '').toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedReply.html ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: selectedReply.html }}
              />
            ) : selectedReply.text ? (
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                {selectedReply.text}
              </pre>
            ) : (
              <p className="text-sm italic text-gray-400">No content</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center lg:col-span-3">
          <Mail className="mb-4 h-12 w-12 text-gray-200 dark:text-gray-700" />
          <p className="text-sm text-gray-400">Select an email to view</p>
        </div>
      )}
    </div>
  );
}
