import { getNextReceiptNumber } from '@/src/lib/receipt/receiptNumber';

export interface PaymentReceiptFormData {
  receiptNo: string;
  date: string;
  salutation: string;
  name: string;
  refId: string;
  amount: string;
  amountWords: string;
  paymentRef: string;
  drawnOn: string;
  plotNo: string;
  plotSize: string;
  account: string;
  paymentMethod: string;
  clientPhone: string;
}

export interface CompanyInfoLike {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_website: string;
}

export const getInitialFormData = (): PaymentReceiptFormData => ({
  receiptNo: getNextReceiptNumber([]),
  date: new Date().toISOString().split('T')[0],
  salutation: 'Mr.',
  name: '',
  refId: '',
  amount: '',
  amountWords: '',
  paymentRef: '',
  drawnOn: '',
  plotNo: '',
  plotSize: '',
  account: '',
  paymentMethod: 'UPI',
  clientPhone: '',
});

export const DEFAULT_COMPANY_INFO: CompanyInfoLike = {
  company_name: 'SVI INFRA SOLUTIONS PVT. LTD',
  company_address: 'Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309',
  company_email: 'info@sviinfrasolutions.com',
  company_phone: '+91 9216014579',
  company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
};
