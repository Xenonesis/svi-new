'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'motion/react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = 'max-h-[88dvh]',
  showHandle = true,
  showCloseButton = true,
  className,
}: MobileBottomSheetProps) {
  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Handle drag down gesture to dismiss
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            className={clsx(
              'relative z-10 flex w-full max-w-lg flex-col rounded-t-3xl sm:rounded-2xl',
              'border border-gray-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111118]',
              'overflow-hidden pb-[max(1rem,env(safe-area-inset-bottom,0px))]',
              maxHeight,
              className
            )}
          >
            {/* Grab / Drag Handle */}
            {showHandle && (
              <div className="flex w-full cursor-grab items-center justify-center pt-3 pb-1 active:cursor-grabbing sm:hidden">
                <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
              </div>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-white/5">
                <div className="min-w-0 flex-1 pr-2">
                  {title && (
                    <h3 className="truncate font-serif text-lg font-bold text-gray-900 dark:text-white">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="touch-target flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="Close sheet"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
