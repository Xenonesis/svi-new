/**
 * Shared types for the BBA Legal Pages section components.
 *
 * These describe the subset of the form/company data that the BBA legal
 * preview actually consumes. The full BBA form is still typed loosely in
 * `app/admin/bba/page.tsx`; that refactor is staged separately.
 */

export interface BBALegalFormData {
  clientName: string;
  salutation?: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  projectName: string;
  unitNumber: string;
  area: string | number;
  bsp?: string | number;
  plc?: string | number;
  edc?: string | number;
  paymentPlan?: string;
  bookingDate?: string;
  fatherName?: string;
  age?: string | number;
  bookingPaymentPercent?: string;
  showSecondInstalment?: string;
  zeroPercentEmi?: string;
  emiPercentage?: string;
  edcInEmi?: string;
  emiCount?: string;
  emiStartDate?: string;
}

export interface BBALegalCompanyInfo {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_website: string;
  bank_account_name?: string;
  bank_account_no?: string;
  bank_name?: string;
  bank_ifsc?: string;
}

export interface BBALegalContext {
  formData: BBALegalFormData;
  companyInfo: BBALegalCompanyInfo;
  totalCost: number;
}
