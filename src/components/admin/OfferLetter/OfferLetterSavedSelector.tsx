'use client';

import React from 'react';
import { FileText, X } from 'lucide-react';
import type { SavedOffer } from './types';

interface OfferLetterSavedSelectorProps {
  savedOffers: SavedOffer[];
  loadingRecords: boolean;
  selectedRecordId: string;
  onSelectRecord: (id: string) => void;
}

export function OfferLetterSavedSelector({
  savedOffers,
  loadingRecords,
  selectedRecordId,
  onSelectRecord,
}: OfferLetterSavedSelectorProps) {
  return (
    <div className="dark:bg-brand-dark-surface/40 mb-6 rounded-xl border border-gray-200 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-white/8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          <FileText className="h-3.5 w-3.5" />
          Load from Records
        </div>
        <div className="relative flex-1" style={{ minWidth: 280 }}>
          <select
            value={selectedRecordId}
            onChange={(e) => onSelectRecord(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold/50 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 pr-8 text-sm text-gray-900 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
          >
            <option value="" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
              {loadingRecords
                ? 'Loading records...'
                : savedOffers.length === 0
                  ? '— No saved offer letter records found —'
                  : '— Select a saved offer letter —'}
            </option>
            {savedOffers.map((r) => (
              <option
                key={r.id}
                value={r.id}
                className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
              >
                {r.form_data?.name || 'Unnamed'} — {r.form_data?.designation || 'No designation'} (
                {new Date(r.created_at).toLocaleDateString('en-IN')})
              </option>
            ))}
          </select>
        </div>
        {selectedRecordId && (
          <button
            type="button"
            onClick={() => onSelectRecord('')}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition-all hover:border-gray-300 hover:text-gray-700 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/20"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
