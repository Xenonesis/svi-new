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
        className="fixed inset-x-4 top-[10vh] z-[60] overflow-hidden rounded-xl border border-[#EAEAEA] bg-white shadow-sm sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[420px] dark:border-gray-800 dark:bg-[#111111]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAEAEA] px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#FBF3DB] text-[#956400] dark:bg-[#956400]/20">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-medium text-[#111111] dark:text-gray-200">
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
              className="w-full resize-none rounded-md border border-[#EAEAEA] bg-white px-3 py-3 text-sm text-[#111111] placeholder-gray-400 outline-none focus:border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-gray-100"
              disabled={loading}
            />
          </div>

          {/* Tone + Generate */}
          <div className="mt-3 flex items-center gap-2">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowToneDropdown(!showToneDropdown)}
                className="flex items-center gap-1.5 rounded-md border border-[#EAEAEA] bg-white px-3 py-1.5 text-xs font-medium text-[#111111] transition-transform hover:scale-[0.98] dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-gray-200"
              >
                {tone}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showToneDropdown && (
                <div className="absolute bottom-full left-0 z-10 mb-1 w-36 overflow-hidden rounded-md border border-[#EAEAEA] bg-white shadow-sm dark:border-gray-700 dark:bg-[#1a1a1a]">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTone(t);
                        setShowToneDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                        tone === t
                          ? 'bg-[#EAEAEA] text-[#111111] dark:bg-gray-800 dark:text-white'
                          : 'text-[#787774] hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5'
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
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#111111] px-4 py-1.5 text-xs font-medium text-white transition-transform hover:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-[#111111]"
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
          <div className="border-t border-[#EAEAEA] dark:border-gray-800">
            <div className="scrollbar-gold max-h-[240px] overflow-y-auto p-4">
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-[#EAEAEA] px-4 py-3 dark:border-gray-800">
              <button
                onClick={handleInsert}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-md border border-[#EAEAEA] bg-white px-3 py-1.5 text-xs font-medium text-[#111111] transition-transform hover:scale-[0.98] disabled:opacity-50 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-gray-200"
              >
                <Copy className="h-3 w-3" />
                Insert
              </button>
              <button
                onClick={handleReplace}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-md bg-[#111111] px-3 py-1.5 text-xs font-medium text-white transition-transform hover:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-[#111111]"
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
