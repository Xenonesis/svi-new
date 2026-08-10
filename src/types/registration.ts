export interface FormData {
  firstName: string;
  lastName: string;
  mobileNo: string;
  email: string;
  soWoDo: string;
  dob: string;
  aadharNumber: string;
  panNumber: string;
  state: string;
  city: string;
  address: string;
  advisorName: string;
  project: string;
  propertySize: string;
  propertyType: string;
  plotPreference: string;
  paymentPlan: string;
  paymentMode: string;
  schemeAmount: string;
}

export const INITIAL_FORM: FormData = {
  firstName: '',
  lastName: '',
  mobileNo: '',
  email: '',
  soWoDo: '',
  dob: '',
  aadharNumber: '',
  panNumber: '',
  state: '',
  city: '',
  address: '',
  advisorName: '',
  project: '',
  propertySize: '',
  propertyType: '',
  plotPreference: '',
  paymentPlan: '',
  paymentMode: '',
  schemeAmount: '',
};
