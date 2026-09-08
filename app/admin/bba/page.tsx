'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ClipboardList, FileText } from 'lucide-react';
import { BBAForm } from '@/src/components/admin/bba/BBAForm';
import { BbaPreviewContainer } from '@/src/components/admin/bba/BbaPreviewContainer';
import { useBbaPage } from '@/src/components/admin/bba/hooks/useBbaPage';

function BbaPageContent() {
  const page = useBbaPage();

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Builder Buyer <span className="text-brand-gold italic">Agreement (BBA)</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download official Builder Buyer Agreements for clients.
          </p>
        </div>
        <Link
          href="/admin/bba-records"
          className="flex w-fit items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
        >
          <ClipboardList className="h-4 w-4" /> View Records
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="dark:bg-brand-dark-surface/65 relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
          <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
                <FileText className="text-brand-gold h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Agreement Details</h2>
            </div>

            {page.savedBbas.length > 0 && (
              <select
                className="border-brand-navy/20 focus:border-brand-gold focus:ring-brand-gold/20 dark:border-brand-gold/20 dark:bg-brand-gold/5 dark:focus:border-brand-gold w-full rounded-xl border bg-white/50 px-3 py-1.5 text-sm text-gray-900 backdrop-blur-sm transition-all outline-none sm:w-auto dark:text-white"
                value={page.documentId || ''}
                onChange={page.handleLoadBba}
              >
                <option
                  value=""
                  className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
                >
                  -- Create New BBA --
                </option>
                {page.savedBbas.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
                  >
                    {b.form_data?.clientName || 'Unknown'} - {b.form_data?.ticketId || 'No Ticket'}{' '}
                    ({new Date(b.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>
          <BBAForm {...page} />
        </div>

        <BbaPreviewContainer
          preview={page.preview}
          formData={page.formData}
          companyInfo={page.companyInfo}
          activeLanguage={page.activeLanguage}
          onLanguageChange={page.setActiveLanguage}
          onDownloadPDF={page.handleDownloadPDF}
          onDownloadImage={page.handleDownloadImage}
        />
      </div>
    </div>
  );
}

export default function BbaPage() {
  return (
    <Suspense fallback={<div>Loading BBA Generator...</div>}>
      <BbaPageContent />
    </Suspense>
  );
}
