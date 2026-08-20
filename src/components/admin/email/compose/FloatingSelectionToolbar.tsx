'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, PenLine, Trash2, X, Loader2, Wand2, ArrowRight } from 'lucide-react';
import { useAIEmail } from '../hooks/useAIEmail';
import { toast } from 'sonner';

interface FloatingSelectionToolbarProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  onReplaceText: (original: string, replacement: string, range?: Range | null) => void;
  onDeleteText: (original: string, range?: Range | null) => void;
}

const AI_PRESETS = [
  {
    label: 'Make Professional',
    instruction: 'Make this text concise, executive and professional.',
  },
  {
    label: 'Make Bullet Points',
    instruction: 'Convert this text into clean, clear bullet points.',
  },
  { label: 'Make Shorter', instruction: 'Shorten this text while preserving all key information.' },
  {
    label: 'Fix Grammar & Flow',
    instruction: 'Fix grammar, punctuation and improve sentence flow.',
  },
  {
    label: 'Translate to Hindi',
    instruction: 'Translate this text accurately into polite Hindi (भारतीय हिंदी).',
  },
];

export function FloatingSelectionToolbar({
  containerRef,
  onReplaceText,
  onDeleteText,
}: FloatingSelectionToolbarProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const savedRangeRef = useRef<Range | null>(null);
  const { improveContent, loading } = useAIEmail();
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update selection position
  const handleSelectionChange = useCallback(() => {
    // If popovers are open, don't auto-dismiss
    if (showAIPanel || showEditPanel) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      if (!showAIPanel && !showEditPanel) {
        setPosition(null);
        setSelectedText('');
        savedRangeRef.current = null;
      }
      return;
    }

    const text = selection.toString().trim();
    if (!text || text.length < 2) {
      setPosition(null);
      setSelectedText('');
      savedRangeRef.current = null;
      return;
    }

    // Check if selection is within the container if containerRef is provided
    if (containerRef?.current) {
      const anchorNode = selection.anchorNode;
      if (anchorNode && !containerRef.current.contains(anchorNode)) {
        return;
      }
    }

    try {
      const range = selection.getRangeAt(0);
      savedRangeRef.current = range.cloneRange();
      const rect = range.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) return;

      const top = rect.top + window.scrollY - 48;
      const left = Math.max(
        16,
        Math.min(window.innerWidth - 300, rect.left + rect.width / 2 - 130)
      );

      setPosition({ top, left });
      setSelectedText(text);
      setEditValue(text);
    } catch {
      // Ignore range errors
    }
  }, [containerRef, showAIPanel, showEditPanel]);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // If clicking inside toolbar, don't reset selection
      if (toolbarRef.current && toolbarRef.current.contains(e.target as Node)) {
        return;
      }
      setTimeout(handleSelectionChange, 30);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift' || e.key.startsWith('Arrow')) {
        setTimeout(handleSelectionChange, 30);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleSelectionChange]);

  const handleClose = () => {
    setPosition(null);
    setSelectedText('');
    setShowAIPanel(false);
    setShowEditPanel(false);
    setCustomPrompt('');
    savedRangeRef.current = null;
  };

  // 1. Delete selected text
  const handleDelete = () => {
    if (!selectedText) return;
    onDeleteText(selectedText, savedRangeRef.current);
    toast.success('Deleted selected text');
    handleClose();
  };

  // 2. Direct Edit / Save
  const handleSaveEdit = () => {
    if (!selectedText || !editValue.trim()) return;
    onReplaceText(selectedText, editValue, savedRangeRef.current);
    toast.success('Updated text snippet');
    handleClose();
  };

  // 3. AI Rewrite
  const handleAIRewrite = async (instruction: string) => {
    if (!selectedText) return;
    try {
      const result = await improveContent({
        html: selectedText,
        instruction,
      });

      if (result && result.trim()) {
        onReplaceText(selectedText, result.trim(), savedRangeRef.current);
        toast.success('Rewrote selection with AI');
        handleClose();
      }
    } catch (err) {
      console.error('[FloatingSelection] AI rewrite error:', err);
    }
  };

  if (!mounted || !position || !selectedText) return null;

  return createPortal(
    <div
      ref={toolbarRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
      className="pointer-events-auto select-none"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 6 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col items-center"
        >
          {/* Main Floating Bubble Bar */}
          <div className="flex items-center gap-1 rounded-xl border border-gray-200/90 bg-white/95 px-2 py-1.5 shadow-2xl backdrop-blur-md dark:border-gray-700/80 dark:bg-gray-900/95">
            {/* AI Rewrite Action */}
            <button
              type="button"
              onClick={() => {
                setShowAIPanel(!showAIPanel);
                setShowEditPanel(false);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                showAIPanel
                  ? 'bg-brand-gold text-brand-dark-surface'
                  : 'bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Tools</span>
            </button>

            {/* Edit Action */}
            <button
              type="button"
              onClick={() => {
                setShowEditPanel(!showEditPanel);
                setShowAIPanel(false);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                showEditPanel
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              <PenLine className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>

            {/* Delete Action */}
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
              title="Delete selected text"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* AI Tools Dropdown Panel */}
          {showAIPanel && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="mt-1.5 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  ✨ AI Quick Actions
                </span>
                {loading && <Loader2 className="text-brand-gold h-3.5 w-3.5 animate-spin" />}
              </div>

              {/* Preset Buttons */}
              <div className="space-y-1">
                {AI_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={loading}
                    onClick={() => handleAIRewrite(preset.instruction)}
                    className="hover:bg-brand-gold/15 hover:text-brand-dark-surface dark:hover:bg-brand-gold/20 flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-gray-700 transition-colors disabled:opacity-50 dark:text-gray-200 dark:hover:text-white"
                  >
                    <span>{preset.label}</span>
                    <Wand2 className="text-brand-gold h-3 w-3 opacity-70" />
                  </button>
                ))}
              </div>

              {/* Custom Prompt Input */}
              <div className="mt-2.5 border-t border-gray-100 pt-2.5 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Custom instruction..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customPrompt.trim()) {
                        handleAIRewrite(customPrompt.trim());
                      }
                    }}
                    className="focus-gold w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-900 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="button"
                    disabled={!customPrompt.trim() || loading}
                    onClick={() => handleAIRewrite(customPrompt.trim())}
                    className="bg-brand-gold text-brand-dark-surface rounded-lg p-1.5 hover:brightness-105 disabled:opacity-40"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Inline Edit Panel */}
          {showEditPanel && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="mt-1.5 w-80 rounded-xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  ✏️ Edit Selected Text
                </span>
              </div>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={4}
                className="focus-gold w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                autoFocus
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="bg-brand-gold text-brand-dark-surface rounded-lg px-3 py-1 text-xs font-semibold hover:brightness-105"
                >
                  Replace Text
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
