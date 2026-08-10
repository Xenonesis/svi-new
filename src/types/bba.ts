export interface SavedBba {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  form_data: {
    salutation: string;
    clientName: string;
    aadharNumber: string;
    fatherName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    pincode: string;
    state: string;
    phone: string;
    email: string;
    projectName: string;
    unitNumber: string;
    area: string;
    bsp: string;
    plc: string;
    paymentPlan: string;
    bookingDate: string;
    secondPaymentDays: string;
    advisorName: string;
    advisorNumber: string;
    advisorEmail?: string;
    age?: string;
    language?: string;
  };
}
