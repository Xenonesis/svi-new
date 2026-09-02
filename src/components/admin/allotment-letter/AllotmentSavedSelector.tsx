'use client';

import React, { useState } from 'react';
import { FileText, X, RefreshCw, Search, ChevronDown, Check } from 'lucide-react';
import { AllotmentRecordPickerModal } from './AllotmentRecordPickerModal';

interface AllotmentSavedSelectorProps {
  savedAllotments: any[];
  loadingRecords: boolean;
  selectedRecordId: string;
  onSelectRecord: (recordOrId: any) => void;
  onRefreshRecords?: () => void;
  onClearRecord?: () => void;
}

export function AllotmentSavedSelector({
  savedAllotments,
  loadingRecords,
  selectedRecordId,
  onSelectRecord,
  onRefreshRecords,
  onClearRecord,
}: AllotmentSavedSelectorProps) {
  const [showModal, setShowModal] = useState(false);

  const selectedRecord = savedAllotments.find((r) => r.id === selectedRecordId);
  const selectedName = selectedRecord?.form_data?.clientName || selectedRecord?.form_data?.name;

  return (
    <>
      <div className="dark:bg-brand-dark-surface/50 mb-6 rounded-2xl border border-gray-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-white/8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Title + Badge */}
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-gold/15 text-brand-gold flex h-8 w-8 items-center justify-center rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-gray-800 uppercase dark:text-white">
                  Load from Records
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                  {loadingRecords ? 'Syncing...' : `${savedAllotments.length} saved`}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {selectedRecord
                  ? `Active record: ${selectedName || 'Selected allotment'}`
                  : 'Quick-load past allotment data to prefill form fields'}
              </p>
            </div>
          </div>

          {/* Controls: Dropdown + Search Modal + Refresh + Clear */}
          <div
            className="flex flex-1 flex-wrap items-center justify-end gap-2"
            style={{ minWidth: 280 }}
          >
            {/* Quick Select Dropdown */}
            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <select
                value={selectedRecordId}
                onChange={(e) => onSelectRecord(e.target.value)}
                disabled={loadingRecords}
                className="focus:border-brand-gold focus:ring-brand-gold/50 w-full appearance-none rounded-xl border border-gray-200 bg-white py-2 pr-8 pl-3 text-xs text-gray-900 transition-all focus:ring-1 focus:outline-none disabled:opacity-60 dark:border-white/10 dark:bg-[#111118] dark:text-white"
              >
                <option value="">
                  {loadingRecords
                    ? 'Loading records...'
                    : savedAllotments.length === 0
                      ? '— No saved allotments —'
                      : '— Quick Select Allotment —'}
                </option>
                {savedAllotments.map((r: any) => {
                  const fd = r.form_data || {};
                  const name = fd.clientName || fd.name || 'Unnamed';
                  const ticket = fd.ticketId ? ` • ${fd.ticketId}` : '';
                  const proj = fd.projectName ? ` (${fd.projectName})` : '';
                  return (
                    <option key={r.id} value={r.id}>
                      {name}
                      {ticket}
                      {proj}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Open Full Search Modal Button */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Search and browse all saved allotment records"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Browse All ({savedAllotments.length})</span>
            </button>

            {/* Refresh Records Button */}
            {onRefreshRecords && (
              <button
                type="button"
                onClick={onRefreshRecords}
                disabled={loadingRecords}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                title="Refresh allotment records from database"
                aria-label="Refresh records"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingRecords ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Clear Selection Button */}
            {selectedRecordId && onClearRecord && (
              <button
                type="button"
                onClick={onClearRecord}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                title="Clear selected record and reset form"
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full Search & Record Picker Modal */}
      <AllotmentRecordPickerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        records={savedAllotments}
        selectedRecordId={selectedRecordId}
        onSelectRecord={(rec) => onSelectRecord(rec)}
        loading={loadingRecords}
      />
    </>
  );
}
