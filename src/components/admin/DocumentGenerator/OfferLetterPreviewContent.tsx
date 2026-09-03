import {
  OfferLetterPreviewContentProps,
  OfferLetterPage1,
  OfferLetterPage2,
  OfferLetterPage3,
  formatDate,
  formatINR,
  getDocReferenceNumber,
  resolveMatchedSlab,
} from './OfferLetter';

export type {
  OfferLetterFormData,
  CompanyInfo,
  OfferLetterPreviewContentProps,
} from './OfferLetter';

export default function OfferLetterPreviewContent({
  formData,
  companyInfo,
  matchedSlab: initialMatchedSlab,
}: OfferLetterPreviewContentProps) {
  const isSalesDepartment = formData.department === 'Sales';
  const targetUnit = formData.targetUnit || 'Sq. Yd.';

  const language: 'en' | 'hi' = formData.language === 'hi' ? 'hi' : 'en';
  const matchedSlab = resolveMatchedSlab(initialMatchedSlab, formData);
  const currentDateFormatted = formatDate(formData.date);
  const appointmentDateFormatted = formatDate(formData.appointmentDate);
  const docReferenceNumber = getDocReferenceNumber(formData);

  const monthlyCTC = parseFloat(formData.salaryCtc || '0');
  const annualCTC = monthlyCTC * 12;
  const commonProps = {
    formData,
    companyInfo,
    matchedSlab,
    docReferenceNumber,
    currentDateFormatted,
    appointmentDateFormatted,
    targetUnit,
    isSalesDepartment,
    formatINR,
    annualCTC,
    language,
  };

  return (
    <div className="offer-letter-document flex flex-col items-center gap-6 bg-gray-200/60 p-2 sm:p-4">
      <OfferLetterPage1 {...commonProps} />
      <OfferLetterPage2 {...commonProps} />
      <OfferLetterPage3 {...commonProps} />
    </div>
  );
}
