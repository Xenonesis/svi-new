import React from 'react';
import { FormField, FormSelect } from '@/src/components/admin/DocumentGenerator/Shared';
import { FileSignature, RefreshCw, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { SlabSelector, SALARY_SLABS } from '@/src/components/admin/OfferLetter/SlabSelector';
import { SalesCompensationSection } from '@/src/components/admin/OfferLetter/SalesCompensationSection';
import { OfferLetterFormData, SavedOffer } from './types';

const DEPARTMENTS = ['Sales', 'IT', 'Management'];
const SALES_DESIGNATIONS = ['Telecaller', 'BDM', 'BDE', 'Sales Manager', 'Team Leader'];

interface OfferLetterFormProps {
  formData: OfferLetterFormData;
  setFormData: React.Dispatch<React.SetStateAction<OfferLetterFormData>>;
  savedOffers: SavedOffer[];
  selectedRecordId?: string;
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
      <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-white/10">
        <FileSignature className="text-brand-gold h-4 w-4" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Candidate Details</h2>
      </div>

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
              offerSlab={formData.offerSlab}
              onSalaryChange={handleSalaryChange}
              onSalaryTypeChange={(val) => setFormData((prev) => ({ ...prev, salaryType: val }))}
              onTargetChange={handleTargetChange}
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

        <button
          type="submit"
          className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold tracking-widest uppercase shadow-sm transition-all"
        >
          <RefreshCw className="h-4 w-4" /> Generate Offer Letter
        </button>
      </form>
    </div>
  );
}
