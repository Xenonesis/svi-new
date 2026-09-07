'use client';

import { DownloadOptions, PreviewContainer } from '@/src/components/admin/DocumentGenerator/Shared';
import {
  usePaymentPlanForm,
  PaymentPlanHeader,
  PaymentPlanForm,
  PaymentPlanPreview,
} from '@/src/components/admin/payment-plan';

export default function PaymentPlanPage() {
  const {
    formData,
    preview,
    schedule,
    totals,
    handleChange,
    calculatePlan,
    handleDownloadPDF,
    handleDownloadImage,
  } = usePaymentPlanForm();

  const handleToggleFullscreen = () => {
    const previewElement =
      document.getElementById('planPreview') || document.getElementById('paymentPlanPreview');
    if (previewElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error('Error attempting to exit fullscreen:', err);
        });
      } else {
        previewElement.requestFullscreen().catch((err) => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <PaymentPlanHeader />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <PaymentPlanForm formData={formData} onChange={handleChange} onSubmit={calculatePlan} />

        {/* Preview Section */}
        <div className="dark:bg-brand-dark-surface/65 relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h2>
            {preview && (
              <button
                onClick={handleToggleFullscreen}
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

          <PreviewContainer previewId="planPreview" hasPreview={preview}>
            <PaymentPlanPreview formData={formData} totals={totals} schedule={schedule} />
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
