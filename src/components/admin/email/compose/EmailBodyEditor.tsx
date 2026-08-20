'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import {
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Trash2,
  CornerUpLeft,
  AlertTriangle,
  Wand2,
  Check,
} from 'lucide-react';

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
  templateVars?: Record<string, string>;
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
  onVariableChange?: (key: string, value: string) => void;
  onAutoFillAll?: () => void;
  setHtml: (html: string) => void;
  getPreviewHtml: () => string;
}

export function EmailBodyEditor({
  previewMode,
  html,
  templateHtml,
  templateVars = {},
  subject,
  toStr,
  editorKey,
  quotedHtml,
  onRemoveQuoted,
  onApplyTemplate,
  onVariableChange,
  onAutoFillAll,
  setHtml,
  getPreviewHtml,
}: EmailBodyEditorProps) {
  const [showQuoted, setShowQuoted] = useState(false);

  const previewContent = getPreviewHtml() || '';
  const unfilledVariables = useMemo(() => {
    if (!previewContent) return [];
    const matches = previewContent.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g) || [];
    return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, ''))));
  }, [previewContent]);

  return (
    <div className="relative">
      {previewMode ? (
        <div className="min-h-[400px] p-4 sm:p-6">
          {/* Interactive Unfilled Variables Banner */}
          {unfilledVariables.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mb-4 max-w-[700px] rounded-2xl border border-amber-300/80 bg-amber-50/95 p-4 text-xs text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {unfilledVariables.length} Unfilled Template Fields
                    </h4>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                      Fill them below or click auto-fill to instantly personalize this email.
                    </p>
                  </div>
                </div>

                {onAutoFillAll && (
                  <button
                    type="button"
                    onClick={onAutoFillAll}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-500/30 dark:bg-amber-500/25 dark:text-amber-100"
                  >
                    <Wand2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>⚡ Auto-Fill All Details</span>
                  </button>
                )}
              </div>

              {/* Quick Inline Fill Inputs */}
              {onVariableChange && (
                <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {unfilledVariables.map((v) => {
                    const currentVal = templateVars[v] || '';
                    return (
                      <div key={v} className="flex flex-col">
                        <label className="mb-1 flex items-center justify-between text-[10px] font-bold tracking-wider text-amber-900 uppercase dark:text-amber-300">
                          <span>{v.replace(/_/g, ' ')}</span>
                          <span className="text-[9px] font-medium text-amber-600 dark:text-amber-400">
                            Required
                          </span>
                        </label>
                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => onVariableChange(v, e.target.value)}
                          placeholder={`Enter ${v.replace(/_/g, ' ')}...`}
                          className="focus-gold w-full rounded-lg border border-amber-300/90 bg-white px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 transition-all outline-none dark:border-amber-500/40 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Email Preview Card */}
          <div
            className="mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-700 dark:text-gray-900"
            style={{ maxWidth: '700px' }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html:
                  previewContent ||
                  '<div style="padding:40px;text-align:center;color:#999;font-family:sans-serif;">No content yet...<br>Select a template or write your email below.</div>',
              }}
            />
          </div>

          {quotedHtml && !templateHtml && onRemoveQuoted && (
            <div className="mx-auto mt-3 flex max-w-[700px] items-center justify-between px-2">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Quoted reply history attached at bottom
              </span>
              <button
                type="button"
                onClick={onRemoveQuoted}
                className="flex items-center gap-1 text-[11px] font-medium text-red-500 transition-colors hover:underline"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove quoted thread</span>
              </button>
            </div>
          )}
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
