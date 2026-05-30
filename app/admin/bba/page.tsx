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

export default function BbaPage() {
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
    advisorEmail: '',
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
  const initialPayment = totalCost * 0.05;

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
            document_type: 'bba',
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
        elementId: 'bbaPreview',
        filename: 'BBA_Document.pdf',
      });

      // Update document status to completed
      if (documentId && token) {
        await fetch(`/api/admin/documents/${documentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'completed' }),
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDownloadImage = async () => {
    try {
      await exportToImage({
        elementId: 'bbaPreview',
        filename: 'BBA_Document.png',
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
            Builder Buyer <span className="text-brand-gold italic">Agreement (BBA)</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download official Builder Buyer Agreements for clients.
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
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Agreement Details</h2>
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
                  Booking Payment (5%)
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
              <RefreshCw className="h-4 w-4" /> Generate BBA
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
                  const previewElement = document.getElementById('bbaPreview');
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

          <PreviewContainer previewId="bbaPreview" hasPreview={preview}>
            <div className="bg-white p-8 font-sans text-[13px] leading-relaxed text-black">
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
                  {/* We can use a standard logo image here, or text fallback. The user's pdf had a logo on the right. */}
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
                  {formData.bookingDate ||
                    new Date().toISOString().split('T')[0].split('-').reverse().join('-')}
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
                  Congratulations from {companyInfo.company_name} on your new investment in{' '}
                  {formData.projectName} (Kishan Garh Renwal, Jaipur, Rajasthan). It is a perfect
                  choice and you are one of the few lucky ones to get unit at such reasonable rates.
                </p>
                <p className="mb-4 text-justify">
                  We at {companyInfo.company_name} feel privileged to be part of your great
                  investment. We thank you for giving us an opportunity to assist you in making this
                  very investment. We sincerely hope that you are satisfied with our services and
                  will refer us in your circle.
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
                    <tr className="bg-[#00b0f0] text-black">
                      <th className="border border-gray-400 p-2 font-bold">Client Name</th>
                      <th className="border border-gray-400 p-2 font-bold">Allotted Unit</th>
                      <th className="border border-gray-400 p-2 font-bold">Area (Sq. Yds.)</th>
                      <th className="border border-gray-400 p-2 font-bold">Payment Plan</th>
                      <th className="border border-gray-400 p-2 font-bold">BSP (PSq.Yd)</th>
                      <th className="border border-gray-400 p-2 font-bold">PLC (in %)</th>
                      <th className="border border-gray-400 p-2 font-bold">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
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
                    <tr className="bg-[#00b0f0] text-black">
                      <th className="border border-gray-400 p-2 font-bold">SNO</th>
                      <th className="border border-gray-400 p-2 font-bold">Date</th>
                      <th className="border border-gray-400 p-2 font-bold">Particulars</th>
                      <th className="border border-gray-400 p-2 font-bold">%</th>
                      <th className="border border-gray-400 p-2 font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* First Instalment (5%) */}
                    <tr>
                      <td className="border border-gray-400 p-2 font-bold">1</td>
                      <td className="border border-gray-400 p-2 font-bold">
                        {(() => {
                          if (!formData.bookingDate) return '-';
                          const d = new Date(formData.bookingDate);
                          d.setDate(d.getDate() + 3);
                          return d.toISOString().split('T')[0];
                        })()}
                      </td>
                      <td className="border border-gray-400 p-2 font-bold">
                        On Booking (First 3 Days)
                      </td>
                      <td className="border border-gray-400 p-2">5%</td>
                      <td className="border border-gray-400 p-2 font-bold">
                        Rs. {(totalCost * 0.05).toFixed(2)}
                      </td>
                    </tr>
                    {/* Second Instalment (5%) */}
                    <tr>
                      <td className="border border-gray-400 p-2 font-bold">2</td>
                      <td className="border border-gray-400 p-2 font-bold">
                        {(() => {
                          if (!formData.bookingDate) return '-';
                          const d = new Date(formData.bookingDate);
                          d.setDate(d.getDate() + 10);
                          return d.toISOString().split('T')[0];
                        })()}
                      </td>
                      <td className="border border-gray-400 p-2 font-bold">
                        Second Instalment (Next 7 Days)
                      </td>
                      <td className="border border-gray-400 p-2">5%</td>
                      <td className="border border-gray-400 p-2 font-bold">
                        Rs. {(totalCost * 0.05).toFixed(2)}
                      </td>
                    </tr>
                    {/* Third Instalment (30%) */}
                    <tr>
                      <td className="border border-gray-400 p-2 font-bold">3</td>
                      <td className="border border-gray-400 p-2 font-bold">
                        {(() => {
                          if (!formData.bookingDate) return '-';
                          const d = new Date(formData.bookingDate);
                          d.setDate(d.getDate() + 25);
                          return d.toISOString().split('T')[0];
                        })()}
                      </td>
                      <td className="border border-gray-400 p-2 font-bold">
                        Third Instalment (Next 15 Days)
                      </td>
                      <td className="border border-gray-400 p-2">30%</td>
                      <td className="border border-gray-400 p-2 font-bold">
                        Rs. {(totalCost * 0.3).toFixed(2)}
                      </td>
                    </tr>
                    {/* EMIs (Remaining 60%) */}
                    {(() => {
                      const remainingCost = totalCost * 0.6;
                      const months = parseInt(formData.paymentPlan || '12');
                      const emiAmount = remainingCost / months;
                      const emiPercent = 60 / months;

                      return Array.from({ length: months }).map((_, i) => {
                        let emiDate = '-';
                        if (formData.bookingDate) {
                          const d = new Date(formData.bookingDate);
                          d.setMonth(d.getMonth() + i + 2); // Start EMIs roughly 2 months after booking
                          emiDate = d.toISOString().split('T')[0];
                        }

                        return (
                          <tr key={i}>
                            <td className="border border-gray-400 p-2 font-bold">{i + 4}</td>
                            <td className="border border-gray-400 p-2 font-bold">{emiDate}</td>
                            <td className="border border-gray-400 p-2 font-bold">{i + 1} EMI</td>
                            <td className="border border-gray-400 p-2">{emiPercent.toFixed(1)}%</td>
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
              <div className="mb-8 rounded-lg border-l-4 border-[#00b0f0] bg-[#f0f8ff] p-4 text-gray-800 italic">
                <p className="mb-2">
                  Please transfer the initial amount of 5% (Rs. {(totalCost * 0.05).toFixed(2)})
                  within the first 3 days (by{' '}
                  {(() => {
                    if (!formData.bookingDate) return '[Date]';
                    const d = new Date(formData.bookingDate);
                    d.setDate(d.getDate() + 3);
                    return d.toISOString().split('T')[0];
                  })()}
                  ) to confirm allotment under {formData.projectName}.
                </p>
                <p className="mb-2">
                  The second instalment of 5% (Rs. {(totalCost * 0.05).toFixed(2)}) must be paid in
                  the next 7 days (by{' '}
                  {(() => {
                    if (!formData.bookingDate) return '[Date]';
                    const d = new Date(formData.bookingDate);
                    d.setDate(d.getDate() + 10);
                    return d.toISOString().split('T')[0];
                  })()}
                  ), and the third instalment of 30% (Rs. {(totalCost * 0.3).toFixed(2)}) in the
                  next 15 days (by{' '}
                  {(() => {
                    if (!formData.bookingDate) return '[Date]';
                    const d = new Date(formData.bookingDate);
                    d.setDate(d.getDate() + 25);
                    return d.toISOString().split('T')[0];
                  })()}
                  ).
                </p>
                <p className="mb-2">
                  The remaining 60% will be paid as per the selected payment plan EMIs and is
                  scheduled to complete accordingly.
                </p>
                <p className="mb-2">
                  Note: Allotment under {formData.projectName} will only be confirmed upon receipt
                  of the initial 5% (Rs. {(totalCost * 0.05).toFixed(2)}) by the due date.
                </p>
                <p>
                  In the event you fail to make the payments as per the payment plan chosen by you,
                  the allotment of these plots will be automatically cancelled.
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
                    <span className="font-bold">Bank:</span> {companyInfo.bank_name || 'IDBI BANK'}
                  </p>
                  <p>
                    <span className="font-bold">IFSC CODE:</span>{' '}
                    {companyInfo.bank_ifsc || 'IBKL0000894'}
                  </p>
                  <p className="mt-4">
                    Your account manager is{' '}
                    <span className="font-bold">{formData.advisorName}</span> and will be reachable
                    on <span className="font-bold">{formData.advisorNumber}</span>
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
                  <p className="mb-2">With Best Regards</p>
                  <p className="mb-16">For {companyInfo.company_name}</p>
                  <div className="w-48 border-t border-black pt-2 text-center">
                    <p>Director</p>
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
