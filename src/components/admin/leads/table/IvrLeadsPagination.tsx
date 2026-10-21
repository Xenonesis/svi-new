import { ChevronLeft, ChevronRight } from 'lucide-react';

interface IvrLeadsPaginationProps {
  currentCount: number;
  totalCount: number;
  page: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function IvrLeadsPagination({
  currentCount,
  totalCount,
  page,
  totalPages,
  loading,
  onPageChange,
}: IvrLeadsPaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-xs text-gray-500 dark:border-white/5 dark:text-gray-400">
      <div>
        Showing <span className="font-semibold text-gray-900 dark:text-white">{currentCount}</span>{' '}
        of <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span> records
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 font-medium transition-colors hover:bg-gray-100 disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/5"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </button>
        <span className="px-2 font-medium">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 font-medium transition-colors hover:bg-gray-100 disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/5"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
