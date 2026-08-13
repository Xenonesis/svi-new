// Quotation type definitions

export interface QuotationFormData {
  quotationNo: string;
  quotationDate: string;
  validUntil: string;

  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;

  projectName: string;
  plotNo: string;
  propertyType: string;

  area: string;
  basicRate: string;
  edcRate: string;
  plcPercent: string;

  notes: string;
}

export interface QuotationCalculationInput {
  area: number;
  basicRate: number;
  edcRate: number;
  plcPercent: number;
}

export interface QuotationCalculationResult {
  area: number;
  basicRate: number;
  basicPrice: number;

  edcRate: number;
  edcAmount: number;

  plcPercent: number;
  plcAmount: number;

  grandTotal: number;
  effectiveRate: number;
}

export interface SavedQuotation {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  form_data: QuotationFormData & {
    calculation: QuotationCalculationResult;
  };
}

export type CompanyInfo = {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_website: string;
  [key: string]: string;
};
