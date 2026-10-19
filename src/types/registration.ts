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
  district: string;
  pincode: string;
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
  district: '',
  pincode: '',
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

export const INITIAL_FORM_DATA: FormData = INITIAL_FORM;
