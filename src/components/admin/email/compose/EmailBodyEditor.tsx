'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import { MoreHorizontal, ChevronDown, ChevronUp, Trash2, CornerUpLeft } from 'lucide-react';

const RichTextEditor = dynamic(() => import('../RichTextEditor').then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
  ),
});

interface EmailBodyEditorProps {
  previewMode: boolean;
  html: string;
  templateHtml: string | null;
  subject: string;
  toStr: string;
  editorKey: number;
  quotedHtml?: string | null;
  onRemoveQuoted?: () => void;
  onApplyTemplate?: (
    html: string,
    templateName?: string,
    variables?: Record<string, string>
  ) => void;
  setHtml: (html: string) => void;
  getPreviewHtml: () => string;
}

export function EmailBodyEditor({
  previewMode,
  html,
  subject,
  toStr,
  editorKey,
  quotedHtml,
  onRemoveQuoted,
  onApplyTemplate,
  setHtml,
  getPreviewHtml,
}: EmailBodyEditorProps) {
  const [showQuoted, setShowQuoted] = useState(false);

  return (
    <div className="relative">
      {previewMode ? (
        <div className="min-h-[400px] p-4 sm:p-6">
          <div
            className="mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-700 dark:text-gray-900"
            style={{ maxWidth: '700px' }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html:
                  getPreviewHtml() ||
                  '<div style="padding:40px;text-align:center;color:#999;font-family:sans-serif;">No content yet...<br>Select a template or write your email below.</div>',
              }}
            />
          </div>
        </div>
      ) : (
        <div className="p-4">
          <RichTextEditor
            key={editorKey}
            value={html}
            onChange={setHtml}
            placeholder={
              quotedHtml
                ? 'Type your reply here...'
                : 'Write your email here... Use the toolbar above to format text.'
            }
            recipientName={toStr.split(',')[0]?.trim()}
            subject={subject}
            onApplyTemplate={onApplyTemplate}
          />

          {/* Collapsible Quoted Email History Widget */}
          {quotedHtml && (
            <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowQuoted(!showQuoted)}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  aria-expanded={showQuoted}
                >
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                  <span>{showQuoted ? 'Hide quoted email' : 'Show quoted email'}</span>
                  {showQuoted ? (
                    <ChevronUp className="h-3 w-3 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  )}
                </button>

                {onRemoveQuoted && (
                  <button
                    type="button"
                    onClick={onRemoveQuoted}
                    className="flex items-center gap-1 text-[11px] font-medium text-gray-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
                    title="Remove quoted history from this email"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove quote</span>
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showQuoted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2.5 max-h-72 overflow-y-auto rounded-xl border border-gray-200/80 bg-gray-50/70 p-4 text-xs text-gray-600 dark:border-gray-700/60 dark:bg-gray-900/50 dark:text-gray-300">
                      <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-gray-400 uppercase">
                        <CornerUpLeft className="h-3 w-3 text-blue-500" />
                        <span>Quoted Thread History</span>
                      </div>
                      <div
                        className="prose-xs max-w-none break-words"
                        dangerouslySetInnerHTML={{ __html: quotedHtml }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
