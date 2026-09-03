import React from 'react';
import { SALARY_SLABS, SalarySlabType } from '@/src/components/admin/OfferLetter/SlabSelector';
import { OfferLetterFormData } from './types';
import { translations, OfferLetterTranslation } from './translations';

export const getPageFontStyles = (language?: 'en' | 'hi'): React.CSSProperties => ({
  fontFamily:
    language === 'hi'
      ? 'var(--font-hindi), "Noto Sans Devanagari", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      : 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeLegibility',
  lineHeight: language === 'hi' ? 1.45 : 1.35,
});

export const pageFontStyles: React.CSSProperties = getPageFontStyles('en');

export const getTranslation = (language?: 'en' | 'hi'): OfferLetterTranslation => {
  return translations[language === 'hi' ? 'hi' : 'en'];
};

export const formatDate = (dateStr?: string) => {
  if (!dateStr) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }
  return dateStr;
};

export const formatINR = (val?: string | number) => {
  if (!val) return '0.00';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const getCandidateInitials = (name?: string) => {
  return (
    name
      ?.split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 3)
      .join('') || 'CND'
  );
};

export const getDocReferenceNumber = (formData: OfferLetterFormData) => {
  const docRefYear = formData.date
    ? formData.date.split('-')[0].length === 4
      ? formData.date.split('-')[0]
      : new Date().getFullYear()
    : new Date().getFullYear();

  const candidateInitials = getCandidateInitials(formData.name);
  const mobileSuffix = formData.mobileNo ? formData.mobileNo.slice(-4) : '2026';
  return `SVI/HR-OFFER/${docRefYear}/${candidateInitials}-${mobileSuffix}`;
};

export const resolveMatchedSlab = (
  initialMatchedSlab: SalarySlabType | null | undefined,
  formData: OfferLetterFormData
): SalarySlabType | null => {
  if (initialMatchedSlab !== undefined) return initialMatchedSlab;
  if (formData.salaryCtc) {
    return SALARY_SLABS.find((s) => parseFloat(formData.salaryCtc || '0') === s.salary) || null;
  }
  if (formData.target) {
    return SALARY_SLABS.find((s) => parseFloat(formData.target || '0') === s.target) || null;
  }
  return null;
};
