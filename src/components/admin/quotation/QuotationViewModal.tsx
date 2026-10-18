'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  X,
  Download,
  Image as ImageIcon,
  RefreshCw,
  FileText,
  LayoutList,
  Mail,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Edit,
} from 'lucide-react';
import type {
  SavedQuotation,
  CompanyInfo,
  QuotationFormData,
  QuotationCalculationResult,
} from '@/src/lib/quotation/types';
import { formatINR, formatDateDisplay } from '@/src/lib/quotation/format';
import { numberToIndianWords } from '@/src/lib/quotation/numberToIndianWords';
import {
  calculateQuotation,
  calculatePricingTiers,
  calculateQuotationMilestones,
} from '@/src/lib/quotation/calculateQuotation';
import QuotationPreview from '@/src/components/admin/quotation/QuotationPreview';

interface QuotationViewModalProps {
  quotation: SavedQuotation;
  companyInfo: CompanyInfo;
  onClose: () => void;
  onDownloadPDF: () => Promise<void>;
  onDownloadPNG: () => Promise<void>;
  pdfLoading: boolean;
  imageLoading: boolean;
}

export default function QuotationViewModal({
  quotation,
  companyInfo,
  onClose,
  onDownloadPDF,
  onDownloadPNG,
  pdfLoading,
  imageLoading,
}: QuotationViewModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'summary'>('preview');
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

  const fd = quotation.form_data;

  // Derive or recalculate calculation safely
  const calc: QuotationCalculationResult | null = useMemo(() => {
    if (fd?.calculation) return fd.calculation;
    if (!fd) return null;
    try {
      return calculateQuotation({
        area: Number(fd.area) || 0,
        basicRate: Number(fd.basicRate) || 0,
        edcRate: Number(fd.edcRate) || 0,
        plcPercent: Number(fd.plcPercent) || 0,
      });
    } catch {
      return null;
    }
  }, [fd]);

  const tierCalculations = useMemo(() => {
    if (!fd?.pricingTiers || fd.pricingTiers.length === 0) return [];
    try {
      return calculatePricingTiers(Number(fd.area) || 0, fd.pricingTiers);
    } catch {
      return [];
    }
  }, [fd]);
  const milestones = useMemo(() => {
    if (!calc) return null;
    return calculateQuotationMilestones(calc.grandTotal, fd?.paymentMonths);
  }, [calc, fd?.paymentMonths]);

  const handleDownloadPDFClick = async () => {
    if (activeTab !== 'preview') {
      setActiveTab('preview');
      const { promise, resolve } = Promise.withResolvers<void>();
      setTimeout(resolve, 150);
      await promise;
    }
    await onDownloadPDF();
  };

  const handleDownloadPNGClick = async () => {
    if (activeTab !== 'preview') {
      setActiveTab('preview');
      const { promise, resolve } = Promise.withResolvers<void>();
      setTimeout(resolve, 150);
      await promise;
    }
    await onDownloadPNG();
  };
  return (
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
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
              <h2 className="text-base font-bold text-gray-900 sm:text-lg dark:text-white">
                {fd?.quotationNo || 'Quotation'}
              </h2>
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                A4 Sheets
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase sm:text-[10px] ${
                  quotation.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                }`}
              >
                {quotation.status}
              </span>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center rounded-lg bg-gray-100 p-1 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'border border-gray-200/50 bg-white text-gray-900 shadow-xs dark:border-white/10 dark:bg-white/10 dark:text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Document Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeTab === 'summary'
                    ? 'border border-gray-200/50 bg-white text-gray-900 shadow-xs dark:border-white/10 dark:bg-white/10 dark:text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span>Quick Summary</span>
              </button>
            </div>

            {fd?.customerName && (
              <div className="hidden max-w-[200px] truncate text-xs text-gray-500 sm:block md:max-w-[260px] dark:text-gray-400">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {fd.customerName}
                </span>{' '}
                {fd.projectName ? `(${fd.projectName})` : ''}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls when on preview */}
            {activeTab === 'preview' && (
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
            )}

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

        {/* Body Canvas / Summary */}
        {activeTab === 'preview' ? (
          <div className="custom-scrollbar flex-1 overflow-x-auto overflow-y-auto bg-slate-200/70 p-3 shadow-inner sm:p-6 dark:bg-[#0c0d14]">
            <div
              id="modalQuotationPreview"
              style={zoomLevel !== 100 ? { zoom: `${zoomLevel}%` } : undefined}
              className="mx-auto flex origin-top flex-col items-center will-change-transform"
            >
              <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
                {calc && fd ? (
                  <QuotationPreview
                    formData={fd as QuotationFormData}
                    calculation={calc}
                    tierCalculations={tierCalculations}
                    companyInfo={companyInfo}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                    <p className="text-sm font-semibold">Unable to render quotation preview</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Calculation details are unavailable for this quotation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Summary View */
          <div className="custom-scrollbar flex-1 overflow-y-auto bg-gray-100 p-3 sm:p-6 dark:bg-zinc-900/30">
            <div className="dark:bg-brand-dark-card mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-white/10">
              {/* Dates */}
              <div className="mb-5 flex flex-wrap items-center gap-3">
                {fd?.quotationDate && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Date:{' '}
                    <strong className="text-gray-800 dark:text-gray-200">
                      {formatDateDisplay(fd.quotationDate)}
                    </strong>
                  </span>
                )}
                {fd?.validUntil && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Valid until:{' '}
                    <strong className="text-gray-800 dark:text-gray-200">
                      {formatDateDisplay(fd.validUntil)}
                    </strong>
                  </span>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Customer */}
                <div className="rounded-lg border border-gray-100 p-4 dark:border-white/8">
                  <p className="mb-3 text-[10px] font-bold tracking-widest text-amber-600 uppercase">
                    Customer
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {fd?.customerName || '—'}
                  </p>
                  {fd?.customerPhone && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {fd.customerPhone}
                    </p>
                  )}
                  {fd?.customerEmail && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{fd.customerEmail}</p>
                  )}
                  {fd?.customerAddress && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {fd.customerAddress}
                    </p>
                  )}
                </div>

                {/* Property */}
                <div className="rounded-lg border border-gray-100 p-4 dark:border-white/8">
                  <p className="mb-3 text-[10px] font-bold tracking-widest text-amber-600 uppercase">
                    Property
                  </p>
                  {fd?.projectName && (
                    <div className="mb-1.5 flex gap-3 text-sm">
                      <span className="min-w-[72px] text-gray-400">Project</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {fd.projectName}
                      </span>
                    </div>
                  )}
                  {fd?.plotNo && (
                    <div className="mb-1.5 flex gap-3 text-sm">
                      <span className="min-w-[72px] text-gray-400">Plot / Unit</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {fd.plotNo}
                      </span>
                    </div>
                  )}
                  {fd?.propertyType && (
                    <div className="mb-1.5 flex gap-3 text-sm">
                      <span className="min-w-[72px] text-gray-400">Type</span>
                      <span className="text-gray-700 dark:text-gray-300">{fd.propertyType}</span>
                    </div>
                  )}
                  {fd?.area && (
                    <div className="flex gap-3 text-sm">
                      <span className="min-w-[72px] text-gray-400">Area</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {Number(fd.area).toLocaleString('en-IN')} Sq. Yds.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              {calc && (
                <div className="mt-5">
                  <p className="mb-3 text-[10px] font-bold tracking-widest text-amber-600 uppercase">
                    Pricing Breakdown
                  </p>
                  <table className="w-full rounded-lg border border-gray-100 text-sm dark:border-white/8">
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {[
                        ['Basic Price', formatINR(calc.basicPrice)],
                        ['EDC Amount', formatINR(calc.edcAmount)],
                        [`PLC @ ${calc.plcPercent}%`, formatINR(calc.plcAmount)],
                        ['Effective Rate', `${formatINR(calc.effectiveRate)} / Sq. Yd.`],
                      ].map(([label, value]) => (
                        <tr key={label} className="hover:bg-gray-50/50 dark:hover:bg-white/3">
                          <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{label}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-900 dark:text-white">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Grand Total */}
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-500/10">
                    <span className="text-sm font-bold text-amber-900 dark:text-amber-400">
                      Grand Total
                    </span>
                    <span className="text-xl font-extrabold text-amber-900 dark:text-amber-400">
                      {formatINR(calc.grandTotal)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 italic dark:text-gray-400">
                    {numberToIndianWords(calc.grandTotal)}
                  </p>

                  {/* Payment Milestones */}
                  {milestones && (
                    <div className="mt-4 rounded-lg border border-amber-200/60 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[10px] font-bold tracking-widest text-amber-900 uppercase dark:text-amber-300">
                          Payment Milestones &amp; Terms
                        </p>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                          ✓ No-Cost EMI (0% Interest)
                        </span>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-3">
                        <div className="rounded bg-white/70 p-2.5 dark:bg-black/20">
                          <span className="block font-bold text-gray-700 dark:text-gray-300">
                            1. Draw Token (10%)
                          </span>
                          <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
                            {formatINR(milestones.tokenAmount)}
                          </span>
                          <span className="block text-[10px] text-gray-500 dark:text-gray-400">
                            Within 2–3 days after draw
                          </span>
                        </div>
                        <div className="rounded bg-white/70 p-2.5 dark:bg-black/20">
                          <span className="block font-bold text-gray-700 dark:text-gray-300">
                            2. Allotment (20%)
                          </span>
                          <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
                            {formatINR(milestones.allotmentAmount)}
                          </span>
                          <span className="block text-[10px] text-gray-500 dark:text-gray-400">
                            Within 15–30 days
                          </span>
                        </div>
                        <div className="rounded bg-white/70 p-2.5 dark:bg-black/20">
                          <span className="block font-bold text-gray-700 dark:text-gray-300">
                            3. Balance (70%)
                          </span>
                          <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                            {formatINR(milestones.remainingAmount)}
                          </span>
                          <span className="block text-[10px] text-gray-500 dark:text-gray-400">
                            {milestones.monthlyEmiOnRemaining
                              ? `≈ ${formatINR(milestones.monthlyEmiOnRemaining)}/mo (${fd?.paymentMonths} mos)`
                              : 'On agreed No-Cost EMI'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {fd?.notes && fd.notes.trim().replace(/^[\/\-\s]+$/, '').length > 0 && (
                <div className="mt-5 rounded-lg border border-gray-100 p-4 dark:border-white/8">
                  <p className="mb-2 text-[10px] font-bold tracking-widest text-amber-600 uppercase">
                    Notes &amp; Remarks
                  </p>
                  <p className="text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                    {fd.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dedicated Bottom "Download Options" Footer */}
        {activeTab === 'preview' ? (
          <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-5 dark:border-white/8 dark:bg-white/[0.02]">
            <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
              Download Options
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button
                type="button"
                onClick={handleDownloadPDFClick}
                disabled={pdfLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pdfLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download PDF
              </button>
              <button
                type="button"
                onClick={handleDownloadPNGClick}
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
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('emailPrefillRecord', JSON.stringify(quotation));
                  window.location.href = '/admin/email?tab=compose&prefillQuotation=true';
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 py-3 text-sm font-semibold text-purple-700 shadow-xs transition-all hover:bg-purple-500/20 dark:text-purple-300"
              >
                <Mail className="h-4 w-4" />
                Email Quotation
              </button>
              <Link
                href={`/admin/quotation?id=${quotation.id}`}
                target="_blank"
                className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold shadow-xs transition-all"
              >
                <Edit className="h-4 w-4" />
                Edit in Generator
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 p-4 sm:px-6 dark:border-white/8 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className="flex items-center gap-2 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            >
              <FileText className="h-4 w-4" />
              Switch to Document Preview to download
            </button>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/quotation?id=${quotation.id}`}
                target="_blank"
                className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-xs transition-all"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit in Generator
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
