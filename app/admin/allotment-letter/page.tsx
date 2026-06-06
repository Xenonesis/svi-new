'use client';

import {
  DownloadOptions,
  FormField,
  FormSelect,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import { FileText, RefreshCw } from 'lucide-react';

import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase/client';

export default function AllotmentLetterPage() {
  const { token } = useAdminSession();

  interface Advisor {
    full_name: string;
    phone: string | null;
    email: string | null;
  }

  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isCustomAdvisor, setIsCustomAdvisor] = useState(false);
  const [projects, setProjects] = useState<{ value: string; label: string }[]>([
    { value: 'Shyam Aangan', label: 'Shyam Aangan' },
    { value: 'Shyam Aangan Farm House', label: 'Shyam Aangan Farm House' },
  ]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('name')
          .eq('active', true)
          .order('name', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setProjects(
            data.map((p) => ({
              value: p.name,
              label: p.name,
            }))
          );
        }
      } catch (err) {
        console.error('Error loading projects:', err);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    if (!token) return;

    async function loadAdvisors() {
      try {
        // 1. Fetch active_advisors setting from our authenticated admin API
        const settingsRes = await fetch('/api/admin/settings?key=active_advisors', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!settingsRes.ok) throw new Error('Failed to fetch advisor settings');
        const settingsJson = await settingsRes.json();

        let advisorIds: string[] = [];
        if (settingsJson?.value?.ids && Array.isArray(settingsJson.value.ids)) {
          advisorIds = settingsJson.value.ids;
        }

        // 2. Fetch all profiles using our authenticated admin API (to bypass RLS)
        const usersRes = await fetch('/api/admin/users?limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!usersRes.ok) throw new Error('Failed to fetch profiles');
        const usersJson = await usersRes.json();
        const allProfiles: any[] = usersJson.users || [];

        // 3. Filter profiles by active advisor IDs
        const filteredProfiles = allProfiles.filter((p) => advisorIds.includes(p.id));

        setAdvisors(
          filteredProfiles.map((p) => ({
            full_name: p.full_name || '',
            phone: p.phone || '',
            email: p.email || '',
          }))
        );
      } catch (err) {
        console.error('Error loading advisors:', err);
      }
    }
    loadAdvisors();
  }, [token]);

  const handleAdvisorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    if (name === 'custom') {
      setIsCustomAdvisor(true);
      setFormData((prev) => ({
        ...prev,
        advisorName: '',
        advisorNumber: '',
        advisorEmail: '',
      }));
    } else {
      setIsCustomAdvisor(false);
      const selected = advisors.find((adv) => adv.full_name === name);
      setFormData((prev) => ({
        ...prev,
        advisorName: name,
        advisorNumber: selected?.phone || '',
        advisorEmail: selected?.email || '',
      }));
    }
  };

  const [companyInfo, setCompanyInfo] = useState({
    company_name: 'SVI Infra Solutions Pvt. Ltd.',
    company_address: 'A-61 Sector 65 Noida Uttar Pradesh 201309',
    company_email: 'info@sviinfrasolutions.com',
    company_phone: '+91 9216014579',
    company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
    bank_account_name: 'Svi Infra Solutions Pvt. Ltd',
    bank_account_no: '0894102000013837',
    bank_name: 'IDBI BANK',
    bank_ifsc: 'IBKL0000894',
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
    clientName: '',
    salutation: 'Mr.', // Default salutation
    address: '',
    ticketId: '',
    projectName: 'Shyam Aangan',
    unitNumber: '',
    area: '',
    bsp: '',
    plc: '',
    edc: '',
    paymentPlan: '12',
    bookingDate: '',
    secondPaymentDays: '15',
    advisorName: '',
    advisorNumber: '',
    advisorEmail: '',
    // EMI Customization fields
    emiCount: '12',
    emiPercentage: '',
    emiStartDate: '',
    zeroPercentEmi: 'false',
    // Payment customization
    bookingPaymentPercent: '10',
    showSecondInstalment: 'true',
  });

  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const calculateTotalCost = () => {
    const area = parseFloat(formData.area) || 0;
    const bsp = parseFloat(formData.bsp) || 0;
    const plc = parseFloat(formData.plc) || 0;
    const edc = parseFloat(formData.edc) || 0;

    const base = area * bsp;
    const plcAmount = base * (plc / 100);
    return base + plcAmount + edc;
  };

  // Safely parse YYYY-MM-DD → Date object using local timezone components
  const parseDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // Format a date to DD-MM-YYYY without timezone shifts
  const formatDate = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const totalCost = calculateTotalCost();
  const bookingPercent = parseFloat(formData.bookingPaymentPercent) || 10;
  const initialPayment = totalCost * (bookingPercent / 100);
  const secondPercent = 20;
  const secondPayment = totalCost * (secondPercent / 100);
  const showSecondInstalment = formData.showSecondInstalment === 'true';
  const zeroCost = formData.zeroPercentEmi === 'true';
  const remainingPercentInTerms = zeroCost
    ? 0
    : showSecondInstalment
      ? 100 - bookingPercent - secondPercent
      : 100 - bookingPercent;

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
    try {
      await exportToPDF({
        elementId: 'allotmentPreview',
        filename: 'Allotment_Letter.pdf',
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
              <FormSelect
                label="Salutation"
                name="salutation"
                value={formData.salutation}
                onChange={handleChange}
                options={[
                  { value: 'Mr.', label: 'Mr.' },
                  { value: 'Mrs.', label: 'Mrs.' },
                  { value: 'Ms.', label: 'Ms.' },
                  { value: 'Dr.', label: 'Dr.' },
                ]}
              />
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
                options={projects}
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

              <FormField
                label="EDC (₹)"
                name="edc"
                type="number"
                value={formData.edc}
                onChange={handleChange}
                placeholder="0"
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

              {isCustomAdvisor ? (
                <div className="relative">
                  <FormField
                    label="Advisor Name"
                    name="advisorName"
                    value={formData.advisorName}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomAdvisor(false)}
                    className="text-brand-gold absolute top-0 right-0 text-[10px] font-bold tracking-wider uppercase hover:underline"
                  >
                    Use Dropdown
                  </button>
                </div>
              ) : (
                <FormSelect
                  label="Advisor Name"
                  name="advisorName"
                  value={formData.advisorName}
                  onChange={handleAdvisorChange}
                  options={[
                    { value: '', label: 'Select Advisor' },
                    ...advisors.map((adv) => ({ value: adv.full_name, label: adv.full_name })),
                    { value: 'custom', label: 'Other / Custom...' },
                  ]}
                />
              )}

              {!isCustomAdvisor && advisors.length === 0 && (
                <div className="border-brand-gold/25 bg-brand-gold/5 animate-in fade-in slide-in-from-top-2 col-span-2 overflow-hidden rounded-xl border p-4.5 backdrop-blur-md transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="bg-brand-gold/15 text-brand-gold flex h-5 w-5 shrink-0 items-center justify-center rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-brand-gold text-[10px] font-bold tracking-widest uppercase">
                        Admin Advisory Tip
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                        The advisor list is currently empty. To populate this list dynamically,
                        navigate to the{' '}
                        <Link
                          href="/admin/registrations"
                          className="text-brand-gold hover:text-brand-gold-light font-bold underline transition-colors"
                        >
                          Registrations Config Page
                        </Link>{' '}
                        and click{' '}
                        <strong className="text-gray-800 dark:text-gray-200">
                          Manage Advisors
                        </strong>{' '}
                        to check dynamic active accounts. Alternatively, select{' '}
                        <strong className="text-gray-800 dark:text-gray-200">
                          Other / Custom...
                        </strong>{' '}
                        above to input details manually.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <FormField
                label="Advisor Number"
                name="advisorNumber"
                value={formData.advisorNumber}
                onChange={handleChange}
                required
                disabled={!isCustomAdvisor}
              />
              <FormField
                label="Advisor Email"
                name="advisorEmail"
                type="email"
                value={formData.advisorEmail}
                onChange={handleChange}
                required
                disabled={!isCustomAdvisor}
              />
            </div>

            {/* EMI Customization Section */}
            <div className="mt-6 border-t border-gray-200 pt-6 dark:border-white/10">
              <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                EMI Customization
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormSelect
                  label="EMI Count"
                  name="emiCount"
                  value={formData.emiCount}
                  onChange={handleChange}
                  options={[
                    { value: '6', label: '6 EMIs' },
                    { value: '12', label: '12 EMIs' },
                    { value: '18', label: '18 EMIs' },
                    { value: '24', label: '24 EMIs' },
                    { value: '36', label: '36 EMIs' },
                    { value: 'custom', label: 'Custom...' },
                  ]}
                />
                <FormField
                  label="EMI Percentage per Installment"
                  name="emiPercentage"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.emiPercentage}
                  onChange={handleChange}
                  disabled={formData.zeroPercentEmi === 'true'}
                />
                <FormField
                  label="EMI Start Date"
                  name="emiStartDate"
                  type="date"
                  value={formData.emiStartDate}
                  onChange={handleChange}
                />
              </div>
              <div className="mt-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 transition-all hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20">
                  <input
                    type="checkbox"
                    name="zeroPercentEmi"
                    checked={formData.zeroPercentEmi === 'true'}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        zeroPercentEmi: e.target.checked ? 'true' : 'false',
                        // Clear emiPercentage when zero-cost is enabled
                        emiPercentage: e.target.checked ? '' : prev.emiPercentage,
                      }))
                    }
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      0% Interest EMI
                    </span>
                    <p className="text-[10px] text-gray-400">
                      Remaining amount divided equally — no extra interest charged
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Customization Section */}
            <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4 dark:border-white/8 dark:bg-white/5">
              <h3 className="mb-3 text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
                Payment Customization
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="On Booking Payment (%) "
                  name="bookingPaymentPercent"
                  type="number"
                  value={formData.bookingPaymentPercent}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="10"
                />
                <div className="flex items-end pb-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 transition-all hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20">
                    <input
                      type="checkbox"
                      name="showSecondInstalment"
                      checked={formData.showSecondInstalment === 'true'}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          showSecondInstalment: e.target.checked ? 'true' : 'false',
                        }))
                      }
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        Show Second Instalment
                      </span>
                      <p className="text-[10px] text-gray-400">20% payment with due date</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-brand-navy/5 dark:bg-brand-gold/5 border-brand-navy/10 dark:border-brand-gold/10 mt-6 rounded-xl border p-4">
              <div className="flex items-center justify-between">
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
                    Booking Payment ({bookingPercent}%)
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
              {(parseFloat(formData.edc) || 0) > 0 && (
                <div className="mt-2 border-t border-dashed border-gray-200 pt-2 dark:border-white/10">
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                    Includes EDC: ₹
                    {parseFloat(formData.edc).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}
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
                    Dated:{' '}
                    {formData.bookingDate
                      ? formatDate(parseDate(formData.bookingDate))
                      : formatDate(new Date())}
                  </p>
                  <p className="font-bold">To,</p>
                  <p className="font-bold">{formData.clientName || '[Client Name]'}</p>
                  <p className="font-bold whitespace-pre-wrap">{formData.address || '[Address]'}</p>
                </div>

                {/* Body */}
                <div className="mb-6">
                  <p className="mb-2">
                    Dear {formData.salutation}{' '}
                    <span className="font-bold">{formData.clientName || '[Client Name]'}</span>
                  </p>
                  <p className="mb-1 text-justify">
                    Congratulations from {companyInfo.company_name} on your new investment in{' '}
                    {formData.projectName} (Kishan Garh Renwal, Jaipur, Rajasthan). It is a perfect
                    choice and you are one of the few lucky ones to get unit at such reasonable
                    rates.
                  </p>
                  <p className="mb-4 text-justify">
                    We at {companyInfo.company_name} feel privileged to be part of your great
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
                          EDC (₹)
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
                          {formData.edc ? parseFloat(formData.edc).toFixed(2) : '0.00'}
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
                      {/* First Instalment (Custom %) */}
                      <tr>
                        <td className="border border-gray-400 p-2 font-bold">1</td>
                        <td className="border border-gray-400 p-2 font-bold">
                          {(() => {
                            if (!formData.bookingDate) return '-';
                            const d = parseDate(formData.bookingDate);
                            return formatDate(d);
                          })()}
                        </td>
                        <td className="border border-gray-400 p-2 font-bold">
                          On Booking (First 3 Days)
                        </td>
                        <td className="border border-gray-400 p-2">{bookingPercent}%</td>
                        <td className="border border-gray-400 p-2 font-bold">
                          Rs. {initialPayment.toFixed(2)}
                        </td>
                      </tr>
                      {/* Second Instalment (20%) — only shown if enabled */}
                      {showSecondInstalment && (
                        <tr>
                          <td className="border border-gray-400 p-2 font-bold">2</td>
                          <td className="border border-gray-400 p-2 font-bold">
                            {(() => {
                              if (!formData.bookingDate) return '-';
                              const d = parseDate(formData.bookingDate);
                              d.setDate(d.getDate() + parseInt(formData.secondPaymentDays));
                              return formatDate(d);
                            })()}
                          </td>
                          <td className="border border-gray-400 p-2 font-bold">
                            Second Instalment ({formData.secondPaymentDays} Days)
                          </td>
                          <td className="border border-gray-400 p-2">{secondPercent}%</td>
                          <td className="border border-gray-400 p-2 font-bold">
                            Rs. {secondPayment.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      {/* EMIs (Remaining %) */}
                      {(() => {
                        const remainingPercent = showSecondInstalment
                          ? 100 - bookingPercent - secondPercent
                          : 100 - bookingPercent;
                        const emiCount =
                          formData.emiCount === 'custom'
                            ? parseInt(formData.paymentPlan || '12')
                            : parseInt(formData.emiCount || '12');
                        const emiPercentPerInstallment = formData.emiPercentage
                          ? parseFloat(formData.emiPercentage)
                          : remainingPercent / emiCount;
                        const emiAmount = totalCost * (emiPercentPerInstallment / 100);
                        const emiStartIndex = showSecondInstalment ? 3 : 2;

                        return Array.from({ length: emiCount }).map((_, i) => {
                          let emiDate = '-';
                          if (formData.emiStartDate) {
                            const d = parseDate(formData.emiStartDate);
                            d.setMonth(d.getMonth() + i);
                            emiDate = formatDate(d);
                          } else if (formData.bookingDate) {
                            const d = parseDate(formData.bookingDate);
                            d.setMonth(d.getMonth() + i + 2);
                            emiDate = formatDate(d);
                          }

                          return (
                            <tr key={i}>
                              <td className="border border-gray-400 p-2 font-bold">
                                {i + emiStartIndex}
                              </td>
                              <td className="border border-gray-400 p-2 font-bold">{emiDate}</td>
                              <td className="border border-gray-400 p-2 font-bold">
                                {zeroCost ? `${i + 1} EMI (0% Interest)` : `${i + 1} EMI`}
                              </td>
                              <td className="border border-gray-400 p-2">
                                {emiPercentPerInstallment.toFixed(1)}%
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
                    Please transfer the initial amount of {bookingPercent}% (Rs.{' '}
                    {initialPayment.toFixed(2)}) within the first 3 days (by{' '}
                    {(() => {
                      if (!formData.bookingDate) return '[Date]';
                      const d = parseDate(formData.bookingDate);
                      d.setDate(d.getDate() + 3);
                      return formatDate(d);
                    })()}
                    ) to confirm allotment under {formData.projectName}.
                  </p>
                  {showSecondInstalment && (
                    <p className="mb-2">
                      The second instalment of {secondPercent}% (Rs. {secondPayment.toFixed(2)})
                      must be paid within {formData.secondPaymentDays} days (by{' '}
                      {(() => {
                        if (!formData.bookingDate) return '[Date]';
                        const d = parseDate(formData.bookingDate);
                        d.setDate(d.getDate() + parseInt(formData.secondPaymentDays));
                        return formatDate(d);
                      })()}
                      ).
                    </p>
                  )}
                  <p className="mb-2">
                    The remaining {remainingPercentInTerms}%
                    {zeroCost ? ' (0% Interest — equal instalments)' : ''} will be paid as per the
                    selected payment plan EMIs and is scheduled to complete accordingly.
                  </p>
                  <p className="mb-2">
                    Note: Allotment under {formData.projectName} will only be confirmed upon receipt
                    of the initial {bookingPercent}% (Rs. {initialPayment.toFixed(2)}) by the due
                    date.
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
                      <span className="font-bold">Account Name:</span>{' '}
                      {companyInfo.bank_account_name || 'Svi Infra Solutions Pvt. Ltd'}
                    </p>
                    <p>
                      <span className="font-bold">Account Number:</span>{' '}
                      {companyInfo.bank_account_no || '0894102000013837'}
                    </p>
                    <p>
                      <span className="font-bold">Bank:</span>{' '}
                      {companyInfo.bank_name || 'IDBI BANK'}
                    </p>
                    <p>
                      <span className="font-bold">IFSC CODE:</span>{' '}
                      {companyInfo.bank_ifsc || 'IBKL0000894'}
                    </p>
                    <p className="mt-4">
                      Your account manager is{' '}
                      <span className="font-bold">{formData.advisorName}</span> and will be
                      reachable on <span className="font-bold">{formData.advisorNumber}</span>
                      {formData.advisorEmail ? (
                        <>
                          {' '}
                          (Email: <span className="font-bold">{formData.advisorEmail}</span>)
                        </>
                      ) : (
                        ''
                      )}{' '}
                      for any queries.
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
