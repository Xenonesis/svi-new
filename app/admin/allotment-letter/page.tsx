'use client';

import {
  DownloadOptions,
  FormField,
  FormSelect,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import { FileText, RefreshCw } from 'lucide-react';

import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { useState } from 'react';

export default function AllotmentLetterPage() {
  const { token } = useAdminSession();
  const [formData, setFormData] = useState({
    clientName: '',
    address: '',
    ticketId: '',
    projectName: 'Shyam Aangan',
    unitNumber: '',
    area: '',
    bsp: '',
    plc: '',
    paymentPlan: '12',
    bookingDate: '',
    secondPaymentDays: '15',
    advisorName: '',
    advisorNumber: '',
  });

  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const calculateTotalCost = () => {
    const area = parseFloat(formData.area) || 0;
    const bsp = parseFloat(formData.bsp) || 0;
    const plc = parseFloat(formData.plc) || 0;

    const base = area * bsp;
    const plcAmount = base * (plc / 100);
    return base + plcAmount;
  };

  const totalCost = calculateTotalCost();
  const initialPayment = totalCost * 0.1;

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
            document_type: 'allotment_letter',
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
    const element = document.getElementById('allotmentPreview');
    if (!element) return;

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;

    // Set a proper width for better text layout (A4-like proportions)
    clone.style.backgroundColor = 'white';
    clone.style.color = 'black';
    clone.style.width = '210mm'; // A4 width
    clone.style.minHeight = element.offsetHeight + 'px';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.padding = '32px'; // Match original padding
    clone.style.boxSizing = 'border-box';

    // Wait for all images in the clone to load
    const images = clone.querySelectorAll('img');
    const imagePromises = Array.from(images).map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve even on error to not block
        }
      });
    });

    document.body.appendChild(clone);

    try {
      // Wait for images to load
      await Promise.all(imagePromises);

      // Use high-quality settings for perfect capture
      const canvas = await html2canvas(clone, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000, // Increased timeout for image loading
        removeContainer: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794, // A4 width in pixels at 96 DPI (210mm)
        windowHeight: clone.scrollHeight,
      });

      // Create PDF with exact dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      // Use PNG for better quality (no JPEG compression artifacts)
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('Allotment_Letter.pdf');

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
    } finally {
      // Clean up cloned element
      document.body.removeChild(clone);
    }
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('allotmentPreview');
    if (!element) return;

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;

    // Set a proper width for better text layout (A4-like proportions)
    clone.style.backgroundColor = 'white';
    clone.style.color = 'black';
    clone.style.width = '210mm'; // A4 width
    clone.style.minHeight = element.offsetHeight + 'px';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.padding = '32px'; // Match original padding
    clone.style.boxSizing = 'border-box';

    // Wait for all images in the clone to load
    const images = clone.querySelectorAll('img');
    const imagePromises = Array.from(images).map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve even on error to not block
        }
      });
    });

    document.body.appendChild(clone);

    try {
      // Wait for images to load
      await Promise.all(imagePromises);

      // Use high-quality settings for perfect capture
      const canvas = await html2canvas(clone, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000, // Increased timeout for image loading
        removeContainer: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794, // A4 width in pixels at 96 DPI (210mm)
        windowHeight: clone.scrollHeight,
      });

      // Download as PNG with maximum quality
      const link = document.createElement('a');
      link.download = 'Allotment_Letter.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } finally {
      // Clean up cloned element
      document.body.removeChild(clone);
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

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Form Section */}
        <div className="relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
              <FileText className="text-brand-gold h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Document Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Client Name"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              <FormField
                label="Ticket ID"
                name="ticketId"
                value={formData.ticketId}
                onChange={handleChange}
                required
              />

              <FormSelect
                label="Project Name"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                options={[
                  { value: 'Shyam Aangan', label: 'Shyam Aangan' },
                  { value: 'Shyam Aangan Farm House', label: 'Shyam Aangan Farm House' },
                ]}
              />

              <FormField
                label="Unit Number"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleChange}
                required
              />
              <FormField
                label="Area (Sq. Yds.)"
                name="area"
                type="number"
                value={formData.area}
                onChange={handleChange}
                required
              />
              <FormField
                label="BSP (Per Sq.Yd)"
                name="bsp"
                type="number"
                value={formData.bsp}
                onChange={handleChange}
                required
              />
              <FormField
                label="PLC (%)"
                name="plc"
                type="number"
                value={formData.plc}
                onChange={handleChange}
              />

              <FormSelect
                label="Payment Plan"
                name="paymentPlan"
                value={formData.paymentPlan}
                onChange={handleChange}
                options={[
                  { value: '3', label: '3 Months' },
                  { value: '6', label: '6 Months' },
                  { value: '12', label: '12 Months' },
                  { value: '18', label: '18 Months' },
                  { value: '24', label: '24 Months' },
                ]}
              />

              <FormField
                label="Booking Date"
                name="bookingDate"
                type="date"
                value={formData.bookingDate}
                onChange={handleChange}
                required
              />

              <FormSelect
                label="Second Payment Days"
                name="secondPaymentDays"
                value={formData.secondPaymentDays}
                onChange={handleChange}
                options={[
                  { value: '15', label: '15 days' },
                  { value: '28', label: '28 days' },
                ]}
              />

              <FormField
                label="Advisor Name"
                name="advisorName"
                value={formData.advisorName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Advisor Number"
                name="advisorNumber"
                value={formData.advisorNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="bg-brand-navy/5 dark:bg-brand-gold/5 border-brand-navy/10 dark:border-brand-gold/10 mt-6 flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                  Total Cost
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹
                  {totalCost.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                  Initial Payment (10%)
                </p>
                <p className="text-brand-gold text-lg font-bold">
                  ₹
                  {initialPayment.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Generate Letter
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/8 dark:bg-[#0e0e14]">
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
            <div className="relative bg-white p-8 font-sans text-[13px] leading-relaxed text-black">
              {/* Watermark */}
              <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-5">
                <img
                  src="/logo.png"
                  alt="Watermark"
                  className="w-[80%] max-w-3xl object-contain grayscale"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between border-b-2 border-[#1e3a8a] pb-4">
                  <div>
                    <h1 className="mb-2 text-2xl font-bold tracking-wide text-[#1e3a8a] uppercase">
                      SVI INFRA SOLUTIONS PVT. LTD
                    </h1>
                    <p className="text-gray-700">
                      Cell: +91 9216014579 | Email: info@sviinfrasolutions.com
                    </p>
                    <p className="text-gray-700">
                      Website: www.sviinfrasolutions.in | www.sviinfrasolutions.com
                    </p>
                    <p className="text-gray-700">
                      Office Address : A-61 Sector 65 Noida Uttar Pradesh 201309
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

                {/* Date & To */}
                <div className="mb-6">
                  <p className="mb-4 font-bold">
                    Dated:{' '}
                    {formData.bookingDate
                      ? formData.bookingDate.split('-').reverse().join('-')
                      : new Date().toISOString().split('T')[0].split('-').reverse().join('-')}
                  </p>
                  <p className="font-bold">To,</p>
                  <p className="font-bold">{formData.clientName || '[Client Name]'}</p>
                  <p className="font-bold whitespace-pre-wrap">{formData.address || '[Address]'}</p>
                </div>

                {/* Body */}
                <div className="mb-6">
                  <p className="mb-2">
                    Dear Mr./Mrs./Ms.{' '}
                    <span className="font-bold">{formData.clientName || '[Client Name]'}</span>
                  </p>
                  <p className="mb-1 text-justify">
                    Congratulations from Svi Infra Solutions Pvt. Ltd. on your new investment in{' '}
                    {formData.projectName} (Kishan Garh Renwal, Jaipur, Rajasthan). It is a perfect
                    choice and you are one of the few lucky ones to get unit at such reasonable
                    rates.
                  </p>
                  <p className="mb-4 text-justify">
                    We at Svi Infra Solutions Pvt. Ltd. feel privileged to be part of your great
                    investment. We thank you for giving us an opportunity to assist you in making
                    this very investment. We sincerely hope that you are satisfied with our services
                    and will refer us in your circle.
                  </p>

                  <p className="mb-2 font-bold">Your Allotment is as Follows:</p>
                  <p>
                    Ticket Id : <span className="font-bold">{formData.ticketId}</span>
                  </p>
                  <p>
                    Project Name : <span className="font-bold">{formData.projectName}</span>
                  </p>
                  <p>
                    Unit Number : <span className="font-bold">{formData.unitNumber}</span>
                  </p>

                  <p className="mt-4 mb-2">
                    Brief details about the total cost of the unit and payment plan are as follows:
                  </p>
                </div>

                {/* Details Table */}
                <div className="mb-6 overflow-hidden border border-gray-400">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#00b0f0] text-xs text-black">
                        <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                          Client Name
                        </th>
                        <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                          Allotted Unit
                        </th>
                        <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                          Area (Sq. Yds.)
                        </th>
                        <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                          Payment Plan
                        </th>
                        <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                          BSP (PSq.Yd)
                        </th>
                        <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                          PLC (in %)
                        </th>
                        <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                          Total Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      <tr>
                        <td className="border border-gray-400 p-2 font-bold">
                          {formData.clientName}
                        </td>
                        <td className="border border-gray-400 p-2 font-bold">
                          {formData.unitNumber}
                        </td>
                        <td className="border border-gray-400 p-2 font-bold">{formData.area}</td>
                        <td className="border border-gray-400 p-2 font-bold">
                          {formData.paymentPlan} Months
                        </td>
                        <td className="border border-gray-400 p-2 font-bold">{formData.bsp}</td>
                        <td className="border border-gray-400 p-2 font-bold">
                          {formData.plc || '0'}
                        </td>
                        <td className="border border-gray-400 p-2 font-bold">
                          {totalCost.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Payment Schedule Table */}
                <h3 className="mb-2 text-lg font-bold text-gray-800">Payment Schedule</h3>
                <div className="mb-6 overflow-hidden border border-gray-400">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#00b0f0] text-xs text-black">
                        <th className="border border-gray-400 p-2 font-bold">SNO</th>
                        <th className="border border-gray-400 p-2 font-bold">Date</th>
                        <th className="border border-gray-400 p-2 font-bold">Particulars</th>
                        <th className="border border-gray-400 p-2 font-bold">%</th>
                        <th className="border border-gray-400 p-2 font-bold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {/* Booking (10%) */}
                      <tr>
                        <td className="border border-gray-400 p-2 font-bold">1</td>
                        <td className="border border-gray-400 p-2 font-bold">
                          {formData.bookingDate
                            ? formData.bookingDate.split('-').reverse().join('-')
                            : '-'}
                        </td>
                        <td className="border border-gray-400 p-2 font-bold">On Booking</td>
                        <td className="border border-gray-400 p-2">10%</td>
                        <td className="border border-gray-400 p-2 font-bold">
                          Rs. {initialPayment.toFixed(2)}
                        </td>
                      </tr>
                      {/* Second Payment (20%) */}
                      <tr>
                        <td className="border border-gray-400 p-2 font-bold">2</td>
                        <td className="border border-gray-400 p-2 font-bold">
                          {(() => {
                            if (!formData.bookingDate) return '-';
                            const d = new Date(formData.bookingDate);
                            d.setDate(d.getDate() + parseInt(formData.secondPaymentDays || '15'));
                            return d.toISOString().split('T')[0].split('-').reverse().join('-');
                          })()}
                        </td>
                        <td className="border border-gray-400 p-2 font-bold">
                          {formData.secondPaymentDays} days
                        </td>
                        <td className="border border-gray-400 p-2">20%</td>
                        <td className="border border-gray-400 p-2 font-bold">
                          Rs. {(totalCost * 0.2).toFixed(2)}
                        </td>
                      </tr>
                      {/* EMIs */}
                      {(() => {
                        const remainingCost = totalCost * 0.7;
                        const months = parseInt(formData.paymentPlan || '12');
                        const emiAmount = remainingCost / months;
                        const emiPercent = 70 / months;

                        return Array.from({ length: months }).map((_, i) => {
                          let emiDate = '-';
                          if (formData.bookingDate) {
                            const d = new Date(formData.bookingDate);
                            d.setMonth(d.getMonth() + i + 2);
                            emiDate = d.toISOString().split('T')[0].split('-').reverse().join('-');
                          }

                          return (
                            <tr key={i}>
                              <td className="border border-gray-400 p-2 font-bold">{i + 3}</td>
                              <td className="border border-gray-400 p-2 font-bold">{emiDate}</td>
                              <td className="border border-gray-400 p-2 font-bold">{i + 1} EMI</td>
                              <td className="border border-gray-400 p-2">
                                {emiPercent.toFixed(1)}%
                              </td>
                              <td className="border border-gray-400 p-2 font-bold">
                                Rs. {emiAmount.toFixed(2)}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Terms Box */}
                <div className="mb-8 rounded-lg border-l-4 border-[#00b0f0] bg-[#f0f8ff] p-4 text-xs text-gray-800 italic">
                  <p className="mb-2">
                    Please transfer the initial amount of 10% (Rs. {initialPayment.toFixed(2)}) by{' '}
                    {formData.bookingDate
                      ? formData.bookingDate.split('-').reverse().join('-')
                      : '[Date]'}{' '}
                    to confirm allotment under {formData.projectName}, and the second instalment of
                    20% (Rs. {(totalCost * 0.2).toFixed(2)}) by{' '}
                    {(() => {
                      if (!formData.bookingDate) return '[Date]';
                      const d = new Date(formData.bookingDate);
                      d.setDate(d.getDate() + parseInt(formData.secondPaymentDays || '15'));
                      return d.toISOString().split('T')[0].split('-').reverse().join('-');
                    })()}
                    .
                  </p>
                  <p className="mb-2">
                    The remaining 70% will be paid as per the selected payment plan and is scheduled
                    to complete accordingly.
                  </p>
                  <p className="mb-2">
                    Note: Allotment under {formData.projectName} will only be confirmed upon receipt
                    of the initial 10% (Rs. {initialPayment.toFixed(2)}) by{' '}
                    {formData.bookingDate
                      ? formData.bookingDate.split('-').reverse().join('-')
                      : '[Date]'}
                    .
                  </p>
                  <p>
                    In the event you fail to make the payments as per the payment plan chosen by
                    you, the allotment of these plots will be automatically cancelled.
                  </p>
                </div>

                {/* Footer details */}
                <div className="flex items-end justify-between pb-8">
                  <div>
                    <p className="mb-2 font-bold">
                      Payment can be transferred online using the following details:
                    </p>
                    <p>
                      <span className="font-bold">Account Name:</span> Svi Infra Solutions Pvt. Ltd
                    </p>
                    <p>
                      <span className="font-bold">Account Number:</span> 0894102000013837
                    </p>
                    <p>
                      <span className="font-bold">Bank:</span> IDBI BANK
                    </p>
                    <p>
                      <span className="font-bold">IFSC CODE:</span> IBKL0000894
                    </p>
                    <p className="mt-4">
                      Your account manager is{' '}
                      <span className="font-bold">{formData.advisorName}</span> and will be
                      reachable on <span className="font-bold">{formData.advisorNumber}</span> for
                      any queries.
                    </p>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <img
                      src="/signature.png"
                      alt="Signature"
                      className="w-56 object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                </div>
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
