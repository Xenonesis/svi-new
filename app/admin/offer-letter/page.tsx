'use client';

import React from 'react';
import { DownloadOptions, PreviewContainer } from '@/src/components/admin/DocumentGenerator/Shared';
import OfferLetterPreviewContent from '@/src/components/admin/DocumentGenerator/OfferLetterPreviewContent';
import { OfferLetterForm } from '@/src/components/admin/OfferLetter/OfferLetterForm';
import { useOfferLetterForm } from '@/src/components/admin/OfferLetter/useOfferLetterForm';
import { OfferLetterSavedSelector } from '@/src/components/admin/OfferLetter/OfferLetterSavedSelector';

export default function OfferLetterPage() {
  const {
    companyInfo,
    formData,
    setFormData,
    savedOffers,
    loadingRecords,
    selectedRecordId,
    showSalesOptions,
    setShowSalesOptions,
    showSlabs,
    setShowSlabs,
    salesCustomDesignation,
    setSalesCustomDesignation,
    showCustomDesignation,
    setShowCustomDesignation,
    isGenerating,
    preview,
    matchedSlab,
    getCandidateFilename,
    loadFromRecord,
    handleChange,
    handleSalaryChange,
    handleTargetChange,
    handleSalarySelect,
    handleTargetSelect,
    handleLoadOffer,
    handleSubmit,
    handleDownloadPDF,
    handleDownloadImage,
  } = useOfferLetterForm();

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Offer <span className="text-brand-gold italic">Letter</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download offer letters for new employees.
          </p>
        </div>
      </div>

      {/* Saved Records Selector */}
      <OfferLetterSavedSelector
        savedOffers={savedOffers}
        loadingRecords={loadingRecords}
        selectedRecordId={selectedRecordId}
        onSelectRecord={loadFromRecord}
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Form Controls */}
        <OfferLetterForm
          formData={formData}
          setFormData={setFormData}
          savedOffers={savedOffers}
          selectedRecordId={selectedRecordId}
          isGenerating={isGenerating}
          showSalesOptions={showSalesOptions}
          setShowSalesOptions={setShowSalesOptions}
          showSlabs={showSlabs}
          setShowSlabs={setShowSlabs}
          salesCustomDesignation={salesCustomDesignation}
          setSalesCustomDesignation={setSalesCustomDesignation}
          showCustomDesignation={showCustomDesignation}
          setShowCustomDesignation={setShowCustomDesignation}
          handleLoadOffer={handleLoadOffer}
          handleSubmit={handleSubmit}
          handleSalaryChange={handleSalaryChange}
          handleTargetChange={handleTargetChange}
          handleSalarySelect={handleSalarySelect}
          handleTargetSelect={handleTargetSelect}
          handleChange={handleChange}
        />

        {/* Preview & Downloads */}
        <div className="dark:bg-brand-dark-surface relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Preview</h2>
              {formData.name?.trim() && (
                <span className="hidden rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-600 sm:inline-block dark:bg-emerald-500/15 dark:text-emerald-400">
                  {getCandidateFilename('pdf')}
                </span>
              )}
            </div>
            {preview && (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('offerPreview');
                  if (el) {
                    if (document.fullscreenElement) document.exitFullscreen();
                    else el.requestFullscreen().catch(() => {});
                  }
                }}
                className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-300"
                title="Fullscreen"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
              </button>
            )}
          </div>

          <PreviewContainer previewId="offerPreview" hasPreview={preview}>
            <OfferLetterPreviewContent
              formData={formData}
              companyInfo={companyInfo}
              matchedSlab={matchedSlab}
            />
          </PreviewContainer>

          <DownloadOptions
            onDownloadPDF={handleDownloadPDF}
            onDownloadImage={handleDownloadImage}
            disabled={!preview}
          />
        </div>
      </div>
    </div>
  );
}
