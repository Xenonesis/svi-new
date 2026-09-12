'use client';

import React, { useState } from 'react';
import { Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(150, z + 10));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(50, z - 10));
  const handleResetZoom = () => setZoomLevel(100);

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
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h2>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
              A4 Sheets
            </span>
          </div>

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
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                className="rounded p-1 hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-white/10"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="hover:text-brand-gold px-2 py-0.5 font-medium tabular-nums"
                title="Reset zoom to 100%"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 150}
                className="rounded p-1 hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-white/10"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={handleToggleFullscreen}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          </div>
        )}
      </div>

      <PreviewContainer
        previewId="bbaPreview"
        hasPreview={preview}
        containerClassName="custom-scrollbar relative flex-1 overflow-hidden rounded-xl border border-gray-200 bg-slate-200/70 dark:bg-[#0c0d14] p-2 shadow-inner dark:border-white/10 [:fullscreen]:overflow-hidden [:fullscreen]:rounded-none [:fullscreen]:border-none [:fullscreen]:p-0"
        className="custom-scrollbar mx-auto h-full w-full overflow-x-auto overflow-y-auto px-2 py-6 text-gray-800 [:fullscreen]:h-full [:fullscreen]:py-8"
        style={zoomLevel !== 100 ? { zoom: `${zoomLevel}%` } : undefined}
      >
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
