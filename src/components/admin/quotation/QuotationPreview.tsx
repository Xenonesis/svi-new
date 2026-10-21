'use client';

import type {
  QuotationCalculationResult,
  QuotationFormData,
  PricingTierCalculation,
  CompanyInfo,
} from '@/src/lib/quotation/types';
import { numberToIndianWords } from '@/src/lib/quotation/numberToIndianWords';
import { calculateQuotationMilestones } from '@/src/lib/quotation/calculateQuotation';

import { QuotationHeader } from './preview/QuotationHeader';
import { QuotationCustomerPropertyCards } from './preview/QuotationCustomerPropertyCards';
import { QuotationPricingTable } from './preview/QuotationPricingTable';
import { QuotationPaymentSchedule } from './preview/QuotationPaymentSchedule';
import { QuotationAmenitiesAndProcess } from './preview/QuotationAmenitiesAndProcess';
import { QuotationTermsAndFooter } from './preview/QuotationTermsAndFooter';

export interface QuotationPreviewProps {
  formData: QuotationFormData;
  calculation: QuotationCalculationResult;
  tierCalculations?: PricingTierCalculation[];
  companyInfo: CompanyInfo;
}

/** Check if notes has meaningful content (not just //, whitespace, or empty) */
function hasValidNotes(notes?: string): boolean {
  if (!notes) return false;
  const cleaned = notes.trim().replace(/^[\/\-\s]+$/, '');
  return cleaned.length > 0;
}

export default function QuotationPreview({
  formData,
  calculation,
  tierCalculations = [],
  companyInfo,
}: QuotationPreviewProps) {
  const hasMultipleTiers = Boolean(tierCalculations && tierCalculations.length > 1);
  const amountInWords = numberToIndianWords(calculation.grandTotal);
  const areaSqYds = Number(formData.area) || 0;
  const areaSqFt = Math.round(areaSqYds * 9);
  const showCustomNotes = hasValidNotes(formData.notes);
  const milestones = calculateQuotationMilestones(calculation.grandTotal, formData.paymentMonths);

  return (
    <div
      className="bg-white font-sans text-slate-900"
      style={{
        minWidth: 720,
        maxWidth: 900,
        margin: '0 auto',
        color: '#0f172a',
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        fontSize: '12px',
        lineHeight: '1.5',
      }}
    >
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <QuotationHeader companyInfo={companyInfo} formData={formData} />

      {/* ── BODY CONTAINER ─────────────────────────────────────────────── */}
      <div style={{ padding: '14px 26px 14px' }}>
        {/* Customer Dossier & Property Specifications */}
        <QuotationCustomerPropertyCards
          formData={formData}
          areaSqYds={areaSqYds}
          areaSqFt={areaSqFt}
        />

        {/* Price Breakdown Table (Single-Tier or Multi-Tier Comparative) */}
        <QuotationPricingTable
          hasMultipleTiers={hasMultipleTiers}
          tierCalculations={tierCalculations}
          calculation={calculation}
          formData={formData}
          areaSqYds={areaSqYds}
          amountInWords={amountInWords}
          milestones={milestones}
        />

        {/* Payment Milestones & Schedule Card */}
        <QuotationPaymentSchedule
          milestones={milestones}
          grandTotal={calculation.grandTotal}
          paymentMonths={formData.paymentMonths}
        />

        {/* High-Converting Value Adds & 4-Step Booking Process */}
        <QuotationAmenitiesAndProcess companyInfo={companyInfo} />

        {/* Special Remarks, Terms & Conditions & Authorized Signatory */}
        <QuotationTermsAndFooter
          formData={formData}
          companyInfo={companyInfo}
          showCustomNotes={showCustomNotes}
        />
      </div>
    </div>
  );
}
