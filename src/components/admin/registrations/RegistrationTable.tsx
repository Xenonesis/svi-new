'use client';

import {
  Users,
  Star,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  FileText,
  Receipt,
} from 'lucide-react';
import { motion } from 'motion/react';
import { STATUS_OPTIONS } from './types';
import type { Registration } from './types';

function TableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full animate-pulse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50 dark:bg-white/2">
            <th className="w-10 px-4 py-4"></th>
            {[
              'Submission ID',
              'Name',
              'Email',
              'Phone',
              'Project',
              'Advisor',
              'Status',
              'Date',
              'Actions',
            ].map((h) => (
              <th
                key={h}
                className="px-6 py-4 text-left text-[9px] font-bold tracking-widest text-gray-400 uppercase"
              >
                <div className="h-3 w-16 rounded bg-gray-200 dark:bg-white/5" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {[...Array(6)].map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-4.5"></td>
              {[...Array(9)].map((__, j) => (
                <td key={j} className="px-6 py-4.5">
                  <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/5" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({
  hasFilters,
  hasSearch,
  onClear,
}: {
  hasFilters: boolean;
  hasSearch: boolean;
  onClear: () => void;
}) {
  return (
    <div className="py-24 text-center">
      <Users className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-700" />
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {hasSearch || hasFilters ? 'No matches found.' : 'No registrations yet.'}
      </p>
      {(hasSearch || hasFilters) && (
        <button onClick={onClear} className="text-brand-gold mt-2 text-xs underline">
          Clear filters
        </button>
      )}
    </div>
  );
}

function StarButton({
  isImportant,
  onToggle,
}: {
  isImportant?: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-center text-gray-300 transition-colors hover:text-amber-500"
      title={isImportant ? 'Important (starred)' : 'Mark as important'}
    >
      <Star
        className={`h-4.5 w-4.5 transition-all ${
          isImportant
            ? 'scale-110 fill-amber-500 text-amber-500'
            : 'hover:scale-110 hover:text-amber-400'
        }`}
      />
    </button>
  );
}

interface RegistrationTableProps {
  registrations: Registration[];
  loading: boolean;
  hasFilters: boolean;
  hasSearch: boolean;
  total: number;
  page: number;
  hasMore: boolean;
  startItem: number;
  endItem: number;
  onStarToggle: (reg: Registration) => void;
  onStatusChange: (id: string, status: string) => void;
  onView: (reg: Registration) => void;
  onDelete: (reg: Registration) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
}

export function RegistrationTable({
  registrations,
  loading,
  hasFilters,
  hasSearch,
  total,
  page,
  hasMore,
  startItem,
  endItem,
  onStarToggle,
  onStatusChange,
  onView,
  onDelete,
  onClearFilters,
  onPageChange,
}: RegistrationTableProps) {
  return (
    <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/8">
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

      {loading ? (
        <TableSkeleton />
      ) : registrations.length === 0 ? (
        <EmptyState hasFilters={hasFilters} hasSearch={hasSearch} onClear={onClearFilters} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="dark:border-brand-gold/15 border-b border-gray-200 bg-gray-50/50 dark:bg-white/2">
                <th className="w-10 px-4 py-4"></th>
                {[
                  'Submission ID',
                  'Name',
                  'Email',
                  'Phone',
                  'Project',
                  'Advisor',
                  'Status',
                  'Date',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-[9px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg, i) => (
                <motion.tr
                  key={reg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.4 }}
                  className="group border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-white/5 dark:hover:bg-[#111118]/60"
                >
                  <td className="px-4 py-4.5 text-center">
                    <StarButton
                      isImportant={reg.is_important}
                      onToggle={(e) => {
                        e.stopPropagation();
                        onStarToggle(reg);
                      }}
                    />
                  </td>
                  <td className="px-6 py-4.5">
                    {reg.submission_id ? (
                      <span className="bg-brand-gold/10 text-brand-gold inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-bold tracking-wider">
                        {reg.submission_id}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="font-semibold tracking-wide text-gray-900 dark:text-white">
                      {reg.name} {reg.last_name || ''}
                    </div>
                    {reg.so_wo_do && (
                      <div className="mt-0.5 text-xs text-gray-400">{reg.so_wo_do}</div>
                    )}
                  </td>
                  <td className="px-6 py-4.5 font-medium text-gray-700 dark:text-gray-300">
                    {reg.email}
                  </td>
                  <td className="px-6 py-4.5 text-gray-700 dark:text-gray-300">{reg.phone}</td>
                  <td className="px-6 py-4.5">
                    <span className="text-brand-gold/90 font-semibold">
                      {reg.project || reg.property_interest || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-gray-700 dark:text-gray-300">
                    {reg.advisor_name || '—'}
                  </td>
                  <td className="px-6 py-4.5">
                    <select
                      value={reg.status}
                      onChange={(e) => onStatusChange(reg.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="focus:border-brand-gold appearance-none rounded border border-transparent bg-transparent px-1 py-0.5 text-[10px] font-bold uppercase outline-none hover:border-gray-200 dark:hover:border-white/10"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4.5 text-xs whitespace-nowrap text-gray-500">
                    {new Date(reg.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 transition-all group-hover:opacity-100">
                      <button
                        onClick={() => onView(reg)}
                        className="hover:text-brand-gold hover:bg-brand-gold/10 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          sessionStorage.setItem(
                            'allotmentPrefillRegistration',
                            JSON.stringify(reg)
                          );
                          window.location.href = '/admin/allotment-letter?prefillRegistration=true';
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                        title="Generate Document"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          sessionStorage.setItem('emailPrefillRegistration', JSON.stringify(reg));
                          window.location.href =
                            '/admin/email?tab=compose&prefillRegistration=true';
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
                        title="Email Client"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          sessionStorage.setItem('receiptPrefillRegistration', JSON.stringify(reg));
                          window.location.href = '/admin/payment-receipt?prefillRegistration=true';
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-500/10 dark:hover:text-green-400"
                        title="Payment Receipt"
                      >
                        <Receipt className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(reg)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-white/8">
          <p className="text-xs text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-300">{startItem}</span>
            {' - '}
            <span className="font-semibold text-gray-700 dark:text-gray-300">{endItem}</span>
            {' of '}
            <span className="font-semibold text-gray-700 dark:text-gray-300">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="hover:border-brand-gold hover:text-brand-gold flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[2rem] text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
              {page}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!hasMore}
              className="hover:border-brand-gold hover:text-brand-gold flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
