'use client';

import { DownloadOptions, PreviewContainer } from '@/src/components/admin/DocumentGenerator/Shared';
import { useAuthStore } from '@/src/stores/authStore';
import { FileText, ClipboardList } from 'lucide-react';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import Link from 'next/link';
import { Suspense } from 'react';
import BbaPreviewContent from '@/src/components/admin/DocumentGenerator/BbaPreviewContent';
import BbaPreviewContentHindi from '@/src/components/admin/DocumentGenerator/BbaPreviewContentHindi';
import { useBBAData } from '@/src/hooks/admin/useBBAData';
import { BBAForm } from '@/src/components/admin/bba/BBAForm';

function BbaPageContent() {
  const { token } = useAuthStore();

  const {
    advisors,
    isCustomAdvisor,
    setIsCustomAdvisor,
    isCustomSecondPaymentDays,
    setIsCustomSecondPaymentDays,
    projects,
    companyInfo,
    formData,
    setFormData,
    preview,
    setPreview,
    documentId,
    setDocumentId,
    savedBbas,
    setSavedBbas,
    handleChange,
    getCustomDateValue,
    handleCustomDateChange,
    handleSecondPaymentDaysChange,
    handleAdvisorChange,
  } = useBBAData(token);

  const calculateTotalCost = () => {
    const area = parseFloat(formData.area) || 0;
    const bsp = parseFloat(formData.bsp) || 0;
    const plc = parseFloat(formData.plc) || 0;
    const edc = parseFloat(formData.edc) || 0;

    const base = area * bsp;
    const plcAmount = base * (plc / 100);
    return base + plcAmount + edc;
  };

  const totalCost = calculateTotalCost();
  const initialPayment = totalCost * 0.1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (token) {
      const saveBody = {
        document_type: 'bba',
        form_data: formData,
        status: 'draft',
      };

      const doPost = async () => {
        const res = await fetch('/api/admin/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(saveBody),
        });
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Failed to create document: ${errBody}`);
        }
        return res.json();
      };

      try {
        let savedDoc: any = null;

        if (documentId) {
          const patchRes = await fetch(`/api/admin/documents/${documentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ form_data: formData, status: 'draft' }),
          });

          if (patchRes.status === 404) {
            console.warn('[BBA] Document not found, creating new record instead.');
            setDocumentId(null);
            const data = await doPost();
            savedDoc = data.document;
          } else if (!patchRes.ok) {
            const errBody = await patchRes.text();
            throw new Error(`Failed to update document: ${errBody}`);
          } else {
            const data = await patchRes.json();
            savedDoc = data.document;
          }
        } else {
          const data = await doPost();
          savedDoc = data.document;
        }

        if (savedDoc?.id) {
          setDocumentId(savedDoc.id);
          const listRes = await fetch('/api/admin/documents?type=bba', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (listRes.ok) {
            const listData = await listRes.json();
            setSavedBbas(listData.documents || []);
          }
        }
      } catch (error) {
        console.error('Failed to save document:', error);
      }
    }

    setPreview(true);
  };

  const handleLoadBba = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) {
      setDocumentId(null);
      setFormData({
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
      });
      setIsCustomSecondPaymentDays(false);
      return;
    }

    const selected = savedBbas.find((b) => b.id === id);
    if (selected && selected.form_data) {
      setDocumentId(selected.id);
      const parsed = selected.form_data;
      setFormData((prev: any) => ({ ...prev, ...parsed }));
      if (parsed.secondPaymentDays) {
        const isCustomDays = parsed.secondPaymentDays !== '15' && parsed.secondPaymentDays !== '28';
        setIsCustomSecondPaymentDays(isCustomDays);
      }
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await exportToPDF({
        elementId: 'bbaPreview',
        filename: 'BBA_Document.pdf',
      });

      if (documentId && token) {
        await fetch(`/api/admin/documents/${documentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'completed' }),
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDownloadImage = async () => {
    try {
      await exportToImage({
        elementId: 'bbaPreview',
        filename: 'BBA_Document.png',
      });
    } catch (error) {
      console.error('Error generating Image:', error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Builder Buyer <span className="text-brand-gold italic">Agreement (BBA)</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download official Builder Buyer Agreements for clients.
          </p>
        </div>
        <Link
          href="/admin/bba-records"
          className="flex w-fit items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
        >
          <ClipboardList className="h-4 w-4" /> View Records
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="dark:bg-brand-dark-surface/65 relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
                <FileText className="text-brand-gold h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Agreement Details</h2>
            </div>

            {savedBbas.length > 0 && (
              <select
                className="border-brand-navy/20 focus:border-brand-gold focus:ring-brand-gold/20 dark:border-brand-gold/20 dark:bg-brand-gold/5 dark:focus:border-brand-gold w-full rounded-xl border bg-white/50 px-3 py-1.5 text-sm text-gray-900 backdrop-blur-sm transition-all outline-none sm:w-auto dark:text-white"
                value={documentId || ''}
                onChange={handleLoadBba}
              >
                <option
                  value=""
                  className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
                >
                  -- Create New BBA --
                </option>
                {savedBbas.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
                  >
                    {b.form_data?.clientName || 'Unknown'} - {b.form_data?.ticketId || 'No Ticket'}{' '}
                    ({new Date(b.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          <BBAForm
            formData={formData}
            setFormData={setFormData}
            advisors={advisors}
            projects={projects}
            isCustomAdvisor={isCustomAdvisor}
            setIsCustomAdvisor={setIsCustomAdvisor}
            isCustomSecondPaymentDays={isCustomSecondPaymentDays}
            setIsCustomSecondPaymentDays={setIsCustomSecondPaymentDays}
            handleChange={handleChange}
            getCustomDateValue={getCustomDateValue}
            handleCustomDateChange={handleCustomDateChange}
            handleSecondPaymentDaysChange={handleSecondPaymentDaysChange}
            handleAdvisorChange={handleAdvisorChange}
            handleSubmit={handleSubmit}
            totalCost={totalCost}
            initialPayment={initialPayment}
          />
        </div>

        <div className="dark:bg-brand-dark-surface relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/8">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h2>
            {preview && (
              <button
                onClick={() => {
                  const previewElement = document.getElementById('bbaPreview');
                  if (previewElement) {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      previewElement.requestFullscreen().catch((err) => {
                        console.error('Error attempting to enable fullscreen:', err);
                      });
                    }
                  }
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
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

          <PreviewContainer previewId="bbaPreview" hasPreview={preview}>
            {formData.language === 'hi' ? (
              <BbaPreviewContentHindi formData={formData} companyInfo={companyInfo} />
            ) : (
              <BbaPreviewContent formData={formData} companyInfo={companyInfo} />
            )}
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

export default function BbaPage() {
  return (
    <Suspense fallback={<div>Loading BBA Generator...</div>}>
      <BbaPageContent />
    </Suspense>
  );
}
