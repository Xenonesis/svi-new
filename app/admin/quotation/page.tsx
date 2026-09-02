'use client';

import { useAuthStore } from '@/src/stores/authStore';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { FileText, Plus } from 'lucide-react';
import { PreviewContainer, DownloadOptions } from '@/src/components/admin/DocumentGenerator/Shared';
import QuotationForm from '@/src/components/admin/quotation/QuotationForm';
import QuotationSummary from '@/src/components/admin/quotation/QuotationSummary';
import QuotationPreview from '@/src/components/admin/quotation/QuotationPreview';

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
const DEFAULT_PROJECTS = [
  { value: 'Shyam Aangan', label: 'Shyam Aangan' },
  { value: 'Shivani Vatika', label: 'Shivani Vatika' },
  { value: 'Phulera SmartCity', label: 'Phulera SmartCity' },
  { value: 'Shivani Vatika 11th', label: 'Shivani Vatika 11th' },
  { value: 'Shyam Aangan Farm House', label: 'Shyam Aangan Farm House' },
  { value: 'Shyam Aangan Phase 1', label: 'Shyam Aangan Phase 1' },
];

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  company_name: 'SVI INFRA SOLUTIONS PVT. LTD.',
  company_address: 'Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309',
  company_email: 'info@sviinfrasolutions.com',
  company_phone: '+91 9216014579',
  company_website: 'www.sviinfrasolutions.in',
};

function getInitialFormData(): QuotationFormData {
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

export default function QuotationPage() {
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
  }, [templateId, token]);

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

  if (templateLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="border-brand-gold mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading template…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Quotation <span className="text-brand-gold italic">Generator</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create professional property quotations with automatic pricing calculations and
            downloadable PDF/PNG documents.
          </p>
        </div>
        <button
          onClick={handleResetForm}
          className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 flex w-fit items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold tracking-wide uppercase shadow-sm transition-all active:scale-95"
          title="Reset form and fetch next quotation number from DB"
        >
          <Plus className="h-4 w-4" /> New Quotation
        </button>
      </div>
      {/* Desktop: Form | Preview. Mobile: stacked */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* ── Left: Form ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <QuotationForm
            formData={formData}
            projects={projects}
            loadingProjects={loadingProjects}
            tierCalculations={tierCalculations}
            onChange={handleChange}
            onTiersChange={handleTiersChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            validationErrors={validationErrors}
            onRefreshQuotationNo={() => fetchNextQuotationNo(formData.quotationDate)}
            loadingQuotationNo={loadingQuotationNo}
          />

          {/* Live summary (mobile: show below form; desktop: inside left col) */}
          <div className="dark:bg-brand-dark-surface/65 overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-white/10">
              <div className="bg-brand-gold/10 border-brand-gold/20 flex h-7 w-7 items-center justify-center rounded border">
                <FileText className="text-brand-gold h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Calculation Summary
              </h2>
            </div>
            <QuotationSummary
              calculation={calculation}
              tierCalculations={tierCalculations}
              area={formData.area}
              paymentMonths={formData.paymentMonths}
            />
          </div>
        </div>

        {/* ── Right: Preview ────────────────────────────────────────────── */}
        <div className="dark:bg-brand-dark-surface/65 relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h2>
            {hasPreview && (
              <button
                onClick={() => {
                  const el = document.getElementById('quotationPreview');
                  if (!el) return;
                  if (document.fullscreenElement) document.exitFullscreen();
                  else el.requestFullscreen().catch(console.error);
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                title="Toggle Fullscreen"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
                <span className="hidden sm:inline">Fullscreen</span>
              </button>
            )}
          </div>

          <PreviewContainer previewId="quotationPreview" hasPreview={hasPreview}>
            {calculation && (
              <QuotationPreview
                formData={formData}
                calculation={calculation}
                tierCalculations={tierCalculations}
                companyInfo={companyInfo}
              />
            )}
          </PreviewContainer>

          <DownloadOptions
            onDownloadPDF={handleDownloadPDF}
            onDownloadImage={handleDownloadPNG}
            disabled={!hasPreview || pdfLoading || imageLoading}
          />
        </div>
      </div>
    </div>
  );
}
