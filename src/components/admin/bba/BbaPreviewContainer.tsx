'use client';

import React from 'react';
import { Maximize2 } from 'lucide-react';
import { DownloadOptions, PreviewContainer } from '@/src/components/admin/DocumentGenerator/Shared';
import BbaPreviewContent from '@/src/components/admin/DocumentGenerator/BbaPreviewContent';
import BbaPreviewContentHindi from '@/src/components/admin/DocumentGenerator/BbaPreviewContentHindi';
import type { BbaFormData, BbaCompanyInfo } from '@/src/components/admin/bba/hooks/useBbaPage';

export interface BbaPreviewContainerProps {
  preview: boolean;
  formData: BbaFormData;
  companyInfo: BbaCompanyInfo;
  activeLanguage: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  onDownloadPDF: () => Promise<void> | void;
  onDownloadImage: () => Promise<void> | void;
}

export function BbaPreviewContainer({
  preview,
  formData,
  companyInfo,
  activeLanguage,
  onLanguageChange,
  onDownloadPDF,
  onDownloadImage,
}: BbaPreviewContainerProps) {
  const handleToggleFullscreen = () => {
    const previewElement = document.getElementById('bbaPreview');
    if (previewElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        previewElement.requestFullscreen().catch((err: unknown) => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      }
    }
  };

  return (
    <div className="dark:bg-brand-dark-surface relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/8">
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h2>
          {/* Language Tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-white/5">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                activeLanguage === 'en'
                  ? 'bg-brand-gold text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('hi')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                activeLanguage === 'hi'
                  ? 'bg-brand-gold text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

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

      <PreviewContainer previewId="bbaPreview" hasPreview={preview}>
        {activeLanguage === 'hi' ? (
          <BbaPreviewContentHindi formData={formData} companyInfo={companyInfo} />
        ) : (
          <BbaPreviewContent formData={formData} companyInfo={companyInfo} />
        )}
      </PreviewContainer>

      <DownloadOptions
        onDownloadPDF={onDownloadPDF}
        onDownloadImage={onDownloadImage}
        disabled={!preview}
      />
    </div>
  );
}
