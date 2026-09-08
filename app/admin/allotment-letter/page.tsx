'use client';

import { FileText } from 'lucide-react';
import { AllotmentSavedSelector } from '@/src/components/admin/allotment-letter/AllotmentSavedSelector';
import { AllotmentLetterForm } from '@/src/components/admin/allotment-letter/AllotmentLetterForm';
import { AllotmentLetterPreviewContainer } from '@/src/components/admin/allotment-letter/AllotmentLetterPreviewContainer';
import { AllotmentLetterDuplicateModal } from '@/src/components/admin/allotment-letter/AllotmentLetterDuplicateModal';
import { useAllotmentLetterPage } from '@/src/components/admin/allotment-letter/hooks/useAllotmentLetterPage';

export default function AllotmentLetterPage() {
  const page = useAllotmentLetterPage();

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Allotment <span className="text-brand-gold italic">Letter</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download official allotment letters for clients.
          </p>
        </div>
      </div>

      <AllotmentSavedSelector
        savedAllotments={page.savedAllotments}
        loadingRecords={page.loadingRecords}
        selectedRecordId={page.selectedRecordId}
        onSelectRecord={page.loadFromRecord}
        onRefreshRecords={page.refreshRecords}
        onClearRecord={page.handleClearRecord}
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="dark:bg-brand-dark-surface/65 relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
              <FileText className="text-brand-gold h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Document Details</h2>
          </div>

          <AllotmentLetterForm {...page} />
        </div>

        <AllotmentLetterPreviewContainer
          preview={page.preview}
          formData={page.formData}
          companyInfo={page.companyInfo}
          onDownloadPDF={page.handleDownloadPDF}
          onDownloadImage={page.handleDownloadImage}
        />
      </div>

      <AllotmentLetterDuplicateModal
        isOpen={page.showSaveModal}
        ticketId={page.formData.ticketId}
        onOverwrite={page.handleOverwrite}
        onCreateNew={page.handleCreateNew}
        onCancel={page.handleCancelDuplicate}
      />
    </div>
  );
}
