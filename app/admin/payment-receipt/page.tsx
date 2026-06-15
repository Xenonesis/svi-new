'use client';

import {
  DownloadOptions,
  FormField,
  FormSelect,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { useAuthStore } from '@/src/stores/authStore';
import { Receipt, RefreshCw, Trash2, Eye, Download, Search } from 'lucide-react';

import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { useEffect, useState } from 'react';

export default function PaymentReceiptPage() {
  const { token } = useAuthStore();
  const [formData, setFormData] = useState({
    receiptNo: '',
    date: '',
    salutation: 'Mr.', // Default salutation
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const [companyInfo, setCompanyInfo] = useState({
    company_name: 'SVI INFRA SOLUTIONS PVT. LTD',
    company_address: 'A-61 Sector 65 Noida Uttar Pradesh 201309',
    company_email: 'info@sviinfrasolutions.com',
    company_phone: '+91 9216014579',
    company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
  });

  const fetchReceipts = () => {
    if (!token) return;
    fetch('/api/admin/documents?type=payment_receipt&limit=1000', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch documents');
        return res.json();
      })
      .then((json) => {
        if (json.documents) {
          setReceipts(json.documents);
          const nextReceiptNo = (2056 + json.documents.length).toString();
          setFormData((prev) => ({ ...prev, receiptNo: nextReceiptNo }));
        }
      })
      .catch((err) => console.error('Error fetching receipts:', err));
  };

  const loadFromRecord = (id: string) => {
    const record = receipts.find((r: any) => r.id === id);
    if (record?.form_data) {
      const fd = record.form_data;
      setFormData({
        receiptNo: fd.receiptNo || '',
        date: fd.date || '',
        salutation: fd.salutation || 'Mr.',
        name: fd.name || '',
        refId: fd.refId || '',
        amount: fd.amount || '',
        amountWords: fd.amountWords || '',
        paymentRef: fd.paymentRef || '',
        drawnOn: fd.drawnOn || '',
        plotNo: fd.plotNo || '',
        plotSize: fd.plotSize || '',
        account: fd.account || '',
        paymentMethod: fd.paymentMethod || 'UPI',
      });
    }
  };

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
        if (json.value) {
          setCompanyInfo(json.value);
        }
      })
      .catch((err) => console.error('Error fetching company info:', err));

    fetchReceipts();
  }, [token]);

  // Handle templateId from URL (e.g. from Receipt Records "Use as Template")
  useEffect(() => {
    if (receipts.length > 0 && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const templateId = searchParams.get('templateId');
      if (templateId) {
        loadFromRecord(templateId);
      }
    }
  }, [receipts]);

  // Function to convert number to words (Indian numbering system)
  const numberToWords = (num: string): string => {
    if (!num || num === '0') return '';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = [
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];
    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];

    const convertLessThanOneThousand = (n: number): string => {
      let result = '';

      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred';
        n %= 100;
        if (n > 0) result += ' ';
      }

      if (n >= 20) {
        result += tens[Math.floor(n / 10)];
        n %= 10;
        if (n > 0) result += ' ';
      }

      if (n >= 10 && n < 20) {
        result += teens[n - 10];
        n = 0;
      }

      if (n > 0 && n < 10) {
        result += ones[n];
      }

      return result;
    };

    const numValue = parseFloat(num);
    let integerPart = Math.floor(numValue);
    const decimalPart = Math.round((numValue - integerPart) * 100);

    let words = '';

    if (integerPart === 0) {
      words = 'Zero';
    } else {
      // Crores
      if (integerPart >= 10000000) {
        words += convertLessThanOneThousand(Math.floor(integerPart / 10000000)) + ' Crore';
        integerPart %= 10000000;
        if (integerPart > 0) words += ' ';
      }

      // Lakhs
      if (integerPart >= 100000) {
        words += convertLessThanOneThousand(Math.floor(integerPart / 100000)) + ' Lakh';
        integerPart %= 100000;
        if (integerPart > 0) words += ' ';
      }

      // Thousands
      if (integerPart >= 1000) {
        words += convertLessThanOneThousand(Math.floor(integerPart / 1000)) + ' Thousand';
        integerPart %= 1000;
        if (integerPart > 0) words += ' ';
      }

      // Hundreds and below
      if (integerPart > 0) {
        words += convertLessThanOneThousand(integerPart);
      }
    }

    words += ' Rupees';

    // Add paise if decimal part exists
    if (decimalPart > 0) {
      words += ' and ' + convertLessThanOneThousand(decimalPart) + ' Paise';
    }

    words += ' Only';

    return words;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Auto-convert amount to words when amount field changes
    if (name === 'amount' && value) {
      const words = numberToWords(value);
      setFormData((prev) => ({ ...prev, amountWords: words }));

      // Reset terms acceptance if amount changes from 2100
      if (parseFloat(value) !== 2100) {
        setTermsAccepted(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate terms acceptance for ₹2100 amount
    if (parseFloat(formData.amount) === 2100 && !termsAccepted) {
      alert('Please accept the terms and conditions for the refundable amount of ₹2100');
      return;
    }

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
          fetchReceipts();
        }
      } catch (error) {
        console.error('Failed to save document:', error);
      }
    }

    setPreview(true);
  };

  const handleDownloadPDF = async () => {
    try {
      const clientName = formData.name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
      const receiptNo = formData.receiptNo.trim().replace(/[^a-zA-Z0-9]/g, '');
      const filename =
        clientName && receiptNo
          ? `${clientName} ${receiptNo}.pdf`
          : clientName
            ? `${clientName}.pdf`
            : 'Receipt.pdf';

      await exportToPDF({
        elementId: 'receiptPreview',
        filename,
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
          fetchReceipts();
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
      const clientName = formData.name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
      const receiptNo = formData.receiptNo.trim().replace(/[^a-zA-Z0-9]/g, '');
      const filename =
        clientName && receiptNo
          ? `${clientName} ${receiptNo}.png`
          : clientName
            ? `${clientName}.png`
            : 'Receipt.png';

      await exportToImage({
        elementId: 'receiptPreview',
        filename,
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
            Payment <span className="text-brand-gold italic">Receipt</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate official payment receipts for client transactions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Form Section */}
        <div className="dark:bg-brand-dark-surface/65 relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
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
                disabled
              />
              <FormField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <FormSelect
                label="Salutation"
                name="salutation"
                value={formData.salutation}
                onChange={handleChange}
                options={[
                  { value: 'Mr.', label: 'Mr.' },
                  { value: 'Mrs.', label: 'Mrs.' },
                  { value: 'Ms.', label: 'Ms.' },
                  { value: 'M/s', label: 'M/s' },
                ]}
              />
              <FormField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
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
                step="0.01"
                min="0"
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

              {/* Terms and Conditions Checkbox - Only show for ₹2100 */}
              {parseFloat(formData.amount) === 2100 && (
                <div className="border-brand-gold/30 bg-brand-gold/5 rounded-lg border-2 p-4 md:col-span-2">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="text-brand-gold focus:ring-brand-gold mt-1 h-5 w-5 cursor-pointer rounded border-gray-300"
                      required
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      <strong className="text-brand-navy dark:text-white">
                        Terms & Conditions:
                      </strong>{' '}
                      This is a refundable amount of ₹2100. If your name is not selected in the
                      draw, the amount will be automatically refunded within the next 48 hours.
                    </span>
                  </label>
                </div>
              )}
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
                  <p className="text-[13px] text-gray-700">
                    Website: {companyInfo.company_website}
                  </p>
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
                      {formData.drawnOn
                        ? new Date(formData.drawnOn).toLocaleDateString('en-GB')
                        : ''}
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
                      This is a refundable amount of ₹2100. If your name is not selected in the
                      draw, the amount will be automatically refunded within the next 48 hours.
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
                    <p className="text-sm font-bold text-[#1e3a8a]">
                      For {companyInfo.company_name}
                    </p>
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
      </div>
    </div>
  );
}
