import React from 'react';
import { FormField, FormSelect } from '@/src/components/admin/DocumentGenerator/Shared';
import {
  FileSignature,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  AlertTriangle,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { SlabSelector, SALARY_SLABS } from '@/src/components/admin/OfferLetter/SlabSelector';
import { SalesCompensationSection } from '@/src/components/admin/OfferLetter/SalesCompensationSection';
import { OfferLetterFormData, SavedOffer, SALES_DESIGNATIONS } from './types';

const DEPARTMENTS = ['Sales', 'IT', 'Management'];

interface OfferLetterFormProps {
  formData: OfferLetterFormData;
  setFormData: React.Dispatch<React.SetStateAction<OfferLetterFormData>>;
  savedOffers: SavedOffer[];
  selectedRecordId?: string;
  documentId?: string | null;
  duplicateCandidate?: SavedOffer | null;
  loadDuplicateRecord?: () => void;
  handleResetForm?: () => void;
  isGenerating?: boolean;
  showSalesOptions: boolean;
  setShowSalesOptions: (val: boolean) => void;
  showSlabs: boolean;
  setShowSlabs: (val: boolean) => void;
  salesCustomDesignation: string;
  setSalesCustomDesignation: (val: string) => void;
  showCustomDesignation: boolean;
  setShowCustomDesignation: (val: boolean) => void;
  handleLoadOffer: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleSalaryChange: (val: string) => void;
  handleTargetChange: (val: string) => void;
  handleSalarySelect: (slab: (typeof SALARY_SLABS)[number]) => void;
  handleTargetSelect: (slab: (typeof SALARY_SLABS)[number]) => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
}

export function OfferLetterForm({
  formData,
  setFormData,
  savedOffers,
  selectedRecordId,
  documentId,
  duplicateCandidate,
  loadDuplicateRecord,
  handleResetForm,
  isGenerating = false,
  showSalesOptions,
  setShowSalesOptions,
  showSlabs,
  setShowSlabs,
  salesCustomDesignation,
  setSalesCustomDesignation,
  showCustomDesignation,
  setShowCustomDesignation,
  handleLoadOffer,
  handleSubmit,
  handleSalaryChange,
  handleTargetChange,
  handleSalarySelect,
  handleTargetSelect,
  handleChange,
}: OfferLetterFormProps) {
  return (
    <div className="dark:bg-brand-dark-surface/80 relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10">
      <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
        <div className="flex items-center gap-2">
          <FileSignature className="text-brand-gold h-4 w-4" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Candidate Details</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-white/10 dark:bg-black/20">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, language: 'en' }))}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                (formData.language || 'en') === 'en'
                  ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-800 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, language: 'hi' }))}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                formData.language === 'hi'
                  ? 'bg-brand-gold text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>
          {documentId && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
              <CheckCircle2 className="h-3 w-3" /> Edit Mode
            </span>
          )}
        </div>
      </div>

      {/* ── Active Edit Mode Alert Banner ── */}
      {documentId && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 dark:border-blue-500/20 dark:bg-blue-500/10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-blue-600"></span>
            <div>
              <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                Updating Existing Offer Letter
              </p>
              <p className="text-[10.5px] text-blue-700 dark:text-blue-300">
                Changes will overwrite this existing record (no duplicate will be created).
              </p>
            </div>
          </div>
          {handleResetForm && (
            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-800 shadow-xs transition-colors hover:bg-blue-50 dark:border-blue-400/30 dark:bg-[#111118] dark:text-blue-200 dark:hover:bg-white/10"
            >
              <Plus className="h-3 w-3" /> New Letter
            </button>
          )}
        </div>
      )}

      {/* ── Duplicate Candidate Warning Banner ── */}
      {duplicateCandidate && !documentId && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Potential Duplicate Candidate Detected
              </p>
              <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                An offer letter already exists for{' '}
                <span className="font-bold">
                  {duplicateCandidate.form_data?.name || 'this candidate'}
                </span>{' '}
                {duplicateCandidate.form_data?.mobileNo
                  ? `(Mobile: ${duplicateCandidate.form_data.mobileNo})`
                  : ''}{' '}
                created on{' '}
                <span className="font-bold">
                  {new Date(duplicateCandidate.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                .
              </p>
              {loadDuplicateRecord && (
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadDuplicateRecord}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                  >
                    Load &amp; Update Existing Record
                  </button>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400">
                    (Recommended &mdash; avoids creating duplicate entry)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {savedOffers.length > 0 && (
          <div className="mb-2">
            <label className="mb-1 block text-xs font-bold text-gray-500 dark:text-gray-400">
              Load Saved Offer Letter
            </label>
            <select
              value={selectedRecordId || ''}
              onChange={handleLoadOffer}
              className="focus:border-brand-gold dark:bg-brand-dark-surface w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none dark:border-white/10 dark:text-gray-200"
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
                setFormData((prev) => ({ ...prev, designation: e.target.value }));
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
              salaryType={formData.salaryType || 'CTC'}
              target={formData.target}
              targetUnit={formData.targetUnit || 'Sq. Yd.'}
              offerSlab={formData.offerSlab}
              onSalaryChange={handleSalaryChange}
              onSalaryTypeChange={(val) => setFormData((prev) => ({ ...prev, salaryType: val }))}
              onTargetChange={handleTargetChange}
              onTargetUnitChange={(val) => setFormData((prev) => ({ ...prev, targetUnit: val }))}
              onOfferSlabChange={(value) => setFormData((prev) => ({ ...prev, offerSlab: value }))}
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
              <SalesCompensationSection
                department={formData.department}
                designation={formData.designation}
                salesCompensationType={formData.salesCompensationType}
                probationPeriod={formData.probationPeriod}
                noSaleMonths={formData.noSaleMonths}
                subsistenceAllowance={formData.subsistenceAllowance}
                customSalaryPercent={formData.customSalaryPercent}
                meetingsPerMonth={formData.meetingsPerMonth}
                salaryCtc={formData.salaryCtc}
                target={formData.target}
                gracePeriodMonths={formData.gracePeriodMonths}
                reducedSalaryPercent={formData.reducedSalaryPercent}
                enablePartialTargetRule={formData.enablePartialTargetRule}
                partialTargetSalaryPercent={formData.partialTargetSalaryPercent}
                commissionReleasePercent={formData.commissionReleasePercent}
                includeSiteVisitPolicy={formData.includeSiteVisitPolicy !== false}
                siteVisitSchedule={formData.siteVisitSchedule}
                weeklyOffDays={formData.weeklyOffDays}
                includeConveyanceAllowance={Boolean(formData.includeConveyanceAllowance)}
                conveyanceAllowanceAmount={formData.conveyanceAllowanceAmount}
                includeSalesPolicyBox={formData.includeSalesPolicyBox !== false}
                onValueChange={(name, value) => setFormData((prev) => ({ ...prev, [name]: value }))}
                onToggleType={(type) =>
                  setFormData((prev) => ({
                    ...prev,
                    salesCompensationType: prev.salesCompensationType === type ? '' : type,
                  }))
                }
              />
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

        {/* ── Document Boxes & Section Visibility Controls ── */}
        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                Document Sections &amp; Boxes Visibility
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Manually show or hide framed boxes and borders in the generated letter
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {formData.department === 'Sales' && (
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 text-xs transition-colors hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="includeSalesPolicyBox"
                    checked={formData.includeSalesPolicyBox !== false}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, includeSalesPolicyBox: e.target.checked }))
                    }
                    className="text-brand-gold focus:ring-brand-gold h-4 w-4 rounded border-gray-300"
                  />
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Sales Policy &amp; Quota Box
                    </span>
                    <p className="text-[10px] text-gray-400">Clause 3 Performance Terms Box</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    formData.includeSalesPolicyBox !== false
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {formData.includeSalesPolicyBox !== false ? 'VISIBLE' : 'HIDDEN'}
                </span>
              </label>
            )}

            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 text-xs transition-colors hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="includeDocumentationBox"
                  checked={formData.includeDocumentationBox !== false}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, includeDocumentationBox: e.target.checked }))
                  }
                  className="text-brand-gold focus:ring-brand-gold h-4 w-4 rounded border-gray-300"
                />
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Onboarding Docs Box
                  </span>
                  <p className="text-[10px] text-gray-400">Clause 4 Checklist Box</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  formData.includeDocumentationBox !== false
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {formData.includeDocumentationBox !== false ? 'VISIBLE' : 'HIDDEN'}
              </span>
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 text-xs transition-colors hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="includeCandidateParticularsBox"
                  checked={formData.includeCandidateParticularsBox !== false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      includeCandidateParticularsBox: e.target.checked,
                    }))
                  }
                  className="text-brand-gold focus:ring-brand-gold h-4 w-4 rounded border-gray-300"
                />
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Candidate Particulars Card
                  </span>
                  <p className="text-[10px] text-gray-400">Top Details Box</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  formData.includeCandidateParticularsBox !== false
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {formData.includeCandidateParticularsBox !== false ? 'VISIBLE' : 'HIDDEN'}
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold tracking-widest uppercase shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />{' '}
              {documentId ? 'Updating & Downloading...' : 'Generating & Downloading...'}
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />{' '}
              {documentId ? 'Update & Download Offer Letter' : 'Generate Offer Letter'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
