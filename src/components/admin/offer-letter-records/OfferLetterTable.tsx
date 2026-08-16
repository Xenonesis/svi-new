'use client';

import { motion } from 'motion/react';
import {
  Search,
  Trash2,
  Eye,
  Calendar,
  RefreshCw,
  X,
  WifiOff,
  Plus,
  FileText,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { SkeletonBlock } from '@/src/components/ui/DynamicSkeleton';
import { StatCardSkeleton, TableSkeleton } from '@/src/components/admin/Shared/AdminSkeleton';

interface SavedOfferLetter {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  form_data: {
    date: string;
    name: string;
    address: string;
    mobileNo: string;
    alternativeNo: string;
    emailId: string;
    designation: string;
    department: string;
    reportingTo: string;
    appointmentDate: string;
    location: string;
    salaryCtc: string;
    target: string;
    offerSlab: string;
    workingHoursStart: string;
    workingHoursEnd: string;
    workingDays: string;
    probationPeriod: string;
  };
}

interface OfferLetterTableProps {
  offers: SavedOfferLetter[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onSortChange: (config: { key: string; direction: 'asc' | 'desc' }) => void;
  onClearFilters: () => void;
  onView: (offer: SavedOfferLetter) => void;
  onDelete: (offer: SavedOfferLetter) => void;
  onRetry: () => void;
}

export function OfferLetterTable({
  offers,
  loading,
  error,
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  sortConfig,
  onSortChange,
  onClearFilters,
  onView,
  onDelete,
  onRetry,
}: OfferLetterTableProps) {
  const filteredOffers = useMemo(() => {
    return offers
      .filter((r) => {
        const query = searchQuery.toLowerCase();
        const name = (r.form_data?.name || '').toLowerCase();
        const designation = (r.form_data?.designation || '').toLowerCase();
        const department = (r.form_data?.department || '').toLowerCase();
        const mobileNo = (r.form_data?.mobileNo || '').toLowerCase();
        const matchesSearch =
          name.includes(query) ||
          designation.includes(query) ||
          department.includes(query) ||
          mobileNo.includes(query);

        let matchesDate = true;
        if (dateRange.start || dateRange.end) {
          const recordDate = new Date(r.created_at);
          if (dateRange.start && new Date(dateRange.start) > recordDate) matchesDate = false;
          if (dateRange.end) {
            const endD = new Date(dateRange.end);
            endD.setHours(23, 59, 59, 999);
            if (endD < recordDate) matchesDate = false;
          }
        }

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        if (sortConfig.key === 'date') {
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
        }
        if (sortConfig.key === 'name') {
          return (a.form_data?.name || '').localeCompare(b.form_data?.name || '') * dir;
        }
        if (sortConfig.key === 'ctc') {
          const ctcA = parseFloat(a.form_data?.salaryCtc || '0');
          const ctcB = parseFloat(b.form_data?.salaryCtc || '0');
          return (ctcA - ctcB) * dir;
        }
        return 0;
      });
  }, [offers, searchQuery, sortConfig, dateRange]);

  return (
    <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-3.5 shadow-xl backdrop-blur-xl sm:rounded-2xl sm:p-6 dark:border-white/8">
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:gap-4">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64 sm:max-w-xs">
            <Search className="text-brand-gold absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 sm:left-3 sm:h-4 sm:w-4" />
            <input
              type="text"
              placeholder="Search by name, role, dept..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="focus:border-brand-gold dark:bg-brand-dark-surface w-full rounded-lg border border-gray-200 bg-white py-1.5 pr-3 pl-8 text-xs text-gray-900 transition-colors focus:outline-none sm:py-2 sm:pr-4 sm:pl-9 dark:border-white/8 dark:text-white"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            {/* Date Range Inputs */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar className="text-brand-gold h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                aria-label="Start date"
                className="focus:border-brand-gold dark:bg-brand-dark-surface min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-[11px] text-gray-700 [color-scheme:light] outline-none sm:flex-initial sm:px-2 sm:py-1.5 sm:text-xs dark:border-white/10 dark:text-white dark:[color-scheme:dark]"
              />
              <span className="text-xs text-gray-400">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                aria-label="End date"
                className="focus:border-brand-gold dark:bg-brand-dark-surface min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-1.5 py-1 text-[11px] text-gray-700 [color-scheme:light] outline-none sm:flex-initial sm:px-2 sm:py-1.5 sm:text-xs dark:border-white/10 dark:text-white dark:[color-scheme:dark]"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="w-full sm:w-auto">
              <select
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-');
                  onSortChange({ key, direction: direction as 'asc' | 'desc' });
                }}
                aria-label="Sort records"
                className="focus:border-brand-gold dark:bg-brand-dark-surface w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-700 [color-scheme:light] outline-none sm:w-auto sm:px-3 sm:py-2 sm:text-xs sm:font-bold dark:border-white/10 dark:text-gray-200 dark:[color-scheme:dark]"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="ctc-desc">CTC (High-Low)</option>
                <option value="ctc-asc">CTC (Low-High)</option>
              </select>
            </div>
          </div>
        </div>

        {(searchQuery || dateRange.start || dateRange.end) && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400">Active Filters:</span>
            <button
              onClick={onClearFilters}
              className="text-brand-gold hover:text-brand-navy flex items-center gap-1 font-medium transition-colors dark:hover:text-white"
            >
              <X className="h-3 w-3" />
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <>
            <div className="animate-pulse border-b border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-white/8 dark:bg-white/5">
              <div className="flex items-center gap-4">
                {[
                  'Date',
                  'Name',
                  'Designation',
                  'Dept',
                  'Location',
                  'CTC',
                  'Status',
                  'Actions',
                ].map((h, idx) => (
                  <SkeletonBlock
                    key={h}
                    className={`h-3.5 ${idx === 7 ? 'ml-auto w-24' : 'w-16'}`}
                  />
                ))}
              </div>
            </div>
            <TableSkeleton />
          </>
        ) : error ? (
          <div className="py-24 text-center font-sans">
            <WifiOff className="mx-auto mb-4 h-12 w-12 text-red-400 dark:text-red-600" />
            <p className="mb-2 text-sm font-medium text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={onRetry}
              className="text-brand-gold hover:text-brand-gold-light mx-auto mt-2 flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
              No records found
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "We couldn't find any offer letters matching your current filters."
                : 'No offer letters generated yet.'}
            </p>
            {searchQuery || dateRange.start || dateRange.end ? (
              <button
                onClick={onClearFilters}
                className="text-brand-gold hover:bg-brand-gold/10 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Clear all filters
              </button>
            ) : (
              <Link
                href="/admin/offer-letter"
                className="bg-brand-gold mt-2 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold text-white uppercase shadow-md transition-all hover:bg-yellow-500"
              >
                <Plus className="h-3.5 w-3.5" />
                Create New Offer Letter
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold tracking-widest text-gray-400 uppercase dark:border-white/8">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Candidate Name</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">CTC (Monthly)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 dark:divide-white/5 dark:text-gray-300">
              {filteredOffers.map((record, i) => {
                const ctc = parseFloat(record.form_data?.salaryCtc || '0');
                const formattedCtc = ctc.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                });

                return (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.3, ease: 'easeOut' }}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/2"
                  >
                    <td className="text-brand-gold px-4 py-3.5 font-bold">
                      {record.created_at
                        ? new Date(record.created_at).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                      {record.form_data?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5">{record.form_data?.designation || 'N/A'}</td>
                    <td className="px-4 py-3.5">{record.form_data?.department || 'N/A'}</td>
                    <td className="px-4 py-3.5">{record.form_data?.location || 'N/A'}</td>
                    <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                      {formattedCtc}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          record.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {record.status === 'completed' ? 'Completed' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onView(record)}
                          className="hover:text-brand-gold hover:bg-brand-gold/10 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors"
                          title="View & Print"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/admin/offer-letter?templateId=${record.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                          title="Use as Template"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            sessionStorage.setItem('emailPrefillRecord', JSON.stringify(record));
                            window.location.href = '/admin/email?tab=compose&prefillOffer=true';
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
                          title="Email Client"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(record)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
