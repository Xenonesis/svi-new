'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Loader2,
  Copy,
  LayoutTemplate,
  ChevronDown,
  Check,
  Smartphone,
  Monitor,
  Clock,
  Zap,
} from 'lucide-react';
import { useAIEmail } from '../hooks/useAIEmail';
import { getPreviewHtml, extractTemplateVars } from '@/src/lib/utils/templateParser';

interface AIComposePopoverProps {
  open: boolean;
  onClose: () => void;
  onInsert: (html: string) => void;
  onReplace: (html: string) => void;
  onApplyTemplate?: (
    html: string,
    templateName?: string,
    variables?: Record<string, string>
  ) => void;
  recipientName?: string;
  subject?: string;
}

const TONES = ['Professional', 'Friendly', 'Formal', 'Urgent'] as const;

export function AIComposePopover({
  open,
  onClose,
  onInsert,
  onReplace,
  onApplyTemplate,
  recipientName,
  subject,
}: AIComposePopoverProps) {
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<string>('Professional');
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [preview, setPreview] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [templateMeta, setTemplateMeta] = useState<{
    templateName?: string;
    variables?: Record<string, string>;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lastGenTime, setLastGenTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { autoCompose, loading, cancel } = useAIEmail();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live timer effect during generation
  useEffect(() => {
    if (loading) {
      setElapsedTime(0);
      const start = performance.now();
      timerRef.current = setInterval(() => {
        setElapsedTime(+((performance.now() - start) / 1000).toFixed(1));
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading]);

  // Auto-focus input on open
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowToneDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || loading) return;
    setPreview('');
    setTemplateMeta(null);
    setLastGenTime(null);
    const startTime = performance.now();

    try {
      const result = await autoCompose({
        prompt: prompt.trim(),
        subject: subject || undefined,
        to: recipientName || undefined,
        tone,
        onChunk: (html) => {
          setPreview(html);
        },
      });

      const totalDuration = +((performance.now() - startTime) / 1000).toFixed(1);
      setLastGenTime(totalDuration);

      if (result && result.html) {
        setPreview(result.html);
        setTemplateMeta({
          templateName: result.templateName,
          variables: result.variables,
        });
      }
    } catch (err) {
      console.error('[AICompose] Error generating:', err);
    }
  }, [prompt, tone, recipientName, subject, autoCompose, loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // Build resolved preview HTML for iframe
  const resolvedPreviewHtml = useMemo(() => {
    if (!preview) return '';
    const vars = extractTemplateVars(preview);
    const resolvedVars: Record<string, string> = {};
    vars.forEach((v) => {
      if (templateMeta?.variables?.[v]) {
        resolvedVars[v] = templateMeta.variables[v];
      } else if (v === 'name') {
        resolvedVars[v] = recipientName || 'Sanu Mishra';
      } else if (v.includes('date')) {
        resolvedVars[v] = new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } else if (v.includes('portal') || v.includes('url') || v.includes('link')) {
        resolvedVars[v] = 'https://www.sviinfrasolutions.com';
      } else {
        resolvedVars[v] = v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      }
    });

    const parsed = getPreviewHtml(preview, resolvedVars);

    // Ensure full HTML document wrapper for iframe
    if (!parsed.includes('<html')) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body style="margin:0;padding:20px 10px;background-color:#f1f5f9;">
  ${parsed}
</body>
</html>`;
    }
    return parsed;
  }, [preview, templateMeta, recipientName]);

  const handleCopy = () => {
    if (!preview) return;
    navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!preview) return;
    if (onApplyTemplate) {
      onApplyTemplate(preview, templateMeta?.templateName, templateMeta?.variables);
    } else {
      onReplace(preview);
    }
    handleClose();
  };

  const handleInsert = () => {
    if (!preview) return;
    onInsert(preview);
    handleClose();
  };

  const handleClose = () => {
    cancel();
    setPrompt('');
    setPreview('');
    setTemplateMeta(null);
    setLastGenTime(null);
    setElapsedTime(0);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-[660px] flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl dark:border-gray-700/70 dark:bg-[#121620]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="bg-brand-gold/15 text-brand-gold flex h-7 w-7 items-center justify-center rounded-lg">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      AI Email & Template Writer
                    </h3>
                    <span className="bg-brand-gold/10 text-brand-gold inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                      <Zap className="h-2.5 w-2.5" />
                      ~2-3s ultra-fast
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Generates official SVI Infra luxury corporate email templates
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="scrollbar-gold flex-1 space-y-4 overflow-y-auto p-5">
              {/* Prompt Input */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  What would you like to write?
                </label>
                <textarea
                  ref={inputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. okay you can join us as freelancer, ask for documents and schedule kickoff call..."
                  rows={3}
                  className="focus-gold w-full resize-none rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-sm text-gray-900 placeholder-gray-400 transition-all outline-none dark:border-gray-700 dark:bg-gray-900/70 dark:text-white dark:placeholder-gray-500"
                  disabled={loading}
                />
              </div>

              {/* Tone & Generate Action */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setShowToneDropdown(!showToneDropdown)}
                      className="dark:hover:bg-gray-750 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <span>
                        Tone: <strong className="text-gray-900 dark:text-white">{tone}</strong>
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                    {showToneDropdown && (
                      <div className="absolute bottom-full left-0 z-30 mb-1.5 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        {TONES.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setTone(t);
                              setShowToneDropdown(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                              tone === t
                                ? 'bg-brand-gold/15 text-brand-gold'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'
                            }`}
                          >
                            {t}
                            {tone === t && <Check className="text-brand-gold h-3.5 w-3.5" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || loading}
                    className="bg-brand-gold text-brand-dark-surface flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>
                          Generating SVI Template... (<strong>{elapsedTime.toFixed(1)}s</strong>)
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Generate Corporate Template</span>
                        <span className="py-0.2 text-brand-dark-surface/80 rounded bg-black/10 px-1.5 text-[10px] font-semibold dark:bg-black/20">
                          ~2.5s
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Live timer & progress bar while generating */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-lg bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-700 dark:text-amber-300"
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 animate-pulse text-amber-500" />
                      <span>
                        Elapsed time: <strong>{elapsedTime.toFixed(1)}s</strong> (Est. complete:
                        ~2-4s)
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-amber-600/80 dark:text-amber-400/80">
                      Generating structure...
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Output Preview (Sandboxed Iframe) */}
              {preview && (
                <div className="rounded-xl border border-gray-200/80 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-900/60">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="text-brand-gold h-3.5 w-3.5" />
                      <span className="text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                        {templateMeta?.templateName || 'SVI Corporate Email Preview'}
                      </span>
                      {lastGenTime !== null && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          ⚡ Took {lastGenTime}s
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Viewport device switcher */}
                      <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-800">
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('desktop')}
                          className={`rounded-md p-1 transition-colors ${
                            previewDevice === 'desktop'
                              ? 'bg-brand-gold/15 text-brand-gold'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                          }`}
                          title="Desktop view"
                        >
                          <Monitor className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('mobile')}
                          className={`rounded-md p-1 transition-colors ${
                            previewDevice === 'mobile'
                              ? 'bg-brand-gold/15 text-brand-gold'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                          }`}
                          title="Mobile view (375px)"
                        >
                          <Smartphone className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopy}
                        className="hover:text-brand-gold flex items-center gap-1 text-[11px] font-medium text-gray-500 transition-colors dark:text-gray-400"
                        title="Copy HTML"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy HTML</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sandboxed Iframe Container */}
                  <div className="flex justify-center overflow-hidden rounded-xl border border-gray-200 bg-[#f1f5f9] p-2 dark:border-gray-800">
                    <iframe
                      title="Corporate Email Preview"
                      srcDoc={resolvedPreviewHtml}
                      className={`h-[380px] rounded-lg border-0 bg-white shadow-md transition-all duration-200 ${
                        previewDevice === 'mobile' ? 'w-[375px]' : 'w-full'
                      }`}
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            {preview && (
              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-5 py-3 dark:border-gray-800 dark:bg-gray-900/40">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
                >
                  Discard
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInsert}
                    disabled={loading}
                    className="dark:hover:bg-gray-750 flex items-center gap-1.5 rounded-xl border border-gray-200/80 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    title="Insert content into rich text editor"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Insert Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={loading}
                    className="bg-brand-gold text-brand-dark-surface flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold shadow-sm transition-all hover:brightness-105 active:scale-[0.98]"
                  >
                    <LayoutTemplate className="h-3.5 w-3.5" />
                    <span>Apply Corporate Template</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
