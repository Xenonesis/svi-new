import { SalarySlabType } from '@/src/components/admin/OfferLetter/SlabSelector';

export interface OfferLetterFormData {
  date?: string;
  name?: string;
  address?: string;
  mobileNo?: string;
  alternativeNo?: string;
  emailId?: string;
  designation?: string;
  department?: string;
  reportingTo?: string;
  appointmentDate?: string;
  location?: string;
  salaryCtc?: string;
  salaryType?: string;
  target?: string;
  targetUnit?: 'Sq. Yd.' | 'Sq. Ft.' | 'Lakhs' | 'Crores' | string;
  offerSlab?: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  workingDays?: string;
  probationPeriod?: string;
  salesCompensationType?: string;
  noSaleMonths?: string;
  customSalaryPercent?: string;
  subsistenceAllowance?: string;
  meetingsPerMonth?: string;
  gracePeriodMonths?: string;
  reducedSalaryPercent?: string;
  enablePartialTargetRule?: boolean | string;
  partialTargetSalaryPercent?: string;
  commissionReleasePercent?: string;
  includeSiteVisitPolicy?: boolean | string;
  siteVisitSchedule?: string;
  weeklyOffDays?: string;
  includeConveyanceAllowance?: boolean | string;
  conveyanceAllowanceAmount?: string;
  includeSalesPolicyBox?: boolean;
  includeDocumentationBox?: boolean;
  includeCandidateParticularsBox?: boolean;
  language?: 'en' | 'hi';
}

export interface CompanyInfo {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_website: string;
}

export interface OfferLetterPreviewContentProps {
  formData: OfferLetterFormData;
  companyInfo: CompanyInfo;
  matchedSlab?: SalarySlabType | null;
}

export interface OfferLetterCommonProps {
  formData: OfferLetterFormData;
  companyInfo: CompanyInfo;
  matchedSlab: SalarySlabType | null;
  docReferenceNumber: string;
  currentDateFormatted: string;
  appointmentDateFormatted: string;
  targetUnit: string;
  isSalesDepartment: boolean;
  formatINR: (val?: string | number) => string;
  annualCTC: number;
  language: 'en' | 'hi';
}
