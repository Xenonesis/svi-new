'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/src/stores/authStore';
import { useBBAData } from '@/src/hooks/admin/useBBAData';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';

export interface BbaCostCalculationInput {
  area?: string | number;
  bsp?: string | number;
  plc?: string | number;
  edc?: string | number;
}

export interface BbaFormData {
  salutation: string;
  clientName: string;
  aadharNumber: string;
  fatherName: string;
  age: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  ticketId: string;
  projectName: string;
  unitNumber: string;
  area: string;
  bsp: string;
  plc: string;
  edc: string;
  paymentPlan: string;
  bookingDate: string;
  secondPaymentDays: string;
  advisorName: string;
  advisorNumber: string;
  advisorEmail: string;
  onBookingPaymentRef: string;
  onBookingAmount: string;
  within15DaysPaymentRef: string;
  within15DaysAmount: string;
  bookingPaymentPercent: string;
  showSecondInstalment: string;
  zeroPercentEmi: string;
  emiPercentage: string;
  edcInEmi: string;
  emiCount: string;
  emiStartDate: string;
  language: string;
  panNumber?: string;
  mobileNumber?: string;
  email?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  nomineeAge?: string;
  nomineeAddress?: string;
}

export interface BbaCompanyInfo {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_website: string;
  bank_account_name: string;
  bank_account_no: string;
  bank_name: string;
  bank_ifsc: string;
  [key: string]: unknown;
}

export interface SavedBbaDocument {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  form_data?: Partial<BbaFormData>;
}

export function calculateTotalCost(data?: BbaCostCalculationInput): number {
  if (!data) return 0;
  const area = typeof data.area === 'number' ? data.area : parseFloat(data.area || '') || 0;
  const bsp = typeof data.bsp === 'number' ? data.bsp : parseFloat(data.bsp || '') || 0;
  const plc = typeof data.plc === 'number' ? data.plc : parseFloat(data.plc || '') || 0;
  const edc = typeof data.edc === 'number' ? data.edc : parseFloat(data.edc || '') || 0;

  const base = area * bsp;
  const plcAmount = base * (plc / 100);
  return base + plcAmount + edc;
}

export function calculateFinancialValues(formData?: BbaCostCalculationInput) {
  const totalCost = calculateTotalCost(formData);
  const initialPayment = totalCost * 0.1;
  return { totalCost, initialPayment };
}

export const INITIAL_BBA_FORM_DATA: BbaFormData = {
  salutation: '',
  clientName: '',
  aadharNumber: '',
  fatherName: '',
  age: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  ticketId: '',
  projectName: 'Shyam Aangan',
  unitNumber: '',
  area: '',
  bsp: '',
  plc: '',
  edc: '',
  paymentPlan: '12',
  bookingDate: '',
  secondPaymentDays: '15',
  advisorName: '',
  advisorNumber: '',
  advisorEmail: '',
  onBookingPaymentRef: '',
  onBookingAmount: '',
  within15DaysPaymentRef: '',
  within15DaysAmount: '',
  bookingPaymentPercent: '10',
  showSecondInstalment: 'true',
  zeroPercentEmi: 'false',
  emiPercentage: '',
  edcInEmi: 'false',
  emiCount: '12',
  emiStartDate: '',
  language: 'en',
  panNumber: '',
  mobileNumber: '',
  email: '',
  nomineeName: '',
  nomineeRelation: '',
  nomineeAge: '',
  nomineeAddress: '',
};

export function useBbaPage(tokenOverride?: string | null) {
  const { token: authStoreToken } = useAuthStore();
  const token = tokenOverride !== undefined ? tokenOverride : authStoreToken;

  const data = useBBAData(token);

  const [activeLanguage, setActiveLanguageState] = useState<'en' | 'hi'>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Synchronize activeLanguage when formData.language changes externally
  useEffect(() => {
    const lang = data.formData?.language;
    if (lang === 'hi' || lang === 'en') {
      setActiveLanguageState(lang);
    }
  }, [data.formData?.language]);

  const setActiveLanguage = useCallback(
    (lang: 'en' | 'hi') => {
      setActiveLanguageState(lang);
      data.setFormData((prev) => ({ ...prev, language: lang }));
    },
    [data]
  );

  const { totalCost, initialPayment } = calculateFinancialValues(data.formData);

  const handleCreateNew = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!token) {
        data.setPreview(true);
        return;
      }
      setIsSubmitting(true);
      try {
        const saveBody = {
          document_type: 'bba',
          form_data: data.formData,
          status: 'draft',
        };

        const res = await fetch('/api/admin/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(saveBody),
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Failed to create document: ${errBody}`);
        }

        const postData = await res.json();
        const savedDoc: SavedBbaDocument = postData.document;

        if (savedDoc?.id) {
          data.setDocumentId(savedDoc.id);
          data.setSavedBbas((prev: SavedBbaDocument[]) => {
            const index = prev.findIndex((b) => b.id === savedDoc.id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = savedDoc;
              return updated;
            }
            return [savedDoc, ...prev];
          });
        }
        toast.success('New BBA created successfully!');
      } catch (error) {
        console.error('Failed to create document:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to create BBA');
      } finally {
        setIsSubmitting(false);
        data.setPreview(true);
      }
    },
    [token, data]
  );

  const handleUpdateExisting = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!token) {
        data.setPreview(true);
        return;
      }
      if (!data.documentId) {
        return handleCreateNew(e);
      }

      setIsSubmitting(true);
      try {
        const patchRes = await fetch(`/api/admin/documents/${data.documentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ form_data: data.formData, status: 'draft' }),
        });

        if (patchRes.status === 404) {
          console.warn('[BBA] Document not found, creating new record instead.');
          data.setDocumentId(null);
          return await handleCreateNew(e);
        }

        if (!patchRes.ok) {
          const errBody = await patchRes.text();
          throw new Error(`Failed to update document: ${errBody}`);
        }

        const patchData = await patchRes.json();
        const savedDoc: SavedBbaDocument = patchData.document;

        if (savedDoc?.id) {
          data.setDocumentId(savedDoc.id);
          data.setSavedBbas((prev: SavedBbaDocument[]) => {
            const index = prev.findIndex((b) => b.id === savedDoc.id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = savedDoc;
              return updated;
            }
            return [savedDoc, ...prev];
          });
        }
        toast.success('BBA updated successfully!');
      } catch (error) {
        console.error('Failed to update document:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to update BBA');
      } finally {
        setIsSubmitting(false);
        data.setPreview(true);
      }
    },
    [token, data, handleCreateNew]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (data.documentId) {
        return handleUpdateExisting(e);
      }
      return handleCreateNew(e);
    },
    [data.documentId, handleUpdateExisting, handleCreateNew]
  );
  const handleDownloadPDF = useCallback(async () => {
    try {
      await exportToPDF({
        elementId: 'bbaPreview',
        filename: 'BBA_Document.pdf',
        width: '800px',
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
        } catch (statusErr) {
          console.error('Failed to update document status to completed:', statusErr);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }, [data.documentId, token]);

  const handleDownloadImage = useCallback(async () => {
    try {
      await exportToImage({
        elementId: 'bbaPreview',
        filename: 'BBA_Document.png',
      });
    } catch (error) {
      console.error('Error generating Image:', error);
    }
  }, []);

  const handleClearRecord = useCallback(() => {
    data.setDocumentId(null);
    data.setFormData(INITIAL_BBA_FORM_DATA);
    data.setIsCustomSecondPaymentDays(false);
    data.setIsCustomAdvisor(false);
    setActiveLanguageState('en');
  }, [data]);

  const handleLoadBba = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement> | string) => {
      const id = typeof e === 'string' ? e : e.target.value;
      if (!id) {
        handleClearRecord();
        return;
      }

      const selected = data.savedBbas.find((b: SavedBbaDocument) => b.id === id);
      if (selected && selected.form_data) {
        data.setDocumentId(selected.id);
        const parsed = selected.form_data;
        const projectMap: Record<string, string> = {
          'shyam-aangan': 'Shyam Aangan',
          'shyam-aangan-phase-1': 'Shyam Aangan Phase 1',
          'shyam-aangan-farm-house': 'Shyam Aangan Farm House',
          'shivani-vatika': 'Shivani Vatika',
          'shivani-vatika-11th': 'Shivani Vatika 11th',
          'shivani-vatika-11': 'Shivani Vatika 11th',
          'shivani vatika 11th': 'Shivani Vatika 11th',
          'shivani vatika': 'Shivani Vatika',
          'phulera-smartcity': 'Phulera SmartCity',
          'phulera-smart-city': 'Phulera SmartCity',
        };
        const normalizedProj = parsed.projectName
          ? projectMap[parsed.projectName.toLowerCase().trim()] || parsed.projectName
          : parsed.projectName;
        data.setFormData((prev) => ({
          ...prev,
          ...parsed,
          ...(normalizedProj ? { projectName: normalizedProj } : {}),
        }));
        if (parsed.language === 'en' || parsed.language === 'hi') {
          setActiveLanguageState(parsed.language);
        }
        if (parsed.secondPaymentDays) {
          const isCustomDays =
            parsed.secondPaymentDays !== '15' && parsed.secondPaymentDays !== '28';
          data.setIsCustomSecondPaymentDays(isCustomDays);
        }
        data.setPreview(true);
      }
    },
    [data, handleClearRecord]
  );

  return {
    ...data,
    activeLanguage,
    setActiveLanguage,
    totalCost,
    initialPayment,
    calculateTotalCost: () => totalCost,
    isSubmitting,
    handleUpdateExisting,
    handleCreateNew,
    handleSubmit,
    handleDownloadPDF,
    handleDownloadImage,
    handleClearRecord,
    handleLoadBba,
  };
}
