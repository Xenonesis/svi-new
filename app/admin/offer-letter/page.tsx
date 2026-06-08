'use client';

import {
  DownloadOptions,
  FormField,
  FormSelect,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import {
  FileSignature,
  RefreshCw,
  SlidersHorizontal,
  CircleDollarSign,
  Calendar,
  Trash2,
  TrendingUp,
  Plus,
  ChevronDown,
} from 'lucide-react';

import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import OfferLetterPreviewContent from '@/src/components/admin/DocumentGenerator/OfferLetterPreviewContent';
import { SlabSelector, SALARY_SLABS } from '@/src/components/admin/OfferLetter/SlabSelector';
import { useOfferLetterApi } from '@/src/services/offerLetterApi';
import { useEffect, useState, useCallback } from 'react';

const DEPARTMENTS = ['Sales', 'IT', 'Management'];

const SALES_DESIGNATIONS = ['Telecaller', 'BDM', 'BDE', 'Sales Manager', 'Team Leader'];

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
  const [showSlabs, setShowSlabs] = useState(false);
  const [salesCustomDesignation, setSalesCustomDesignation] = useState('');
  const [showCustomDesignation, setShowCustomDesignation] = useState(false);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    // Handled by SlabSelector component
  }, []);
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const matchedSlab = formData.salaryCtc
    ? SALARY_SLABS.find((s) => parseFloat(formData.salaryCtc) === s.salary)
    : formData.target
      ? SALARY_SLABS.find((s) => parseFloat(formData.target) === s.target)
      : null;

  // Helper to find slab by value
  const findSlabByValue = (
    value: string,
    key: 'salary' | 'target'
  ): (typeof SALARY_SLABS)[number] | null => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return null;
    return SALARY_SLABS.find((s) => s[key] === numVal) || null;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalaryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, salaryCtc: value }));
    const slab = findSlabByValue(value, 'salary');
    if (slab) {
      setFormData((prev) => ({
        ...prev,
        target: slab.target.toString(),
        offerSlab: slab.offerSlab.replace('%', ''),
      }));
    }
  };

  const handleTargetChange = (value: string) => {
    setFormData((prev) => ({ ...prev, target: value }));
    const slab = findSlabByValue(value, 'target');
    if (slab) {
      setFormData((prev) => ({
        ...prev,
        salaryCtc: slab.salary.toString(),
        offerSlab: slab.offerSlab.replace('%', ''),
      }));
    }
  };

  const handleSalarySelect = (s: (typeof SALARY_SLABS)[number]) => {
    setFormData({
      ...formData,
      salaryCtc: s.salary.toString(),
      target: s.target.toString(),
      offerSlab: s.offerSlab.replace('%', ''),
    });
  };

  const handleTargetSelect = (s: (typeof SALARY_SLABS)[number]) => {
    setFormData({
      ...formData,
      salaryCtc: s.salary.toString(),
      target: s.target.toString(),
      offerSlab: s.offerSlab.replace('%', ''),
    });
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
              {formData.department === 'Sales' ? (
                <FormSelect
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={(e) => {
                    handleChange(e);
                    setShowCustomDesignation(e.target.value === '__custom__');
                  }}
                  required
                  options={[
                    { value: '', label: '— Select designation —' },
                    ...SALES_DESIGNATIONS.map((d) => ({ value: d, label: d })),
                    { value: '__custom__', label: '+ Custom…' },
                  ]}
                />
              ) : (
                <FormField
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Software Engineer, Project Manager"
                />
              )}
              {formData.department === 'Sales' && showCustomDesignation && (
                <FormField
                  label="Custom Designation"
                  name="designationCustom"
                  value={salesCustomDesignation}
                  onChange={(e) => {
                    setSalesCustomDesignation(e.target.value);
                    setFormData({ ...formData, designation: e.target.value });
                  }}
                  required
                  placeholder="e.g. Sales Executive"
                />
              )}
              <FormSelect
                label="Department"
                name="department"
                value={formData.department}
                onChange={(e) => {
                  handleChange(e);
                  setShowSalesOptions(e.target.value === 'Sales');
                  if (e.target.value !== 'Sales') setShowCustomDesignation(false);
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

              {/* ── Salary Slab Selector (Extracted Component) ── */}
              <div className="md:col-span-2">
                <SlabSelector
                  salaryCtc={formData.salaryCtc}
                  target={formData.target}
                  offerSlab={formData.offerSlab}
                  onSalaryChange={handleSalaryChange}
                  onTargetChange={handleTargetChange}
                  onOfferSlabChange={(value) =>
                    setFormData((prev) => ({ ...prev, offerSlab: value }))
                  }
                  onSalarySelect={handleSalarySelect}
                  onTargetSelect={handleTargetSelect}
                />
              </div>

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
                          onClick={() => handleSalarySelect(slab)}
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
                  <div className="mt-1 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50/80 to-white shadow-sm dark:border-white/10 dark:from-white/5 dark:to-transparent">
                    {/* Header */}
                    <div className="border-b border-gray-100 px-5 py-3.5 dark:border-white/10">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-brand-gold/10 flex h-8 w-8 items-center justify-center rounded-lg">
                          <CircleDollarSign className="text-brand-gold h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">
                            Sales Compensation Policy
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            Configure earnings structure for this role
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Compensation Type — radio cards */}
                      <div className="mb-5">
                        <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                          Compensation Type
                        </label>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {/* No Sale No Salary card */}
                          <button
                            type="button"
                            onClick={() =>
                              handleChange({
                                target: {
                                  name: 'salesCompensationType',
                                  value:
                                    formData.salesCompensationType === 'no_sale_no_salary'
                                      ? ''
                                      : 'no_sale_no_salary',
                                },
                              } as any)
                            }
                            className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                              formData.salesCompensationType === 'no_sale_no_salary'
                                ? 'border-brand-gold bg-brand-gold/5 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                                  formData.salesCompensationType === 'no_sale_no_salary'
                                    ? 'border-brand-gold bg-brand-gold'
                                    : 'border-gray-300 dark:border-white/20'
                                }`}
                              >
                                {formData.salesCompensationType === 'no_sale_no_salary' && (
                                  <svg
                                    className="text-brand-navy h-3 w-3"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                  >
                                    <path d="M5 12l5 5L20 7" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p
                                  className={`text-xs font-semibold ${formData.salesCompensationType === 'no_sale_no_salary' ? 'text-brand-navy dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                  No Sale No Salary
                                </p>
                                <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                                  Allowance-based pay during sales period
                                </p>
                              </div>
                            </div>
                          </button>

                          {/* Custom % card */}
                          <button
                            type="button"
                            onClick={() =>
                              handleChange({
                                target: {
                                  name: 'salesCompensationType',
                                  value:
                                    formData.salesCompensationType === 'custom_percent'
                                      ? ''
                                      : 'custom_percent',
                                },
                              } as any)
                            }
                            className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                              formData.salesCompensationType === 'custom_percent'
                                ? 'border-brand-gold bg-brand-gold/5 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                                  formData.salesCompensationType === 'custom_percent'
                                    ? 'border-brand-gold bg-brand-gold'
                                    : 'border-gray-300 dark:border-white/20'
                                }`}
                              >
                                {formData.salesCompensationType === 'custom_percent' && (
                                  <svg
                                    className="text-brand-navy h-3 w-3"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                  >
                                    <path d="M5 12l5 5L20 7" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p
                                  className={`text-xs font-semibold ${formData.salesCompensationType === 'custom_percent' ? 'text-brand-navy dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                  Custom % of Salary
                                </p>
                                <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                                  Fixed percentage guaranteed during probation
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* ── No Sale No Salary: Duration + Allowance ── */}
                      {formData.salesCompensationType === 'no_sale_no_salary' && (
                        <div className="grid grid-cols-1 gap-5 border-t border-gray-100 pt-5 md:grid-cols-2 dark:border-white/10">
                          {/* Duration */}
                          <div>
                            <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                              Duration
                            </label>
                            <div className="flex flex-col gap-2.5">
                              <select
                                name="noSaleMonths"
                                value={formData.noSaleMonths || ''}
                                onChange={handleChange}
                                className="focus:border-brand-gold focus:ring-brand-gold/50 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                              >
                                <option value="">Select months…</option>
                                {Array.from({ length: 36 }, (_, i) => i + 1).map((m) => (
                                  <option key={m} value={m.toString()}>
                                    {m} {m === 1 ? 'month' : 'months'}
                                  </option>
                                ))}
                              </select>
                              {formData.noSaleMonths && formData.appointmentDate && (
                                <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                                  <Calendar className="h-3 w-3 text-gray-400" />
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
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Subsistence Allowance */}
                          <div>
                            <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                              Subsistence Allowance
                            </label>
                            {formData.subsistenceAllowance ? (
                              <div className="space-y-2.5">
                                <div className="relative">
                                  <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    name="subsistenceAllowance"
                                    value={formData.subsistenceAllowance}
                                    onChange={handleChange}
                                    placeholder="10000"
                                    min="0"
                                    className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-7 font-sans text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData({ ...formData, subsistenceAllowance: '10000' })
                                    }
                                    className="hover:border-brand-gold hover:text-brand-gold dark:hover:border-brand-gold dark:hover:text-brand-gold inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-medium text-gray-600 transition-all dark:border-white/10 dark:bg-[#111118] dark:text-gray-400"
                                  >
                                    <RefreshCw className="h-3 w-3" />
                                    Reset to ₹10,000
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData({ ...formData, subsistenceAllowance: '' })
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-medium text-gray-600 transition-all hover:border-red-300 hover:text-red-600 dark:border-white/10 dark:bg-[#111118] dark:text-gray-400 dark:hover:border-red-400 dark:hover:text-red-400"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({ ...formData, subsistenceAllowance: '10000' })
                                }
                                className="text-brand-gold hover:border-brand-gold hover:bg-brand-gold/5 dark:hover:border-brand-gold dark:hover:bg-brand-gold/10 inline-flex items-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-2.5 text-[11px] font-medium transition-all dark:border-white/20 dark:bg-transparent"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add subsistence allowance
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ── Custom % of Salary ── */}
                      {formData.salesCompensationType === 'custom_percent' && (
                        <div className="border-t border-gray-100 pt-5 dark:border-white/10">
                          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
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
                                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-gray-400">
                                  %
                                </span>
                              </div>
                            </div>
                            <div className="flex items-end">
                              {formData.customSalaryPercent && formData.salaryCtc && (
                                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  <div>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                      Guaranteed / month
                                    </p>
                                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                      ₹
                                      {Math.round(
                                        (parseFloat(formData.customSalaryPercent) / 100) *
                                          parseFloat(formData.salaryCtc)
                                      ).toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
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
            <OfferLetterPreviewContent
              formData={formData}
              companyInfo={companyInfo}
              matchedSlab={matchedSlab}
            />
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
