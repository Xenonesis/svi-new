'use client';

import React from 'react';
import { RefreshCw, Plus } from 'lucide-react';

export interface AllotmentLetterDuplicateModalProps {
  isOpen: boolean;
  ticketId: string;
  onOverwrite: () => void;
  onCreateNew: () => void;
  onCancel: () => void;
}

export function AllotmentLetterDuplicateModal({
  isOpen,
  ticketId,
  onOverwrite,
  onCreateNew,
  onCancel,
}: AllotmentLetterDuplicateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
      <div className="dark:bg-brand-dark-surface animate-in zoom-in-95 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl duration-200 dark:border-white/10">
        <h3 className="mb-2 font-serif text-lg font-bold text-gray-900 dark:text-white">
          Duplicate Ticket ID Found
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          An allotment letter with Ticket ID <strong className="text-brand-gold">{ticketId}</strong>{' '}
          is already saved in the database. What would you like to do?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onOverwrite}
            className="bg-brand-navy hover:bg-brand-navy/90 flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Overwrite Old One
          </button>
          <button
            onClick={onCreateNew}
            className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold tracking-wider uppercase shadow-md transition-all"
          >
            <Plus className="h-4 w-4" /> Save as New
          </button>
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-xl border border-gray-200 px-4 py-3 text-xs font-bold tracking-wider text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
