'use client';

import Link from 'next/link';
import { FileText, RefreshCw } from 'lucide-react';

export interface QuotationHeaderProps {
  onRefresh: () => void;
  loading?: boolean;
}

export function QuotationHeader({ onRefresh, loading = false }: QuotationHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between sm:mb-8">
      <div>
        <h1 className="text-brand-navy mb-1 font-serif text-2xl tracking-tight sm:mb-2 sm:text-3xl dark:text-white">
          Quotation <span className="text-brand-gold italic">Records</span>
        </h1>
        <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
          View, search, and manage all generated quotation documents.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/admin/quotation"
          className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase shadow-md transition-all sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs"
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Quotation</span>
          <span className="sm:hidden">New</span>
        </Link>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="dark:bg-brand-dark-surface/50 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 sm:h-10 sm:w-10 sm:rounded-xl dark:border-white/10 dark:hover:bg-white/5"
          title="Refresh"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-gray-600 sm:h-4 sm:w-4 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>
    </div>
  );
}
