'use client';

import { useAuthStore } from '@/src/stores/authStore';

import PaymentReceiptForm from './components/PaymentReceiptForm';
import PaymentReceiptPreview from './components/PaymentReceiptPreview';

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
    company_address: 'Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309',
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

  // Handle prefillRegistration from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const prefillRegistration = searchParams.get('prefillRegistration');
      if (prefillRegistration === 'true') {
        const storedReg = sessionStorage.getItem('receiptPrefillRegistration');
        if (storedReg) {
          try {
            const regData = JSON.parse(storedReg);

            let proj = regData.project || regData.property_interest;
            if (proj) {
              const projectMap: Record<string, string> = {
                'shyam-aangan': 'Shyam Aangan',
                'shyam-aangan-phase-1': 'Shyam Aangan Phase 1',
                'shyam-aangan-farm-house': 'Shyam Aangan Farm House',
                'shivani-vatika': 'Shivani Vatika',
                'phulera-smartcity': 'Phulera SmartCity',
              };
              proj = projectMap[proj.toLowerCase().trim()] || proj;
            }

            setFormData((prev) => ({
              ...prev,
              name: `${regData.name || ''} ${regData.last_name || ''}`.trim(),
              account: proj || prev.account,
              amount: regData.scheme_amount || prev.amount,
              refId: regData.submission_id || prev.refId,
            }));

            sessionStorage.removeItem('receiptPrefillRegistration');
          } catch (e) {
            console.error('Failed to parse prefill registration', e);
          }
        }
      }
    }
  }, []);

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
        <PaymentReceiptForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
        />

        {/* Preview Section */}
        <PaymentReceiptPreview
          formData={formData}
          companyInfo={companyInfo}
          preview={preview}
          setPreview={setPreview}
          handleDownloadPDF={handleDownloadPDF}
          handleDownloadImage={handleDownloadImage}
        />
      </div>
    </div>
  );
}
