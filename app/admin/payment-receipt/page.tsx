'use client';

import {
  DownloadOptions,
  FormField,
  FormSelect,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import { Receipt, RefreshCw } from 'lucide-react';

import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { useState } from 'react';

export default function PaymentReceiptPage() {
  const { token } = useAdminSession();
  const [formData, setFormData] = useState({
    receiptNo: '',
    date: '',
    name: '',
    refId: '',
    amount: '',
    amountWords: '',
    paymentRef: '',
    drawnOn: '',
    plotNo: '',
    plotSize: '',
    account: '',
    paymentMethod: 'UPI', // Defaulted
  });

  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save document record to database
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
    const element = document.getElementById('receiptPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Payment_Receipt.pdf');

    // Update document status to completed
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
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('receiptPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'Payment_Receipt.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Payment <span className="text-brand-gold italic">Receipt</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate official payment receipts for client transactions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Form Section */}
        <div className="relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
              <Receipt className="text-brand-gold h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Receipt Number"
                name="receiptNo"
                value={formData.receiptNo}
                onChange={handleChange}
                required
              />
              <FormField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <FormField
                label="Name (Mr./Mrs./M/s)"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />
              <FormField
                label="Ref. Id"
                name="refId"
                value={formData.refId}
                onChange={handleChange}
                required
              />
              <FormField
                label="Amount (in digits)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
              />

              <FormField
                label="Amount (in words)"
                name="amountWords"
                value={formData.amountWords}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />

              <FormSelect
                label="Payment Method"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                options={[
                  { value: 'Cash', label: 'Cash' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Cheque', label: 'Cheque' },
                  { value: 'Credit Card', label: 'Credit Card' },
                  { value: 'Bank Transfer', label: 'Bank Transfer' },
                  { value: 'UPI', label: 'UPI' },
                ]}
              />

              <FormField
                label="Payment Reference Number"
                name="paymentRef"
                value={formData.paymentRef}
                onChange={handleChange}
                required
              />
              <FormField
                label="Drawn On"
                name="drawnOn"
                type="date"
                value={formData.drawnOn}
                onChange={handleChange}
              />
              <FormField
                label="Plot No"
                name="plotNo"
                value={formData.plotNo}
                onChange={handleChange}
              />
              <FormField
                label="Plot Size"
                name="plotSize"
                value={formData.plotSize}
                onChange={handleChange}
                required
              />

              <FormField
                label="On Account Of"
                name="account"
                value={formData.account}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />
            </div>

            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Generate Receipt
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Live Preview
            </h2>
            {preview && (
              <button
                onClick={() => {
                  const previewElement = document.getElementById('receiptPreview');
                  if (previewElement) {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      previewElement.requestFullscreen().catch(err => {
                        console.error('Error attempting to enable fullscreen:', err);
                      });
                    }
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                title="Toggle Fullscreen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <div className="bg-white text-black p-8 font-sans">
              {/* Header */}
              <div className="flex justify-between items-start mb-6 border-b-2 border-brand-gold pb-6">
                <div>
                  <h1 className="text-[#1e3a8a] text-2xl font-bold mb-2 tracking-wide uppercase">
                    SVI INFRA SOLUTIONS PVT. LTD
                  </h1>
                  <p className="text-gray-700 text-[13px]">Cell: +91 9216014579 | Email: info@sviinfrasolutions.com</p>
                  <p className="text-gray-700 text-[13px]">Website: www.sviinfrasolutions.in | www.sviinfrasolutions.com</p>
                  <p className="text-gray-700 text-[13px]">Office Address : A-61 Sector 65 Noida Uttar Pradesh 201309</p>
                </div>
                <div className="w-48">
                  <img src="/images/logo.png" alt="SVI Infra Solutions" className="w-full h-auto object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              </div>

              <div className="mb-6 text-center">
                <h2 className="inline-block bg-[#1e3a8a] text-white px-6 py-2 rounded text-lg font-bold tracking-widest uppercase shadow-md">
                  Payment Receipt
                </h2>
              </div>

              <div className="mb-8 flex justify-between font-sans text-sm font-bold">
                <p className="rounded border-l-4 border-[#1e3a8a] bg-gray-50 px-4 py-2 shadow-sm">
                  Receipt No: <span className="ml-1 text-red-600">{formData.receiptNo || '___________'}</span>
                </p>
                <p className="rounded border-l-4 border-[#1e3a8a] bg-gray-50 px-4 py-2 shadow-sm">
                  Date: <span className="ml-1 text-red-600">{formData.date || '___________'}</span>
                </p>
              </div>

              <div className="space-y-6 font-sans text-[15px] leading-relaxed p-6 border border-gray-200 rounded-xl bg-gray-50 shadow-sm relative">
                {/* Watermark Logo (optional) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                   <img src="/images/logo.png" alt="" className="w-96" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>

                <div className="flex items-end relative z-10">
                  <span className="mr-2 whitespace-nowrap">
                    Received with thanks from Mr. / Mrs. / M/s :
                  </span>
                  <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold italic text-[#1e3a8a]">
                    {formData.name}
                  </span>
                </div>

                <div className="flex items-end relative z-10">
                  <span className="mr-2 whitespace-nowrap">Ref. Id :</span>
                  <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                    {formData.refId}
                  </span>
                </div>

                <div className="flex items-end relative z-10">
                  <span className="mr-2 whitespace-nowrap">The sum of Rupees :</span>
                  <span className="flex-1 border-b border-gray-400 pb-0.5 text-lg font-bold text-gray-800">
                    ₹ {parseFloat(formData.amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-end relative z-10">
                  <span className="mr-2 whitespace-nowrap">Rupees in Words :</span>
                  <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold italic text-[#1e3a8a]">
                    {formData.amountWords}
                  </span>
                </div>

                <div className="flex items-end relative z-10">
                  <span className="mr-2 whitespace-nowrap">By {formData.paymentMethod} No :</span>
                  <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                    {formData.paymentRef}
                  </span>
                </div>

                <div className="flex justify-between gap-6 pt-2 relative z-10">
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

                <div className="flex items-end pt-2 relative z-10">
                  <span className="mr-2 whitespace-nowrap">On Account of :</span>
                  <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                    {formData.account}
                  </span>
                </div>
              </div>

              <div className="mt-12 flex items-end justify-between pb-8">
                <div className="border-[#1e3a8a] rounded-lg border-2 bg-white px-8 py-4 text-2xl font-bold shadow-md text-[#1e3a8a]">
                  ₹ {parseFloat(formData.amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-
                </div>
                <div className="text-center relative">
                  <img src="/images/signature.png" alt="Signature" className="absolute bottom-10 left-1/2 -translate-x-1/2 h-16 w-auto opacity-90 mix-blend-multiply" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  <div className="w-56 border-t-2 border-black pt-2 relative z-10">
                    <p className="text-sm font-bold text-[#1e3a8a]">For SVI Infra Solutions Pvt. Ltd</p>
                    <p className="mt-1 text-xs font-bold text-gray-700">Authorized Signatory</p>
                  </div>
                </div>
              </div>

              <p className="mt-8 border-t border-gray-200 pt-4 text-center text-[11px] text-gray-500 italic">
                Thank you for your business. Please keep this receipt for your records. This is a computer generated document.
              </p>
            </div>
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
