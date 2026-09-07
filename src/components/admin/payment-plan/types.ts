import React from 'react';

export interface PaymentPlanFormData {
  unitNo: string;
  plotSize: string;
  propertyType: string;
  costPerSqYd: string;
  bookingAmount: string;
  emis: string;
  startDate: string;
}

export interface PaymentPlanScheduleItem {
  month: number;
  date: string;
  amount: string;
}

export interface PaymentPlanTotals {
  totalCost: number;
  balance: number;
  emiAmount: number;
}

export interface UsePaymentPlanFormReturn {
  formData: PaymentPlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<PaymentPlanFormData>>;
  preview: boolean;
  setPreview: React.Dispatch<React.SetStateAction<boolean>>;
  documentId: string | null;
  setDocumentId: React.Dispatch<React.SetStateAction<string | null>>;
  schedule: PaymentPlanScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<PaymentPlanScheduleItem[]>>;
  totals: PaymentPlanTotals;
  setTotals: React.Dispatch<React.SetStateAction<PaymentPlanTotals>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  calculatePlan: (e: React.FormEvent) => Promise<void>;
  handleDownloadPDF: () => Promise<void>;
  handleDownloadImage: () => Promise<void>;
}

export interface PaymentPlanHeaderProps {
  className?: string;
}

export interface PaymentPlanFormProps {
  formData: PaymentPlanFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  className?: string;
}

export interface PaymentPlanPreviewProps {
  formData: PaymentPlanFormData;
  totals: PaymentPlanTotals;
  schedule: PaymentPlanScheduleItem[];
  className?: string;
}
