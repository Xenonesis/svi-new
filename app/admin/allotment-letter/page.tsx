'use client';

import {
  DownloadOptions,
  FormField,
  FormSelect,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { AllotmentLetterPreview } from '@/src/components/admin/DocumentGenerator/AllotmentLetterPreview';
import { useAuthStore } from '@/src/stores/authStore';
import { FileText, RefreshCw, X } from 'lucide-react';

import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase/client';

export default function AllotmentLetterPage() {
  const { token } = useAuthStore();

  interface Advisor {
    full_name: string;
    phone: string | null;
    email: string | null;
  }

  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isCustomAdvisor, setIsCustomAdvisor] = useState(false);
  const [isCustomSecondPaymentDays, setIsCustomSecondPaymentDays] = useState(false);
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
            email: p.real_email || p.email || '',
          }))
        );
      } catch (err) {
        console.error('Error loading advisors:', err);
      }
    }
    loadAdvisors();

    // Load saved allotment records
    async function loadSavedAllotments() {
      setLoadingRecords(true);
      try {
        const res = await fetch('/api/admin/documents?type=allotment_letter&limit=500', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch records');
        const json = await res.json();
        const docs = json.documents || [];
        // Only include records with form_data that have at least clientName
        const valid = docs.filter((d: any) => d.form_data?.clientName);
        setSavedAllotments(valid);
      } catch (err) {
        console.error('Error loading allotment records:', err);
      } finally {
        setLoadingRecords(false);
      }
    }
    loadSavedAllotments();
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

  const formatYYYYMMDD = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getCustomDateValue = () => {
    if (!formData.bookingDate) return '';
    const bDate = parseDate(formData.bookingDate);
    const days = parseInt(formData.secondPaymentDays) || 0;
    const targetDate = new Date(bDate);
    targetDate.setDate(targetDate.getDate() + days);
    return formatYYYYMMDD(targetDate);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenDateStr = e.target.value;
    if (!chosenDateStr) return;

    const bDateStr = formData.bookingDate || formatYYYYMMDD(new Date());
    const bDate = parseDate(bDateStr);
    const chosenDate = parseDate(chosenDateStr);

    const diffTime = chosenDate.getTime() - bDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setFormData((prev) => ({
      ...prev,
      secondPaymentDays: String(diffDays >= 0 ? diffDays : 0),
      bookingDate: prev.bookingDate ? prev.bookingDate : bDateStr,
    }));
  };

  const handleSecondPaymentDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomSecondPaymentDays(true);
      const bDateStr = formData.bookingDate || formatYYYYMMDD(new Date());
      const bDate = parseDate(bDateStr);
      const defaultTarget = new Date(bDate);
      defaultTarget.setDate(defaultTarget.getDate() + 15);

      setFormData((prev) => ({
        ...prev,
        secondPaymentDays: '15',
        bookingDate: prev.bookingDate ? prev.bookingDate : bDateStr,
      }));
    } else {
      setIsCustomSecondPaymentDays(false);
      setFormData((prev) => ({
        ...prev,
        secondPaymentDays: val,
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
    edcInEmi: 'false',
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

  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  const DRAFT_VERSION = 1;

  // Load draft from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem('allotment_letter_form_draft');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed._v === DRAFT_VERSION) {
            const { _v, ...data } = parsed;
            setFormData((prev) => ({ ...prev, ...data }));

            const isCustomDays =
              parsed.secondPaymentDays &&
              parsed.secondPaymentDays !== '15' &&
              parsed.secondPaymentDays !== '28';
            setIsCustomSecondPaymentDays(!!isCustomDays);
          } else {
            console.log('Draft version mismatch, ignoring stale draft');
            localStorage.removeItem('allotment_letter_form_draft');
          }
        } catch (e) {
          console.error('Failed to parse form draft from localStorage', e);
        }
      }
      setIsDraftLoaded(true);
    }
  }, []);

  // Save draft to localStorage on changes after it is loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && isDraftLoaded) {
      localStorage.setItem(
        'allotment_letter_form_draft',
        JSON.stringify({ _v: DRAFT_VERSION, ...formData })
      );
    }
  }, [formData, isDraftLoaded]);

  // Adjust isCustomAdvisor when advisors load or draft is loaded
  useEffect(() => {
    if (isDraftLoaded && advisors.length > 0 && formData.advisorName) {
      const isCustAdv =
        formData.advisorName && !advisors.some((adv) => adv.full_name === formData.advisorName);
      setIsCustomAdvisor(!!isCustAdv);
    }
  }, [advisors, isDraftLoaded, formData.advisorName]);

  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [duplicateRecordToOverwrite, setDuplicateRecordToOverwrite] = useState<any>(null);

  // Load from saved allotment records
  const [savedAllotments, setSavedAllotments] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState('');

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
  const edcAmount = parseFloat(formData.edc) || 0;
  const edcInEmi = formData.edcInEmi === 'true';
  const baseCost = totalCost - edcAmount; // without EDC
  const bookingPercent = parseFloat(formData.bookingPaymentPercent) || 10;
  const initialPayment = (edcInEmi ? baseCost : totalCost) * (bookingPercent / 100);
  const secondPercent = 20;
  const secondPayment = (edcInEmi ? baseCost : totalCost) * (secondPercent / 100);
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

  const executeSave = async (targetId: string | null, forceInsert = false) => {
    if (!token || isSaving) return;
    setIsSaving(true);
    try {
      const url =
        targetId && !forceInsert ? `/api/admin/documents/${targetId}` : '/api/admin/documents';
      const method = targetId && !forceInsert ? 'PATCH' : 'POST';
      const body =
        targetId && !forceInsert
          ? { form_data: formData, status: 'draft' }
          : { document_type: 'allotment_letter', form_data: formData, status: 'draft' };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setDocumentId(data.document.id);
        // Update savedAllotments state locally to keep list/dropdown in sync
        setSavedAllotments((prev) => {
          const index = prev.findIndex((item) => item.id === data.document.id);
          if (index !== -1 && !forceInsert) {
            const updated = [...prev];
            updated[index] = data.document;
            return updated;
          } else {
            return [data.document, ...prev];
          }
        });
        setPreview(true);
      }
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
      setShowSaveModal(false);
      setDuplicateRecordToOverwrite(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    // Check if ticketId already exists in savedAllotments
    const existingRecord = savedAllotments.find(
      (r) => r.form_data?.ticketId === formData.ticketId && r.id !== documentId
    );

    if (existingRecord) {
      setDuplicateRecordToOverwrite(existingRecord);
      setShowSaveModal(true);
      return;
    }

    await executeSave(documentId);
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

  // Populate form from a saved allotment record
  const loadFromRecord = (id: string) => {
    if (!id) return;
    const record = savedAllotments.find((r) => r.id === id);
    if (!record?.form_data) return;
    const fd = record.form_data;

    const isCustAdv = fd.advisorName && !advisors.some((adv) => adv.full_name === fd.advisorName);
    setIsCustomAdvisor(!!isCustAdv);

    const isCustomDays =
      fd.secondPaymentDays && fd.secondPaymentDays !== '15' && fd.secondPaymentDays !== '28';
    setIsCustomSecondPaymentDays(!!isCustomDays);

    setFormData({
      clientName: fd.clientName || '',
      salutation: fd.salutation || 'Mr.',
      address: fd.address || '',
      ticketId: fd.ticketId || '',
      projectName: fd.projectName || 'Shyam Aangan',
      unitNumber: fd.unitNumber || '',
      area: fd.area || '',
      bsp: fd.bsp || '',
      plc: fd.plc || '',
      edc: fd.edc || '',
      edcInEmi: fd.edcInEmi || 'false',
      paymentPlan: fd.paymentPlan || '12',
      bookingDate: fd.bookingDate || '',
      secondPaymentDays: fd.secondPaymentDays || '15',
      advisorName: fd.advisorName || '',
      advisorNumber: fd.advisorNumber || '',
      advisorEmail: fd.advisorEmail || '',
      emiCount: fd.emiCount || '12',
      emiPercentage: fd.emiPercentage || '',
      emiStartDate: fd.emiStartDate || '',
      zeroPercentEmi: fd.zeroPercentEmi || 'false',
      bookingPaymentPercent: fd.bookingPaymentPercent || '10',
      showSecondInstalment: fd.showSecondInstalment || 'true',
    });
    setSelectedRecordId(id);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);

      if (savedAllotments.length > 0) {
        const templateId = searchParams.get('templateId');
        if (templateId && !selectedRecordId) {
          loadFromRecord(templateId);
        }
      }

      const prefillRegistration = searchParams.get('prefillRegistration');
      if (prefillRegistration === 'true') {
        const storedReg = sessionStorage.getItem('allotmentPrefillRegistration');
        if (storedReg) {
          try {
            const regData = JSON.parse(storedReg);
            setFormData((prev) => {
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
              } else {
                proj = prev.projectName;
              }

              return {
                ...prev,
                clientName: `${regData.name || ''} ${regData.last_name || ''}`.trim(),
                address: regData.address || '',
                projectName: proj,
                ticketId: regData.submission_id || prev.ticketId,
              };
            });
            // Clear so it doesn't re-apply on refresh
            sessionStorage.removeItem('allotmentPrefillRegistration');
          } catch (e) {
            console.error('Failed to parse prefill registration', e);
          }
        }
      }
    }
  }, [savedAllotments, selectedRecordId]);

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

      {/* Load from saved records */}
      <div className="dark:bg-brand-dark-surface/40 mb-6 rounded-xl border border-gray-200 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-white/8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            <FileText className="h-3.5 w-3.5" />
            Load from Records
          </div>
          <div className="relative flex-1" style={{ minWidth: 280 }}>
            <select
              value={selectedRecordId}
              onChange={(e) => loadFromRecord(e.target.value)}
              className="focus:border-brand-gold focus:ring-brand-gold/50 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 pr-8 text-sm text-gray-900 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
            >
              <option value="">
                {loadingRecords
                  ? 'Loading records...'
                  : savedAllotments.length === 0
                    ? '— No saved allotment records found —'
                    : '— Select a saved allotment —'}
              </option>
              {savedAllotments.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.form_data?.clientName || 'Unnamed'} — {r.form_data?.ticketId || 'No ticket'} (
                  {new Date(r.created_at).toLocaleDateString('en-IN')})
                </option>
              ))}
            </select>
          </div>
          {selectedRecordId && (
            <button
              type="button"
              onClick={() => {
                setSelectedRecordId('');
                setIsCustomAdvisor(false);
                setIsCustomSecondPaymentDays(false);
                setFormData({
                  clientName: '',
                  salutation: 'Mr.',
                  address: '',
                  ticketId: '',
                  projectName: 'Shyam Aangan',
                  unitNumber: '',
                  area: '',
                  bsp: '',
                  plc: '',
                  edc: '',
                  edcInEmi: 'false',
                  paymentPlan: '12',
                  bookingDate: '',
                  secondPaymentDays: '15',
                  advisorName: '',
                  advisorNumber: '',
                  advisorEmail: '',
                  emiCount: '12',
                  emiPercentage: '',
                  emiStartDate: '',
                  zeroPercentEmi: 'false',
                  bookingPaymentPercent: '10',
                  showSecondInstalment: 'true',
                });
              }}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition-all hover:border-gray-300 hover:text-gray-700 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/20"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Form Section */}
        <div className="dark:bg-brand-dark-surface/65 relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
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

              {(parseFloat(formData.edc) || 0) > 0 && (
                <div className="col-span-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 transition-all hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20">
                    <input
                      type="checkbox"
                      name="edcInEmi"
                      checked={formData.edcInEmi === 'true'}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          edcInEmi: e.target.checked ? 'true' : 'false',
                        }))
                      }
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        Include EDC in EMI payments only
                      </span>
                      <p className="text-[10px] text-gray-400">
                        EDC excluded from booking &amp; second instalment — added to remaining EMI
                        amount
                      </p>
                    </div>
                  </label>
                </div>
              )}

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

              {isCustomSecondPaymentDays ? (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400">
                      Second Payment Date (Custom) *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomSecondPaymentDays(false);
                        setFormData((prev) => ({ ...prev, secondPaymentDays: '15' }));
                      }}
                      className="text-brand-gold text-[10px] font-bold tracking-wider uppercase hover:underline"
                    >
                      Use Dropdown
                    </button>
                  </div>
                  <input
                    type="date"
                    name="secondPaymentDaysCustom"
                    value={getCustomDateValue()}
                    onChange={handleCustomDateChange}
                    required
                    className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100/70 dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600 dark:disabled:bg-gray-900/40"
                  />
                  <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
                    <span>Calculated: {formData.secondPaymentDays || '0'} days</span>
                  </div>
                </div>
              ) : (
                <FormSelect
                  label="Second Payment Days"
                  name="secondPaymentDays"
                  value={formData.secondPaymentDays}
                  onChange={handleSecondPaymentDaysChange}
                  options={[
                    { value: '15', label: '15 days' },
                    { value: '28', label: '28 days' },
                    { value: 'custom', label: 'Other / Custom...' },
                  ]}
                />
              )}

              {isCustomAdvisor ? (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400">
                      Advisor Name *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomAdvisor(false)}
                      className="text-brand-gold text-[10px] font-bold tracking-wider uppercase hover:underline"
                    >
                      Use Dropdown
                    </button>
                  </div>
                  <input
                    type="text"
                    name="advisorName"
                    value={formData.advisorName}
                    onChange={handleChange}
                    required
                    className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100/70 dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600 dark:disabled:bg-gray-900/40"
                  />
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
                    {edcInEmi ? ' (added to EMI)' : ' (proportionate in all payments)'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className={`bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all ${isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <RefreshCw className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />{' '}
              {isSaving ? 'Generating...' : 'Generate Letter'}
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="dark:bg-brand-dark-surface relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/8">
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
            <AllotmentLetterPreview
              formData={formData}
              companyInfo={companyInfo}
              className="relative bg-white p-8 font-sans text-[13px] leading-relaxed text-black"
            />
          </PreviewContainer>

          <DownloadOptions
            onDownloadPDF={handleDownloadPDF}
            onDownloadImage={handleDownloadImage}
            disabled={!preview}
          />
        </div>
      </div>

      {showSaveModal && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
          <div className="dark:bg-brand-dark-surface animate-in zoom-in-95 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl duration-200 dark:border-white/10">
            <h3 className="mb-2 font-serif text-lg font-bold text-gray-900 dark:text-white">
              Duplicate Ticket ID Found
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              An allotment letter with Ticket ID{' '}
              <strong className="text-brand-gold">{formData.ticketId}</strong> is already saved in
              the database. What would you like to do?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => executeSave(duplicateRecordToOverwrite?.id)}
                className="bg-brand-navy hover:bg-brand-navy/90 cursor-pointer rounded-xl px-4 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all"
              >
                🔄 Overwrite Old One
              </button>
              <button
                onClick={() => executeSave(null, true)}
                className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy cursor-pointer rounded-xl px-4 py-3 text-xs font-bold tracking-wider uppercase shadow-md transition-all"
              >
                ➕ Save as New
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setDuplicateRecordToOverwrite(null);
                }}
                className="cursor-pointer rounded-xl border border-gray-200 px-4 py-3 text-xs font-bold tracking-wider text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
