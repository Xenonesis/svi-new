import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Download,
  RefreshCw,
  Trash2,
  X,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { SavedBba } from '@/src/types/bba';
import BbaPreviewContent from '@/src/components/admin/DocumentGenerator/BbaPreviewContent';
import BbaPreviewContentHindi from '@/src/components/admin/DocumentGenerator/BbaPreviewContentHindi';

interface DeleteModalProps {
  deleteTarget: SavedBba | null;
  deleteLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function BbaDeleteModal({
  deleteTarget,
  deleteLoading,
  onCancel,
  onConfirm,
}: DeleteModalProps) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <div className="dark:bg-brand-dark-surface relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10">
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Delete BBA Record</h3>
        <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
          Are you sure you want to permanently delete the BBA record generated for{' '}
          <strong>{deleteTarget.form_data?.clientName}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleteLoading}
            className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 uppercase hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleteLoading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white uppercase hover:bg-red-700 disabled:opacity-60"
          >
            {deleteLoading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface PreviewModalProps {
  selectedBba: SavedBba | null;
  pdfLoading: boolean;
  imageLoading: boolean;
  companyInfo: any;
  onClose: () => void;
  onDownloadPDF: () => void;
  onDownloadImage: () => void;
}

export function BbaPreviewModal({
  selectedBba,
  pdfLoading,
  imageLoading,
  companyInfo,
  onClose,
  onDownloadPDF,
  onDownloadImage,
}: PreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'hi'>('en');

  // Synchronize language with loaded record
  useEffect(() => {
    if (selectedBba?.form_data?.language === 'hi' || selectedBba?.form_data?.language === 'en') {
      setActiveLanguage(selectedBba.form_data.language);
    } else {
      setActiveLanguage('en');
    }
  }, [selectedBba]);

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

  // Keyboard shortcut for Esc
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

  if (!selectedBba) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-2 backdrop-blur-md sm:p-4 dark:bg-black/90"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isFullscreen) {
          onClose();
        }
      }}
    >
      <div
        ref={containerRef}
        className={`dark:bg-brand-dark-surface relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all dark:border-white/10 ${
          isFullscreen
            ? 'h-screen max-h-none w-screen max-w-none rounded-none border-none p-0'
            : 'h-[92vh] w-full max-w-5xl'
        }`}
      >
        <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        {/* Header Bar matching BbaPreviewContainer */}
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/8">
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
                onClick={() => setActiveLanguage('en')}
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
                onClick={() => setActiveLanguage('hi')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  activeLanguage === 'hi'
                    ? 'bg-brand-gold text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>

            <div className="hidden max-w-[200px] truncate text-xs text-gray-500 sm:block md:max-w-[280px] dark:text-gray-400">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {selectedBba.form_data?.clientName || 'Record'}
              </span>{' '}
              ({selectedBba.form_data?.ticketId || 'No Ticket'})
            </div>
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

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="hover:border-brand-gold/50 hover:bg-brand-gold/10 hover:text-brand-gold flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
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
            id="modalBbaPreview"
            style={zoomLevel !== 100 ? { zoom: `${zoomLevel}%` } : undefined}
            className="mx-auto flex origin-top flex-col items-center will-change-transform"
          >
            {activeLanguage === 'hi' ? (
              <BbaPreviewContentHindi formData={selectedBba.form_data} companyInfo={companyInfo} />
            ) : (
              <BbaPreviewContent formData={selectedBba.form_data} companyInfo={companyInfo} />
            )}
          </div>
        </div>

        {/* Download Options Panel */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-5 dark:border-white/8 dark:bg-white/[0.02]">
          <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Download Options</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
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
              onClick={onDownloadImage}
              disabled={imageLoading}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {imageLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              Save as Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
