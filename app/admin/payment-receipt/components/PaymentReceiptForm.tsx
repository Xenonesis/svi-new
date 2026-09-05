import { FormField, FormSelect } from '@/src/components/admin/DocumentGenerator/Shared';
import { Receipt, RefreshCw } from 'lucide-react';
import React from 'react';

interface PaymentReceiptFormProps {
  formData: {
    receiptNo: string;
    date: string;
    salutation: string;
    name: string;
    refId: string;
    amount: string;
    amountWords: string;
    paymentRef: string;
    drawnOn: string;
    plotNo: string;
    plotSize: string;
    account: string;
    paymentMethod: string;
    clientPhone?: string;
  };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  isSubmitting?: boolean;
}

export default function PaymentReceiptForm({
  formData,
  handleChange,
  handleSubmit,
  termsAccepted,
  setTermsAccepted,
  isSubmitting = false,
}: PaymentReceiptFormProps) {
  return (
    <div className="dark:bg-brand-dark-surface/65 relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
        <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
          <Receipt className="text-brand-gold h-4 w-4" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Receipt Number"
            name="receiptNo"
            value={formData.receiptNo}
            onChange={handleChange}
            required
            disabled
          />
          <FormField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <FormSelect
            label="Salutation"
            name="salutation"
            value={formData.salutation}
            onChange={handleChange}
            options={[
              { value: 'Mr.', label: 'Mr.' },
              { value: 'Mrs.', label: 'Mrs.' },
              { value: 'Ms.', label: 'Ms.' },
              { value: 'M/s', label: 'M/s' },
            ]}
          />
          <FormField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormField
            label="Ref. Id"
            name="refId"
            value={formData.refId}
            onChange={handleChange}
            required
          />
          <FormField
            label="Client Mobile / WhatsApp"
            name="clientPhone"
            type="tel"
            placeholder="10-digit mobile number"
            value={formData.clientPhone || ''}
            onChange={handleChange}
          />
          <FormField
            label="Amount (in digits)"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            required
          />

          <FormField
            label="Amount (in words)"
            name="amountWords"
            value={formData.amountWords}
            onChange={handleChange}
            required
            className="md:col-span-2"
          />

          <FormSelect
            label="Payment Method"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Cheque', label: 'Cheque' },
              { value: 'Credit Card', label: 'Credit Card' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'UPI', label: 'UPI' },
            ]}
          />

          <FormField
            label="Payment Reference Number"
            name="paymentRef"
            value={formData.paymentRef}
            onChange={handleChange}
            required
          />
          <FormField
            label="Drawn On"
            name="drawnOn"
            type="date"
            value={formData.drawnOn}
            onChange={handleChange}
          />
          <FormField
            label="Plot No"
            name="plotNo"
            value={formData.plotNo}
            onChange={handleChange}
          />
          <FormField
            label="Plot Size"
            name="plotSize"
            value={formData.plotSize}
            onChange={handleChange}
            required
          />

          <FormField
            label="On Account Of"
            name="account"
            value={formData.account}
            onChange={handleChange}
            required
            className="md:col-span-2"
          />

          {/* Terms and Conditions Checkbox - Only show for ₹2100 */}
          {parseFloat(formData.amount) === 2100 && (
            <div className="border-brand-gold/30 bg-brand-gold/5 rounded-lg border-2 p-4 md:col-span-2">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="text-brand-gold focus:ring-brand-gold mt-1 h-5 w-5 cursor-pointer rounded border-gray-300"
                  required
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <strong className="text-brand-navy dark:text-white">Terms & Conditions:</strong>{' '}
                  This is a refundable amount of ₹2100. If your name is not selected in the draw,
                  the amount will be automatically refunded within the next 48 hours.
                </span>
              </label>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
          {isSubmitting ? 'Generating...' : 'Generate Receipt'}
        </button>
      </form>
    </div>
  );
}
