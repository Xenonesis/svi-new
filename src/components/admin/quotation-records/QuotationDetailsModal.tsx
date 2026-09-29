'use client';

import QuotationViewModal from '@/src/components/admin/quotation/QuotationViewModal';
import type { SavedQuotation, CompanyInfo } from '@/src/lib/quotation/types';

export interface QuotationDetailsModalProps {
  quotation: SavedQuotation | null;
  companyInfo: CompanyInfo;
  onClose: () => void;
  onDownloadPDF: () => Promise<void>;
  onDownloadPNG: () => Promise<void>;
  pdfLoading: boolean;
  imageLoading: boolean;
}

export function QuotationDetailsModal({
  quotation,
  companyInfo,
  onClose,
  onDownloadPDF,
  onDownloadPNG,
  pdfLoading,
  imageLoading,
}: QuotationDetailsModalProps) {
  if (!quotation) return null;

  return (
    <QuotationViewModal
      quotation={quotation}
      companyInfo={companyInfo}
      onClose={onClose}
      onDownloadPDF={onDownloadPDF}
      onDownloadPNG={onDownloadPNG}
      pdfLoading={pdfLoading}
      imageLoading={imageLoading}
    />
  );
}
