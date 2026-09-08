'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { useAllotmentLetterData } from '@/src/hooks/admin/useAllotmentLetterData';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';

export interface AllotmentCostCalculationInput {
  area?: string | number;
  bsp?: string | number;
  plc?: string | number;
  edc?: string | number;
}
export interface AllotmentFormData {
  clientName: string;
  salutation: string;
  address: string;
  ticketId: string;
  aadharNumber: string;
  fatherName: string;
  onBookingPaymentRef: string;
  within15DaysPaymentRef: string;
  projectName: string;
  unitNumber: string;
  area: string;
  bsp: string;
  plc: string;
  edc: string;
  edcInEmi: string;
  paymentPlan: string;
  bookingDate: string;
  secondPaymentDays: string;
  advisorName: string;
  advisorNumber: string;
  advisorEmail: string;
  emiCount: string;
  emiPercentage: string;
  emiStartDate: string;
  zeroPercentEmi: string;
  bookingPaymentPercent: string;
  showSecondInstalment: string;
}

export interface AllotmentCompanyInfo {
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

export interface SavedAllotmentDocument {
  id: string;
  created_at?: string;
  status?: string;
  form_data?: Partial<AllotmentFormData>;
}

export function calculateTotalCost(data: AllotmentCostCalculationInput): number {
  const area = typeof data.area === 'number' ? data.area : parseFloat(data.area || '') || 0;
  const bsp = typeof data.bsp === 'number' ? data.bsp : parseFloat(data.bsp || '') || 0;
  const plc = typeof data.plc === 'number' ? data.plc : parseFloat(data.plc || '') || 0;
  const edc = typeof data.edc === 'number' ? data.edc : parseFloat(data.edc || '') || 0;

  const base = area * bsp;
  const plcAmount = base * (plc / 100);
  return base + plcAmount + edc;
}

export function calculateFinancialValues(formData: {
  area?: string | number;
  bsp?: string | number;
  plc?: string | number;
  edc?: string | number;
  edcInEmi?: string | boolean;
  bookingPaymentPercent?: string | number;
}) {
  const totalCost = calculateTotalCost(formData);
  const edcAmount =
    typeof formData.edc === 'number' ? formData.edc : parseFloat(formData.edc || '') || 0;
  const edcInEmi = formData.edcInEmi === 'true' || formData.edcInEmi === true;
  const baseCost = totalCost - edcAmount;
  const bookingPercent =
    typeof formData.bookingPaymentPercent === 'number'
      ? formData.bookingPaymentPercent
      : parseFloat(String(formData.bookingPaymentPercent || '')) || 10;
  const initialPayment = (edcInEmi ? baseCost : totalCost) * (bookingPercent / 100);

  return {
    totalCost,
    edcAmount,
    edcInEmi,
    baseCost,
    bookingPercent,
    initialPayment,
  };
}

export const INITIAL_ALLOTMENT_FORM_DATA = {
  clientName: '',
  salutation: 'Mr.',
  address: '',
  ticketId: '',
  aadharNumber: '',
  fatherName: '',
  onBookingPaymentRef: '',
  within15DaysPaymentRef: '',
  projectName: 'Shyam Aangan',
  unitNumber: '',
  area: '',
  bsp: '',
  plc: '',
  edc: '',
  edcInEmi: 'false',
  paymentPlan: '12',
  bookingDate: '',
  secondPaymentDays: '15',
  advisorName: '',
  advisorNumber: '',
  advisorEmail: '',
  emiCount: '12',
  emiPercentage: '',
  emiStartDate: '',
  zeroPercentEmi: 'false',
  bookingPaymentPercent: '10',
  showSecondInstalment: 'true',
};

export function useAllotmentLetterPage(tokenOverride?: string | null) {
  const { token: authStoreToken } = useAuthStore();
  const token = tokenOverride !== undefined ? tokenOverride : authStoreToken;

  const data = useAllotmentLetterData(token);

  const { totalCost, edcAmount, edcInEmi, baseCost, bookingPercent, initialPayment } =
    calculateFinancialValues(data.formData);

  const executeSave = useCallback(
    async (targetId: string | null = null, forceInsert = false) => {
      if (!token || data.isSaving) return;
      data.setIsSaving(true);
      try {
        const url =
          targetId && !forceInsert ? `/api/admin/documents/${targetId}` : '/api/admin/documents';
        const method = targetId && !forceInsert ? 'PATCH' : 'POST';
        const body =
          targetId && !forceInsert
            ? { form_data: data.formData, status: 'draft' }
            : { document_type: 'allotment_letter', form_data: data.formData, status: 'draft' };

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const resData = await response.json();
          data.setDocumentId(resData.document.id);
          data.setSavedAllotments((prev) => {
            const index = prev.findIndex((item) => item.id === resData.document.id);
            if (index !== -1 && !forceInsert) {
              const updated = [...prev];
              updated[index] = resData.document;
              return updated;
            } else {
              return [resData.document, ...prev];
            }
          });
          data.setPreview(true);
        }
      } catch (error) {
        console.error('Failed to save document:', error);
      } finally {
        data.setIsSaving(false);
        data.setShowSaveModal(false);
        data.setDuplicateRecordToOverwrite(null);
      }
    },
    [token, data]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (data.isSaving) return;

      const existingRecord = data.savedAllotments.find(
        (r) => r.form_data?.ticketId === data.formData.ticketId && r.id !== data.documentId
      );

      if (existingRecord) {
        data.setDuplicateRecordToOverwrite(existingRecord);
        data.setShowSaveModal(true);
        return;
      }

      await executeSave(data.documentId);
    },
    [data, executeSave]
  );

  const handleOverwrite = useCallback(async () => {
    await executeSave(data.duplicateRecordToOverwrite?.id ?? null);
  }, [executeSave, data.duplicateRecordToOverwrite]);

  const handleCreateNew = useCallback(async () => {
    await executeSave(null, true);
  }, [executeSave]);

  const handleCancelDuplicate = useCallback(() => {
    data.setShowSaveModal(false);
    data.setDuplicateRecordToOverwrite(null);
  }, [data]);

  const handleDownloadPDF = useCallback(async () => {
    try {
      await exportToPDF({
        elementId: 'allotmentPreview',
        filename: 'Allotment_Letter.pdf',
      });

      if (data.documentId && token) {
        try {
          await fetch(`/api/admin/documents/${data.documentId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'completed' }),
          });
        } catch (error) {
          console.error('Failed to update document status:', error);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }, [data.documentId, token]);

  const handleDownloadImage = useCallback(async () => {
    try {
      await exportToImage({
        elementId: 'allotmentPreview',
        filename: 'Allotment_Letter.png',
      });
    } catch (error) {
      console.error('Error generating Image:', error);
    }
  }, []);

  const handleClearRecord = useCallback(() => {
    data.setSelectedRecordId('');
    data.setDocumentId(null);
    data.setIsCustomAdvisor(false);
    data.setIsCustomSecondPaymentDays(false);
    data.setFormData(INITIAL_ALLOTMENT_FORM_DATA);
  }, [data]);

  return {
    ...data,
    totalCost,
    edcAmount,
    edcInEmi,
    baseCost,
    bookingPercent,
    initialPayment,
    calculateTotalCost: () => totalCost,
    executeSave,
    handleSubmit,
    handleOverwrite,
    handleCreateNew,
    handleCancelDuplicate,
    handleDownloadPDF,
    handleDownloadImage,
    handleClearRecord,
  };
}
