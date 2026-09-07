'use client';

import React from 'react';
import { PreviewContainer, DownloadOptions } from '@/src/components/admin/DocumentGenerator/Shared';
import QuotationPreview from '@/src/components/admin/quotation/QuotationPreview';
import type {
  QuotationFormData,
  QuotationCalculationResult,
  PricingTierCalculation,
  CompanyInfo,
} from '@/src/lib/quotation/types';

export interface QuotationLivePreviewProps {
  formData: QuotationFormData;
  calculation: QuotationCalculationResult | null;
  tierCalculations?: PricingTierCalculation[];
  companyInfo: CompanyInfo;
  hasPreview: boolean;
  onDownloadPDF: () => void;
  onDownloadPNG: () => void;
  pdfLoading?: boolean;
  imageLoading?: boolean;
}

export default function QuotationLivePreview({
  formData,
  calculation,
  tierCalculations = [],
  companyInfo,
  hasPreview,
  onDownloadPDF,
  onDownloadPNG,
  pdfLoading = false,
  imageLoading = false,
}: QuotationLivePreviewProps) {
  const isLivePreviewReady = hasPreview || Boolean(calculation && Number(formData.area) > 0);

  const handleToggleFullscreen = () => {
    const el = document.getElementById('quotationPreview');
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen().catch(console.error);
    }
  };

  return (
    <div className="dark:bg-brand-dark-surface/65 relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl xl:sticky xl:top-6 dark:border-white/8">
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h2>
        {isLivePreviewReady && (
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
            title="Toggle Fullscreen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
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
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        )}
      </div>

      <PreviewContainer previewId="quotationPreview" hasPreview={isLivePreviewReady}>
        {calculation && (
          <QuotationPreview
            formData={formData}
            calculation={calculation}
            tierCalculations={tierCalculations}
            companyInfo={companyInfo}
          />
        )}
      </PreviewContainer>

      <DownloadOptions
        onDownloadPDF={onDownloadPDF}
        onDownloadImage={onDownloadPNG}
        disabled={!isLivePreviewReady || pdfLoading || imageLoading}
      />
    </div>
  );
}
