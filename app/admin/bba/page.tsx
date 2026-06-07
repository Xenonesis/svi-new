'use client';

import {
  DownloadOptions,
  FormField,
  FormSelect,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import { FileText, RefreshCw, ClipboardList } from 'lucide-react';

import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import BbaPreviewContent from '@/src/components/admin/DocumentGenerator/BbaPreviewContent';

export default function BbaPage() {
  const { token } = useAdminSession();

  const [savedBbas, setSavedBbas] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    async function loadBbas() {
      try {
        const res = await fetch('/api/admin/documents?type=bba', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSavedBbas(data.documents || []);
        }
      } catch (err) {
        console.error('Error loading BBAs:', err);
      }
    }
    loadBbas();
  }, [token]);

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
    salutation: '',
    clientName: '',
    aadharNumber: '',
    fatherName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
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
    onBookingPaymentRef: '',
    within15DaysPaymentRef: '',
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
  const isShyamAangan = formData.projectName === 'Shyam Aangan';
  const initialPayment = totalCost * 0.1;

  // dd-mm-yy format (matches PDF: 29-11-25)
  const fmtDate = (dateStr: string, addDays = 0, addMonths = 0) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (addDays) d.setDate(d.getDate() + addDays);
    if (addMonths) d.setMonth(d.getMonth() + addMonths);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}-${mm}-${yy}`;
  };

  // Indian ₹ format, no decimals (matches PDF: ₹51,636)
  const fmtInr = (n: number) => '\u20b9' + Math.round(n).toLocaleString('en-IN');

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
        if (documentId) {
          const response = await fetch(`/api/admin/documents/${documentId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              form_data: formData,
              status: 'draft',
            }),
          });
          if (!response.ok) throw new Error('Failed to update document');
        } else {
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
            // Refresh saved BBAs list
            const res = await fetch('/api/admin/documents?type=bba', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const bbaData = await res.json();
              setSavedBbas(bbaData.documents || []);
            }
          } else {
            throw new Error('Failed to save document');
          }
        }
      } catch (error) {
        console.error('Failed to save document:', error);
      }
    }

    setPreview(true);
  };

  const handleLoadBba = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) {
      setDocumentId(null);
      setFormData({
        salutation: '',
        clientName: '',
        aadharNumber: '',
        fatherName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
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
        onBookingPaymentRef: '',
        within15DaysPaymentRef: '',
      });
      return;
    }

    const selected = savedBbas.find((b) => b.id === id);
    if (selected && selected.form_data) {
      setDocumentId(selected.id);
      setFormData((prev) => ({ ...prev, ...selected.form_data }));
    }
  };

  // Handle templateId from URL (e.g. from BBA Records "Use as Template")
  useEffect(() => {
    if (savedBbas.length > 0 && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const templateId = searchParams.get('templateId');
      if (templateId) {
        const selected = savedBbas.find((b) => b.id === templateId);
        if (selected && selected.form_data) {
          setDocumentId(selected.id);
          setFormData((prev) => ({ ...prev, ...selected.form_data }));
        }
      }
    }
  }, [savedBbas]);

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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Builder Buyer <span className="text-brand-gold italic">Agreement (BBA)</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download official Builder Buyer Agreements for clients.
          </p>
        </div>
        <Link
          href="/admin/bba-records"
          className="flex w-fit items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
        >
          <ClipboardList className="h-4 w-4" /> View Records
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Form Section */}
        <div className="relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
                <FileText className="text-brand-gold h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Agreement Details</h2>
            </div>

            {savedBbas.length > 0 && (
              <select
                className="border-brand-navy/20 focus:border-brand-gold focus:ring-brand-gold/20 dark:border-brand-gold/20 dark:bg-brand-gold/5 dark:focus:border-brand-gold w-full rounded-xl border bg-white/50 px-3 py-1.5 text-sm text-gray-900 backdrop-blur-sm transition-all outline-none sm:w-auto dark:text-white"
                value={documentId || ''}
                onChange={handleLoadBba}
              >
                <option value="">-- Create New BBA --</option>
                {savedBbas.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.form_data?.clientName || 'Unknown'} - {b.form_data?.ticketId || 'No Ticket'}{' '}
                    ({new Date(b.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormSelect
                label="Salutation"
                name="salutation"
                value={formData.salutation}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select Salutation' },
                  { value: 'Mr', label: 'Mr' },
                  { value: 'Mrs', label: 'Mrs' },
                  { value: 'Ms', label: 'Ms' },
                  { value: 'Dr', label: 'Dr' },
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
                label="Aadhar Number"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                placeholder="e.g. 590415758951"
              />
              <FormField
                label="Father / Husband Name"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                placeholder="Son/Daughter/Wife of"
              />
            </div>

            {/* Address Section */}
            <div className="col-span-full">
              <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                Client Address
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormField
                    label="House No. / Street Address"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="e.g. H/No-212 Puncture Shop Old Route NH24 Near Hotel,"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <FormField
                    label="Locality / Area (optional)"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="e.g. Green Palace Baksar, Faridpur Simbhavali,"
                  />
                </div>
                <FormField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Hapur"
                  required
                />
                <FormField
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Uttar Pradesh"
                  required
                />
                <FormField
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 245207"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

              <FormField
                label="Payment Reference No. (On Booking)"
                name="onBookingPaymentRef"
                value={formData.onBookingPaymentRef}
                onChange={handleChange}
                placeholder="e.g. Txn/Receipt No."
              />
              <FormField
                label="Payment Reference No. (Within 15 Days)"
                name="within15DaysPaymentRef"
                value={formData.within15DaysPaymentRef}
                onChange={handleChange}
                placeholder="e.g. Txn/Receipt No."
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
                  Booking Payment (10%)
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
            <BbaPreviewContent formData={formData} companyInfo={companyInfo} />
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
