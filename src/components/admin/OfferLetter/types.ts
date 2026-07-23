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
  target: string;
  offerSlab: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string;
  probationPeriod: string;
  salesCompensationType: string;
  noSaleMonths: string;
  customSalaryPercent: string;
  subsistenceAllowance: string;
}

export interface SavedOffer {
  id: string;
  form_data: Partial<OfferLetterFormData>;
  created_at: string;
}
