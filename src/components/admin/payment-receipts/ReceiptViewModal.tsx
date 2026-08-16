import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Download, Image as ImageIcon, X, RefreshCw } from 'lucide-react';
import { SavedReceipt } from './ReceiptTypes';

interface ReceiptViewModalProps {
  selectedReceipt: SavedReceipt | null;
  setSelectedReceipt: (val: SavedReceipt | null) => void;
  pdfLoading: boolean;
  imageLoading: boolean;
  handleDownloadPDF: () => void;
  handleDownloadImage: () => void;
}

export function ReceiptViewModal({
  selectedReceipt,
  setSelectedReceipt,
  pdfLoading,
  imageLoading,
  handleDownloadPDF,
  handleDownloadImage,
}: ReceiptViewModalProps) {
  return (
    <AnimatePresence>
      {selectedReceipt && (
        <motion.div
          key="view-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-md dark:bg-black/90"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="dark:bg-brand-dark-surface relative flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl dark:border-white/10"
          >
            {/* Modal Header */}
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4 dark:border-white/8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 sm:text-lg dark:text-white">
                    Payment Receipt No: {selectedReceipt.form_data?.receiptNo}
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    Generated on {new Date(selectedReceipt.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  aria-label="Close modal"
                  className="text-gray-500 hover:text-gray-800 sm:hidden dark:text-gray-400 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase shadow-md transition-all disabled:opacity-50 sm:flex-initial sm:px-4 sm:py-2 sm:text-xs"
                >
                  {pdfLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Download PDF
                </button>
                <button
                  onClick={handleDownloadImage}
                  disabled={imageLoading}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white uppercase shadow-md transition-all hover:bg-emerald-700 disabled:opacity-50 sm:flex-initial sm:px-4 sm:py-2 sm:text-xs"
                >
                  {imageLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="h-3.5 w-3.5" />
                  )}
                  Save as PNG
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  aria-label="Close modal"
                  className="hidden text-gray-500 hover:text-gray-800 sm:block dark:text-gray-400 dark:hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body with Scrollable Live Preview */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-2 sm:p-6 dark:bg-zinc-900/30">
              <div
                id="modalReceiptPreview"
                className="mx-auto w-full max-w-3xl rounded-xl bg-white p-8 font-sans text-black shadow-sm"
              >
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
                      Office Address : A-61 Sector 65 Noida Uttar Pradesh 201309
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
                          ? new Date(selectedReceipt.form_data.drawnOn).toLocaleDateString('en-GB')
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
                    {parseFloat(selectedReceipt.form_data?.amount || '0').toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
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
                  Thank you for your business. Please keep this receipt for your records. This is a
                  computer generated document.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
