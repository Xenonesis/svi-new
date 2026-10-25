'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, DollarSign, Compass, Target, ExternalLink } from 'lucide-react';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';

interface AiInsightPopoverProps {
  intelligence: NonNullable<IvrRecordItem['ai_intelligence']>;
  customerPhone: string;
  agentName?: string;
  onOpenFullModal?: () => void;
}

export function AiInsightPopover({
  intelligence,
  customerPhone,
  agentName,
  onOpenFullModal,
}: AiInsightPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    placement: 'top',
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 320;
    const popoverHeight = 220; // approximate estimate

    // Center horizontally on trigger, but clamp within window margins
    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    if (left < 16) left = 16;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }

    // Determine whether to place above or below based on viewport space
    const spaceAbove = rect.top;
    const placement: 'top' | 'bottom' = spaceAbove > popoverHeight + 20 ? 'top' : 'bottom';
    const top = placement === 'top' ? rect.top - 8 : rect.bottom + 8;

    setCoords({ top, left, placement });
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const interestColor =
    intelligence.interest_level === 'Hot'
      ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
      : intelligence.interest_level === 'Warm'
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400'
        : 'border-gray-300 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400';

  return (
    <>
      {/* Interactive Trigger Chip */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onMouseEnter={() => {
          updatePosition();
          setIsOpen(true);
        }}
        title="Click or hover to preview AI Call Insight"
        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold transition-all hover:scale-105 active:scale-95 ${interestColor}`}
      >
        <Sparkles className="h-2.5 w-2.5 animate-pulse text-amber-500" />
        <span className="max-w-[110px] truncate">
          {intelligence.property_interest || intelligence.intent || 'AI Analyzed'}
        </span>
      </button>

      {/* Portaled Floating Popover (Bypasses Table overflow-hidden and clips) */}
      {mounted &&
        isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, scale: 0.95, y: coords.placement === 'top' ? 4 : -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: coords.placement === 'top' ? undefined : `${coords.top}px`,
                bottom:
                  coords.placement === 'top' ? `${window.innerHeight - coords.top}px` : undefined,
                left: `${coords.left}px`,
                zIndex: 99999,
              }}
              className="w-80 rounded-2xl border border-gray-200 bg-white/98 p-3.5 font-sans text-gray-900 shadow-2xl backdrop-blur-xl transition-colors duration-200 dark:border-amber-500/30 dark:bg-[#0c101c]/98 dark:text-white"
            >
              {/* Header */}
              <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <span className="text-gray-900 dark:text-white">AI Call Insight</span>
                  <span
                    className={`py-0.2 ml-1 rounded px-1.5 text-[9px] font-extrabold uppercase ${interestColor}`}
                  >
                    {intelligence.interest_level}
                  </span>
                  {intelligence.sentiment && (
                    <span
                      data-testid="popover-sentiment-badge"
                      className="py-0.2 ml-1 rounded border border-gray-200 bg-gray-50 px-1.5 text-[9px] font-semibold text-gray-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-300"
                    >
                      {intelligence.sentiment}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Caller info */}
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                <span>+91 {customerPhone}</span>
                {agentName && (
                  <>
                    <span>•</span>
                    <span>{agentName}</span>
                  </>
                )}
              </div>

              {/* Full Summary Text (No line clamp!) */}
              <p className="text-xs leading-relaxed font-medium text-gray-700 dark:text-gray-200">
                {intelligence.summary}
              </p>

              {/* Requirements Chips */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2 text-[11px] dark:border-white/10">
                {intelligence.budget && (
                  <div className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-800 dark:text-amber-300">
                    <DollarSign className="h-3 w-3" />
                    <span>{intelligence.budget}</span>
                  </div>
                )}
                {intelligence.property_interest && (
                  <div className="flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 font-semibold text-sky-800 dark:text-sky-300">
                    <Compass className="h-3 w-3" />
                    <span className="max-w-[180px] truncate">{intelligence.property_interest}</span>
                  </div>
                )}
              </div>

              {/* Recommended Action */}
              {intelligence.intent && (
                <div className="mt-2 flex items-start gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                  <Target className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                  <span>
                    Intent:{' '}
                    <strong className="text-gray-800 dark:text-gray-200">
                      {intelligence.intent}
                    </strong>
                  </span>
                </div>
              )}

              {/* Footer with Full Modal link */}
              {onOpenFullModal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullModal();
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 py-1.5 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
                >
                  <span>Open Full Analysis &amp; Audio</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
