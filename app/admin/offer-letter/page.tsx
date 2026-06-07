'use client';

import {
  DownloadOptions,
  FormField,
  FormSelect,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import { FileSignature, RefreshCw, ChevronDown, SlidersHorizontal } from 'lucide-react';

import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import OfferLetterPreviewContent from '@/src/components/admin/DocumentGenerator/OfferLetterPreviewContent';
import { useEffect, useState, useRef, useCallback } from 'react';

const DEPARTMENTS = ['Sales', 'IT', 'Management'];

const SALARY_SLABS = [
  { target: 120, salary: 17000, offerSlab: '3%' },
  { target: 140, salary: 18000, offerSlab: '3%' },
  { target: 160, salary: 19000, offerSlab: '3%' },
  { target: 180, salary: 20000, offerSlab: '3%' },
  { target: 210, salary: 22000, offerSlab: '3%' },
  { target: 250, salary: 25000, offerSlab: '3%' },
  { target: 290, salary: 28000, offerSlab: '3%' },
  { target: 320, salary: 30000, offerSlab: '3%' },
  { target: 380, salary: 35000, offerSlab: '3%' },
  { target: 450, salary: 40000, offerSlab: '3%' },
  { target: 520, salary: 45000, offerSlab: '3%' },
  { target: 600, salary: 50000, offerSlab: '3%' },
];

function SlabSuggestions({
  slabs,
  activeKey,
  activeVal,
  selectedSalary,
  onSelect,
  format,
}: {
  slabs: typeof SALARY_SLABS;
  activeKey: 'salary' | 'target';
  activeVal: string;
  selectedSalary: number;
  onSelect: (s: (typeof SALARY_SLABS)[number]) => void;
  format: (s: (typeof SALARY_SLABS)[number]) => { left: string; right: string };
}) {
  if (slabs.length === 0)
    return <div className="px-3 py-2 text-xs text-gray-400">No matching slab</div>;
  return (
    <div className="py-1">
      {slabs.map((s) => {
        const isActive =
          s[activeKey] === (activeKey === 'salary' ? selectedSalary : parseFloat(activeVal));
        const { left, right } = format(s);
        return (
          <button
            key={s[activeKey]}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(s);
            }}
            className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
              isActive ? 'text-brand-gold font-medium' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <span>{left}</span>
            <span className="text-gray-400">{right}</span>
          </button>
        );
      })}
    </div>
  );
}

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
        if (json.value) setCompanyInfo(json.value);
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
    workingHoursStart: '10:30 am',
    workingHoursEnd: '6:30 pm',
    workingDays: 'Wednesday to Monday',
    probationPeriod: '3',
    salesCompensationType: '',
    noSaleMonths: '',
    customSalaryPercent: '',
    subsistenceAllowance: '',
  });

  const [showSalesOptions, setShowSalesOptions] = useState(false);
  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [savedOffers, setSavedOffers] = useState<any[]>([]);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [showSlabs, setShowSlabs] = useState(false);

  const salaryRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (salaryRef.current && !salaryRef.current.contains(e.target as Node)) setSalaryOpen(false);
    if (targetRef.current && !targetRef.current.contains(e.target as Node)) setTargetOpen(false);
  }, []);
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const matchedSlab = SALARY_SLABS.find((s) => parseFloat(formData.salaryCtc) === s.salary);

  const salarySuggestions = formData.salaryCtc
    ? SALARY_SLABS.filter((s) => {
        const v = parseFloat(formData.salaryCtc) || 0;
        return (
          s.salary.toString().includes(formData.salaryCtc) ||
          (v > 0 && Math.abs(s.salary - v) <= 2000)
        );
      })
    : SALARY_SLABS;
  const targetSuggestions = formData.target
    ? SALARY_SLABS.filter((s) => {
        const v = parseFloat(formData.target) || 0;
        return (
          s.target.toString().includes(formData.target) || (v > 0 && Math.abs(s.target - v) <= 20)
        );
      })
    : SALARY_SLABS;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value } as any;

    if (name === 'salaryCtc' && value) {
      const numVal = parseFloat(value);
      if (!isNaN(numVal)) {
        const slab = SALARY_SLABS.find((s) => s.salary === numVal);
        if (slab) {
          updated.target = slab.target.toString();
          updated.offerSlab = slab.offerSlab;
          setSalaryOpen(false);
        } else setSalaryOpen(true);
      }
    } else if (name === 'target' && value) {
      const numVal = parseFloat(value);
      if (!isNaN(numVal)) {
        const slab = SALARY_SLABS.find((s) => s.target === numVal);
        if (slab) {
          updated.salaryCtc = slab.salary.toString();
          updated.offerSlab = slab.offerSlab;
          setTargetOpen(false);
        } else setTargetOpen(true);
      }
    }

    setFormData(updated);
  };

  const selectSalarySlab = (s: (typeof SALARY_SLABS)[number]) => {
    setFormData({
      ...formData,
      salaryCtc: s.salary.toString(),
      target: s.target.toString(),
      offerSlab: s.offerSlab,
    });
    setSalaryOpen(false);
    setTargetOpen(false);
  };

  const handleLoadOffer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) {
      setDocumentId(null);
      setFormData({
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
        workingHoursStart: '10:30 am',
        workingHoursEnd: '6:30 pm',
        workingDays: 'Wednesday to Monday',
        probationPeriod: '3',
        salesCompensationType: '',
        noSaleMonths: '',
        customSalaryPercent: '',
        subsistenceAllowance: '',
      });
      return;
    }
    const selected = savedOffers.find((b) => b.id === id);
    if (selected && selected.form_data) {
      setDocumentId(selected.id);
      setFormData((prev) => ({ ...prev, ...selected.form_data }));
    }
  };

  useEffect(() => {
    if (savedOffers.length > 0 && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const templateId = searchParams.get('templateId');
      if (templateId) {
        const selected = savedOffers.find((b) => b.id === templateId);
        if (selected && selected.form_data) {
          setDocumentId(selected.id);
          setFormData((prev) => ({ ...prev, ...selected.form_data }));
        }
      }
    }
  }, [savedOffers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    try {
      await exportToPDF({ elementId: 'offerPreview', filename: 'Offer_Letter.pdf' });
      if (documentId && token) {
        try {
          await fetch(`/api/admin/documents/${documentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
      await exportToImage({ elementId: 'offerPreview', filename: 'Offer_Letter.png' });
    } catch (error) {
      console.error('Error generating Image:', error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="text-brand-navy mb-1 font-serif text-3xl tracking-tight dark:text-white">
          Offer <span className="text-brand-gold italic">Letter</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Generate offer letters for new employees.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* ──────────────── Form ──────────────── */}
        <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0e0e14]/80">
          <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-white/10">
            <FileSignature className="text-brand-gold h-4 w-4" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Candidate Details
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {savedOffers.length > 0 && (
              <div className="mb-2">
                <label className="mb-1 block text-xs font-bold text-gray-500 dark:text-gray-400">
                  Load Saved Offer Letter
                </label>
                <select
                  onChange={handleLoadOffer}
                  className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none dark:border-white/10 dark:bg-[#0e0e14] dark:text-gray-200"
                >
                  <option value="">— Select a saved offer letter —</option>
                  {savedOffers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.form_data?.name || 'Unnamed'} — {b.form_data?.designation || ''} (
                      {new Date(b.created_at).toLocaleDateString('en-GB')})
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                label="Alternate No"
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
              <FormSelect
                label="Department"
                name="department"
                value={formData.department}
                onChange={(e) => {
                  handleChange(e);
                  setShowSalesOptions(e.target.value === 'Sales');
                }}
                options={[
                  { value: '', label: '— Select department —' },
                  ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
                ]}
              />
              <FormField
                label="Reporting To"
                name="reportingTo"
                value={formData.reportingTo}
                onChange={handleChange}
                required
              />

              {/* ── Salary ── */}
              <div ref={salaryRef} className="relative">
                <FormField
                  label="Salary (CTC) / month"
                  name="salaryCtc"
                  type="number"
                  value={formData.salaryCtc}
                  onChange={handleChange}
                  onFocus={() => formData.salaryCtc && setSalaryOpen(true)}
                  required
                />
                {formData.salaryCtc && (
                  <div className="absolute top-7 right-2.5">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[10px] leading-tight font-medium ${
                        matchedSlab
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'
                      }`}
                    >
                      {matchedSlab ? `${matchedSlab.target} Sq.Yd` : 'Custom'}
                    </span>
                  </div>
                )}
                {salaryOpen && formData.salaryCtc && (
                  <div className="absolute z-50 mt-0.5 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#1a1a23]">
                    <SlabSuggestions
                      slabs={salarySuggestions}
                      activeKey="salary"
                      activeVal={formData.salaryCtc}
                      selectedSalary={matchedSlab?.salary || 0}
                      onSelect={selectSalarySlab}
                      format={(s) => ({
                        left: `₹${s.salary.toLocaleString('en-IN')}`,
                        right: `${s.target} Sq.Yd`,
                      })}
                    />
                  </div>
                )}
              </div>

              {/* ── Target ── */}
              <div ref={targetRef} className="relative">
                <FormField
                  label="Target (Sq. Yd.)"
                  name="target"
                  type="number"
                  value={formData.target}
                  onChange={handleChange}
                  onFocus={() => formData.target && setTargetOpen(true)}
                  required
                />
                {formData.target && matchedSlab && (
                  <div className="absolute top-7 right-2.5">
                    <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] leading-tight font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      ₹{matchedSlab.salary.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {targetOpen && formData.target && (
                  <div className="absolute z-50 mt-0.5 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#1a1a23]">
                    <SlabSuggestions
                      slabs={targetSuggestions}
                      activeKey="target"
                      activeVal={formData.target}
                      selectedSalary={matchedSlab?.salary || 0}
                      onSelect={selectSalarySlab}
                      format={(s) => ({
                        left: `${s.target} Sq.Yd`,
                        right: `₹${s.salary.toLocaleString('en-IN')}`,
                      })}
                    />
                  </div>
                )}
              </div>

              <FormField
                label="Offer Slab"
                name="offerSlab"
                value={formData.offerSlab}
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
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />

              {/* ── Slab Reference ── */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowSlabs(!showSlabs)}
                  className="flex w-full items-center justify-between rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 dark:border-white/10 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Salary slab reference
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${showSlabs ? 'rotate-180' : ''}`}
                  />
                </button>

                {showSlabs && (
                  <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                    {SALARY_SLABS.map((slab) => {
                      const active = parseFloat(formData.salaryCtc) === slab.salary;
                      return (
                        <button
                          key={slab.target}
                          type="button"
                          onClick={() => selectSalarySlab(slab)}
                          className={`rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                            active
                              ? 'border-brand-gold bg-brand-gold/5 text-brand-gold'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/30'
                          }`}
                        >
                          <div className="font-medium">₹{slab.salary.toLocaleString('en-IN')}</div>
                          <div className="mt-0.5 text-[10px] text-gray-400">
                            {slab.target} Sq.Yd &middot; {slab.offerSlab}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Sales Compensation Options ── */}
              {showSalesOptions && formData.department === 'Sales' && (
                <div className="md:col-span-2">
                  <div className="mt-1 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Sales Compensation Policy
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                          Compensation Type
                        </label>
                        <select
                          name="salesCompensationType"
                          value={formData.salesCompensationType || ''}
                          onChange={handleChange}
                          className="focus:border-brand-gold w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                        >
                          <option value="">— Select type —</option>
                          <option value="no_sale_no_salary">No Sale No Salary (Allowance)</option>
                          <option value="custom_percent">Custom % of Salary</option>
                        </select>
                      </div>

                      {formData.salesCompensationType === 'no_sale_no_salary' && (
                        <>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                              Duration
                            </label>
                            <div className="flex items-center gap-2">
                              <select
                                name="noSaleMonths"
                                value={formData.noSaleMonths || ''}
                                onChange={handleChange}
                                className="focus:border-brand-gold w-24 appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                              >
                                <option value="">—</option>
                                {Array.from({ length: 36 }, (_, i) => i + 1).map((m) => (
                                  <option key={m} value={m.toString()}>
                                    {m} {m === 1 ? 'month' : 'months'}
                                  </option>
                                ))}
                              </select>
                              {formData.noSaleMonths && formData.appointmentDate && (
                                <span className="text-xs text-gray-400">
                                  until{' '}
                                  {(() => {
                                    const d = new Date(formData.appointmentDate);
                                    d.setMonth(d.getMonth() + parseInt(formData.noSaleMonths));
                                    return d
                                      .toISOString()
                                      .split('T')[0]
                                      .split('-')
                                      .reverse()
                                      .join('-');
                                  })()}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Subsistence Allowance — shown only when a value exists (otherwise add-back link) */}
                          <div>
                            {formData.subsistenceAllowance ? (
                              <>
                                <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                                  Subsistence Allowance (₹/month)
                                </label>
                                <div className="relative">
                                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-gray-400">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    name="subsistenceAllowance"
                                    value={formData.subsistenceAllowance}
                                    onChange={handleChange}
                                    placeholder="10000"
                                    min="0"
                                    className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-16 pl-7 font-sans text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
                                  />
                                  <div className="absolute top-1/2 right-2 flex -translate-y-1/2 gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFormData({ ...formData, subsistenceAllowance: '10000' })
                                      }
                                      className="hover:text-brand-gold text-[10px] text-gray-400"
                                      title="Reset to default"
                                    >
                                      ↺
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFormData({ ...formData, subsistenceAllowance: '' })
                                      }
                                      className="text-[10px] text-gray-400 hover:text-red-500"
                                      title="Remove subsistence allowance"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="pt-5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({ ...formData, subsistenceAllowance: '10000' })
                                  }
                                  className="text-brand-gold hover:text-brand-gold-light text-[11px] font-medium underline underline-offset-2 transition-colors"
                                >
                                  + Add subsistence allowance
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {formData.salesCompensationType === 'custom_percent' && (
                        <div>
                          <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                            Guaranteed Salary (%)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="customSalaryPercent"
                              value={formData.customSalaryPercent || ''}
                              onChange={handleChange}
                              placeholder="e.g. 50"
                              min="0"
                              max="100"
                              className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 font-sans text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
                            />
                            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gray-400">
                              %
                            </span>
                          </div>
                          {formData.customSalaryPercent && formData.salaryCtc && (
                            <p className="mt-1 text-[10px] text-gray-400">
                              Guaranteed: ₹
                              {Math.round(
                                (parseFloat(formData.customSalaryPercent) / 100) *
                                  parseFloat(formData.salaryCtc)
                              ).toLocaleString('en-IN')}
                              /month
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Work / Probation ── */}
              <div className="col-span-2 mt-2 border-t border-gray-100 pt-4 dark:border-white/10">
                <p className="mb-3 text-[11px] font-medium tracking-wider text-gray-500 uppercase">
                  Employment Terms
                </p>
              </div>
              <FormField
                label="Working Hours Start"
                name="workingHoursStart"
                value={formData.workingHoursStart}
                onChange={handleChange}
                placeholder="10:30 am"
              />
              <FormField
                label="Working Hours End"
                name="workingHoursEnd"
                value={formData.workingHoursEnd}
                onChange={handleChange}
                placeholder="6:30 pm"
              />
              <FormField
                label="Working Days"
                name="workingDays"
                value={formData.workingDays}
                onChange={handleChange}
                placeholder="Wednesday to Monday"
              />
              <FormField
                label="Probation (months)"
                name="probationPeriod"
                type="number"
                value={formData.probationPeriod}
                onChange={handleChange}
                placeholder="3"
              />
            </div>

            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold tracking-widest uppercase shadow-sm transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Generate Offer Letter
            </button>
          </form>
        </div>

        {/* ──────────────── Preview ──────────────── */}
        <div className="relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0e0e14]">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Preview</h2>
            {preview && (
              <button
                onClick={() => {
                  const el = document.getElementById('offerPreview');
                  if (el) {
                    if (document.fullscreenElement) document.exitFullscreen();
                    else el.requestFullscreen().catch(() => {});
                  }
                }}
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-300"
                title="Fullscreen"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
              </button>
            )}
          </div>

          <PreviewContainer previewId="offerPreview" hasPreview={preview}>
            <OfferLetterPreviewContent formData={formData} companyInfo={companyInfo} />
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
