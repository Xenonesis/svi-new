'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Download,
  Image as ImageIcon,
  RefreshCw,
  FileText,
  LayoutList,
  Mail,
} from 'lucide-react';
import type {
  SavedQuotation,
  CompanyInfo,
  QuotationFormData,
  QuotationCalculationResult,
} from '@/src/lib/quotation/types';
import { formatINR, formatDateDisplay } from '@/src/lib/quotation/format';
import { numberToIndianWords } from '@/src/lib/quotation/numberToIndianWords';
import { calculateQuotation, calculatePricingTiers } from '@/src/lib/quotation/calculateQuotation';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-2 backdrop-blur-md sm:p-4 dark:bg-black/90">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="dark:bg-brand-dark-surface relative flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl dark:border-white/10"
      >
        {/* Header */}
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4 dark:border-white/8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 sm:text-lg dark:text-white">
                  {fd?.quotationNo || 'Quotation'}
                </h3>
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
              <p className="text-[10px] text-gray-500">
                Created {new Date(quotation.created_at).toLocaleDateString('en-GB')}
                {fd?.customerName ? ` • ${fd.customerName}` : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 sm:hidden dark:text-gray-500 dark:hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* View Switcher Tabs & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Tab switch */}
            <div className="flex items-center rounded-lg bg-gray-100 p-1 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'border border-gray-200/50 bg-white text-gray-900 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white'
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
                    ? 'border border-gray-200/50 bg-white text-gray-900 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span>Quick Summary</span>
              </button>
            </div>

            {/* Download Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDownloadPDFClick}
                disabled={pdfLoading}
                className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase shadow-sm transition-all disabled:opacity-50 sm:px-3.5 sm:py-2 sm:text-xs"
                title="Download PDF"
              >
                {pdfLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span>PDF</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPNGClick}
                disabled={imageLoading}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white uppercase shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50 sm:px-3.5 sm:py-2 sm:text-xs"
                title="Save as PNG"
              >
                {imageLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5" />
                )}
                <span>PNG</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('emailPrefillRecord', JSON.stringify(quotation));
                  window.location.href = '/admin/email?tab=compose&prefillQuotation=true';
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-[11px] font-bold text-purple-700 uppercase shadow-sm transition-all hover:bg-purple-100 sm:px-3.5 sm:py-2 sm:text-xs dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20"
                title="Email Quotation to Client"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Email</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="ml-1 hidden text-gray-400 hover:text-gray-700 sm:block dark:text-gray-500 dark:hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-2 sm:p-6 dark:bg-zinc-900/30">
          {activeTab === 'preview' ? (
            <div
              id="modalQuotationPreview"
              className="mx-auto w-full max-w-4xl overflow-x-auto rounded-xl bg-white shadow-md transition-shadow"
            >
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
          ) : (
            /* Summary View */
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
          )}
        </div>
      </motion.div>
    </div>
  );
}
