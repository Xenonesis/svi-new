export interface SavedAllotment {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  form_data: {
    clientName: string;
    salutation: string;
    address: string;
    ticketId: string;
    projectName: string;
    unitNumber: string;
    area: string;
    bsp: string;
    plc: string;
    edc?: string;
    paymentPlan: string;
    bookingDate: string;
    secondPaymentDays: string;
    advisorName: string;
    advisorNumber: string;
    advisorEmail?: string;
    aadharNumber?: string;
    fatherName?: string;
    onBookingPaymentRef?: string;
    within15DaysPaymentRef?: string;
  };
}

export interface CompanyInfo {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_website: string;
  bank_account_name: string;
  bank_account_no: string;
  bank_name: string;
  bank_ifsc: string;
}

export function calculateTotalCost(formData: SavedAllotment['form_data']) {
  const area = parseFloat(formData?.area) || 0;
  const bsp = parseFloat(formData?.bsp) || 0;
  const plc = parseFloat(formData?.plc) || 0;
  const edc = parseFloat(formData?.edc || '0') || 0;
  const base = area * bsp;
  const plcAmount = base * (plc / 100);
  return base + plcAmount + edc;
}
