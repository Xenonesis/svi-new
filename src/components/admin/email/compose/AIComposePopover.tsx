'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Loader2, Copy, Replace, ChevronDown } from 'lucide-react';
import { useAIEmail } from '../hooks/useAIEmail';

interface AIComposePopoverProps {
  open: boolean;
  onClose: () => void;
  onInsert: (html: string) => void;
  onReplace: (html: string) => void;
  recipientName?: string;
  subject?: string;
}

const TONES = ['Professional', 'Friendly', 'Formal', 'Urgent'] as const;

export function AIComposePopover({
  open,
  onClose,
  onInsert,
  onReplace,
  recipientName,
  subject,
}: AIComposePopoverProps) {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<string>('Professional');
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [preview, setPreview] = useState('');
  const { generateContent, loading, cancel } = useAIEmail();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount: cancel any in-flight request
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cancel();
    };
  }, [cancel]);

  // Auto-focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      // Reset when opening fresh
      if (!preview) setPrompt('');
    }
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

    await generateContent({
      prompt: prompt.trim(),
      tone,
      context: { recipientName, subject },
      onChunk: (text) => {
        if (mountedRef.current) setPreview(text);
      },
    });
  }, [prompt, tone, recipientName, subject, generateContent, loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleInsert = () => {
    if (!preview) return;
    onInsert(preview);
    handleClose();
  };

  const handleReplace = () => {
    if (!preview) return;
    onReplace(preview);
    handleClose();
  };

  const handleClose = () => {
    cancel();
    setPrompt('');
    setPreview('');
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="dark:bg-brand-dark-surface absolute top-full left-0 z-50 mt-2 w-[420px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="bg-brand-gold/15 flex h-6 w-6 items-center justify-center rounded-lg">
              <Sparkles className="text-brand-gold h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              AI Email Writer
            </span>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Prompt Input */}
        <div className="p-4">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the email you want to write..."
              rows={3}
              className="focus-gold w-full resize-none rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none dark:border-gray-600 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500"
              disabled={loading}
            />
          </div>

          {/* Tone + Generate */}
          <div className="mt-3 flex items-center gap-2">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowToneDropdown(!showToneDropdown)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                {tone}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showToneDropdown && (
                <div className="dark:bg-brand-dark-surface absolute bottom-full left-0 z-10 mb-1 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTone(t);
                        setShowToneDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                        tone === t
                          ? 'bg-brand-gold/10 text-brand-gold'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="bg-brand-gold text-brand-navy flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <div className="scrollbar-gold max-h-[240px] overflow-y-auto p-4">
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
              <button
                onClick={handleInsert}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <Copy className="h-3 w-3" />
                Insert
              </button>
              <button
                onClick={handleReplace}
                disabled={loading}
                className="bg-brand-gold text-brand-navy flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Replace className="h-3 w-3" />
                Replace
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
