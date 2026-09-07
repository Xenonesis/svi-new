'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export interface QuotationPageHeaderProps {
  onNewQuotation?: () => void;
  onResetForm?: () => void;
  templateLoading?: boolean;
}

export default function QuotationPageHeader({
  onNewQuotation,
  onResetForm,
  templateLoading = false,
}: QuotationPageHeaderProps) {
  const handleAction = onNewQuotation || onResetForm;

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Quotation <span className="text-brand-gold italic">Generator</span>
          </h1>
          {templateLoading && (
            <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold mb-2 flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-medium">
              <div className="border-brand-gold h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent" />
              <span>Loading template…</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create professional property quotations with automatic pricing calculations and
          downloadable PDF/PNG documents.
        </p>
      </div>
      <button
        type="button"
        onClick={handleAction}
        className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 flex w-fit items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold tracking-wide uppercase shadow-sm transition-all active:scale-95"
        title="Reset form and fetch next quotation number from DB"
      >
        <Plus className="h-4 w-4" /> New Quotation
      </button>
    </div>
  );
}
