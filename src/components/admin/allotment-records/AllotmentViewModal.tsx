'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import {
  X,
  RefreshCw,
  Download,
  Image as ImageIcon,
  Edit,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AllotmentLetterPreview } from '@/src/components/admin/DocumentGenerator/AllotmentLetterPreview';
import type { SavedAllotment, CompanyInfo } from './types';

interface AllotmentViewModalProps {
  allotment: SavedAllotment | null;
  companyInfo: CompanyInfo;
  pdfLoading: boolean;
  imageLoading: boolean;
  onClose: () => void;
  onDownloadPDF: () => void;
  onDownloadImage: () => void;
}

export function AllotmentViewModal({
  allotment,
  companyInfo,
  pdfLoading,
  imageLoading,
  onClose,
  onDownloadPDF,
  onDownloadImage,
}: AllotmentViewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleZoomIn = useCallback(() => setZoomLevel((z) => Math.min(180, z + 10)), []);
  const handleZoomOut = useCallback(() => setZoomLevel((z) => Math.max(50, z - 10)), []);
  const handleResetZoom = useCallback(() => setZoomLevel(100), []);

  const handleToggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    } else {
      try {
        await containerRef.current.requestFullscreen();
      } catch (err: unknown) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    }
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const applicantName = allotment?.form_data?.applicantName || allotment?.form_data?.clientName;

  return (
    <AnimatePresence>
      {allotment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-2 backdrop-blur-md sm:p-4 dark:bg-black/90"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isFullscreen) {
              onClose();
            }
          }}
        >
          <motion.div
            ref={containerRef}
            key="allotment-view-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`dark:bg-brand-dark-surface relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all dark:border-white/10 ${
              isFullscreen
                ? 'h-screen max-h-none w-screen max-w-none rounded-none border-none p-0'
                : 'h-[92vh] w-full max-w-5xl'
            }`}
          >
            {/* Top Gold Accent Line */}
            <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

            {/* Header Bar */}
            <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h2>
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                    A4 Sheets
                  </span>
                </div>

                {(applicantName || allotment.form_data?.ticketId) && (
                  <div className="hidden max-w-[240px] truncate text-xs text-gray-500 sm:block md:max-w-[320px] dark:text-gray-400">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {applicantName || 'Record'}
                    </span>{' '}
                    {allotment.form_data?.ticketId ? `(${allotment.form_data.ticketId})` : ''}
                  </div>
                )}
              </div>

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

                {/* Fullscreen Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="hover:border-brand-gold/50 hover:bg-brand-gold/10 hover:text-brand-gold flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition-all dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Open Fullscreen'}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Exit</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Fullscreen</span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 active:scale-95"
                  title="Close Preview (Esc)"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable A4 Canvas */}
            <div className="custom-scrollbar flex-1 overflow-x-auto overflow-y-auto bg-slate-200/70 p-3 shadow-inner sm:p-6 dark:bg-[#0c0d14]">
              <div
                style={zoomLevel !== 100 ? { zoom: `${zoomLevel}%` } : undefined}
                className="mx-auto flex origin-top flex-col items-center will-change-transform"
              >
                <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
                  <AllotmentLetterPreview
                    id="modalAllotmentPreview"
                    className="relative w-full bg-white p-4 font-sans text-xs leading-relaxed text-black sm:p-8 sm:text-[13px]"
                    formData={allotment.form_data}
                    companyInfo={companyInfo}
                  />
                </div>
              </div>
            </div>

            {/* Dedicated Bottom "Download Options" Footer */}
            <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-5 dark:border-white/8 dark:bg-white/[0.02]">
              <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
                Download Options
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={onDownloadPDF}
                  disabled={pdfLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pdfLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download as PDF
                </button>
                <button
                  type="button"
                  onClick={onDownloadImage}
                  disabled={imageLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {imageLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                  Save as PNG
                </button>
                <Link
                  href={`/admin/allotment-letter?templateId=${allotment.id}`}
                  target="_blank"
                  className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold shadow-xs transition-all"
                >
                  <Edit className="h-4 w-4" />
                  Edit in Generator
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
