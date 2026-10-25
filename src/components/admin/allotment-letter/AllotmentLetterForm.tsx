import React from 'react';
import { FormField, FormSelect } from '@/src/components/admin/DocumentGenerator/Shared';
import { ActiveAllotmentTicketDropdown } from '@/src/components/admin/allotment-shared/ActiveAllotmentTicketDropdown';
import type { ActiveAllotmentOption } from '@/src/components/admin/allotment-shared/types';
import type { AllotmentFormData } from './hooks/useAllotmentLetterPage';
import { RefreshCw } from 'lucide-react';

export interface AdvisorItem {
  full_name: string;
  email?: string | null;
  phone?: string | null;
}

export interface ProjectItem {
  value: string;
  label: string;
}

export interface AllotmentLetterFormProps {
  formData: AllotmentFormData;
  setFormData: React.Dispatch<React.SetStateAction<AllotmentFormData>>;
  advisors: AdvisorItem[];
  projects: ProjectItem[];
  isCustomAdvisor: boolean;
  setIsCustomAdvisor: (val: boolean) => void;
  isCustomSecondPaymentDays: boolean;
  setIsCustomSecondPaymentDays: (val: boolean) => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  getCustomDateValue: () => string;
  handleCustomDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSecondPaymentDaysChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAdvisorChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  totalCost: number;
  bookingPercent: number;
  initialPayment: number;
  edcInEmi: boolean;
  activeAllotments?: ActiveAllotmentOption[];
  loadingActiveAllotments?: boolean;
  handleSelectAllotment?: (allotment: ActiveAllotmentOption) => void;
}

export function AllotmentLetterForm({
  formData,
  setFormData,
  advisors,
  projects,
  isCustomAdvisor,
  setIsCustomAdvisor,
  isCustomSecondPaymentDays,
  setIsCustomSecondPaymentDays,
  handleChange,
  getCustomDateValue,
  handleCustomDateChange,
  handleSecondPaymentDaysChange,
  handleAdvisorChange,
  handleSubmit,
  isSaving,
  totalCost,
  bookingPercent,
  initialPayment,
  edcInEmi,
  activeAllotments = [],
  loadingActiveAllotments = false,
  handleSelectAllotment,
}: AllotmentLetterFormProps) {
  const isOneTime = formData.planType === 'one_time';
  const remainingBalance = Math.max(0, totalCost - initialPayment);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Plan Type Selector */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
        <label className="mb-2 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
          Allotment Letter Scheme Type
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setFormData((prev: AllotmentFormData) => ({
                ...prev,
                planType: 'emi',
                paymentPlan:
                  prev.paymentPlan === 'One-Time Payment Plan' ? '12' : prev.paymentPlan || '12',
                showSecondInstalment: 'true',
                bookingPaymentPercent: prev.bookingPaymentPercent || '10',
              }));
            }}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              !isOneTime
                ? 'dark:bg-brand-gold dark:text-brand-navy bg-[#1e3a8a] text-white shadow-md'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            <span>🔄</span> Monthly EMI / Installment Plan
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData((prev: AllotmentFormData) => ({
                ...prev,
                planType: 'one_time',
                paymentPlan: 'One-Time Payment Plan',
                showSecondInstalment: 'false',
                emiCount: '1',
                remainingPaymentLabel: prev.remainingPaymentLabel || 'Remaining Payment',
                specialClause:
                  prev.specialClause ||
                  'This allotment letter is strictly provisional and valid subject to the realization / encashment of the booking cheque. In the event of cheque dishonor/bounce, this allotment letter shall immediately and automatically become null, void, and cancelled.',
              }));
            }}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              isOneTime
                ? 'dark:bg-brand-gold dark:text-brand-navy bg-[#1e3a8a] text-white shadow-md'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            <span>⚡</span> One-Time / Down-Payment Plan
          </button>
        </div>
      </div>

      {/* Section 1: Client & Nominee Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-4.5 shadow-xs dark:border-white/10 dark:bg-transparent">
        <h3 className="mb-3 text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
          1. Client &amp; Nominee Information
        </h3>
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
            label="Father / Husband Name"
            name="fatherName"
            value={formData.fatherName || ''}
            onChange={handleChange}
            placeholder="Son/Daughter/Wife of"
          />
          <FormField
            label="Nominee Name"
            name="nomineeName"
            value={formData.nomineeName || ''}
            onChange={handleChange}
            placeholder="e.g. Smt. Veena Pani"
          />
          <FormField
            label="Aadhar Number"
            name="aadharNumber"
            value={formData.aadharNumber || ''}
            onChange={handleChange}
            placeholder="e.g. 5360 0344 2729"
          />
          <FormField
            label="PAN Number"
            name="panNumber"
            value={formData.panNumber || ''}
            onChange={handleChange}
            placeholder="e.g. BVWPD1088B"
          />
          <FormField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <FormField
            label="Client Phone"
            name="clientPhone"
            value={formData.clientPhone || ''}
            onChange={handleChange}
            placeholder="e.g. 9050998171"
          />
          <FormField
            label="Client Email"
            name="clientEmail"
            type="email"
            value={formData.clientEmail || ''}
            onChange={handleChange}
            placeholder="e.g. client@gmail.com"
          />
        </div>
      </div>

      {/* Section 2: Property & Pricing */}
      <div className="rounded-xl border border-gray-200 bg-white p-4.5 shadow-xs dark:border-white/10 dark:bg-transparent">
        <h3 className="mb-3 text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
          2. Property &amp; Pricing
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ActiveAllotmentTicketDropdown
            value={formData.ticketId}
            onChange={(newTicket) => {
              handleChange({
                target: { name: 'ticketId', value: newTicket },
              } as unknown as React.ChangeEvent<HTMLInputElement>);
            }}
            onSelectAllotment={handleSelectAllotment}
            allotments={activeAllotments}
            loading={loadingActiveAllotments}
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
            label="Unit / Plot Number"
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
            placeholder="0"
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
                    setFormData((prev: AllotmentFormData) => ({
                      ...prev,
                      edcInEmi: e.target.checked ? 'true' : 'false',
                    }))
                  }
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    Include EDC in Installment payments only
                  </span>
                  <p className="text-[10px] text-gray-400">
                    EDC excluded from booking &amp; second instalment — added to remaining
                    Installment amount
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Payment Configuration (Dynamic by Mode) */}
      <div className="rounded-xl border border-gray-200 bg-white p-4.5 shadow-xs dark:border-white/10 dark:bg-transparent">
        <h3 className="mb-3 text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
          3. Payment Configuration ({isOneTime ? 'One-Time Settlement' : 'Monthly EMI Plan'})
        </h3>

        {isOneTime ? (
          /* One-Time Plan Fields */
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                label="Booking Date"
                name="bookingDate"
                type="date"
                value={formData.bookingDate}
                onChange={handleChange}
                required
              />
              <FormField
                label="Booking Payment Amount (₹)"
                name="bookingPaymentAmount"
                type="number"
                value={formData.bookingPaymentAmount || ''}
                onChange={handleChange}
                placeholder="e.g. 100000"
              />
              <FormField
                label="Booking Payment (%)"
                name="bookingPaymentPercent"
                type="number"
                step="0.01"
                value={formData.bookingPaymentPercent}
                onChange={handleChange}
                placeholder="e.g. 11.83"
              />
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3.5 dark:border-white/8 dark:bg-white/[0.02]">
              <h4 className="mb-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                Cheque / Transaction Details (Advance)
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <FormField
                  label="Cheque / Ref No"
                  name="chequeNumber"
                  value={formData.chequeNumber || ''}
                  onChange={handleChange}
                  placeholder="e.g. 72011005"
                />
                <FormField
                  label="Cheque Date"
                  name="chequeDate"
                  type="date"
                  value={formData.chequeDate || ''}
                  onChange={handleChange}
                />
                <FormField
                  label="Bank & Branch Name"
                  name="chequeBank"
                  value={formData.chequeBank || ''}
                  onChange={handleChange}
                  placeholder="e.g. Union Bank, Rohtak"
                />
                <FormField
                  label="Cheque Drawer Name"
                  name="chequeDrawer"
                  value={formData.chequeDrawer || ''}
                  onChange={handleChange}
                  placeholder="e.g. V. B. Sharma"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Remaining Balance Due Date"
                name="remainingDueDate"
                type="date"
                value={formData.remainingDueDate || formData.emiStartDate || ''}
                onChange={(e) => {
                  handleChange(e);
                  setFormData((prev: AllotmentFormData) => ({
                    ...prev,
                    remainingDueDate: e.target.value,
                    emiStartDate: e.target.value,
                  }));
                }}
                required
              />
              <FormField
                label="Remaining Payment Row Label"
                name="remainingPaymentLabel"
                value={formData.remainingPaymentLabel || 'Remaining Payment'}
                onChange={handleChange}
                placeholder="Remaining Payment"
              />
            </div>
          </div>
        ) : (
          /* EMI Plan Fields */
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              <FormField
                label="On Booking Payment (%)"
                name="bookingPaymentPercent"
                type="number"
                step="0.1"
                value={formData.bookingPaymentPercent}
                onChange={handleChange}
                placeholder="10"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        setFormData((prev: AllotmentFormData) => ({
                          ...prev,
                          secondPaymentDays: '15',
                        }));
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
                    className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
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

              <div className="flex items-end pb-1">
                <label className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 transition-all hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20">
                  <input
                    type="checkbox"
                    name="showSecondInstalment"
                    checked={formData.showSecondInstalment === 'true'}
                    onChange={(e) =>
                      setFormData((prev: AllotmentFormData) => ({
                        ...prev,
                        showSecondInstalment: e.target.checked ? 'true' : 'false',
                      }))
                    }
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      Show Second Instalment (20%)
                    </span>
                    <p className="text-[10px] text-gray-400">Due within specified days</p>
                  </div>
                </label>
              </div>
            </div>

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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Payment Ref No. (On Booking)"
                name="onBookingPaymentRef"
                value={formData.onBookingPaymentRef || ''}
                onChange={handleChange}
                placeholder="e.g. UPI-928341"
              />
              <FormField
                label="Payment Ref No. (Within 15 Days)"
                name="within15DaysPaymentRef"
                value={formData.within15DaysPaymentRef || ''}
                onChange={handleChange}
                placeholder="e.g. NEFT-928341"
              />
            </div>

            <div>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 transition-all hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20">
                <input
                  type="checkbox"
                  name="zeroPercentEmi"
                  checked={formData.zeroPercentEmi === 'true'}
                  onChange={(e) =>
                    setFormData((prev: AllotmentFormData) => ({
                      ...prev,
                      zeroPercentEmi: e.target.checked ? 'true' : 'false',
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
        )}
      </div>

      {/* Section 4: Special Conditions & Editable Terms */}
      <div className="rounded-xl border border-gray-200 bg-white p-4.5 shadow-xs dark:border-white/10 dark:bg-transparent">
        <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
          4. Special Conditions &amp; Custom Legal Terms (Editable)
        </h3>
        <p className="mb-3 text-[11px] text-gray-500 dark:text-gray-400">
          {isOneTime
            ? 'Cheque dishonor condition and validity terms. Admin can edit or add clauses freely.'
            : 'Custom conditions, payment terms, or remarks to display in the terms box.'}
        </p>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
              Special Condition Clause (Highlighted in red on document)
            </label>
            <textarea
              name="specialClause"
              rows={3}
              value={formData.specialClause || ''}
              onChange={handleChange}
              placeholder="e.g. This allotment letter is strictly provisional and valid subject to the realization / encashment of Cheque No..."
              className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white p-3 font-sans text-xs text-gray-900 placeholder-gray-400 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
              Custom Full Terms Text (Optional Override)
            </label>
            <textarea
              name="customTermsText"
              rows={2}
              value={formData.customTermsText || ''}
              onChange={handleChange}
              placeholder="Leave empty to use automatic standard terms, or enter custom full terms here..."
              className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white p-3 font-sans text-xs text-gray-900 placeholder-gray-400 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Advisor Details */}
      <div className="rounded-xl border border-gray-200 bg-white p-4.5 shadow-xs dark:border-white/10 dark:bg-transparent">
        <h3 className="mb-3 text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
          5. Advisor Details
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
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
                ...advisors.map((adv: AdvisorItem) => ({
                  value: adv.full_name,
                  label: adv.full_name,
                })),
                { value: 'custom', label: 'Other / Custom...' },
              ]}
            />
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
      </div>

      {/* Protected Financial Calculation Card */}
      <div className="bg-brand-navy/5 dark:bg-brand-gold/5 border-brand-navy/10 dark:border-brand-gold/10 rounded-xl border p-4.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
              Total Deal Value (Protected)
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white">
              ₹
              {totalCost.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[10px] text-gray-400">Area × BSP + PLC + EDC</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
              Booking Amount ({bookingPercent}%)
            </p>
            <p className="text-brand-gold text-xl font-black">
              ₹
              {initialPayment.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[10px] text-gray-400">Advance payable on booking</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
              Remaining Balance (Protected)
            </p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              ₹
              {remainingBalance.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[10px] text-gray-400">
              {isOneTime ? 'Due on or before scheduled date' : 'To be cleared via EMIs'}
            </p>
          </div>
        </div>
        {(parseFloat(formData.edc) || 0) > 0 && (
          <div className="mt-3 border-t border-dashed border-gray-200 pt-2 dark:border-white/10">
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
      {/* Generate / Save Button */}
      <button
        type="submit"
        disabled={isSaving}
        className={`bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all ${
          isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
      >
        <RefreshCw className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />{' '}
        {isSaving ? 'Generating...' : 'Save & Generate Letter'}
      </button>
    </form>
  );
}
