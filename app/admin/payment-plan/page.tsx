'use client';

import {
  DownloadOptions,
  FormField,
  FormSelect,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';

import { Calculator } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';

export default function PaymentPlanPage() {
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
  const [schedule, setSchedule] = useState<Array<{ month: number; date: string; amount: string }>>(
    []
  );
  const [totals, setTotals] = useState({ totalCost: 0, balance: 0, emiAmount: 0 });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculatePlan = (e: React.FormEvent) => {
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
    setPreview(true);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('planPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Payment_Plan.pdf');
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('planPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'Payment_Plan.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
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

          <h2 className="mb-4 border-b border-gray-100 pb-4 text-lg font-bold text-gray-900 dark:border-white/10 dark:text-white">
            Live Preview
          </h2>

          <PreviewContainer previewId="planPreview" hasPreview={preview}>
            <div className="border-brand-gold mb-6 border-b-2 pb-6 text-center">
              <h1 className="text-brand-navy font-serif text-2xl font-bold">Payment Plan</h1>
              <p className="mt-2 font-sans font-semibold text-gray-600">{formData.propertyType}</p>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4 font-sans text-sm font-medium">
              <div>
                <span className="text-gray-500">Unit Number:</span> {formData.unitNo}
              </div>
              <div>
                <span className="text-gray-500">Plot Size:</span> {formData.plotSize} Sq. Yds.
              </div>
              <div>
                <span className="text-gray-500">Cost/Sq.Yd:</span> ₹ {formData.costPerSqYd}
              </div>
              <div>
                <span className="text-gray-500">Total Cost:</span> ₹{' '}
                {totals.totalCost.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div>
                <span className="text-gray-500">Booking Amount:</span> ₹{' '}
                {parseFloat(formData.bookingAmount || '0').toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div>
                <span className="text-gray-500">Balance Amount:</span> ₹{' '}
                {totals.balance.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            <table className="w-full border-collapse border border-gray-300 text-left font-sans text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 font-semibold">Month</th>
                  <th className="border border-gray-300 p-2 font-semibold">Expected Date</th>
                  <th className="border border-gray-300 p-2 font-semibold">Details</th>
                  <th className="border border-gray-300 p-2 font-semibold">Expected Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-green-50 font-semibold">
                  <td className="border border-gray-300 p-2 text-center">0</td>
                  <td className="border border-gray-300 p-2">
                    {new Date(formData.startDate).toLocaleDateString('en-GB')}
                  </td>
                  <td className="border border-gray-300 p-2">Booking Amount</td>
                  <td className="border border-gray-300 p-2 underline">
                    {parseFloat(formData.bookingAmount || '0').toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                {schedule.map((row) => (
                  <tr key={row.month}>
                    <td className="border border-gray-300 p-2 text-center">{row.month}</td>
                    <td className="border border-gray-300 p-2">{row.date}</td>
                    <td className="border border-gray-300 p-2 text-gray-600">EMI {row.month}</td>
                    <td className="border border-gray-300 p-2">
                      {parseFloat(row.amount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-gray-300 p-2 text-right" colSpan={3}>
                    Grand Total
                  </td>
                  <td className="border border-gray-300 p-2 text-red-600 underline">
                    ₹{' '}
                    {totals.totalCost.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-12 border-t pt-8 text-center font-sans text-xs text-gray-500">
              Disclaimer: This is a computer generated document and does not require physical
              signature. Dates are approximate and subject to realization.
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
