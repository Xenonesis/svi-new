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
  MapPin,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { SkeletonBlock } from '@/src/components/ui/DynamicSkeleton';
import { SavedOfferLetter } from '@/src/components/admin/OfferLetter/types';

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
        const location = (r.form_data?.location || '').toLowerCase();
        const matchesSearch =
          name.includes(query) ||
          designation.includes(query) ||
          department.includes(query) ||
          mobileNo.includes(query) ||
          location.includes(query);

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

  const formatDateTimeParts = (dateStr?: string) => {
    if (!dateStr) return { date: '—', time: '' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: dateStr, time: '' };
      const date = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const time = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return { date, time };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  return (
    <div className="dark:bg-brand-dark-surface/80 relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 p-4 shadow-xl backdrop-blur-xl transition-colors duration-300 sm:p-6 dark:border-white/10">
      {/* Top Gold Accent Glow */}
      <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      {/* Search and Filters Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md">
          <Search className="text-brand-gold absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by candidate name, role, dept, location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="focus:border-brand-gold/80 focus:ring-brand-gold/20 dark:bg-brand-dark-surface/85 w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-10 pl-10 text-xs text-gray-900 placeholder-gray-400 shadow-xs transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:text-white dark:placeholder-gray-500"
            aria-label="Search offer letters"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="hover:text-brand-gold absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Controls: Date range + Sort */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          {/* Date Range Inputs */}
          <div className="dark:bg-brand-dark-surface/85 flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs shadow-xs dark:border-white/10">
            <Calendar className="text-brand-gold h-3.5 w-3.5 shrink-0" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              aria-label="Start date"
              className="w-24 bg-transparent text-[11px] font-medium text-gray-700 outline-none dark:text-gray-200"
            />
            <span className="text-gray-400">—</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              aria-label="End date"
              className="w-24 bg-transparent text-[11px] font-medium text-gray-700 outline-none dark:text-gray-200"
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
              className="focus:border-brand-gold dark:bg-brand-dark-surface/85 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-xs outline-none sm:w-auto dark:border-white/10 dark:text-gray-200"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="ctc-desc">CTC (High-Low)</option>
              <option value="ctc-asc">CTC (Low-High)</option>
            </select>
          </div>

          {(searchQuery || dateRange.start || dateRange.end) && (
            <button
              onClick={onClearFilters}
              className="hover:border-brand-gold/30 hover:bg-brand-gold/10 text-brand-gold flex items-center gap-1 rounded-xl border border-transparent px-3 py-1.5 text-xs font-bold transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-4 w-36" />
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-20 rounded-full" />
                <div className="ml-auto flex gap-1.5">
                  <SkeletonBlock className="h-8 w-8 rounded-lg" />
                  <SkeletonBlock className="h-8 w-8 rounded-lg" />
                  <SkeletonBlock className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-24 text-center font-sans">
            <WifiOff className="mx-auto mb-4 h-12 w-12 text-red-400 dark:text-red-500" />
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
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
              <Briefcase className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="mb-1 text-base font-bold text-gray-900 dark:text-white">
              No offer letters found
            </h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              {searchQuery || dateRange.start || dateRange.end
                ? "We couldn't find any offer letters matching your current filters."
                : 'No offer letter records generated yet.'}
            </p>
            {searchQuery || dateRange.start || dateRange.end ? (
              <button
                onClick={onClearFilters}
                className="text-brand-gold hover:bg-brand-gold/10 rounded-xl px-4 py-2 text-xs font-bold transition-colors"
              >
                Clear all filters
              </button>
            ) : (
              <Link
                href="/admin/offer-letter"
                className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase shadow-md transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Create New Offer Letter
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full min-w-[980px] font-sans text-xs">
            <thead>
              <tr className="border-b border-gray-200/80 bg-gray-50/80 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                {[
                  { label: 'DATE & TIME', align: 'text-left' },
                  { label: 'CANDIDATE NAME', align: 'text-left' },
                  { label: 'DESIGNATION', align: 'text-left' },
                  { label: 'DEPARTMENT', align: 'text-left' },
                  { label: 'LOCATION', align: 'text-left' },
                  { label: 'CTC (MONTHLY)', align: 'text-right' },
                  { label: 'STATUS', align: 'text-center' },
                  { label: 'ACTIONS', align: 'text-right' },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={`px-5 py-4 text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase dark:text-gray-400 ${h.align}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredOffers.map((record, i) => {
                const ctc = parseFloat(record.form_data?.salaryCtc || '0');
                const formattedCtc = ctc.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                });
                const { date, time } = formatDateTimeParts(record.created_at);
                const isCompleted = record.status === 'completed';

                return (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.2), duration: 0.25 }}
                    className="group transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.03]"
                  >
                    {/* Date & Time */}
                    <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 shrink-0 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="font-mono text-[11px] font-medium text-gray-800 tabular-nums dark:text-gray-200">
                            {date}
                          </span>
                          {time && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                              {time}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Candidate Name */}
                    <td className="px-5 py-3.5 align-middle">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-gray-900 capitalize dark:text-white">
                          {record.form_data?.name || 'N/A'}
                        </div>
                        {record.form_data?.mobileNo && (
                          <div className="font-mono text-[10px] text-gray-400 dark:text-gray-500">
                            {record.form_data.mobileNo}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="px-5 py-3.5 align-middle font-medium whitespace-nowrap text-gray-700 capitalize dark:text-gray-300">
                      {record.form_data?.designation || 'N/A'}
                    </td>

                    {/* Department */}
                    <td className="px-5 py-3.5 align-middle">
                      <span className="inline-block rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 font-medium whitespace-nowrap text-gray-700 capitalize dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                        {record.form_data?.department || 'N/A'}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-3.5 align-middle">
                      {record.form_data?.location ? (
                        <div
                          className="flex max-w-[200px] items-center gap-1 text-gray-600 dark:text-gray-400"
                          title={record.form_data.location}
                        >
                          <MapPin className="h-3 w-3 shrink-0 text-amber-500/70" />
                          <span className="truncate text-xs font-medium">
                            {record.form_data.location}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* CTC */}
                    <td className="px-5 py-3.5 text-right align-middle font-mono text-xs font-bold text-gray-900 tabular-nums dark:text-white">
                      {formattedCtc}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 text-center align-middle">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap ${
                          isCompleted
                            ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        {isCompleted ? 'Completed' : 'Draft'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right align-middle">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(record)}
                          className="hover:border-brand-gold/30 hover:bg-brand-gold/10 hover:text-brand-gold flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 active:scale-95"
                          title="View & Print Offer Letter"
                          aria-label="View & Print"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          href={`/admin/offer-letter?templateId=${record.id}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500 active:scale-95"
                          title="Use as Template"
                          aria-label="Use as Template"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            sessionStorage.setItem('emailPrefillRecord', JSON.stringify(record));
                            window.location.href = '/admin/email?tab=compose&prefillOffer=true';
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-500 active:scale-95"
                          title="Email Offer Letter to Candidate"
                          aria-label="Email Candidate"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(record)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 active:scale-95"
                          title="Delete Offer Letter"
                          aria-label="Delete Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
