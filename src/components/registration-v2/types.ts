import type React from 'react';
import type { FormData } from '@/src/types/registration';

export type RegistrationV2Step = 1 | 2 | 3 | 4;

export interface SchemeBreakdown {
  sqYards: number;
  sqFeet: number;
  tokenAmount: number;
  planDescription: string;
}

export interface StepProps {
  formData: FormData;
  errors: Record<string, string>;
  attempted: boolean;
  t: (key: string) => string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

export interface StepProgressBarProps {
  currentStep: RegistrationV2Step;
  onSelectStep?: (step: RegistrationV2Step) => void;
}

export interface Step1ApplicantProps extends StepProps {
  onNext: () => void;
}
export interface Step2KycDocumentsProps extends StepProps {
  photoFile: File | null;
  panCardFile: File | null;
  compressing: 'photo' | 'panCard' | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'panCard') => void;
  onRemoveFile: (type: 'photo' | 'panCard') => void;
  onNext: () => void;
  onPrev: () => void;
}

export interface SchemeCalculatorV2Props {
  size: string;
  project: string;
  plan: string;
  className?: string;
}

export interface Step3PropertySchemeProps extends StepProps {
  advisors: string[];
  projects: { value: string; label: string }[];
  onNext: () => void;
  onPrev: () => void;
}
export interface Step4ReviewConfirmProps extends StepProps {
  photoFile: File | null;
  panCardFile: File | null;
  captchaAnswer: string;
  captchaError: string;
  isSubmitting: boolean;
  submitError: string;
  onCaptchaValidate: (answer: string) => void;
  onEditStep: (step: 1 | 2 | 3) => void;
  onProceedToPayment: () => void;
  onPrev: () => void;
}
export interface KycPreviewCardProps {
  fullName: string;
  photoFile: File | null;
  panCardFile: File | null;
  aadharNumber: string;
  panNumber: string;
  city: string;
  state: string;
  className?: string;
}

export interface UseRegistrationV2Return {
  currentStep: RegistrationV2Step;
  setCurrentStep: React.Dispatch<React.SetStateAction<RegistrationV2Step>>;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSubmitting: boolean;
  submitError: string;
  photoFile: File | null;
  panCardFile: File | null;
  captchaAnswer: string;
  setCaptchaAnswer: React.Dispatch<React.SetStateAction<string>>;
  captchaError: string;
  compressing: 'photo' | 'panCard' | null;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  draftRestored: boolean;
  attemptedSteps: Record<RegistrationV2Step, boolean>;
  advisors: string[];
  projects: { value: string; label: string }[];
  validateStep1: () => boolean;
  validateStep2: () => boolean;
  validateStep3: () => boolean;
  validateStep4: () => boolean;
  validateStep: (step: RegistrationV2Step) => boolean;
  nextStep: () => boolean;
  prevStep: () => void;
  goToStep: (step: RegistrationV2Step) => boolean;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'photo' | 'panCard'
  ) => Promise<void>;
  removeFile: (type: 'photo' | 'panCard') => void;
  handleConfirmPayment: () => Promise<void>;
  clearDraft: () => void;
  copiedField: string | null;
  handleCopy: (text: string, fieldId: string) => void;
}

export { INITIAL_FORM, INITIAL_FORM_DATA } from '@/src/types/registration';
export type { FormData } from '@/src/types/registration';
