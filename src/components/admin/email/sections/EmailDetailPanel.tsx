'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  Copy,
  Download,
  Eye,
  Forward,
  Loader2,
  Mail,
  MailOpen,
  Reply,
  Star,
  X,
  FileText,
  Code2,
  Users,
  ExternalLink,
  Calendar,
  Sparkles,
  Tag,
  Archive,
  Trash2,
  Plus,
  RotateCw,
  AlertTriangle,
  Send,
} from 'lucide-react';
import type { EmailDetail } from '../types';
import { buildCopyText } from '../helpers';
import { useState, useRef, useEffect } from 'react';
import { AISummaryPanel } from './AISummaryPanel';
import { SentimentBadge } from './SentimentBadge';
import { COMMON_TAGS, getTagStyle } from '../constants';

interface EmailDetailPanelProps {
  selected: EmailDetail | null;
  loadingDetail: boolean;
  copiedId: string | null;
  copiedType: string | null;
  copyMenuOpen: boolean;
  copyMenuRef: React.RefObject<HTMLDivElement | null>;
  starred: Set<string>;
  onClose: () => void;
  onReply: (html?: string) => void;
  onForward: () => void;
  onCopyMenuToggle: () => void;
  onCopyText: (text: string, type: string) => void;
  onCopyId: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent | React.KeyboardEvent) => void;
  onMarkUnread?: (id: string) => void;
  onArchive?: (id: string, isArchived: boolean) => void;
  onDelete?: (id: string) => void;
  onAddTag?: (id: string, tag: string) => void;
  onRemoveTag?: (id: string, tag: string) => void;
  onRetry?: (email: EmailDetail, customRecipient?: string) => Promise<void>;
}

export function EmailDetailPanel({
  selected,
  loadingDetail,
  copiedId,
  copiedType,
  copyMenuOpen,
  copyMenuRef,
  starred,
  onClose,
  onReply,
  onForward,
  onCopyMenuToggle,
  onCopyText,
  onCopyId,
  onToggleStar,
  onMarkUnread,
  onArchive,
  onDelete,
  onAddTag,
  onRemoveTag,
  onRetry,
}: EmailDetailPanelProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [showAltRecipient, setShowAltRecipient] = useState(false);
  const [altRecipient, setAltRecipient] = useState('');
  const tagMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tagMenuRef.current && !tagMenuRef.current.contains(e.target as Node)) {
        setTagMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!selected) return null;

  // Build thread emails array for summarization
  const threadEmails = [
    {
      from: selected.from,
      subject: selected.subject,
      html: selected.html,
      text: selected.text,
      created_at: selected.created_at,
    },
  ];
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="flex flex-col border-l border-gray-100 lg:col-span-3 dark:border-gray-800"
      >
        {/* Header with gradient accent */}
        <div className="from-brand-gold/60 via-brand-gold to-brand-gold/60 h-[2px] w-full bg-gradient-to-r" />

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <Mail className="text-brand-gold h-3.5 w-3.5" />
            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Email Detail
            </span>
            {selected.last_event && <span className="text-[10px] text-gray-400">•</span>}
            <span className="font-mono text-[10px] text-gray-400 capitalize">
              {selected.last_event || 'sent'}
            </span>
            {selected.is_read === false && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Unread
              </span>
            )}
            {selected.is_archived && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Archived
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onRetry &&
              (selected.last_event === 'bounced' ||
                selected.last_event === 'failed' ||
                selected.last_event === 'rejected' ||
                selected.last_event === 'delivery_delayed') && (
                <button
                  onClick={async () => {
                    setRetrying(true);
                    try {
                      await onRetry(selected);
                    } finally {
                      setRetrying(false);
                    }
                  }}
                  disabled={retrying}
                  className="mr-1 flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                  title="Retry Delivery"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${retrying ? 'animate-spin' : ''}`} />
                  <span>Retry</span>
                </button>
              )}

            <button
              onClick={(e) => onToggleStar(selected.id, e)}
              className={`rounded-lg p-1.5 transition-colors ${
                starred.has(selected.id) || selected.is_starred
                  ? 'text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5'
              }`}
              title={starred.has(selected.id) || selected.is_starred ? 'Unstar' : 'Star'}
            >
              <Star
                className={`h-4 w-4 ${
                  starred.has(selected.id) || selected.is_starred ? 'fill-amber-400' : ''
                }`}
              />
            </button>
            {onMarkUnread && (
              <button
                onClick={() => onMarkUnread(selected.id)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-white/5 dark:hover:text-blue-400"
                title="Mark as Unread"
              >
                <Mail className="h-4 w-4" />
              </button>
            )}

            {onArchive && (
              <button
                onClick={() => onArchive(selected.id, !selected.is_archived)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-amber-600 dark:hover:bg-white/5 dark:hover:text-amber-400"
                title={selected.is_archived ? 'Move to Inbox' : 'Archive'}
              >
                <Archive className="h-4 w-4" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(selected.id)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                title="Delete Email"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loadingDetail ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <Loader2 className="text-brand-gold h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="scrollbar-gold flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Subject with improved typography */}
              <h2 className="mb-4 font-serif text-xl leading-tight font-bold text-gray-900 dark:text-white">
                {selected.subject || '(no subject)'}
              </h2>

              {/* Recipient info - compact grid */}
              <div className="mb-5 space-y-2">
                {/* ─── Failed / Bounced Delivery Banner & 1-Click Retry ─── */}
                {(selected.last_event === 'bounced' ||
                  selected.last_event === 'failed' ||
                  selected.last_event === 'rejected' ||
                  selected.last_event === 'delivery_delayed') && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50/80 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-red-900 uppercase dark:text-red-300">
                            Delivery Failed / Bounced
                          </h4>
                          <span className="py-0.2 rounded-full bg-red-200/80 px-2 text-[10px] font-bold text-red-800 dark:bg-red-900/40 dark:text-red-300">
                            {selected.last_event}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                          The mail server could not deliver this message to the destination inbox.
                          Verify the email address or retry now.
                        </p>

                        {/* Retry Buttons */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {onRetry && (
                            <button
                              onClick={async () => {
                                setRetrying(true);
                                try {
                                  await onRetry(selected);
                                } finally {
                                  setRetrying(false);
                                }
                              }}
                              disabled={retrying}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
                            >
                              <RotateCw
                                className={`h-3.5 w-3.5 ${retrying ? 'animate-spin' : ''}`}
                              />
                              {retrying ? 'Retrying Send…' : '1-Click Retry Now'}
                            </button>
                          )}

                          <button
                            onClick={() => setShowAltRecipient(!showAltRecipient)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:bg-gray-800 dark:text-red-300"
                          >
                            <Send className="h-3 w-3" />
                            <span>Resend to different address</span>
                          </button>
                        </div>

                        {/* Resend to Alternative Email input */}
                        <AnimatePresence>
                          {showAltRecipient && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 overflow-hidden border-t border-red-200 pt-3 dark:border-red-500/20"
                            >
                              <div className="flex gap-2">
                                <input
                                  type="email"
                                  placeholder="Enter alternative recipient email..."
                                  value={altRecipient}
                                  onChange={(e) => setAltRecipient(e.target.value)}
                                  className="w-full rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-500 dark:border-red-500/40 dark:bg-gray-900 dark:text-white"
                                />
                                <button
                                  onClick={async () => {
                                    if (!altRecipient.trim() || !onRetry) return;
                                    setRetrying(true);
                                    try {
                                      await onRetry(selected, altRecipient.trim());
                                      setShowAltRecipient(false);
                                      setAltRecipient('');
                                    } finally {
                                      setRetrying(false);
                                    }
                                  }}
                                  disabled={retrying || !altRecipient.trim()}
                                  className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-red-700 disabled:opacity-50"
                                >
                                  {retrying ? 'Sending…' : 'Send'}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )}
                {[
                  { label: 'From', value: selected.from, isEmail: true },
                  { label: 'To', value: selected.to?.join(', '), isEmail: true },
                  selected.cc?.length
                    ? { label: 'CC', value: selected.cc.join(', '), isEmail: true }
                    : null,
                  selected.bcc?.length
                    ? { label: 'BCC', value: selected.bcc.join(', '), isEmail: true }
                    : null,
                ]
                  .filter(Boolean)
                  .map((row) => (
                    <div key={row!.label} className="flex items-start gap-3">
                      <span className="w-10 shrink-0 text-right font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                        {row!.label}
                      </span>
                      <span className="min-w-0 flex-1 text-sm break-all text-gray-700 dark:text-gray-300">
                        {row!.isEmail ? (
                          <a
                            href={`mailto:${row!.value}`}
                            className="text-brand-gold hover:underline"
                          >
                            {row!.value}
                          </a>
                        ) : (
                          row!.value
                        )}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Date & Tags Row */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(selected.created_at).toLocaleString('en-IN')}</span>
                </div>

                {/* Tags List */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {(selected.tags || []).map((tag) => {
                    const style = getTagStyle(tag);
                    return (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${style.bg} ${style.color} ${style.border}`}
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                        {onRemoveTag && (
                          <button
                            type="button"
                            onClick={() => onRemoveTag(selected.id, tag)}
                            className="ml-0.5 text-gray-400 hover:text-red-500"
                            title={`Remove ${tag}`}
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </span>
                    );
                  })}

                  {/* Add Tag Button */}
                  {onAddTag && (
                    <div ref={tagMenuRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setTagMenuOpen(!tagMenuOpen)}
                        className="inline-flex items-center gap-1 rounded-md border border-dashed border-gray-300 px-2 py-0.5 text-[11px] font-medium text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        Tag
                      </button>

                      <AnimatePresence>
                        {tagMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.96 }}
                            className="dark:bg-brand-dark-surface absolute top-full right-0 z-50 mt-1.5 w-52 rounded-xl border border-gray-200 bg-white p-2.5 shadow-xl dark:border-gray-700"
                          >
                            <p className="mb-2 text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                              Apply Tag
                            </p>
                            <div className="mb-2.5 flex flex-wrap gap-1.5">
                              {COMMON_TAGS.map((t) => {
                                const isApplied = (selected.tags || []).includes(t.name);
                                return (
                                  <button
                                    key={t.name}
                                    type="button"
                                    onClick={() => {
                                      if (isApplied && onRemoveTag) {
                                        onRemoveTag(selected.id, t.name);
                                      } else {
                                        onAddTag(selected.id, t.name);
                                      }
                                      setTagMenuOpen(false);
                                    }}
                                    className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-all ${
                                      isApplied
                                        ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                                        : `${t.bg} ${t.color} ${t.border} opacity-80 hover:opacity-100`
                                    }`}
                                  >
                                    {t.name} {isApplied ? '✓' : ''}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex gap-1.5 border-t border-gray-100 pt-1 dark:border-gray-800">
                              <input
                                type="text"
                                placeholder="Custom tag..."
                                value={customTag}
                                onChange={(e) => setCustomTag(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && customTag.trim()) {
                                    e.preventDefault();
                                    onAddTag(selected.id, customTag.trim());
                                    setCustomTag('');
                                    setTagMenuOpen(false);
                                  }
                                }}
                                className="w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (customTag.trim()) {
                                    onAddTag(selected.id, customTag.trim());
                                    setCustomTag('');
                                    setTagMenuOpen(false);
                                  }
                                }}
                                className="bg-brand-gold text-brand-navy rounded-md px-2.5 py-1 text-xs font-bold"
                              >
                                Add
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
              {/* Sentiment + AI Actions */}
              <div className="mb-6 flex items-center gap-1.5">
                {selected.html && (
                  <SentimentBadge
                    emailHtml={selected.html}
                    emailText={selected.text}
                    onSuggestionSelect={(html) => onReply(html)}
                  />
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSummary(!showSummary)}
                  className="border-brand-gold/20 bg-brand-gold/10 text-brand-gold hover:border-brand-gold/30 hover:bg-brand-gold/20 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all"
                  title="Summarize Thread"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Summarize</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onReply()}
                  className="flex items-center gap-1.5 rounded-lg border border-blue-200/60 bg-blue-50/80 px-3 py-2 text-xs font-medium text-blue-600 transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400"
                  title="Reply"
                >
                  <Reply className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reply</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onForward}
                  className="flex items-center gap-1.5 rounded-lg border border-violet-200/60 bg-violet-50/80 px-3 py-2 text-xs font-medium text-violet-600 transition-all hover:border-violet-300 hover:bg-violet-100 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400"
                  title="Forward"
                >
                  <Forward className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Forward</span>
                </motion.button>

                {/* Copy dropdown */}
                <div ref={copyMenuRef} className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCopyMenuToggle}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200/60 bg-gray-50/80 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
                    title="Copy"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Copy</span>
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
                        className="dark:bg-brand-dark-surface absolute top-full left-0 z-50 mt-1.5 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700"
                      >
                        {[
                          {
                            key: 'text',
                            icon: FileText,
                            label: 'Copy as Text',
                            action: () => onCopyText(buildCopyText(selected), 'text'),
                          },
                          {
                            key: 'html',
                            icon: Code2,
                            label: 'Copy as HTML',
                            action: () => onCopyText(selected.html || '', 'html'),
                          },
                          {
                            key: 'subject',
                            icon: Mail,
                            label: 'Copy Subject',
                            action: () => onCopyText(selected.subject, 'subject'),
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
                              onCopyText(all.join(', '), 'recipients');
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
                  onClick={(e) => onToggleStar(selected.id, e)}
                  className={`ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    starred.has(selected.id)
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                      : 'text-gray-400 hover:bg-gray-50 hover:text-amber-500 dark:hover:bg-white/5'
                  }`}
                  title={starred.has(selected.id) ? 'Unstar' : 'Star'}
                >
                  <Star
                    className={`h-3.5 w-3.5 ${starred.has(selected.id) ? 'fill-amber-400' : ''}`}
                  />
                </motion.button>
              </div>

              {/* Summary Panel */}
              {showSummary && (
                <div className="mb-6">
                  <AISummaryPanel
                    open={showSummary}
                    emails={threadEmails}
                    onClose={() => setShowSummary(false)}
                  />
                </div>
              )}

              {/* Body - with better styling */}
              {selected.html && (
                <div className="mt-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 text-gray-900 shadow-sm dark:border-gray-700 dark:text-gray-900">
                    <div
                      className="email-preview-wrapper overflow-auto"
                      dangerouslySetInnerHTML={{
                        __html:
                          `<style>.email-preview-wrapper div[style*="background-color: #f9f9f9"],.email-preview-wrapper div[style*="background-color: #f9f9f9"] *,.email-preview-wrapper div[style*="background-color:#f9f9f9"],.email-preview-wrapper div[style*="background-color:#f9f9f9"] *,.email-preview-wrapper div[style*="background:#f9f9f9"],.email-preview-wrapper div[style*="background:#f9f9f9"] * { color: #333333 !important; }</style>` +
                          selected.html,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Attachments Section */}
              {selected.attachments && selected.attachments.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Attachments ({selected.attachments.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selected.attachments.map((attachment: any, index: number) => {
                      const isBase64 =
                        attachment.content &&
                        typeof attachment.content === 'string' &&
                        !attachment.content.includes(' ');
                      const hasUrl = !!attachment.url;
                      const downloadHref = hasUrl
                        ? attachment.url
                        : isBase64
                          ? `data:${attachment.content_type || 'application/octet-stream'};base64,${attachment.content}`
                          : '#';
                      const canDownload = hasUrl || isBase64;
                      const ct = (attachment.content_type || '').toLowerCase();
                      const isImage = ct.startsWith('image/');
                      return (
                        <div
                          key={index}
                          className="dark:bg-brand-dark-surface flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
                              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {attachment.filename || `attachment-${index + 1}`}
                              </p>
                              {attachment.content_type && (
                                <p className="truncate text-[10px] text-gray-500">
                                  {attachment.content_type}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {canDownload ? (
                              <>
                                {/* Preview — inline for images, new tab for others */}
                                {isImage ? (
                                  <button
                                    onClick={() => setPreviewImage(downloadHref)}
                                    className="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                    title="Preview"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <a
                                    href={downloadHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                    title="Preview"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </a>
                                )}
                                {/* Download — prompts file save */}
                                <a
                                  href={downloadHref}
                                  download={attachment.filename || `attachment-${index + 1}`}
                                  className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                  title="Download"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-400">No content</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Image preview lightbox */}
                  <AnimatePresence>
                    {previewImage && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                        onClick={() => setPreviewImage(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.85, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className="dark:bg-brand-dark-surface relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-white p-1 shadow-2xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-2 right-2 z-10 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="max-h-[85vh] w-full rounded-xl object-contain"
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Footer actions */}
              <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      window.open(`https://resend.com/emails/${selected.id}`, '_blank')
                    }
                    className="hover:text-brand-gold flex items-center gap-1 text-xs text-gray-400"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View in Resend
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onCopyId(selected.id)}
                      className="font-mono text-[10px] text-gray-400 hover:text-gray-600"
                    >
                      {copiedId === selected.id ? 'Copied!' : selected.id.slice(0, 12) + '...'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
