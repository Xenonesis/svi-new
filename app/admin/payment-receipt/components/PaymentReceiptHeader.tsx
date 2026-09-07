import React from 'react';
import { Plus } from 'lucide-react';

interface PaymentReceiptHeaderProps {
  onReset?: () => void;
  handleResetForm?: () => void;
}

export default function PaymentReceiptHeader({
  onReset,
  handleResetForm,
}: PaymentReceiptHeaderProps) {
  const resetHandler = onReset || handleResetForm;

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
          Payment Receipt <span className="text-brand-gold italic">Generator</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Generate official payment receipts for client transactions.
        </p>
      </div>
      <button
        type="button"
        onClick={resetHandler}
        className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 flex w-fit items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold tracking-wide uppercase shadow-sm transition-all active:scale-95"
        title="Reset form and start a new receipt with next sequential number"
      >
        <Plus className="h-4 w-4" /> New Receipt
      </button>
    </div>
  );
}
