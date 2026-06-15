'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, RefreshCw } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import type { Lottery } from '../types';

interface BulkEmailModalProps {
  open: boolean;
  lottery: Lottery | null;
  onClose: () => void;
  token: string;
  onSuccess: (msg: string | null) => void;
  onError: (msg: string | null) => void;
}

const EMAIL_TEMPLATES: Record<string, { subject: string; body: string }> = {
  announcement: {
    subject: '🎉 Upcoming Lucky Draw — {TITLE}',
    body: `Dear Participant,

We are excited to inform you about the upcoming draw for "{TITLE}".

Stay tuned for the live announcement. Best of luck!

— SVI Infra Solutions Team`,
  },
  reminder: {
    subject: '⏰ Reminder: {TITLE} Draw Tomorrow!',
    body: `Dear Participant,

This is a friendly reminder that the lucky draw for "{TITLE}" is coming up soon!

Make sure you have your ticket ready. We look forward to having you with us.

— SVI Infra Solutions Team`,
  },
  winner: {
    subject: '🏆 Congratulations! You Won {TITLE}!',
    body: `Dear Participant,

Congratulations! We are thrilled to inform you that you are the winner of "{TITLE}".

Our team will contact you shortly with details on how to claim your prize.

— SVI Infra Solutions Team`,
  },
};

export function BulkEmailModal({
  open,
  lottery,
  onClose,
  token,
  onSuccess,
  onError,
}: BulkEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  // Initialize on open
  if (open && lottery && !subject && !body) {
    setSubject(`Upcoming Lucky Draw — ${lottery.title}`);
    setBody(
      `Dear Participant,\n\nWe are excited to inform you about the upcoming draw for "${lottery.title}".\n\nStay tuned for the live announcement. Best of luck!\n\n— SVI Infra Solutions Team`
    );
  }

  const applyTemplate = (templateKey: string) => {
    const t = EMAIL_TEMPLATES[templateKey];
    if (!t) return;
    setSubject(t.subject.replace('{TITLE}', lottery?.title || ''));
    setBody(t.body.replace(/\{TITLE\}/g, lottery?.title || ''));
  };

  const handleSend = async () => {
    if (!lottery || !subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      const { data: parts, error } = await supabase
        .from('lottery_participants')
        .select('email, name')
        .eq('lottery_id', lottery.id)
        .not('email', 'is', null);
      if (error) throw error;
      const emails = (parts || []).map((p: any) => p.email).filter(Boolean);
      if (emails.length === 0) {
        onError('No participants with email addresses found.');
        setSending(false);
        return;
      }
      const htmlBody = body.replace(/\n/g, '<br/>');
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'send',
          to: emails,
          subject: subject.trim(),
          html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">${htmlBody}</div>`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send emails');
      onSuccess(`Email sent to ${emails.length} participant(s).`);
      onClose();
    } catch (err: any) {
      onError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && lottery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="dark:bg-brand-dark-bg flex w-full max-w-xl flex-col rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <div>
                <h3 className="text-brand-navy font-serif text-2xl font-bold dark:text-gray-100">
                  Send Email to Participants
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Campaign: <strong>{lottery.title}</strong>
                </p>
              </div>
              <button
                onClick={onClose}
                className="hover:text-brand-navy cursor-pointer rounded-md border border-gray-200 p-2 text-gray-400 transition-colors dark:border-gray-700 dark:hover:text-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {/* Quick Templates */}
              <div>
                <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                  Quick Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'announcement', label: 'Announcement' },
                    { key: 'reminder', label: 'Reminder' },
                    { key: 'winner', label: 'Winner Notice' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyTemplate(key)}
                      className="cursor-pointer rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-bold text-violet-700 transition-all hover:border-violet-500 hover:bg-violet-500 hover:text-white dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500 dark:hover:text-white"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {/* Body */}
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                  Message Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
                <button
                  onClick={onClose}
                  className="cursor-pointer rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !subject.trim() || !body.trim()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-violet-700 disabled:opacity-50"
                >
                  {sending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sending ? 'Sending…' : 'Send to All Participants'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
