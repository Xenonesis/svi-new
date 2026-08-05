'use client';

import { DownloadOptions, PreviewContainer } from '@/src/components/admin/DocumentGenerator/Shared';
import { AllotmentLetterPreview } from '@/src/components/admin/DocumentGenerator/AllotmentLetterPreview';
import { useAuthStore } from '@/src/stores/authStore';
import { FileText, X } from 'lucide-react';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { useAllotmentLetterData } from '@/src/hooks/admin/useAllotmentLetterData';
import { AllotmentLetterForm } from '@/src/components/admin/allotment-letter/AllotmentLetterForm';

export default function AllotmentLetterPage() {
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
    isSaving,
    setIsSaving,
    showSaveModal,
    setShowSaveModal,
    duplicateRecordToOverwrite,
    setDuplicateRecordToOverwrite,
    savedAllotments,
    setSavedAllotments,
    loadingRecords,
    selectedRecordId,
    setSelectedRecordId,
    loadFromRecord,
    handleChange,
    getCustomDateValue,
    handleCustomDateChange,
    handleSecondPaymentDaysChange,
    handleAdvisorChange,
  } = useAllotmentLetterData(token);

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
  const edcAmount = parseFloat(formData.edc) || 0;
  const edcInEmi = formData.edcInEmi === 'true';
  const baseCost = totalCost - edcAmount;
  const bookingPercent = parseFloat(formData.bookingPaymentPercent) || 10;
  const initialPayment = (edcInEmi ? baseCost : totalCost) * (bookingPercent / 100);

  const executeSave = async (targetId: string | null, forceInsert = false) => {
    if (!token || isSaving) return;
    setIsSaving(true);
    try {
      const url =
        targetId && !forceInsert ? `/api/admin/documents/${targetId}` : '/api/admin/documents';
      const method = targetId && !forceInsert ? 'PATCH' : 'POST';
      const body =
        targetId && !forceInsert
          ? { form_data: formData, status: 'draft' }
          : { document_type: 'allotment_letter', form_data: formData, status: 'draft' };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setDocumentId(data.document.id);
        setSavedAllotments((prev) => {
          const index = prev.findIndex((item) => item.id === data.document.id);
          if (index !== -1 && !forceInsert) {
            const updated = [...prev];
            updated[index] = data.document;
            return updated;
          } else {
            return [data.document, ...prev];
          }
        });
        setPreview(true);
      }
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
      setShowSaveModal(false);
      setDuplicateRecordToOverwrite(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const existingRecord = savedAllotments.find(
      (r) => r.form_data?.ticketId === formData.ticketId && r.id !== documentId
    );

    if (existingRecord) {
      setDuplicateRecordToOverwrite(existingRecord);
      setShowSaveModal(true);
      return;
    }

    await executeSave(documentId);
  };

  const handleDownloadPDF = async () => {
    try {
      await exportToPDF({
        elementId: 'allotmentPreview',
        filename: 'Allotment_Letter.pdf',
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
      await exportToImage({
        elementId: 'allotmentPreview',
        filename: 'Allotment_Letter.png',
      });
    } catch (error) {
      console.error('Error generating Image:', error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Allotment <span className="text-brand-gold italic">Letter</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download official allotment letters for clients.
          </p>
        </div>
      </div>

      <div className="dark:bg-brand-dark-surface/40 mb-6 rounded-xl border border-gray-200 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-white/8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            <FileText className="h-3.5 w-3.5" />
            Load from Records
          </div>
          <div className="relative flex-1" style={{ minWidth: 280 }}>
            <select
              value={selectedRecordId}
              onChange={(e) => loadFromRecord(e.target.value)}
              className="focus:border-brand-gold focus:ring-brand-gold/50 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 pr-8 text-sm text-gray-900 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
            >
              <option value="" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
                {loadingRecords
                  ? 'Loading records...'
                  : savedAllotments.length === 0
                    ? '— No saved allotment records found —'
                    : '— Select a saved allotment —'}
              </option>
              {savedAllotments.map((r: any) => (
                <option
                  key={r.id}
                  value={r.id}
                  className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
                >
                  {r.form_data?.clientName || 'Unnamed'} — {r.form_data?.ticketId || 'No ticket'} (
                  {new Date(r.created_at).toLocaleDateString('en-IN')})
                </option>
              ))}
            </select>
          </div>
          {selectedRecordId && (
            <button
              type="button"
              onClick={() => {
                setSelectedRecordId('');
                setIsCustomAdvisor(false);
                setIsCustomSecondPaymentDays(false);
                setFormData({
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
                });
              }}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition-all hover:border-gray-300 hover:text-gray-700 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/20"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="dark:bg-brand-dark-surface/65 relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
              <FileText className="text-brand-gold h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Document Details</h2>
          </div>

          <AllotmentLetterForm
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
            isSaving={isSaving}
            totalCost={totalCost}
            bookingPercent={bookingPercent}
            initialPayment={initialPayment}
            edcInEmi={edcInEmi}
          />
        </div>

        <div className="dark:bg-brand-dark-surface relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/8">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h2>
            {preview && (
              <button
                onClick={() => {
                  const previewElement = document.getElementById('allotmentPreview');
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

          <PreviewContainer previewId="allotmentPreview" hasPreview={preview}>
            <AllotmentLetterPreview
              formData={formData}
              companyInfo={companyInfo}
              className="relative bg-white p-8 font-sans text-[13px] leading-relaxed text-black"
            />
          </PreviewContainer>

          <DownloadOptions
            onDownloadPDF={handleDownloadPDF}
            onDownloadImage={handleDownloadImage}
            disabled={!preview}
          />
        </div>
      </div>

      {showSaveModal && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
          <div className="dark:bg-brand-dark-surface animate-in zoom-in-95 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl duration-200 dark:border-white/10">
            <h3 className="mb-2 font-serif text-lg font-bold text-gray-900 dark:text-white">
              Duplicate Ticket ID Found
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              An allotment letter with Ticket ID{' '}
              <strong className="text-brand-gold">{formData.ticketId}</strong> is already saved in
              the database. What would you like to do?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => executeSave(duplicateRecordToOverwrite?.id)}
                className="bg-brand-navy hover:bg-brand-navy/90 cursor-pointer rounded-xl px-4 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all"
              >
                🔄 Overwrite Old One
              </button>
              <button
                onClick={() => executeSave(null, true)}
                className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy cursor-pointer rounded-xl px-4 py-3 text-xs font-bold tracking-wider uppercase shadow-md transition-all"
              >
                ➕ Save as New
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setDuplicateRecordToOverwrite(null);
                }}
                className="cursor-pointer rounded-xl border border-gray-200 px-4 py-3 text-xs font-bold tracking-wider text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
