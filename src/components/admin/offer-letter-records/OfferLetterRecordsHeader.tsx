import { RefreshCw } from 'lucide-react';

interface OfferLetterRecordsHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export function OfferLetterRecordsHeader({ loading, onRefresh }: OfferLetterRecordsHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between sm:mb-8">
      <div>
        <h1 className="text-brand-navy mb-1 font-serif text-2xl tracking-tight sm:mb-2 sm:text-3xl dark:text-white">
          Offer Letter <span className="text-brand-gold italic">Records</span>
        </h1>
        <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
          View, search, audit, download, and delete all generated offer letters.
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="dark:bg-brand-dark-surface/50 flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 sm:h-10 sm:w-10 dark:border-white/10 dark:hover:bg-white/5"
        title="Refresh List"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 text-gray-600 sm:h-4 sm:w-4 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`}
        />
      </button>
    </div>
  );
}
