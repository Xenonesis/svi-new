import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NotificationPaginationProps {
  currentPage: number;
  totalPages: number;
  fetchNotifications: (page: number) => void;
  getPageNumbers: () => number[];
}

export function NotificationPagination({
  currentPage,
  totalPages,
  fetchNotifications,
  getPageNumbers,
}: NotificationPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <>
      <div className="mt-8 flex items-center justify-center gap-2">
        <button
          onClick={() => fetchNotifications(currentPage - 1)}
          disabled={currentPage <= 1}
          className="hover:border-brand-gold hover:text-brand-gold flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 transition-colors disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:text-gray-400"
        >
          <ChevronLeft size={14} />
          Prev
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => fetchNotifications(page)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
              page === currentPage
                ? 'bg-brand-gold text-brand-navy'
                : 'hover:border-brand-gold hover:text-brand-gold border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => fetchNotifications(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="hover:border-brand-gold hover:text-brand-gold flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 transition-colors disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:text-gray-400"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-gray-400">
        Page {currentPage} of {totalPages}
      </p>
    </>
  );
}
