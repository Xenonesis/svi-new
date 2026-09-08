'use client';

import React from 'react';
import { Maximize2 } from 'lucide-react';
import { DownloadOptions, PreviewContainer } from '@/src/components/admin/DocumentGenerator/Shared';
import { AllotmentLetterPreview } from '@/src/components/admin/DocumentGenerator/AllotmentLetterPreview';
import type {
  AllotmentFormData,
  AllotmentCompanyInfo,
} from '@/src/components/admin/allotment-letter/hooks/useAllotmentLetterPage';

export interface AllotmentLetterPreviewContainerProps {
  preview: boolean;
  formData: AllotmentFormData;
  companyInfo: AllotmentCompanyInfo;
  onDownloadPDF: () => Promise<void> | void;
  onDownloadImage: () => Promise<void> | void;
}

export function AllotmentLetterPreviewContainer({
  preview,
  formData,
  companyInfo,
  onDownloadPDF,
  onDownloadImage,
}: AllotmentLetterPreviewContainerProps) {
  const handleToggleFullscreen = () => {
    const previewElement = document.getElementById('allotmentPreview');
    if (previewElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        previewElement.requestFullscreen().catch((err) => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      }
    }
  };

  return (
    <div className="dark:bg-brand-dark-surface relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/8">
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h2>
        {preview && (
          <button
            onClick={handleToggleFullscreen}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        )}
      </div>

      <PreviewContainer previewId="allotmentPreview" hasPreview={preview}>
        <AllotmentLetterPreview
          formData={formData}
          companyInfo={companyInfo}
          className="relative bg-white p-8 font-sans text-[13px] leading-relaxed text-black"
        />
      </PreviewContainer>

      <DownloadOptions
        onDownloadPDF={onDownloadPDF}
        onDownloadImage={onDownloadImage}
        disabled={!preview}
      />
    </div>
  );
}
