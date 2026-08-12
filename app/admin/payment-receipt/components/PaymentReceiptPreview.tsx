import { DownloadOptions, PreviewContainer } from '@/src/components/admin/DocumentGenerator/Shared';
import React from 'react';

interface PaymentReceiptPreviewProps {
  formData: {
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
  };
  companyInfo: {
    company_name: string;
    company_phone: string;
    company_email: string;
    company_website: string;
    company_address: string;
  };
  preview: boolean;
  setPreview: (preview: boolean) => void;
  handleDownloadPDF: () => void;
  handleDownloadImage: () => void;
}

export default function PaymentReceiptPreview({
  formData,
  companyInfo,
  preview,
  setPreview,
  handleDownloadPDF,
  handleDownloadImage,
}: PaymentReceiptPreviewProps) {
  return (
    <div className="dark:bg-brand-dark-surface/65 relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h2>
        {preview && (
          <button
            onClick={() => {
              const previewElement = document.getElementById('receiptPreview');
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

      <PreviewContainer previewId="receiptPreview" hasPreview={preview}>
        <div className="bg-white p-8 font-sans text-black">
          {/* Header */}
          <div className="border-brand-gold mb-6 flex items-start justify-between border-b-2 pb-6">
            <div>
              <h1 className="mb-2 text-2xl font-bold tracking-wide text-[#1e3a8a] uppercase">
                {companyInfo.company_name}
              </h1>
              <p className="text-[13px] text-gray-700">
                Cell: {companyInfo.company_phone} | Email: {companyInfo.company_email}
              </p>
              <p className="text-[13px] text-gray-700">Website: {companyInfo.company_website}</p>
              <p className="text-[13px] text-gray-700">
                Office Address : {companyInfo.company_address}
              </p>
            </div>
            <div className="w-48">
              <img
                src="/logo.png"
                alt="SVI Infra Solutions"
                className="h-auto w-full object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          </div>

          <div className="mb-6 text-center">
            <h2 className="inline-block rounded bg-[#1e3a8a] px-6 py-2 text-lg font-bold tracking-widest text-white uppercase shadow-md">
              Payment Receipt
            </h2>
          </div>

          <div className="mb-8 flex justify-between font-sans text-sm font-bold">
            <p className="rounded border-l-4 border-[#1e3a8a] bg-gray-50 px-4 py-2 shadow-sm">
              Receipt No:{' '}
              <span className="ml-1 text-red-600">{formData.receiptNo || '___________'}</span>
            </p>
            <p className="rounded border-l-4 border-[#1e3a8a] bg-gray-50 px-4 py-2 shadow-sm">
              Date:{' '}
              <span className="ml-1 text-red-600">
                {formData.date
                  ? new Date(formData.date).toLocaleDateString('en-GB')
                  : '___________'}
              </span>
            </p>
          </div>

          <div className="relative space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-6 font-sans text-[15px] leading-relaxed shadow-sm">
            {/* Watermark Logo (optional) */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.12]">
              <img
                src="/logo.png"
                alt=""
                className="w-96"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>

            <div className="relative z-10 flex items-end">
              <span className="mr-2 whitespace-nowrap">
                Received with thanks from {formData.salutation} :
              </span>
              <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold text-[#1e3a8a] italic">
                {formData.name}
              </span>
            </div>

            <div className="relative z-10 flex items-end">
              <span className="mr-2 whitespace-nowrap">Ref. Id :</span>
              <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                {formData.refId}
              </span>
            </div>

            <div className="relative z-10 flex items-end">
              <span className="mr-2 whitespace-nowrap">The sum of Rupees :</span>
              <span className="flex-1 border-b border-gray-400 pb-0.5 text-lg font-bold text-gray-800">
                ₹{' '}
                {parseFloat(formData.amount || '0').toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="relative z-10 flex items-end">
              <span className="mr-2 whitespace-nowrap">Rupees in Words :</span>
              <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold text-[#1e3a8a] italic">
                {formData.amountWords}
              </span>
            </div>

            <div className="relative z-10 flex items-end">
              <span className="mr-2 whitespace-nowrap">
                By{' '}
                {formData.paymentMethod === 'UPI' || formData.paymentMethod === 'Cheque'
                  ? 'UPI No / Cheque no'
                  : formData.paymentMethod}{' '}
                No :
              </span>
              <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                {formData.paymentRef}
              </span>
            </div>

            <div className="relative z-10 flex justify-between gap-6 pt-2">
              <div className="flex flex-1 items-end">
                <span className="mr-2 whitespace-nowrap">Drawn On :</span>
                <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                  {formData.drawnOn ? new Date(formData.drawnOn).toLocaleDateString('en-GB') : ''}
                </span>
              </div>
              <div className="flex flex-1 items-end">
                <span className="mr-2 whitespace-nowrap">Plot No :</span>
                <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold text-red-600">
                  {formData.plotNo}
                </span>
              </div>
              <div className="flex flex-1 items-end">
                <span className="mr-2 whitespace-nowrap">Plot Size :</span>
                <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                  {formData.plotSize} Sq. Yds.
                </span>
              </div>
            </div>

            <div className="relative z-10 flex items-end pt-2">
              <span className="mr-2 whitespace-nowrap">On Account of :</span>
              <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                {formData.account}
              </span>
            </div>

            {/* Terms and Conditions - Only show for ₹2100 */}
            {parseFloat(formData.amount) === 2100 && (
              <div className="relative z-10 mt-6 rounded-lg border-2 border-red-500 bg-red-50 p-4">
                <p className="text-sm font-bold text-red-700">Terms & Conditions:</p>
                <p className="mt-2 text-sm font-medium text-gray-900">
                  This is a refundable amount of ₹2100. If your name is not selected in the draw,
                  the amount will be automatically refunded within the next 48 hours.
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 flex items-end justify-between pb-8">
            <div className="rounded-lg border-2 border-[#1e3a8a] bg-white px-8 py-4 text-2xl font-bold text-[#1e3a8a] shadow-md">
              ₹{' '}
              {parseFloat(formData.amount || '0').toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
              /-
            </div>
            <div className="relative text-center">
              <img
                src="/signature.png"
                alt="Signature"
                className="absolute bottom-10 left-1/2 h-28 w-auto -translate-x-1/2 opacity-95 mix-blend-multiply"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <div className="relative z-10 w-56 border-t-2 border-black pt-2">
                <p className="text-sm font-bold text-[#1e3a8a]">For {companyInfo.company_name}</p>
                <p className="mt-1 text-xs font-bold text-gray-700">Authorized Signatory</p>
              </div>
            </div>
          </div>

          <p className="mt-8 border-t border-gray-200 pt-4 text-center text-[11px] text-gray-500 italic">
            Thank you for your business. Please keep this receipt for your records. This is a
            computer generated document.
          </p>
        </div>
      </PreviewContainer>

      <DownloadOptions
        onDownloadPDF={handleDownloadPDF}
        onDownloadImage={handleDownloadImage}
        disabled={!preview}
      />
    </div>
  );
}
