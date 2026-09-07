import React from 'react';
import { Calculator } from 'lucide-react';
import { FormField, FormSelect } from '@/src/components/admin/DocumentGenerator/Shared';
import { PaymentPlanFormProps } from './types';

export function PaymentPlanForm({
  formData,
  onChange,
  onSubmit,
  className = '',
}: PaymentPlanFormProps) {
  return (
    <div
      className={`dark:bg-brand-dark-surface/65 relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 ${className}`}
    >
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
        <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
          <Calculator className="text-brand-gold h-4 w-4" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Plan Configuration</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Unit Number"
            name="unitNo"
            value={formData.unitNo}
            onChange={onChange}
            required
          />
          <FormField
            label="Size of Plot (Sq. Yds.)"
            name="plotSize"
            type="number"
            value={formData.plotSize}
            onChange={onChange}
            required
          />

          <FormSelect
            label="Property Type"
            name="propertyType"
            value={formData.propertyType}
            onChange={onChange}
            className="md:col-span-2"
            options={[
              { value: 'Residential Farm House', label: 'Residential Farm House' },
              { value: 'Commercial Plot', label: 'Commercial Plot' },
              { value: 'Residential Plot', label: 'Residential Plot' },
            ]}
          />

          <FormField
            label="Cost / Sq.Yd (₹)"
            name="costPerSqYd"
            type="number"
            value={formData.costPerSqYd}
            onChange={onChange}
            required
          />
          <FormField
            label="Booking Amount (₹)"
            name="bookingAmount"
            type="number"
            value={formData.bookingAmount}
            onChange={onChange}
            required
          />
          <FormField
            label="No of EMI's Required"
            name="emis"
            type="number"
            value={formData.emis}
            onChange={onChange}
            required
          />
          <FormField
            label="Plan Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={onChange}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
        >
          <Calculator className="h-4 w-4" /> Calculate & Generate Plan
        </button>
      </form>
    </div>
  );
}
