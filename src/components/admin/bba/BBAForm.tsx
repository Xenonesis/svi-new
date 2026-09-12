import React from 'react';
import { FormField, FormSelect } from '@/src/components/admin/DocumentGenerator/Shared';
import { RefreshCw, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
interface BBAFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  advisors: any[];
  projects: any[];
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
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleUpdateExisting?: (e?: React.FormEvent) => Promise<void>;
  handleCreateNew?: (e?: React.FormEvent) => Promise<void>;
  documentId?: string | null;
  isSubmitting?: boolean;
  totalCost: number;
  initialPayment: number;
}

export function BBAForm({
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
  handleUpdateExisting,
  handleCreateNew,
  documentId,
  isSubmitting,
  totalCost,
  initialPayment,
}: BBAFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-brand-gold/20 bg-brand-gold/5 mb-6 rounded-xl border p-4">
        <p className="text-brand-gold mb-3 text-[10px] font-bold tracking-widest uppercase">
          Document Settings
        </p>
        <div className="w-full md:w-1/2">
          <FormSelect
            label="BBA Language"
            name="language"
            value={formData.language || 'en'}
            onChange={handleChange}
            options={[
              { value: 'en', label: 'English' },
              { value: 'hi', label: 'Hindi' },
            ]}
          />
        </div>
      </div>

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
        <FormField
          label="Age (Years)"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="e.g. 45"
        />
        <FormField
          label="PAN Number (Optional)"
          name="panNumber"
          value={formData.panNumber || ''}
          onChange={handleChange}
          placeholder="e.g. ABCDE1234F"
        />
        <FormField
          label="Mobile Number (Optional)"
          name="mobileNumber"
          value={formData.mobileNumber || ''}
          onChange={handleChange}
          placeholder="e.g. 9876543210"
        />
        <FormField
          label="Email Address (Optional)"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          placeholder="e.g. client@example.com"
        />
      </div>

      <div className="border-brand-navy/10 bg-brand-navy/5 col-span-full rounded-xl border p-4 dark:border-white/10 dark:bg-white/5">
        <p className="mb-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          Nominee Details (Optional - In case of demise of Allottee)
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Nominee Name"
            name="nomineeName"
            value={formData.nomineeName || ''}
            onChange={handleChange}
            placeholder="e.g. Sunita Sharma"
          />
          <FormField
            label="Relationship with Allottee"
            name="nomineeRelation"
            value={formData.nomineeRelation || ''}
            onChange={handleChange}
            placeholder="e.g. Wife / Son / Daughter"
          />
          <FormField
            label="Nominee Age (Years)"
            name="nomineeAge"
            value={formData.nomineeAge || ''}
            onChange={handleChange}
            placeholder="e.g. 42"
          />
          <FormField
            label="Nominee Address"
            name="nomineeAddress"
            value={formData.nomineeAddress || ''}
            onChange={handleChange}
            placeholder="Leave blank if same as client address"
          />
        </div>
      </div>

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
        <div className="space-y-1">
          <FormField
            label="PLC (%)"
            name="plc"
            type="number"
            value={formData.plc}
            onChange={handleChange}
            placeholder="e.g. 5, 10 or 15"
            min="0"
            step="any"
          />
          {Number(formData.plc) > 30 && (
            <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              ⚠️ Warning: PLC is entered as percentage (%). {formData.plc}% adds{' '}
              {Number(formData.plc).toFixed(0)}% to base price. If you intended ₹/sq.yd, convert to
              %.
            </p>
          )}
        </div>

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
                  setFormData((prev: any) => ({ ...prev, secondPaymentDays: '15' }));
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

        <FormField
          label="Payment Reference No. (On Booking)"
          name="onBookingPaymentRef"
          value={formData.onBookingPaymentRef}
          onChange={handleChange}
          placeholder="e.g. Txn/Receipt No."
        />
        <FormField
          label="Amount Paid (On Booking) ₹"
          name="onBookingAmount"
          value={formData.onBookingAmount}
          onChange={handleChange}
          placeholder="e.g. 106645"
          type="number"
        />
        <FormField
          label="Payment Reference No. (Within 15 Days)"
          name="within15DaysPaymentRef"
          value={formData.within15DaysPaymentRef}
          onChange={handleChange}
          placeholder="e.g. Txn/Receipt No."
        />
        <FormField
          label="Amount Paid (Within 15 Days) ₹"
          name="within15DaysAmount"
          value={formData.within15DaysAmount}
          onChange={handleChange}
          placeholder="e.g. 213290"
          type="number"
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
                  The advisor list is currently empty. To populate this list dynamically, navigate
                  to the{' '}
                  <Link
                    href="/admin/registrations"
                    className="text-brand-gold hover:text-brand-gold-light font-bold underline transition-colors"
                  >
                    Registrations Config Page
                  </Link>{' '}
                  and click{' '}
                  <strong className="text-gray-800 dark:text-gray-200">Manage Advisors</strong> to
                  check dynamic active accounts. Alternatively, select{' '}
                  <strong className="text-gray-800 dark:text-gray-200">Other / Custom...</strong>{' '}
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

      {documentId ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleUpdateExisting || handleSubmit}
            disabled={isSubmitting}
            className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Update Existing BBA
          </button>
          <button
            type="button"
            onClick={handleCreateNew || handleSubmit}
            disabled={isSubmitting}
            className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10 hover:border-brand-gold dark:border-brand-gold/40 dark:text-brand-gold dark:hover:bg-brand-gold/10 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create New BBA
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Generate BBA
        </button>
      )}
    </form>
  );
}
