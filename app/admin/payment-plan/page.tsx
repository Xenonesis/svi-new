'use client';

import {
  DownloadOptions,
  FormField,
  FormSelect,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';

import { Calculator } from 'lucide-react';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { useState } from 'react';

export default function PaymentPlanPage() {
  const { token } = useAdminSession();
  const [formData, setFormData] = useState({
    unitNo: '',
    plotSize: '',
    propertyType: 'Residential Farm House',
    costPerSqYd: '',
    bookingAmount: '',
    emis: '12',
    startDate: new Date().toISOString().split('T')[0],
  });

  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Array<{ month: number; date: string; amount: string }>>(
    []
  );
  const [totals, setTotals] = useState({ totalCost: 0, balance: 0, emiAmount: 0 });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculatePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    const size = parseFloat(formData.plotSize) || 0;
    const rate = parseFloat(formData.costPerSqYd) || 0;
    const booking = parseFloat(formData.bookingAmount) || 0;
    const emiCount = parseInt(formData.emis) || 1;

    const totalCost = size * rate;
    const balance = totalCost - booking;
    const emiAmount = balance / emiCount;

    const newSchedule = [];
    const start = new Date(formData.startDate);

    for (let i = 1; i <= emiCount; i++) {
      const emiDate = new Date(start);
      emiDate.setMonth(start.getMonth() + i);

      newSchedule.push({
        month: i,
        date: emiDate.toLocaleDateString('en-GB'),
        amount: emiAmount.toFixed(2),
      });
    }

    setTotals({ totalCost, balance, emiAmount });
    setSchedule(newSchedule);

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
            document_type: 'payment_plan',
            form_data: {
              ...formData,
              schedule: newSchedule,
              totals: { totalCost, balance, emiAmount },
            },
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
      await exportToPDF({
        elementId: 'planPreview',
        filename: 'Payment_Plan.pdf',
      });

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
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDownloadImage = async () => {
    try {
      await exportToImage({
        elementId: 'planPreview',
        filename: 'Payment_Plan.png',
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
            Payment <span className="text-brand-gold italic">Plan Calculator</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download structured payment plans and EMIs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Form Section */}
        <div className="relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
              <Calculator className="text-brand-gold h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Plan Configuration</h2>
          </div>

          <form onSubmit={calculatePlan} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Unit Number"
                name="unitNo"
                value={formData.unitNo}
                onChange={handleChange}
                required
              />
              <FormField
                label="Size of Plot (Sq. Yds.)"
                name="plotSize"
                type="number"
                value={formData.plotSize}
                onChange={handleChange}
                required
              />

              <FormSelect
                label="Property Type"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="md:col-span-2"
                options={[
                  { value: 'Residential Farm House', label: 'Residential Farm House' },
                  { value: 'Commercial Plot', label: 'Commercial Plot' },
                  { value: 'Residential Plot', label: 'Residential Plot' },
                ]}
              />

              <FormField
                label="Cost / Sq.Yd (₹)"
                name="costPerSqYd"
                type="number"
                value={formData.costPerSqYd}
                onChange={handleChange}
                required
              />
              <FormField
                label="Booking Amount (₹)"
                name="bookingAmount"
                type="number"
                value={formData.bookingAmount}
                onChange={handleChange}
                required
              />
              <FormField
                label="No of EMI's Required"
                name="emis"
                type="number"
                value={formData.emis}
                onChange={handleChange}
                required
              />
              <FormField
                label="Plan Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
            >
              <Calculator className="h-4 w-4" /> Calculate & Generate Plan
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h2>
            {preview && (
              <button
                onClick={() => {
                  const previewElement = document.getElementById('paymentPlanPreview');
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

          <PreviewContainer previewId="planPreview" hasPreview={preview}>
            <div className="bg-white p-8 font-sans text-black">
              <div className="border-brand-gold mb-8 border-b-2 pb-6 text-center">
                <h1 className="text-brand-navy font-serif text-3xl font-bold">
                  Payment Plan ({formData.emis} Months)
                </h1>
                <p className="mt-2 font-sans text-lg font-semibold tracking-wider text-gray-600 uppercase">
                  {formData.propertyType}
                </p>
              </div>

              <div className="mb-10 grid grid-cols-2 gap-6 rounded-xl border border-gray-200 bg-gray-50 p-6 md:grid-cols-3">
                <div>
                  <span className="mb-1 block text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Unit Number
                  </span>
                  <span className="text-lg font-semibold">{formData.unitNo || '-'}</span>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Plot Size
                  </span>
                  <span className="text-lg font-semibold">{formData.plotSize || '0'} Sq. Yds.</span>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Cost/Sq.Yd
                  </span>
                  <span className="text-lg font-semibold">
                    ₹ {parseFloat(formData.costPerSqYd || '0').toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Total Cost
                  </span>
                  <span className="text-brand-navy text-lg font-semibold">
                    ₹ {totals.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Booking Amount
                  </span>
                  <span className="text-lg font-semibold text-green-600">
                    ₹{' '}
                    {parseFloat(formData.bookingAmount || '0').toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Balance Amount
                  </span>
                  <span className="text-lg font-semibold text-orange-600">
                    ₹ {totals.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <h3 className="mb-6 border-b pb-2 text-xl font-bold text-gray-800">
                Installment Schedule
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {/* Initial Payment Card */}
                <div className="relative overflow-hidden rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
                  <div className="absolute top-0 left-0 h-full w-1 bg-green-500"></div>
                  <h4 className="mb-1 text-sm font-bold tracking-wide text-green-800 uppercase">
                    Initial Payment
                  </h4>
                  <p className="mb-3 text-xs text-green-600">
                    {new Date(formData.startDate).toLocaleDateString('en-GB')}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{' '}
                    {parseFloat(formData.bookingAmount || '0').toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* EMI Cards */}
                {schedule.map((row) => (
                  <div
                    key={row.month}
                    className="group hover:border-brand-gold/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors"
                  >
                    <div className="absolute top-0 left-0 h-full w-1 bg-blue-400"></div>
                    <div className="mb-1 flex items-start justify-between">
                      <h4 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
                        EMI {row.month}
                      </h4>
                    </div>
                    <p className="mb-3 text-xs text-gray-500">{row.date}</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{' '}
                      {parseFloat(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 border-t pt-8 text-center font-sans text-xs text-gray-500">
                Disclaimer: This is a computer generated document and does not require physical
                signature. Dates are approximate and subject to realization.
              </div>
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
