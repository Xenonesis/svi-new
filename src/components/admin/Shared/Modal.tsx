'use client';

import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  actions,
  children,
  size = 'lg',
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-md dark:bg-black/85"
      onClick={onClose}
    >
      <div
        className={`dark:bg-brand-dark-surface relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/8">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
              )}
              {description && <p className="text-[10px] text-gray-500">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        )}
        {!title && !description && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Footer Actions */}
        {actions && (
          <div className="border-t border-gray-100 p-4 dark:border-white/8">{actions}</div>
        )}
      </div>
    </div>
  );
}
