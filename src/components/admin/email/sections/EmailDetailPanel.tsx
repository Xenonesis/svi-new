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
  Reply,
  Star,
  X,
  FileText,
  Code2,
  Users,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import type { EmailDetail } from '../types';
import { buildCopyText } from '../helpers';
import { useState } from 'react';

interface EmailDetailPanelProps {
  selected: EmailDetail | null;
  loadingDetail: boolean;
  copiedId: string | null;
  copiedType: string | null;
  copyMenuOpen: boolean;
  copyMenuRef: React.RefObject<HTMLDivElement | null>;
  starred: Set<string>;
  onClose: () => void;
  onReply: () => void;
  onForward: () => void;
  onCopyMenuToggle: () => void;
  onCopyText: (text: string, type: string) => void;
  onCopyId: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent | React.KeyboardEvent) => void;
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
}: EmailDetailPanelProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  if (!selected) return null;

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
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
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

              {/* Date */}
              <div className="mb-4 flex items-center gap-2 text-[10px] text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{new Date(selected.created_at).toLocaleString('en-IN')}</span>
              </div>

              {/* Actions - icon-only for compact view */}
              <div className="mb-6 flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onReply}
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

              {/* Body - with better styling */}
              {selected.html && (
                <div className="mt-4">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/20">
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
