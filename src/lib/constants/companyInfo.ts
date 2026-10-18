export interface CompanyInfo {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_website: string;
}

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  company_name: 'SVI Infra Solutions Pvt. Ltd.',
  company_address: 'Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309',
  company_email: 'info@sviinfrasolutions.com',
  company_phone: '+91 9216014579',
  company_website: 'www.sviinfrasolutions.com',
};
