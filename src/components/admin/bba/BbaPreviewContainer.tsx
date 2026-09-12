'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileDown,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleZoomIn = useCallback(() => setZoomLevel((z) => Math.min(180, z + 10)), []);
  const handleZoomOut = useCallback(() => setZoomLevel((z) => Math.max(50, z - 10)), []);
  const handleResetZoom = useCallback(() => setZoomLevel(100), []);

  const handleFitWidth = useCallback(() => {
    if (typeof window === 'undefined') return;
    const availableWidth = window.innerWidth - (isFullscreen ? 64 : 120);
    const computed = Math.min(160, Math.max(60, Math.floor((availableWidth / 794) * 100)));
    setZoomLevel(computed);
  }, [isFullscreen]);

  const handleFitPage = useCallback(() => {
    if (typeof window === 'undefined') return;
    const availableHeight = window.innerHeight - (isFullscreen ? 120 : 200);
    const computed = Math.min(140, Math.max(40, Math.floor((availableHeight / 1122) * 100)));
    setZoomLevel(computed);
  }, [isFullscreen]);

  const handleToggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    } else {
      try {
        await containerRef.current.requestFullscreen();
        // Intelligent initial zoom in fullscreen: fit to width comfortably if widescreen
        if (window.innerWidth >= 1200) {
          const availableWidth = window.innerWidth - 80;
          const targetZoom = Math.min(135, Math.max(100, Math.floor((availableWidth / 794) * 85)));
          setZoomLevel(targetZoom);
        }
      } catch (err: unknown) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    }
  }, []);

  // Listen to native fullscreen changes (sync Esc key and UI toggles)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = document.fullscreenElement === containerRef.current;
      setIsFullscreen(active);
      if (!active) {
        setZoomLevel(100);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts during fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleFitWidth();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handleFitPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, handleZoomIn, handleZoomOut, handleResetZoom, handleFitWidth, handleFitPage]);

  // Mouse wheel zoom listener (Ctrl + Wheel or Trackpad Pinch) throttled with RAF
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    let deltaAccumulator = 0;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        deltaAccumulator += e.deltaY;

        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            if (Math.abs(deltaAccumulator) >= 8) {
              const delta = deltaAccumulator;
              deltaAccumulator = 0;
              const isLarge = Math.abs(delta) > 40;
              const step = delta < 0 ? (isLarge ? 10 : 4) : isLarge ? -10 : -4;
              setZoomLevel((prev) => Math.min(200, Math.max(40, prev + step)));
            }
            rafId = null;
          });
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isFullscreen]);

  // ──────────────────────────────────────────────────────────────────────────
  // FULLSCREEN MODE VIEW
  // ──────────────────────────────────────────────────────────────────────────
  if (isFullscreen) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-[9999] flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100 select-none"
      >
        {/* Fullscreen Executive HUD */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800/90 bg-slate-950/95 px-4 shadow-lg backdrop-blur-md sm:px-6">
          {/* Left: Document Info */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
              <FileText className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wide text-white sm:text-sm">
                  BBA Provisional Allotment Letter
                </span>
                <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                  A4 • 16 Pages
                </span>
              </div>
              <p className="hidden text-[10.5px] text-slate-400 sm:block">
                Unit {formData.unitNumber || '—'} | {formData.clientName || 'Applicant'}
              </p>
            </div>
          </div>

          {/* Center: Controls (Language & Zoom) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <div className="flex items-center rounded-lg border border-slate-700/60 bg-slate-800/80 p-0.5">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  activeLanguage === 'en'
                    ? 'bg-amber-500 font-semibold text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  activeLanguage === 'hi'
                    ? 'bg-amber-500 font-semibold text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Zoom Controls HUD */}
            <div className="flex items-center rounded-lg border border-slate-700/60 bg-slate-800/80 p-0.5 text-xs text-slate-200">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                className="rounded p-1 hover:bg-white/10 disabled:opacity-30"
                title="Zoom Out (- or Ctrl + Mouse Wheel)"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span
                className="w-11 cursor-default text-center font-medium tabular-nums"
                title="Current zoom (use Ctrl + Mouse Wheel to zoom)"
              >
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 180}
                className="rounded p-1 hover:bg-white/10 disabled:opacity-30"
                title="Zoom In (+ or Ctrl + Mouse Wheel)"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <div className="mx-1 hidden h-3.5 w-px bg-slate-700 sm:block" />
              <button
                type="button"
                onClick={handleFitWidth}
                className="hidden rounded px-2 py-0.5 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white sm:block"
                title="Fit document to screen width (W)"
              >
                Fit Width
              </button>
              <button
                type="button"
                onClick={handleFitPage}
                className="hidden rounded px-2 py-0.5 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white sm:block"
                title="Fit full page vertically (P)"
              >
                Fit Page
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="hidden rounded px-1.5 py-0.5 text-[11px] text-slate-400 hover:bg-white/10 hover:text-white sm:block"
                title="Reset zoom to 100% (0)"
              >
                100%
              </button>
              <span className="hidden border-l border-slate-700/80 px-2 py-0.5 font-mono text-[10px] text-slate-400 lg:inline">
                Ctrl + 🖱️ Scroll
              </span>
            </div>
          </div>

          {/* Right: Actions (Download & Exit) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownloadPDF}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition-colors hover:bg-blue-500 active:scale-95"
              title="Download official PDF copy"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onDownloadImage}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition-colors hover:bg-emerald-500 active:scale-95"
              title="Save document preview as PNG image"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Save PNG</span>
            </button>

            <div className="mx-1 h-4 w-px bg-slate-800" />

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-sm transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 active:scale-95"
              title="Exit Fullscreen (Esc)"
            >
              <Minimize2 className="h-3.5 w-3.5" />
              <span>Exit</span>
              <kbd className="py-0.2 hidden rounded bg-slate-900 px-1 font-mono text-[9px] text-slate-400 sm:inline">
                Esc
              </kbd>
            </button>
          </div>
        </header>

        {/* Fullscreen Document Canvas */}
        <main className="custom-scrollbar flex flex-1 flex-col items-center overflow-x-auto overflow-y-auto bg-slate-900/95 px-4 py-8 shadow-inner select-text">
          <div
            id="bbaPreview"
            style={zoomLevel !== 100 ? { zoom: `${zoomLevel}%` } : undefined}
            className="mx-auto flex origin-top flex-col items-center will-change-transform"
          >
            {activeLanguage === 'hi' ? (
              <BbaPreviewContentHindi formData={formData} companyInfo={companyInfo} />
            ) : (
              <BbaPreviewContent formData={formData} companyInfo={companyInfo} />
            )}
          </div>
        </main>
      </div>
    );
  }

  const isLivePreviewActive =
    preview ||
    Boolean(
      formData?.clientName?.trim() ||
      formData?.unitNumber?.trim() ||
      formData?.ticketId?.trim() ||
      formData?.fatherName?.trim() ||
      formData?.aadharNumber?.trim() ||
      formData?.mobileNumber?.trim() ||
      formData?.email?.trim() ||
      formData?.panNumber?.trim() ||
      Number(formData?.area) > 0 ||
      formData?.projectName
    );

  // ──────────────────────────────────────────────────────────────────────────
  // STANDARD IN-PAGE EMBEDDED VIEW
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="dark:bg-brand-dark-surface relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/8"
    >
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      {/* Header bar */}
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

        {isLivePreviewActive && (
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
                disabled={zoomLevel >= 180}
                className="rounded p-1 hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-white/10"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <div className="mx-0.5 h-3 w-px bg-gray-300 dark:bg-white/10" />
              <button
                type="button"
                onClick={handleResetZoom}
                className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-white/10 dark:hover:text-white"
                title="Reset to 100%"
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>

            <button
              onClick={handleToggleFullscreen}
              className="hover:border-brand-gold/50 hover:bg-brand-gold/10 hover:text-brand-gold flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              title="Open Fullscreen Document Canvas"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          </div>
        )}
      </div>

      <PreviewContainer
        previewId="bbaPreview"
        hasPreview={isLivePreviewActive}
        containerClassName="custom-scrollbar relative flex-1 overflow-hidden rounded-xl border border-gray-200 bg-slate-200/70 dark:bg-[#0c0d14] p-2 shadow-inner dark:border-white/10"
        className="custom-scrollbar mx-auto h-full w-full overflow-x-auto overflow-y-auto px-2 py-6 text-gray-800 will-change-transform"
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
        disabled={!isLivePreviewActive}
      />
    </div>
  );
}
