'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/src/stores/authStore';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { SALARY_SLABS } from '@/src/components/admin/OfferLetter/SlabSelector';
import type { OfferLetterFormData, SavedOffer } from '@/src/components/admin/OfferLetter/types';

export const INITIAL_FORM_DATA: OfferLetterFormData = {
  date: '',
  name: '',
  address: '',
  mobileNo: '',
  alternativeNo: '',
  emailId: '',
  designation: '',
  department: '',
  reportingTo: '',
  appointmentDate: '',
  location: '',
  salaryCtc: '',
  salaryType: 'CTC',
  target: '',
  offerSlab: '',
  workingHoursStart: '10:30 am',
  workingHoursEnd: '6:30 pm',
  workingDays: 'Wednesday to Monday',
  probationPeriod: '3',
  salesCompensationType: '',
  noSaleMonths: '',
  customSalaryPercent: '',
  subsistenceAllowance: '',
  meetingsPerMonth: '15',
  gracePeriodMonths: '',
  reducedSalaryPercent: '',
  enablePartialTargetRule: false,
  partialTargetSalaryPercent: '50',
  includeSalesPolicyBox: true,
  includeDocumentationBox: true,
  includeCandidateParticularsBox: true,
};

const SALES_DESIGNATIONS = ['Telecaller', 'BDM', 'BDE', 'Sales Manager', 'Team Leader'];

export function useOfferLetterForm() {
  const { token } = useAuthStore();
  const [companyInfo, setCompanyInfo] = useState({
    company_name: 'SVI Infra Solutions Pvt. Ltd.',
    company_address: 'Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309',
    company_email: 'info@sviinfrasolutions.com',
    company_phone: '+91 9216014579',
    company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
  });

  const [formData, setFormData] = useState<OfferLetterFormData>(INITIAL_FORM_DATA);
  const [showSalesOptions, setShowSalesOptions] = useState(false);
  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [savedOffers, setSavedOffers] = useState<SavedOffer[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [showSlabs, setShowSlabs] = useState(false);
  const [salesCustomDesignation, setSalesCustomDesignation] = useState('');
  const [showCustomDesignation, setShowCustomDesignation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
        if (json.value) setCompanyInfo(json.value);
      })
      .catch((err) => console.error('Error fetching company info:', err));
  }, [token]);

  // Load saved offer letters from database
  useEffect(() => {
    if (!token) return;
    setLoadingRecords(true);
    fetch('/api/admin/documents?type=offer_letter&limit=500', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch offer letters');
        return res.json();
      })
      .then((json) => {
        if (json.documents) {
          setSavedOffers(json.documents);
        }
      })
      .catch((err) => console.error('Error fetching saved offer letters:', err))
      .finally(() => setLoadingRecords(false));
  }, [token]);

  const getCandidateFilename = useCallback(
    (ext: 'pdf' | 'png' = 'pdf') => {
      const rawName = formData.name?.trim() || 'Candidate';
      const cleanName = rawName
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      return `Offer_Letter_${cleanName || 'Candidate'}.${ext}`;
    },
    [formData.name]
  );

  // Helper to find slab by value
  const findSlabByValue = (
    value: string,
    key: 'salary' | 'target'
  ): (typeof SALARY_SLABS)[number] | null => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return null;
    return SALARY_SLABS.find((s) => s[key] === numVal) || null;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalaryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, salaryCtc: value }));
    const slab = findSlabByValue(value, 'salary');
    if (slab) {
      setFormData((prev) => ({
        ...prev,
        target: slab.target.toString(),
        offerSlab: slab.offerSlab.replace('%', ''),
      }));
    }
  };

  const handleTargetChange = (value: string) => {
    setFormData((prev) => ({ ...prev, target: value }));
    const slab = findSlabByValue(value, 'target');
    if (slab) {
      setFormData((prev) => ({
        ...prev,
        salaryCtc: slab.salary.toString(),
        offerSlab: slab.offerSlab.replace('%', ''),
      }));
    }
  };

  const handleSalarySelect = (s: (typeof SALARY_SLABS)[number]) => {
    setFormData((prev) => ({
      ...prev,
      salaryCtc: s.salary.toString(),
      target: s.target.toString(),
      offerSlab: s.offerSlab.replace('%', ''),
    }));
  };

  const handleTargetSelect = (s: (typeof SALARY_SLABS)[number]) => {
    setFormData((prev) => ({
      ...prev,
      salaryCtc: s.salary.toString(),
      target: s.target.toString(),
      offerSlab: s.offerSlab.replace('%', ''),
    }));
  };

  const loadFromRecord = useCallback(
    (id: string) => {
      setSelectedRecordId(id);
      if (!id) {
        setDocumentId(null);
        setFormData(INITIAL_FORM_DATA);
        setShowSalesOptions(false);
        setShowCustomDesignation(false);
        setSalesCustomDesignation('');
        return;
      }
      const selected = savedOffers.find((b) => b.id === id);
      if (selected && selected.form_data) {
        setDocumentId(selected.id);
        const data = selected.form_data as OfferLetterFormData;
        setFormData((prev) => ({ ...INITIAL_FORM_DATA, ...data }));

        if (data.department === 'Sales') {
          setShowSalesOptions(true);
          if (data.designation && !SALES_DESIGNATIONS.includes(data.designation)) {
            setShowCustomDesignation(true);
            setSalesCustomDesignation(data.designation);
          } else {
            setShowCustomDesignation(false);
            setSalesCustomDesignation('');
          }
        } else {
          setShowSalesOptions(false);
          setShowCustomDesignation(false);
          setSalesCustomDesignation('');
        }
      }
    },
    [savedOffers]
  );

  const handleLoadOffer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    loadFromRecord(e.target.value);
  };

  const handleResetForm = useCallback(() => {
    setDocumentId(null);
    setSelectedRecordId('');
    setFormData(INITIAL_FORM_DATA);
    setShowSalesOptions(false);
    setShowCustomDesignation(false);
    setSalesCustomDesignation('');
    setPreview(false);
    toast.info('Form reset. Ready to create a new offer letter.');
  }, []);

  // Detect if an offer letter already exists for this candidate's mobile or email
  const duplicateCandidate = useMemo(() => {
    const mobile = (formData.mobileNo || '').replace(/\D/g, '').slice(-10);
    const email = (formData.emailId || '').trim().toLowerCase();

    if ((!mobile || mobile.length < 10) && (!email || email.length < 5)) {
      return null;
    }

    return (
      savedOffers.find((offer) => {
        // Skip comparing against currently edited record
        if (documentId && offer.id === documentId) return false;

        const offerMobile = (offer.form_data?.mobileNo || '').replace(/\D/g, '').slice(-10);
        const offerEmail = (offer.form_data?.emailId || '').trim().toLowerCase();

        const mobileMatch = mobile && mobile.length >= 10 && offerMobile === mobile;
        const emailMatch = email && email.length >= 5 && offerEmail === email;

        return mobileMatch || emailMatch;
      }) || null
    );
  }, [formData.mobileNo, formData.emailId, savedOffers, documentId]);

  const loadDuplicateRecord = useCallback(() => {
    if (duplicateCandidate) {
      loadFromRecord(duplicateCandidate.id);
      toast.success(
        `Loaded existing record for ${duplicateCandidate.form_data?.name || 'Candidate'}`
      );
    }
  }, [duplicateCandidate, loadFromRecord]);

  useEffect(() => {
    if (savedOffers.length > 0 && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const templateId = searchParams.get('templateId');
      if (templateId && !selectedRecordId) {
        loadFromRecord(templateId);
      }
    }
  }, [savedOffers, selectedRecordId, loadFromRecord]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    if (!formData.name?.trim()) {
      toast.error('Please enter candidate name before generating offer letter.');
      return;
    }

    setIsGenerating(true);
    let currentDocId = documentId;
    const isEditingExisting = Boolean(documentId);

    if (token) {
      try {
        if (isEditingExisting && documentId) {
          // ── EDIT MODE: Update existing document record via PATCH ──
          const response = await fetch(`/api/admin/documents/${documentId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              form_data: formData,
              status: 'draft',
            }),
          });
          if (response.ok) {
            const data = await response.json();
            const updatedDoc = data.document || {
              id: documentId,
              form_data: formData,
              created_at: new Date().toISOString(),
            };
            setSavedOffers((prev) =>
              prev.map((item) => (item.id === documentId ? updatedDoc : item))
            );
          }
        } else {
          // ── CREATE MODE: Insert new document record via POST ──
          const response = await fetch('/api/admin/documents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              document_type: 'offer_letter',
              form_data: formData,
              status: 'draft',
            }),
          });
          if (response.ok) {
            const data = await response.json();
            currentDocId = data.document.id;
            setDocumentId(data.document.id);
            setSavedOffers((prev) => {
              const index = prev.findIndex((item) => item.id === data.document.id);
              if (index !== -1) {
                const updated = [...prev];
                updated[index] = data.document;
                return updated;
              } else {
                return [data.document, ...prev];
              }
            });
            setSelectedRecordId(data.document.id);
          }
        }
      } catch (error) {
        console.error('Failed to save document:', error);
      }
    }

    setPreview(true);

    // Auto generate & download PDF named after candidate
    try {
      const filename = getCandidateFilename('pdf');
      const { promise, resolve } = Promise.withResolvers<void>();
      setTimeout(resolve, 300);
      await promise;
      await exportToPDF({ elementId: 'offerPreview', filename });
      toast.success(
        isEditingExisting
          ? `Offer Letter updated & downloaded: ${filename}`
          : `Offer Letter created & downloaded: ${filename}`
      );

      if (currentDocId && token) {
        try {
          await fetch(`/api/admin/documents/${currentDocId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: 'completed' }),
          });
        } catch (error) {
          console.error('Failed to update document status:', error);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };
  const handleDownloadPDF = async () => {
    try {
      const filename = getCandidateFilename('pdf');
      await exportToPDF({ elementId: 'offerPreview', filename });
      toast.success(`Downloaded: ${filename}`);
      if (documentId && token) {
        try {
          await fetch(`/api/admin/documents/${documentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: 'completed' }),
          });
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
      const filename = getCandidateFilename('png');
      await exportToImage({ elementId: 'offerPreview', filename });
      toast.success(`Downloaded: ${filename}`);
    } catch (error) {
      console.error('Error generating Image:', error);
      toast.error('Failed to generate Image');
    }
  };

  const matchedSlab = useMemo(() => {
    return formData.salaryCtc
      ? SALARY_SLABS.find((s) => parseFloat(formData.salaryCtc) === s.salary) || null
      : formData.target
        ? SALARY_SLABS.find((s) => parseFloat(formData.target) === s.target) || null
        : null;
  }, [formData.salaryCtc, formData.target]);

  return {
    companyInfo,
    formData,
    setFormData,
    savedOffers,
    loadingRecords,
    selectedRecordId,
    showSalesOptions,
    setShowSalesOptions,
    showSlabs,
    setShowSlabs,
    salesCustomDesignation,
    setSalesCustomDesignation,
    showCustomDesignation,
    setShowCustomDesignation,
    isGenerating,
    preview,
    matchedSlab,
    documentId,
    duplicateCandidate,
    loadDuplicateRecord,
    handleResetForm,
    getCandidateFilename,
    loadFromRecord,
    handleChange,
    handleSalaryChange,
    handleTargetChange,
    handleSalarySelect,
    handleTargetSelect,
    handleLoadOffer,
    handleSubmit,
    handleDownloadPDF,
    handleDownloadImage,
  };
}
