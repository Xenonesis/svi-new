export interface OfferLetterFormData {
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
  salaryType?: 'CTC' | 'in_hand' | string;
  target: string;
  targetUnit?: 'Sq. Yd.' | 'Sq. Ft.' | 'Lakhs' | 'Crores' | string;
  offerSlab: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string;
  probationPeriod: string;
  salesCompensationType: string;
  noSaleMonths: string;
  customSalaryPercent: string;
  subsistenceAllowance: string;
  meetingsPerMonth: string;
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

export const SALES_DESIGNATIONS = [
  'Telecaller',
  'BDM',
  'BDE',
  'Sales Manager',
  'Senior Sales Manager',
  'Team Leader',
] as const;

export type SalesDesignation = (typeof SALES_DESIGNATIONS)[number];

export interface SavedOffer {
  id: string;
  form_data: Partial<OfferLetterFormData>;
  created_at: string;
}

export interface SavedOfferLetter {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  form_data: Partial<OfferLetterFormData>;
}
