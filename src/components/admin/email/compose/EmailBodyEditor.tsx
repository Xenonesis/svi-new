'use client';

import { useState, useMemo, useRef } from 'react';
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
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { extractTemplateVars, safeReplaceHtmlContent } from '@/src/lib/utils/templateParser';
import { FloatingSelectionToolbar, cleanSnippetHtml } from './FloatingSelectionToolbar';

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
    variables?: Record<string, string>,
    subject?: string
  ) => void;
  onUpdateSubject?: (subject: string) => void;
  onVariableChange?: (key: string, value: string) => void;
  onAutoFillAll?: () => void;
  onUpdateTemplateHtml?: (html: string) => void;
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
  onUpdateSubject,
  onVariableChange,
  onAutoFillAll,
  onUpdateTemplateHtml,
  setHtml,
  getPreviewHtml,
}: EmailBodyEditorProps) {
  const [showQuoted, setShowQuoted] = useState(false);
  const [isEditorExpanded, setIsEditorExpanded] = useState(true);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const renderedEmailRef = useRef<HTMLDivElement>(null);

  const previewContent = getPreviewHtml() || '';

  // Extract all template variables (filled and unfilled)
  const allTemplateVars = useMemo(() => {
    const raw = templateHtml || html;
    if (!raw) return Object.keys(templateVars);
    const extracted = extractTemplateVars(raw);
    const set = new Set([...extracted, ...Object.keys(templateVars)]);
    return Array.from(set);
  }, [templateHtml, html, templateVars]);

  const totalVarsCount = allTemplateVars.length;
  const unfilledCount = allTemplateVars.filter(
    (v) => !templateVars[v] || !templateVars[v].trim()
  ).length;
  const allFilled = totalVarsCount > 0 && unfilledCount === 0;

  // Non-destructive targeted text replacement (preserves outer table & card layout)
  const handleReplaceSelectedText = (
    original: string,
    replacement: string,
    range?: Range | null
  ) => {
    const cleanReplacement = cleanSnippetHtml(replacement);

    if (templateHtml) {
      const updatedTemplate = safeReplaceHtmlContent(templateHtml, original, cleanReplacement);
      if (onUpdateTemplateHtml) {
        onUpdateTemplateHtml(updatedTemplate);
      }
      setHtml(updatedTemplate);
    } else if (html) {
      const updatedHtml = safeReplaceHtmlContent(html, original, cleanReplacement);
      setHtml(updatedHtml);
    }

    // Direct DOM cleanup if range is available inside preview container
    if (range && previewContainerRef.current) {
      try {
        if (!cleanReplacement) {
          range.deleteContents();
        }
      } catch {
        // Safe ignore DOM range errors
      }
    }
  };

  const handleDeleteSelectedText = (original: string, range?: Range | null) => {
    handleReplaceSelectedText(original, '', range);
  };

  return (
    <div className="relative">
      {/* Floating Selection Toolbar for Edit / Delete / AI */}
      <FloatingSelectionToolbar
        containerRef={previewContainerRef}
        onReplaceText={handleReplaceSelectedText}
        onDeleteText={handleDeleteSelectedText}
      />

      {previewMode ? (
        <div ref={previewContainerRef} className="min-h-[400px] p-4 sm:p-6">
          {/* Interactive Template Variables Editor (Always Stays Visible) */}
          {totalVarsCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mx-auto mb-4 max-w-[700px] rounded-2xl border p-4 text-xs shadow-sm transition-all ${
                allFilled
                  ? 'border-brand-gold/35 bg-brand-gold/5 dark:border-brand-gold/25 dark:bg-brand-gold/[0.03] text-gray-900 dark:text-gray-100'
                  : 'border-amber-300/90 bg-amber-50/95 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                      allFilled
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {allFilled ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {allFilled
                          ? `Template Fields Customized (${totalVarsCount})`
                          : `${unfilledCount} Unfilled Template Fields`}
                      </h4>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          allFilled
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {allFilled
                          ? '✓ Complete'
                          : `${totalVarsCount - unfilledCount}/${totalVarsCount} Filled`}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      {allFilled
                        ? 'Edit any field below anytime to update the live preview.'
                        : 'Fill required fields below or click auto-fill to personalize.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onAutoFillAll && (
                    <button
                      type="button"
                      onClick={onAutoFillAll}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        allFilled
                          ? 'bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25'
                          : 'bg-amber-500/20 text-amber-900 hover:bg-amber-500/30 dark:bg-amber-500/25 dark:text-amber-100'
                      }`}
                      title="Auto-fill or reset smart values"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      <span>⚡ Auto-Fill</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsEditorExpanded(!isEditorExpanded)}
                    className="flex items-center gap-1 rounded-xl border border-gray-200/80 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    <span>{isEditorExpanded ? 'Collapse' : 'Expand'}</span>
                  </button>
                </div>
              </div>

              {/* Editable Fields Grid (Keeps open & accessible) */}
              {isEditorExpanded && onVariableChange && (
                <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {allTemplateVars.map((v) => {
                    const currentVal = templateVars[v] || '';
                    const isFilled = Boolean(currentVal.trim());
                    return (
                      <div key={v} className="flex flex-col">
                        <label className="mb-1 flex items-center justify-between text-[10px] font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                          <span>{v.replace(/_/g, ' ')}</span>
                          {isFilled ? (
                            <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                              ✓ Ready
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold text-amber-500">
                              Required
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => onVariableChange(v, e.target.value)}
                          placeholder={`Enter ${v.replace(/_/g, ' ')}...`}
                          className={`focus-gold w-full rounded-lg border bg-white px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 transition-all outline-none dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 ${
                            isFilled
                              ? 'border-gray-200 dark:border-gray-700'
                              : 'border-amber-300 bg-amber-50/40 dark:border-amber-500/40 dark:bg-amber-950/20'
                          }`}
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
            className="mx-auto overflow-hidden rounded-2xl border border-gray-200/90 bg-white text-gray-900 shadow-xl dark:border-gray-700/80 dark:text-gray-900"
            style={{ maxWidth: '700px' }}
          >
            <div
              ref={renderedEmailRef}
              className="w-full overflow-x-auto bg-white"
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
            onUpdateSubject={onUpdateSubject}
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
