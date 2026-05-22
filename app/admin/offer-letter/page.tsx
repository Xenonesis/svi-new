'use client';

import {
  DownloadOptions,
  FormField,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import { FileSignature, RefreshCw } from 'lucide-react';

import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';

export default function OfferLetterPage() {
  const { token } = useAdminSession();
  const [companyInfo, setCompanyInfo] = useState({
    company_name: 'SVI Infra Solutions Pvt. Ltd.',
    company_address: 'A-61 Sector 65 Noida Uttar Pradesh 201309',
    company_email: 'info@sviinfrasolutions.com',
    company_phone: '+91 9216014579',
    company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
  });

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
  }, [token]);

  const [formData, setFormData] = useState({
    date: '',
    name: '',
    address: '',
    mobileNo: '',
    alternativeNo: '',
    emailId: '',
    designation: '',
    department: '',
    reportingTo: '',
    appointmentDate: '',
    location: '',
    salaryCtc: '',
    target: '',
    offerSlab: '',
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
            document_type: 'offer_letter',
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
    const element = document.getElementById('offerPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Offer_Letter.pdf');

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
    const element = document.getElementById('offerPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'Offer_Letter.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Offer <span className="text-brand-gold italic">Letter</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download official job offer letters for new employees.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
              <FileSignature className="text-brand-gold h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Candidate Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <FormField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <FormField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />
              <FormField
                label="Mobile No"
                name="mobileNo"
                type="tel"
                value={formData.mobileNo}
                onChange={handleChange}
                required
              />
              <FormField
                label="Alternative No"
                name="alternativeNo"
                type="tel"
                value={formData.alternativeNo}
                onChange={handleChange}
              />
              <FormField
                label="Email ID"
                name="emailId"
                type="email"
                value={formData.emailId}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />
              <FormField
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
              <FormField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
              <FormField
                label="Reporting To"
                name="reportingTo"
                value={formData.reportingTo}
                onChange={handleChange}
                required
              />
              <FormField
                label="Appointment Date"
                name="appointmentDate"
                type="date"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
              />
              <FormField
                label="Location of Posting"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
              <FormField
                label="Salary (CTC) Per Month"
                name="salaryCtc"
                type="number"
                value={formData.salaryCtc}
                onChange={handleChange}
                required
              />
              <FormField
                label="Target"
                name="target"
                value={formData.target}
                onChange={handleChange}
                required
              />
              <FormField
                label="Offer Slab Per Month"
                name="offerSlab"
                value={formData.offerSlab}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Generate Offer Letter
            </button>
          </form>
        </div>

        <div className="relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/8 dark:bg-[#0e0e14]">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h2>
            {preview && (
              <button
                onClick={() => {
                  const previewElement = document.getElementById('offerPreview');
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

          <PreviewContainer previewId="offerPreview" hasPreview={preview}>
            <div className="bg-white p-8 font-sans text-[13px] leading-relaxed text-black">
              {/* Header */}
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <h1 className="mb-2 text-2xl font-bold tracking-wide text-[#1e3a8a] uppercase">
                    {companyInfo.company_name}
                  </h1>
                  <p className="text-gray-700">
                    Cell: {companyInfo.company_phone} | Email: {companyInfo.company_email}
                  </p>
                  <p className="text-gray-700">Website: {companyInfo.company_website}</p>
                  <p className="text-gray-700">Office Address : {companyInfo.company_address}</p>
                </div>
                <div className="w-48">
                  <img
                    src="/logo.png"
                    alt={companyInfo.company_name}
                    className="h-auto w-full object-contain"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              </div>

              {/* Date & To */}
              <div className="mb-6">
                <p className="mb-4 font-bold">
                  Date:{' '}
                  {formData.date ||
                    new Date().toISOString().split('T')[0].split('-').reverse().join('-')}
                </p>
                <p className="font-bold">To,</p>
                <p className="font-bold">{formData.name || '[Candidate Name]'}</p>
                <p className="font-bold whitespace-pre-wrap">{formData.address || '[Address]'}</p>
              </div>

              {/* Subject */}
              <div className="mb-6 text-center">
                <h3 className="font-bold uppercase underline">
                  Subject: Offer Letter - {formData.designation || '[Designation]'}
                </h3>
              </div>

              {/* Body */}
              <div className="mb-16 space-y-4 text-justify">
                <p>
                  Dear <span className="font-bold">{formData.name || '[Candidate Name]'}</span>,
                </p>
                <p>
                  We are pleased to offer you the position of{' '}
                  <span className="font-bold">{formData.designation || '[Designation]'}</span> in
                  the
                  <span className="font-bold"> {formData.department || '[Department]'}</span>{' '}
                  department at {companyInfo.company_name}. You will report to{' '}
                  <span className="font-bold">{formData.reportingTo || '[Reporting To]'}</span> and
                  be based at
                  <span className="font-bold"> {formData.location || '[Location]'}</span>.
                </p>
                <p>
                  Your appointment date is{' '}
                  <span className="font-bold">{formData.appointmentDate || '[Date]'}</span>. The
                  monthly CTC offered is
                  <span className="font-bold">
                    {' '}
                    ₹
                    {parseFloat(formData.salaryCtc || '0').toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>{' '}
                  with a target of
                  <span className="font-bold"> {formData.target || '[Target]'}</span> and offer slab
                  per month of
                  <span className="font-bold"> {formData.offerSlab || '[Offer Slab]'}</span>.
                </p>
                <p>
                  Please confirm your acceptance of this offer by signing and returning a copy of
                  this letter. We look forward to welcoming you to the team.
                </p>
              </div>

              {/* Footer / Signatures */}
              <div className="mt-12 flex items-end justify-between">
                <div>
                  <p className="mb-2">
                    For <span className="font-bold text-[#1e3a8a]">{companyInfo.company_name}</span>
                  </p>
                  <img
                    src="/images/signature.png"
                    alt="Signature"
                    className="mb-2 h-12 w-auto opacity-80 mix-blend-multiply"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  <p className="font-bold">Ilyas Ali</p>
                  <p className="text-gray-600">(Director)</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto w-48 border-t border-black pt-2">
                    <p className="font-bold">Candidate Signature</p>
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
