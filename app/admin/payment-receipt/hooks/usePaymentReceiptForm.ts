'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/src/stores/authStore';
import { getNextReceiptNumber, type ReceiptLike } from '@/src/lib/receipt/receiptNumber';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import { numberToWords } from '@/src/lib/receipt/numberToWords';
import {
  buildRefIdProfiles,
  type RefIdProfile,
  type CandidateSourceLike,
} from '@/src/lib/receipt/refIdProfiles';
import {
  type PaymentReceiptFormData,
  type CompanyInfoLike,
  getInitialFormData,
  DEFAULT_COMPANY_INFO,
} from '../types';
import { useReceiptExporter } from './useReceiptExporter';
import { useReceiptPrefill } from './useReceiptPrefill';

export type { PaymentReceiptFormData, CompanyInfoLike };
export { getInitialFormData, DEFAULT_COMPANY_INFO };

export function usePaymentReceiptForm() {
  const { token } = useAuthStore();
  const [formData, setFormData] = useState<PaymentReceiptFormData>(getInitialFormData);
  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptLike[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidates, setCandidates] = useState<CandidateSourceLike[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoLike>(DEFAULT_COMPANY_INFO);

  const fetchReceipts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/documents?type=payment_receipt&limit=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch documents');
      const json = await res.json();
      if (json.documents) {
        setReceipts(json.documents);
        setFormData((prev) => {
          const nextNumber = getNextReceiptNumber(json.documents);
          if (!prev.receiptNo || prev.receiptNo === '2056') {
            return { ...prev, receiptNo: nextNumber };
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
    }
  }, [token]);

  const fetchCandidates = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/portal-allotments/candidates?all=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json && Array.isArray(json.candidates)) {
        setCandidates(json.candidates);
      }
    } catch {
      return;
    }
  }, [token]);

  useReceiptPrefill({
    receipts,
    setFormData,
    setDocumentId,
    setPreview,
  });

  const { handleDownloadPDF, handleDownloadImage } = useReceiptExporter({
    formData,
    documentId,
    token,
    setReceipts,
  });

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/settings?key=company_info', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
      })
      .then((json) => {
        if (json.value) {
          setCompanyInfo(json.value);
        }
      })
      .catch((err) => console.error('Error fetching company info:', err));

    fetchReceipts();
    fetchCandidates();
  }, [token, fetchReceipts, fetchCandidates]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'amount') {
        updated.amountWords = value ? numberToWords(value) : '';
      }
      return updated;
    });

    if (name === 'amount' && value) {
      if (parseFloat(value) !== 2100) {
        setTermsAccepted(false);
      }
    }
  };

  const handleResetForm = () => {
    const nextNo = getNextReceiptNumber(receipts);
    setFormData({
      ...getInitialFormData(),
      receiptNo: nextNo,
    });
    setDocumentId(null);
    setPreview(false);
    setTermsAccepted(false);
    toast.success(`Form reset. Next Receipt No: ${nextNo}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (parseFloat(formData.amount) === 2100 && !termsAccepted) {
      alert('Please accept the terms and conditions for the refundable amount of ₹2100');
      return;
    }

    const currentReceiptNo = formData.receiptNo || getNextReceiptNumber(receipts);
    const dataToSave = {
      ...formData,
      receiptNo: currentReceiptNo,
    };

    setIsSubmitting(true);

    if (token) {
      try {
        const response = await fetch('/api/admin/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            document_type: 'payment_receipt',
            form_data: dataToSave,
            status: 'draft',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const savedFormData = (data.document?.form_data as PaymentReceiptFormData) || dataToSave;
          const assignedReceiptNo = savedFormData.receiptNo || currentReceiptNo;
          setDocumentId(data.document.id);
          setFormData(savedFormData);
          setReceipts((prev) => [data.document, ...prev.filter((d) => d.id !== data.document.id)]);
          toast.success(`Payment Receipt No. ${assignedReceiptNo} generated successfully!`);
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(extractApiErrorMessage(errorData, 'Failed to save payment receipt'));
        }
      } catch (error) {
        console.error('Failed to save document:', error);
        toast.error(extractApiErrorMessage(error, 'Network error saving payment receipt'));
      } finally {
        setIsSubmitting(false);
      }
    }

    setPreview(true);
  };

  const refIdProfiles = useMemo(
    () => buildRefIdProfiles(receipts, candidates),
    [receipts, candidates]
  );

  const handleSelectRefProfile = useCallback((profile: RefIdProfile) => {
    setFormData((prev) => ({
      ...prev,
      refId: profile.refId,
      name: profile.name || prev.name,
      salutation: profile.salutation || prev.salutation || 'Mr.',
      clientPhone: profile.clientPhone || prev.clientPhone,
      plotNo: profile.plotNo || prev.plotNo,
      plotSize: profile.plotSize || prev.plotSize,
      account: profile.account || prev.account,
    }));
    toast.success(`Auto-filled details for ${profile.refId}`);
  }, []);

  return {
    formData,
    setFormData,
    preview,
    setPreview,
    documentId,
    setDocumentId,
    termsAccepted,
    setTermsAccepted,
    receipts,
    refIdProfiles,
    handleSelectRefProfile,
    companyInfo,
    isSubmitting,
    handleChange,
    handleResetForm,
    handleSubmit,
    handleDownloadPDF,
    handleDownloadImage,
  };
}
