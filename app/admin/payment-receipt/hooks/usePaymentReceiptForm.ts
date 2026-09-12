'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/src/stores/authStore';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { getNextReceiptNumber, ReceiptLike } from '@/src/lib/receipt/receiptNumber';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import { numberToWords } from '@/src/lib/receipt/numberToWords';

export interface PaymentReceiptFormData {
  receiptNo: string;
  date: string;
  salutation: string;
  name: string;
  refId: string;
  amount: string;
  amountWords: string;
  paymentRef: string;
  drawnOn: string;
  plotNo: string;
  plotSize: string;
  account: string;
  paymentMethod: string;
  clientPhone: string;
}

export interface CompanyInfoLike {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_website: string;
}

export const getInitialFormData = (): PaymentReceiptFormData => ({
  receiptNo: getNextReceiptNumber([]),
  date: new Date().toISOString().split('T')[0],
  salutation: 'Mr.',
  name: '',
  refId: '',
  amount: '',
  amountWords: '',
  paymentRef: '',
  drawnOn: '',
  plotNo: '',
  plotSize: '',
  account: '',
  paymentMethod: 'UPI',
  clientPhone: '',
});

export const DEFAULT_COMPANY_INFO: CompanyInfoLike = {
  company_name: 'SVI INFRA SOLUTIONS PVT. LTD',
  company_address: 'Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309',
  company_email: 'info@sviinfrasolutions.com',
  company_phone: '+91 9216014579',
  company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
};

export function usePaymentReceiptForm() {
  const { token } = useAuthStore();
  const [formData, setFormData] = useState<PaymentReceiptFormData>(getInitialFormData);
  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptLike[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        // Only initialize receiptNo if it is currently unset
        setFormData((prev) => {
          if (!prev.receiptNo) {
            return { ...prev, receiptNo: getNextReceiptNumber(json.documents) };
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
    }
  }, [token]);

  const loadFromRecord = useCallback((id: string, recordsList: ReceiptLike[]) => {
    const record = recordsList.find((r) => r.id === id);
    if (record?.form_data) {
      const fd = record.form_data;
      const nextNo = getNextReceiptNumber(recordsList);
      setFormData({
        receiptNo: nextNo,
        date: new Date().toISOString().split('T')[0],
        salutation: (fd.salutation as string) || 'Mr.',
        name: (fd.name as string) || '',
        refId: (fd.refId as string) || '',
        amount: (fd.amount as string) || '',
        amountWords: (fd.amountWords as string) || '',
        paymentRef: (fd.paymentRef as string) || '',
        drawnOn: (fd.drawnOn as string) || '',
        plotNo: (fd.plotNo as string) || '',
        plotSize: (fd.plotSize as string) || '',
        account: (fd.account as string) || '',
        paymentMethod: (fd.paymentMethod as string) || 'UPI',
        clientPhone: (fd.clientPhone as string) || '',
      });
      setDocumentId(null);
      setPreview(false);
      toast.info(`Loaded template with next Receipt No: ${nextNo}`);
    }
  }, []);

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
  }, [token, fetchReceipts]);

  // Handle templateId from URL (e.g. from Receipt Records "Use as Template")
  const templateProcessed = useRef(false);
  useEffect(() => {
    if (receipts.length > 0 && typeof window !== 'undefined' && !templateProcessed.current) {
      const searchParams = new URLSearchParams(window.location.search);
      const templateId = searchParams.get('templateId');
      if (templateId) {
        templateProcessed.current = true;
        loadFromRecord(templateId, receipts);
      }
    }
  }, [receipts, loadFromRecord]);

  // Handle prefillRegistration from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const prefillRegistration = searchParams.get('prefillRegistration');
      if (prefillRegistration === 'true') {
        const storedReg = sessionStorage.getItem('receiptPrefillRegistration');
        if (storedReg) {
          try {
            const regData = JSON.parse(storedReg);

            let proj = regData.project || regData.property_interest;
            if (proj) {
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
              proj = projectMap[proj.toLowerCase().trim()] || proj;
            }

            const schemeAmount = regData.scheme_amount || '';

            setFormData((prev) => ({
              ...prev,
              name: `${regData.name || ''} ${regData.last_name || ''}`.trim(),
              account: proj || prev.account,
              amount: schemeAmount || prev.amount,
              amountWords: schemeAmount ? numberToWords(schemeAmount) : prev.amountWords,
              refId: regData.submission_id || prev.refId,
            }));

            sessionStorage.removeItem('receiptPrefillRegistration');
          } catch (e) {
            console.error('Failed to parse prefill registration', e);
          }
        }
      }
    }
  }, []);

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

    // Validate terms acceptance for ₹2100 amount
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
          setDocumentId(data.document.id);
          // Keep current formData stable so preview and exports match the saved record
          setFormData(dataToSave);
          // Update local receipts cache for subsequent operations
          setReceipts((prev) => [data.document, ...prev.filter((d) => d.id !== data.document.id)]);
          toast.success(`Payment Receipt No. ${currentReceiptNo} generated successfully!`);
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

  const handleDownloadPDF = async () => {
    try {
      const clientName = formData.name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
      const receiptNo = formData.receiptNo.trim().replace(/[^a-zA-Z0-9]/g, '');
      const filename =
        clientName && receiptNo
          ? `${clientName} ${receiptNo}.pdf`
          : clientName
            ? `${clientName}.pdf`
            : 'Receipt.pdf';

      await exportToPDF({
        elementId: 'receiptPreview',
        filename,
      });

      // Update document status to completed (non-blocking)
      if (documentId && token) {
        try {
          await fetch(`/api/admin/documents/${documentId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'completed' }),
          });
          setReceipts((prev) =>
            prev.map((d) => (d.id === documentId ? { ...d, status: 'completed' } : d))
          );
        } catch (error) {
          console.error('Failed to update document status:', error);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleDownloadImage = async () => {
    try {
      const clientName = formData.name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
      const receiptNo = formData.receiptNo.trim().replace(/[^a-zA-Z0-9]/g, '');
      const filename =
        clientName && receiptNo
          ? `${clientName} ${receiptNo}.png`
          : clientName
            ? `${clientName}.png`
            : 'Receipt.png';

      await exportToImage({
        elementId: 'receiptPreview',
        filename,
      });

      if (documentId && token) {
        try {
          await fetch(`/api/admin/documents/${documentId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'completed' }),
          });
          setReceipts((prev) =>
            prev.map((d) => (d.id === documentId ? { ...d, status: 'completed' } : d))
          );
        } catch (error) {
          console.error('Failed to update document status:', error);
        }
      }
    } catch (error) {
      console.error('Error generating Image:', error);
      toast.error('Failed to generate Image');
    }
  };

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
    companyInfo,
    isSubmitting,
    handleChange,
    handleResetForm,
    handleSubmit,
    handleDownloadPDF,
    handleDownloadImage,
  };
}
