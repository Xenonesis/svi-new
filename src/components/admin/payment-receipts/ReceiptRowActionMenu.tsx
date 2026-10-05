'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, FileText, Mail, BookOpen, Trash2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { SavedReceipt } from './ReceiptTypes';

export interface ReceiptRowActionMenuProps {
  receipt: SavedReceipt;
  onOpenLedger?: (refId: string) => void;
  onDelete: (receipt: SavedReceipt) => void;
  onShareWhatsApp?: (receipt: SavedReceipt) => void;
  className?: string;
}

export function ReceiptRowActionMenu({
  receipt,
  onOpenLedger,
  onDelete,
  onShareWhatsApp,
  className = '',
}: ReceiptRowActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleEmail = () => {
    try {
      sessionStorage.setItem('emailPrefillRecord', JSON.stringify(receipt));
    } catch {
      // Fallback silently if sessionStorage is unavailable in context
    }
    window.location.href = '/admin/email?tab=compose&prefillReceipt=true';
  };

  const refId = receipt.form_data?.refId;

  return (
    <div ref={menuRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-700 active:scale-95 dark:text-gray-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-gray-200"
        aria-label="More actions"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="animate-in fade-in zoom-in-95 absolute top-full right-0 z-40 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-xl backdrop-blur-md duration-100 dark:border-white/[0.1] dark:bg-[#111622] dark:text-slate-200"
        >
          {/* Use as Template */}
          <Link
            href={`/admin/payment-receipt?templateId=${receipt.id}`}
            onClick={() => setIsOpen(false)}
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <FileText className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-500" />
            <span>Use as Template</span>
          </Link>

          {/* Email Receipt */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              handleEmail();
            }}
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <span>Email Receipt</span>
          </button>

          {/* Customer Ledger */}
          {refId && onOpenLedger && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenLedger(refId);
              }}
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              <BookOpen className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <span>Customer Ledger</span>
            </button>
          )}

          {/* Share via WhatsApp */}
          {onShareWhatsApp && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onShareWhatsApp(receipt);
              }}
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              <MessageSquare className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <span>Share WhatsApp</span>
            </button>
          )}

          <div className="my-1 border-t border-slate-100 dark:border-white/[0.06]" />

          {/* Delete Receipt */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDelete(receipt);
            }}
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
            <span>Delete Receipt</span>
          </button>
        </div>
      )}
    </div>
  );
}
