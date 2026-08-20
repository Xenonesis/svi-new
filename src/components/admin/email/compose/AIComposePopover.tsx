'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Loader2,
  Copy,
  LayoutTemplate,
  Replace,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAIEmail } from '../hooks/useAIEmail';

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
  const [templateMeta, setTemplateMeta] = useState<{
    templateName?: string;
    variables?: Record<string, string>;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const { autoCompose, loading, cancel } = useAIEmail();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleCopy = () => {
    if (!preview) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = preview;
    navigator.clipboard.writeText(tmp.textContent || tmp.innerText || preview);
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
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative z-10 flex max-h-[88vh] w-full max-w-[620px] flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl dark:border-gray-700/70 dark:bg-[#121620]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="bg-brand-gold/15 text-brand-gold flex h-7 w-7 items-center justify-center rounded-lg">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    AI Email & Template Writer
                  </h3>
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
                      <span>Generating SVI Template...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Generate Corporate Template</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output Preview */}
              {preview && (
                <div className="rounded-xl border border-gray-200/80 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-900/60">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="text-brand-gold h-3.5 w-3.5" />
                      <span className="text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                        {templateMeta?.templateName || 'SVI Corporate Email Preview'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="hover:text-brand-gold flex items-center gap-1 text-[11px] font-medium text-gray-500 transition-colors dark:text-gray-400"
                      title="Copy text"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* High Fidelity Render Box */}
                  <div className="scrollbar-gold max-h-[320px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-inner dark:border-gray-800">
                    <div
                      className="origin-top text-xs"
                      dangerouslySetInnerHTML={{ __html: preview }}
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
