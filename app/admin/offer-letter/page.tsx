'use client';

import { DownloadOptions, PreviewContainer } from '@/src/components/admin/DocumentGenerator/Shared';
import { useAuthStore } from '@/src/stores/authStore';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import OfferLetterPreviewContent from '@/src/components/admin/DocumentGenerator/OfferLetterPreviewContent';
import { SALARY_SLABS } from '@/src/components/admin/OfferLetter/SlabSelector';
import { OfferLetterForm } from '@/src/components/admin/OfferLetter/OfferLetterForm';
import { OfferLetterFormData, SavedOffer } from '@/src/components/admin/OfferLetter/types';
import { useEffect, useState, useCallback } from 'react';

export default function OfferLetterPage() {
  const { token } = useAuthStore();
  const [companyInfo, setCompanyInfo] = useState({
    company_name: 'SVI Infra Solutions Pvt. Ltd.',
    company_address: 'A-61 Sector 65 Noida Uttar Pradesh 201309',
    company_email: 'info@sviinfrasolutions.com',
    company_phone: '+91 9216014579',
    company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
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
        if (json.value) setCompanyInfo(json.value);
      })
      .catch((err) => console.error('Error fetching company info:', err));
  }, [token]);

  const [formData, setFormData] = useState<OfferLetterFormData>({
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
  });

  const [showSalesOptions, setShowSalesOptions] = useState(false);
  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [savedOffers, setSavedOffers] = useState<SavedOffer[]>([]);
  const [showSlabs, setShowSlabs] = useState(false);
  const [salesCustomDesignation, setSalesCustomDesignation] = useState('');
  const [showCustomDesignation, setShowCustomDesignation] = useState(false);

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

  const handleLoadOffer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) {
      setDocumentId(null);
      setFormData({
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
      });
      return;
    }
    const selected = savedOffers.find((b) => b.id === id);
    if (selected && selected.form_data) {
      setDocumentId(selected.id);
      setFormData((prev) => ({ ...prev, ...(selected.form_data as OfferLetterFormData) }));
    }
  };

  useEffect(() => {
    if (savedOffers.length > 0 && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const templateId = searchParams.get('templateId');
      if (templateId) {
        const selected = savedOffers.find((b) => b.id === templateId);
        if (selected && selected.form_data) {
          setDocumentId(selected.id);
          setFormData((prev) => ({ ...prev, ...(selected.form_data as OfferLetterFormData) }));
        }
      }
    }
  }, [savedOffers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      try {
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
          setDocumentId(data.document.id);
        }
      } catch (error) {
        console.error('Failed to save document:', error);
      }
    }
    setPreview(true);
  };

  const handleDownloadPDF = async () => {
    try {
      await exportToPDF({ elementId: 'offerPreview', filename: 'Offer_Letter.pdf' });
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
    }
  };

  const handleDownloadImage = async () => {
    try {
      await exportToImage({ elementId: 'offerPreview', filename: 'Offer_Letter.png' });
    } catch (error) {
      console.error('Error generating Image:', error);
    }
  };

  const matchedSlab = formData.salaryCtc
    ? SALARY_SLABS.find((s) => parseFloat(formData.salaryCtc) === s.salary)
    : formData.target
      ? SALARY_SLABS.find((s) => parseFloat(formData.target) === s.target)
      : null;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="text-brand-navy mb-1 font-serif text-3xl tracking-tight dark:text-white">
          Offer <span className="text-brand-gold italic">Letter</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Generate offer letters for new employees.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <OfferLetterForm
          formData={formData}
          setFormData={setFormData}
          savedOffers={savedOffers}
          showSalesOptions={showSalesOptions}
          setShowSalesOptions={setShowSalesOptions}
          showSlabs={showSlabs}
          setShowSlabs={setShowSlabs}
          salesCustomDesignation={salesCustomDesignation}
          setSalesCustomDesignation={setSalesCustomDesignation}
          showCustomDesignation={showCustomDesignation}
          setShowCustomDesignation={setShowCustomDesignation}
          handleLoadOffer={handleLoadOffer}
          handleSubmit={handleSubmit}
          handleSalaryChange={handleSalaryChange}
          handleTargetChange={handleTargetChange}
          handleSalarySelect={handleSalarySelect}
          handleTargetSelect={handleTargetSelect}
          handleChange={handleChange}
        />

        {/* ──────────────── Preview ──────────────── */}
        <div className="dark:bg-brand-dark-surface relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Preview</h2>
            {preview && (
              <button
                onClick={() => {
                  const el = document.getElementById('offerPreview');
                  if (el) {
                    if (document.fullscreenElement) document.exitFullscreen();
                    else el.requestFullscreen().catch(() => {});
                  }
                }}
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-300"
                title="Fullscreen"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
              </button>
            )}
          </div>

          <PreviewContainer previewId="offerPreview" hasPreview={preview}>
            <OfferLetterPreviewContent
              formData={formData}
              companyInfo={companyInfo}
              matchedSlab={matchedSlab}
            />
          </PreviewContainer>

          <DownloadOptions
            onDownloadPDF={handleDownloadPDF}
            onDownloadImage={handleDownloadImage}
            disabled={!preview}
          />
        </div>
      </div>
    </div>
  );
}
