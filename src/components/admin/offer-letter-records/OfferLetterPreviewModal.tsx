'use client';

import { AnimatePresence, motion } from 'motion/react';
import { RefreshCw, Download, X, Image as ImageIcon } from 'lucide-react';
import OfferLetterPreviewContent from '@/src/components/admin/DocumentGenerator/OfferLetterPreviewContent';

interface SavedOfferLetter {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  form_data: {
    date: string;
    name: string;
    address: string;
    mobileNo: string;
    alternativeNo: string;
    emailId: string;
    designation: string;
    department: string;
    reportingTo: string;
    appointmentDate: string;
    location: string;
    salaryCtc: string;
    target: string;
    offerSlab: string;
    workingHoursStart: string;
    workingHoursEnd: string;
    workingDays: string;
    probationPeriod: string;
  };
}

interface CompanyInfo {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_website: string;
}

interface OfferLetterPreviewModalProps {
  offer: SavedOfferLetter | null;
  companyInfo: CompanyInfo;
  onClose: () => void;
  onDownloadPDF: () => void;
  onDownloadImage: () => void;
  pdfLoading: boolean;
  imageLoading: boolean;
}

export function OfferLetterPreviewModal({
  offer,
  companyInfo,
  onClose,
  onDownloadPDF,
  onDownloadImage,
  pdfLoading,
  imageLoading,
}: OfferLetterPreviewModalProps) {
  return (
    <AnimatePresence>
      {offer && (
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
            className="dark:bg-brand-dark-surface relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Offer Letter - {offer.form_data?.name}
                </h3>
                <p className="text-[10px] text-gray-500">
                  Generated on{' '}
                  {new Date(offer.created_at).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onDownloadPDF}
                  disabled={pdfLoading}
                  className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase shadow-md transition-all disabled:opacity-50"
                >
                  {pdfLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Download PDF
                </button>
                <button
                  onClick={onDownloadImage}
                  disabled={imageLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white uppercase shadow-md transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  {imageLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="h-3.5 w-3.5" />
                  )}
                  Save as PNG
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body with Scrollable Live Preview */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-6 dark:bg-zinc-900/30">
              <div
                id="modalOfferPreview"
                className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-sm"
              >
                <OfferLetterPreviewContent formData={offer.form_data} companyInfo={companyInfo} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
