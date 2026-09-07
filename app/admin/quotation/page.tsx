'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import QuotationForm from '@/src/components/admin/quotation/QuotationForm';
import QuotationSummary from '@/src/components/admin/quotation/QuotationSummary';
import QuotationPageHeader from '@/src/components/admin/quotation/QuotationPageHeader';
import QuotationLivePreview from '@/src/components/admin/quotation/QuotationLivePreview';
import { useQuotationPage } from '@/src/components/admin/quotation/hooks/useQuotationPage';

export default function QuotationPage() {
  const {
    formData,
    calculation,
    tierCalculations,
    hasPreview,
    isSubmitting,
    companyInfo,
    validationErrors,
    pdfLoading,
    imageLoading,
    templateLoading,
    loadingQuotationNo,
    projects,
    loadingProjects,
    fetchNextQuotationNo,
    handleChange,
    handleTiersChange,
    handleSubmit,
    handleResetForm,
    handleDownloadPDF,
    handleDownloadPNG,
  } = useQuotationPage();

  if (templateLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="border-brand-gold mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading template…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <QuotationPageHeader onNewQuotation={handleResetForm} templateLoading={templateLoading} />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Left: Form */}
        <div className="flex flex-col gap-6">
          <QuotationForm
            formData={formData}
            projects={projects}
            loadingProjects={loadingProjects}
            tierCalculations={tierCalculations}
            onChange={handleChange}
            onTiersChange={handleTiersChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            validationErrors={validationErrors}
            onRefreshQuotationNo={() => fetchNextQuotationNo(formData.quotationDate)}
            loadingQuotationNo={loadingQuotationNo}
          />

          {/* Live summary */}
          <div className="dark:bg-brand-dark-surface/65 overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-white/10">
              <div className="bg-brand-gold/10 border-brand-gold/20 flex h-7 w-7 items-center justify-center rounded border">
                <FileText className="text-brand-gold h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Calculation Summary
              </h2>
            </div>
            <QuotationSummary
              calculation={calculation}
              tierCalculations={tierCalculations}
              area={formData.area}
              paymentMonths={formData.paymentMonths}
            />
          </div>
        </div>

        {/* Right: Preview */}
        <QuotationLivePreview
          formData={formData}
          calculation={calculation}
          tierCalculations={tierCalculations}
          companyInfo={companyInfo}
          hasPreview={hasPreview}
          onDownloadPDF={handleDownloadPDF}
          onDownloadPNG={handleDownloadPNG}
          pdfLoading={pdfLoading}
          imageLoading={imageLoading}
        />
      </div>
    </div>
  );
}
