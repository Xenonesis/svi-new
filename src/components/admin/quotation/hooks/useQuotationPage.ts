'use client';

import { useAuthStore } from '@/src/stores/authStore';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { calculateQuotation, calculatePricingTiers } from '@/src/lib/quotation/calculateQuotation';
import { generateQuotationNumber } from '@/src/lib/quotation/quotationNumber';
import { localDateString, addDays, parseNumber } from '@/src/lib/quotation/format';
import type {
  QuotationFormData,
  QuotationCalculationResult,
  PricingTier,
  PricingTierCalculation,
  CompanyInfo,
} from '@/src/lib/quotation/types';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { supabase } from '@/src/lib/supabase/client';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';

export const DEFAULT_PROJECTS = [
  { value: 'Shyam Aangan', label: 'Shyam Aangan' },
  { value: 'Shivani Vatika', label: 'Shivani Vatika' },
  { value: 'Phulera SmartCity', label: 'Phulera SmartCity' },
  { value: 'Shivani Vatika 11th', label: 'Shivani Vatika 11th' },
  { value: 'Shyam Aangan Farm House', label: 'Shyam Aangan Farm House' },
  { value: 'Shyam Aangan Phase 1', label: 'Shyam Aangan Phase 1' },
];

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  company_name: 'SVI INFRA SOLUTIONS PVT. LTD.',
  company_address: 'Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309',
  company_email: 'info@sviinfrasolutions.com',
  company_phone: '+91 9216014579',
  company_website: 'www.sviinfrasolutions.in',
  bank_name: 'IDBI Bank Ltd.',
  bank_account_no: '0894102000013837',
  bank_ifsc: 'IBKL0000894',
  bank_account_name: 'SVI INFRA SOLUTIONS PVT. LTD.',
};

export function getInitialFormData(): QuotationFormData {
  const today = localDateString();
  return {
    quotationNo: generateQuotationNumber(),
    quotationDate: today,
    validUntil: addDays(today, 7),
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    projectName: 'Shyam Aangan',
    plotNo: '',
    propertyType: 'Residential Plot',
    area: '',
    basicRate: '8000',
    edcRate: '150',
    plcPercent: '5',
    notes: '',
  };
}

export function useQuotationPage() {
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');

  // Quotation number is stable — generated once and never regenerated on render.
  const stableQuotationNo = useRef(generateQuotationNumber());

  const [formData, setFormData] = useState<QuotationFormData>(() => {
    const d = getInitialFormData();
    d.quotationNo = stableQuotationNo.current;
    return d;
  });

  const [calculation, setCalculation] = useState<QuotationCalculationResult | null>(null);
  const [tierCalculations, setTierCalculations] = useState<PricingTierCalculation[]>([]);
  const [hasPreview, setHasPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY_INFO);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof QuotationFormData, string>>
  >({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [loadingQuotationNo, setLoadingQuotationNo] = useState(false);
  const [projects, setProjects] = useState<{ value: string; label: string }[]>(DEFAULT_PROJECTS);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // ── Fetch next auto-generated unique quotation number from DB ─────────────
  const fetchNextQuotationNo = useCallback(
    async (date?: string) => {
      if (!token) return;
      setLoadingQuotationNo(true);
      try {
        const queryDate = date || localDateString();
        const res = await fetch(
          `/api/admin/quotation/next-number?date=${encodeURIComponent(queryDate)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error('Failed to generate quotation number');
        const json = await res.json();
        if (json.quotationNo) {
          stableQuotationNo.current = json.quotationNo;
          setFormData((prev) => ({ ...prev, quotationNo: json.quotationNo }));
          return json.quotationNo;
        }
      } catch (err) {
        console.error('Failed to fetch next quotation number from DB:', err);
      } finally {
        setLoadingQuotationNo(false);
      }
    },
    [token]
  );

  // Fetch on initial load
  useEffect(() => {
    if (!token || templateId) return;
    fetchNextQuotationNo();
  }, [token, templateId, fetchNextQuotationNo]);

  // ── Load company info ───────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/settings?key=company_info', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.value) setCompanyInfo({ ...DEFAULT_COMPANY_INFO, ...json.value });
      })
      .catch(() => {
        /* fallback to default */
      });
  }, [token]);

  // ── Load Projects from /api/admin/properties ────────────────────────────
  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      setLoadingProjects(true);
      try {
        if (token) {
          const res = await fetch('/api/admin/properties', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            if (json.properties && json.properties.length > 0) {
              const activeProps = json.properties
                .filter((p: { active?: boolean }) => p.active !== false)
                .map((p: { name: string }) => ({ value: p.name, label: p.name }));
              if (isMounted && activeProps.length > 0) {
                setProjects(activeProps);
                return;
              }
            }
          }
        }

        // Fallback to direct supabase query
        const { data, error } = await supabase
          .from('properties')
          .select('name')
          .eq('active', true)
          .order('name', { ascending: true });

        if (!error && data && data.length > 0 && isMounted) {
          setProjects(data.map((p) => ({ value: p.name, label: p.name })));
        }
      } catch (err) {
        console.error('Failed to load properties for quotation dropdown:', err);
      } finally {
        if (isMounted) setLoadingProjects(false);
      }
    }
    loadProjects();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // ── Load template ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!templateId || !token) return;
    setTemplateLoading(true);

    fetch(`/api/admin/documents/${templateId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load template');
        return r.json();
      })
      .then((json) => {
        const doc = json.document;
        if (!doc || doc.document_type !== 'quotation') {
          toast.error('Invalid template document.');
          return;
        }
        const fd = doc.form_data as QuotationFormData;
        const today = localDateString();
        setFormData({
          // Copy fields from template
          customerName: fd.customerName || '',
          customerPhone: fd.customerPhone || '',
          customerEmail: fd.customerEmail || '',
          customerAddress: fd.customerAddress || '',
          projectName: fd.projectName || '',
          plotNo: fd.plotNo || '',
          propertyType: fd.propertyType || 'Residential Plot',
          area: fd.area || '',
          basicRate: fd.basicRate || '8000',
          edcRate: fd.edcRate || '150',
          plcPercent: fd.plcPercent || '5',
          notes: fd.notes || '',
          // New values — do NOT copy old ID, date, or status
          quotationNo: generateQuotationNumber(today),
          quotationDate: today,
          validUntil: addDays(today, 7),
        });
        fetchNextQuotationNo(today);
        toast.success('Template loaded. Review details and save as a new quotation.');
      })
      .catch(() => toast.error('Unable to load quotation template.'))
      .finally(() => setTemplateLoading(false));
  }, [templateId, token, fetchNextQuotationNo]);

  // ── Live calculation ────────────────────────────────────────────────────
  useEffect(() => {
    const area = parseNumber(formData.area);
    const basicRate = parseNumber(formData.basicRate);
    const edcRate = parseNumber(formData.edcRate);
    const plcPercent = parseNumber(formData.plcPercent);

    if (isNaN(area) || isNaN(basicRate) || isNaN(edcRate) || isNaN(plcPercent)) {
      setCalculation(null);
    } else {
      try {
        const result = calculateQuotation({ area, basicRate, edcRate, plcPercent });
        setCalculation(result);
      } catch {
        setCalculation(null);
      }
    }

    // Calculate multiple pricing tiers if defined
    if (formData.pricingTiers && formData.pricingTiers.length > 0 && !isNaN(area) && area > 0) {
      const tCalcs = calculatePricingTiers(area, formData.pricingTiers);
      setTierCalculations(tCalcs);
    } else {
      setTierCalculations([]);
    }
  }, [
    formData.area,
    formData.basicRate,
    formData.edcRate,
    formData.plcPercent,
    formData.pricingTiers,
  ]);

  // ── Handle form change ──────────────────────────────────────────────────
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      setFormData((prev) => {
        const updated = { ...prev, [name]: value };

        // When quotation date changes, auto-update validUntil only if not manually edited
        if (name === 'quotationDate' && value) {
          const currentValidUntil = prev.validUntil;
          const expectedValidUntil = addDays(prev.quotationDate, 7);
          // Only auto-update if the user hasn't manually changed validUntil
          if (currentValidUntil === expectedValidUntil || !currentValidUntil) {
            updated.validUntil = addDays(value, 7);
          }
        }

        return updated;
      });

      // Clear relevant validation error on change
      if (validationErrors[name as keyof QuotationFormData]) {
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next[name as keyof QuotationFormData];
          return next;
        });
      }
    },
    [validationErrors]
  );

  const handleTiersChange = useCallback((tiers: PricingTier[]) => {
    setFormData((prev) => {
      const updated = { ...prev, pricingTiers: tiers };
      // If tier 0 has values, sync with main basicRate/edcRate/plcPercent/paymentMonths
      if (tiers.length > 0 && tiers[0]) {
        if (tiers[0].basicRate) updated.basicRate = tiers[0].basicRate;
        if (tiers[0].edcRate) updated.edcRate = tiers[0].edcRate;
        if (tiers[0].plcPercent) updated.plcPercent = tiers[0].plcPercent;
        if (tiers[0].paymentMonths !== undefined) updated.paymentMonths = tiers[0].paymentMonths;
      }
      return updated;
    });
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: Partial<Record<keyof QuotationFormData, string>> = {};

    if (!formData.quotationNo.trim()) errors.quotationNo = 'Please enter a quotation number.';
    if (!formData.quotationDate) errors.quotationDate = 'Please select a date.';
    if (!formData.customerName.trim()) errors.customerName = 'Please enter customer name.';

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      errors.customerEmail = 'Please enter a valid email address.';
    }

    const area = parseNumber(formData.area);
    if (!formData.area || isNaN(area) || area <= 0) {
      errors.area = 'Please enter a valid plot area greater than 0.';
    }

    const basicRate = parseNumber(formData.basicRate);
    if (formData.basicRate === '' || isNaN(basicRate) || basicRate < 0) {
      errors.basicRate = 'Basic Rate cannot be negative.';
    }

    const edcRate = parseNumber(formData.edcRate);
    if (formData.edcRate === '' || isNaN(edcRate) || edcRate < 0) {
      errors.edcRate = 'EDC Rate cannot be negative.';
    }

    const plcPercent = parseNumber(formData.plcPercent);
    if (formData.plcPercent === '' || isNaN(plcPercent) || plcPercent < 0 || plcPercent > 100) {
      errors.plcPercent = 'PLC must be between 0% and 100%.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!calculation) {
      toast.error('Calculation is invalid. Please check pricing inputs.');
      return;
    }
    if (isSubmitting) return; // prevent duplicate

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_type: 'quotation',
          form_data: {
            ...formData,
            area: parseNumber(formData.area),
            basicRate: parseNumber(formData.basicRate),
            edcRate: parseNumber(formData.edcRate),
            plcPercent: parseNumber(formData.plcPercent),
            calculation,
          },
          status: 'draft',
          metadata: { source: 'admin_quotation_generator' },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errMsg = extractApiErrorMessage(
          errorData,
          `Failed to save quotation (${response.status})`
        );
        if (response.status === 409 || errorData?.error?.code === 'CONFLICT') {
          setValidationErrors((prev) => ({
            ...prev,
            quotationNo: errMsg,
          }));
        }
        toast.error(errMsg);
        return;
      }
      const data = await response.json();
      const savedQuotationNo = data.document?.form_data?.quotationNo;
      if (savedQuotationNo) {
        stableQuotationNo.current = savedQuotationNo;
        setFormData((prev) => ({ ...prev, quotationNo: savedQuotationNo }));
      }
      setDocumentId(data.document.id);
      setHasPreview(true);
      toast.success(
        savedQuotationNo
          ? `Quotation No. ${savedQuotationNo} saved successfully!`
          : 'Quotation saved successfully!'
      );
    } catch (err) {
      console.error('Quotation save error:', err instanceof Error ? err.message : String(err));
      toast.error(extractApiErrorMessage(err, 'Unable to save quotation. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    const initial = getInitialFormData();
    setFormData(initial);
    setDocumentId(null);
    setHasPreview(false);
    setValidationErrors({});
    fetchNextQuotationNo();
  };

  // ── Download PDF ─────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      const safeNo = formData.quotationNo.replace(/[^a-zA-Z0-9-]/g, '_');
      await exportToPDF({
        elementId: 'quotationPreview',
        filename: `SVI_Quotation_${safeNo}.pdf`,
      });

      // Update status to completed
      if (documentId && token) {
        try {
          await fetch(`/api/admin/documents/${documentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: 'completed' }),
          });
        } catch {
          // status update failure is non-blocking
        }
      }
    } catch {
      toast.error('PDF generation failed. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Download PNG ─────────────────────────────────────────────────────────
  const handleDownloadPNG = async () => {
    if (imageLoading) return;
    setImageLoading(true);
    try {
      const safeNo = formData.quotationNo.replace(/[^a-zA-Z0-9-]/g, '_');
      await exportToImage({
        elementId: 'quotationPreview',
        filename: `SVI_Quotation_${safeNo}.png`,
      });
    } catch {
      toast.error('PNG generation failed. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    calculation,
    tierCalculations,
    hasPreview,
    setHasPreview,
    isSubmitting,
    documentId,
    setDocumentId,
    companyInfo,
    setCompanyInfo,
    validationErrors,
    setValidationErrors,
    pdfLoading,
    imageLoading,
    templateLoading,
    loadingQuotationNo,
    projects,
    loadingProjects,
    stableQuotationNo,
    fetchNextQuotationNo,
    handleChange,
    handleTiersChange,
    validate,
    handleSubmit,
    handleResetForm,
    handleDownloadPDF,
    handleDownloadPNG,
  };
}

export interface UseQuotationPageReturn {
  formData: QuotationFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuotationFormData>>;
  calculation: QuotationCalculationResult | null;
  tierCalculations: PricingTierCalculation[];
  hasPreview: boolean;
  setHasPreview: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmitting: boolean;
  documentId: string | null;
  setDocumentId: React.Dispatch<React.SetStateAction<string | null>>;
  companyInfo: CompanyInfo;
  setCompanyInfo: React.Dispatch<React.SetStateAction<CompanyInfo>>;
  validationErrors: Partial<Record<keyof QuotationFormData, string>>;
  setValidationErrors: React.Dispatch<
    React.SetStateAction<Partial<Record<keyof QuotationFormData, string>>>
  >;
  pdfLoading: boolean;
  imageLoading: boolean;
  templateLoading: boolean;
  loadingQuotationNo: boolean;
  projects: { value: string; label: string }[];
  loadingProjects: boolean;
  stableQuotationNo: React.MutableRefObject<string>;
  fetchNextQuotationNo: (date?: string) => Promise<string | undefined>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleTiersChange: (tiers: PricingTier[]) => void;
  validate: () => boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleResetForm: () => void;
  handleDownloadPDF: () => Promise<void>;
  handleDownloadPNG: () => Promise<void>;
}
