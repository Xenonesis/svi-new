'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
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
import { SavedReceipt } from './ReceiptTypes';

export interface ReceiptViewModalProps {
  selectedReceipt: SavedReceipt | null;
  setSelectedReceipt: (val: SavedReceipt | null) => void;
  pdfLoading: boolean;
  imageLoading: boolean;
  handleDownloadPDF: () => void;
  handleDownloadImage: () => void;
  onClose?: () => void;
}

export function ReceiptViewModal({
  selectedReceipt,
  setSelectedReceipt,
  pdfLoading,
  imageLoading,
  handleDownloadPDF,
  handleDownloadImage,
  onClose,
}: ReceiptViewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      setSelectedReceipt(null);
    }
  }, [onClose, setSelectedReceipt]);

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
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const receiptNo = selectedReceipt?.form_data?.receiptNo;
  const clientName =
    (selectedReceipt?.form_data?.customerName as string | undefined) ||
    selectedReceipt?.form_data?.name;

  return (
    <AnimatePresence>
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-2 backdrop-blur-md sm:p-4 dark:bg-black/90"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isFullscreen) {
              handleClose();
            }
          }}
        >
          <motion.div
            ref={containerRef}
            key="view-modal"
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

                {(receiptNo || clientName) && (
                  <div className="hidden max-w-[240px] truncate text-xs text-gray-500 sm:block md:max-w-[320px] dark:text-gray-400">
                    {receiptNo && (
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Receipt #{receiptNo}
                      </span>
                    )}
                    {clientName && (
                      <span>
                        {receiptNo ? ' • ' : ''}
                        {clientName}
                      </span>
                    )}
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
                  onClick={handleClose}
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
                id="modalReceiptPreview"
                style={zoomLevel !== 100 ? { zoom: `${zoomLevel}%` } : undefined}
                className="mx-auto flex origin-top flex-col items-center will-change-transform"
              >
                <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white p-8 font-sans text-black shadow-2xl">
                  {/* Header */}
                  <div className="border-brand-gold mb-6 flex items-start justify-between border-b-2 pb-6">
                    <div>
                      <h1 className="mb-2 text-2xl font-bold tracking-wide text-[#1e3a8a] uppercase">
                        SVI INFRA SOLUTIONS PVT. LTD
                      </h1>
                      <p className="text-[13px] text-gray-700">
                        Cell: +91 9216014579 | Email: info@sviinfrasolutions.com
                      </p>
                      <p className="text-[13px] text-gray-700">
                        Website: www.sviinfrasolutions.in | www.sviinfrasolutions.com
                      </p>
                      <p className="text-[13px] text-gray-700">
                        Office Address : Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh
                        201309
                      </p>
                    </div>
                    <div className="w-48">
                      <img
                        src="/logo.png"
                        alt="SVI Infra Solutions"
                        className="h-auto w-full object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  </div>

                  <div className="mb-6 text-center">
                    <h2 className="inline-block rounded bg-[#1e3a8a] px-6 py-2 text-lg font-bold tracking-widest text-white uppercase shadow-md">
                      Payment Receipt
                    </h2>
                  </div>

                  <div className="mb-8 flex justify-between font-sans text-sm font-bold">
                    <p className="rounded border-l-4 border-[#1e3a8a] bg-gray-50 px-4 py-2 shadow-sm">
                      Receipt No:{' '}
                      <span className="ml-1 text-red-600">
                        {selectedReceipt.form_data?.receiptNo || '___________'}
                      </span>
                    </p>
                    <p className="rounded border-l-4 border-[#1e3a8a] bg-gray-50 px-4 py-2 shadow-sm">
                      Date:{' '}
                      <span className="ml-1 text-red-600">
                        {selectedReceipt.form_data?.date
                          ? new Date(selectedReceipt.form_data.date).toLocaleDateString('en-GB')
                          : '___________'}
                      </span>
                    </p>
                  </div>

                  <div className="relative space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-6 font-sans text-[15px] leading-relaxed shadow-sm">
                    {/* Watermark */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.12]">
                      <img
                        src="/logo.png"
                        alt=""
                        className="w-96"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>

                    <div className="relative z-10 flex items-end">
                      <span className="mr-2 whitespace-nowrap">
                        Received with thanks from {selectedReceipt.form_data?.salutation} :
                      </span>
                      <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold text-[#1e3a8a] italic">
                        {selectedReceipt.form_data?.name}
                      </span>
                    </div>

                    <div className="relative z-10 flex items-end">
                      <span className="mr-2 whitespace-nowrap">Ref. Id :</span>
                      <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                        {selectedReceipt.form_data?.refId}
                      </span>
                    </div>

                    <div className="relative z-10 flex items-end">
                      <span className="mr-2 whitespace-nowrap">The sum of Rupees :</span>
                      <span className="flex-1 border-b border-gray-400 pb-0.5 text-lg font-bold text-gray-800">
                        ₹{' '}
                        {parseFloat(selectedReceipt.form_data?.amount || '0').toLocaleString(
                          'en-IN',
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>

                    <div className="relative z-10 flex items-end">
                      <span className="mr-2 whitespace-nowrap">Rupees in Words :</span>
                      <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold text-[#1e3a8a] italic">
                        {selectedReceipt.form_data?.amountWords}
                      </span>
                    </div>

                    <div className="relative z-10 flex items-end">
                      <span className="mr-2 whitespace-nowrap">
                        By{' '}
                        {selectedReceipt.form_data?.paymentMethod === 'UPI' ||
                        selectedReceipt.form_data?.paymentMethod === 'Cheque'
                          ? 'UPI No / Cheque no'
                          : selectedReceipt.form_data?.paymentMethod}{' '}
                        No :
                      </span>
                      <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                        {selectedReceipt.form_data?.paymentRef}
                      </span>
                    </div>

                    <div className="relative z-10 flex justify-between gap-6 pt-2">
                      <div className="flex flex-1 items-end">
                        <span className="mr-2 whitespace-nowrap">Drawn On :</span>
                        <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                          {selectedReceipt.form_data?.drawnOn
                            ? new Date(selectedReceipt.form_data.drawnOn).toLocaleDateString(
                                'en-GB'
                              )
                            : ''}
                        </span>
                      </div>
                      <div className="flex flex-1 items-end">
                        <span className="mr-2 whitespace-nowrap">Plot No :</span>
                        <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold text-red-600">
                          {selectedReceipt.form_data?.plotNo}
                        </span>
                      </div>
                      <div className="flex flex-1 items-end">
                        <span className="mr-2 whitespace-nowrap">Plot Size :</span>
                        <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                          {selectedReceipt.form_data?.plotSize} Sq. Yds.
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-end pt-2">
                      <span className="mr-2 whitespace-nowrap">On Account of :</span>
                      <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                        {selectedReceipt.form_data?.account}
                      </span>
                    </div>

                    {parseFloat(selectedReceipt.form_data?.amount || '0') === 2100 && (
                      <div className="relative z-10 mt-6 rounded-lg border-2 border-red-500 bg-red-50 p-4">
                        <p className="text-sm font-bold text-red-700">Terms & Conditions:</p>
                        <p className="mt-2 text-sm font-medium text-gray-900">
                          This is a refundable amount of ₹2100. If your name is not selected in the
                          draw, the amount will be automatically refunded within the next 48 hours.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-12 flex items-end justify-between pb-8">
                    <div className="rounded-lg border-2 border-[#1e3a8a] bg-white px-8 py-4 text-2xl font-bold text-[#1e3a8a] shadow-md">
                      ₹{' '}
                      {parseFloat(selectedReceipt.form_data?.amount || '0').toLocaleString(
                        'en-IN',
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                      {'/-'}
                    </div>
                    <div className="relative text-center">
                      <img
                        src="/signature.png"
                        alt="Signature"
                        className="absolute bottom-10 left-1/2 h-28 w-auto -translate-x-1/2 opacity-95 mix-blend-multiply"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <div className="relative z-10 w-56 border-t-2 border-black pt-2">
                        <p className="text-sm font-bold text-[#1e3a8a]">
                          For SVI INFRA SOLUTIONS PVT. LTD
                        </p>
                        <p className="mt-1 text-xs font-bold text-gray-700">Authorized Signatory</p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-8 border-t border-gray-200 pt-4 text-center text-[11px] text-gray-500 italic">
                    Thank you for your business. Please keep this receipt for your records. This is
                    a computer generated document.
                  </p>
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
                  onClick={handleDownloadPDF}
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
                  onClick={handleDownloadImage}
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
                  href={`/admin/payment-receipt?receiptNo=${encodeURIComponent(selectedReceipt.form_data?.receiptNo || '')}`}
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
