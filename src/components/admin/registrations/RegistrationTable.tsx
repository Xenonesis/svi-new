'use client';

import React, { useMemo } from 'react';
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
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';

import { STATUS_OPTIONS } from './types';
import type { Registration } from './types';

// ==========================================
// Sub-components
// ==========================================

function TableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50 dark:bg-white/5">
            <th className="w-10 px-4 py-4"></th>
            {[...Array(8)].map((_, i) => (
              <th key={i} className="px-6 py-4 text-left">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {[...Array(6)].map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-4.5"></td>
              {[...Array(8)].map((__, j) => (
                <td key={j} className="px-6 py-4.5">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-white/5" />
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
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5">
        <Users className="h-8 w-8 text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {hasSearch || hasFilters ? 'No matches found' : 'No registrations yet'}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {hasSearch || hasFilters
          ? 'Try adjusting your search query or removing some filters to find what you are looking for.'
          : 'When new property registrations are submitted, they will appear here.'}
      </p>
      {(hasSearch || hasFilters) && (
        <button
          onClick={onClear}
          className="bg-brand-gold hover:bg-brand-gold/90 mt-6 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors"
        >
          Clear all filters
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
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <Star
              className={`h-4.5 w-4.5 transition-all duration-300 ${
                isImportant
                  ? 'scale-110 fill-amber-500 text-amber-500 drop-shadow-md'
                  : 'text-gray-300 hover:scale-110 hover:text-amber-400 dark:text-gray-600'
              }`}
            />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="animate-in fade-in zoom-in-95 z-50 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-md dark:border-white/10 dark:bg-gray-900 dark:text-white"
            sideOffset={5}
          >
            {isImportant ? 'Unmark important' : 'Mark as important'}
            <Tooltip.Arrow className="fill-white dark:fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'contacted':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle2 className="mr-1 h-3 w-3" />;
      case 'pending':
        return <Clock className="mr-1 h-3 w-3" />;
      case 'contacted':
        return <CheckCircle2 className="mr-1 h-3 w-3" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="mr-1 h-3 w-3" />;
      default:
        return <AlertCircle className="mr-1 h-3 w-3" />;
    }
  };

  const option = STATUS_OPTIONS.find((s) => s.value === status);
  const label = option ? option.label : status;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase shadow-sm ${getStatusStyles()}`}
    >
      {getIcon()}
      {label}
    </span>
  );
};

// ==========================================
// Main Component
// ==========================================

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

const columnHelper = createColumnHelper<Registration>();

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
  // Define columns using useMemo to prevent recreation
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'star',
        header: '',
        cell: (info) => {
          const reg = info.row.original;
          return (
            <div className="flex justify-center">
              <StarButton isImportant={reg.is_important} onToggle={() => onStarToggle(reg)} />
            </div>
          );
        },
        size: 50,
      }),
      columnHelper.accessor('submission_id', {
        header: 'ID',
        cell: (info) =>
          info.getValue() ? (
            <span className="bg-brand-gold/10 text-brand-gold inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-bold tracking-wider">
              {info.getValue()}
            </span>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          ),
      }),
      columnHelper.accessor('name', {
        header: 'Applicant',
        cell: (info) => {
          const reg = info.row.original;
          return (
            <div>
              <div className="font-semibold tracking-wide text-gray-900 dark:text-white">
                {reg.name} {reg.last_name || ''}
              </div>
              <div className="mt-0.5 flex flex-col gap-0.5">
                <span className="text-xs font-medium text-gray-500">{reg.email}</span>
                <span className="text-[10px] text-gray-400">{reg.phone}</span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('project', {
        header: 'Project / Advisor',
        cell: (info) => {
          const reg = info.row.original;
          return (
            <div>
              <div className="text-brand-gold dark:text-brand-gold/90 font-semibold">
                {reg.project || reg.property_interest || '—'}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                {reg.advisor_name || 'Direct'}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const reg = info.row.original;
          return (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="focus:ring-brand-gold/50 rounded-full ring-offset-2 ring-offset-white outline-none focus:ring-2 dark:ring-offset-[#111118]">
                  <StatusBadge status={reg.status} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="animate-in fade-in zoom-in-95 z-50 min-w-[140px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#1a1a24]"
                  sideOffset={8}
                >
                  <DropdownMenu.Label className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                    Update Status
                  </DropdownMenu.Label>
                  {STATUS_OPTIONS.map((status) => (
                    <DropdownMenu.Item
                      key={status.value}
                      onClick={() => onStatusChange(reg.id, status.value)}
                      className="group relative flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-gray-700 outline-none select-none hover:bg-gray-100 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white dark:data-[highlighted]:bg-white/5 dark:data-[highlighted]:text-white"
                    >
                      <div
                        className={`mr-2 h-2 w-2 rounded-full ${
                          status.value === 'Approved'
                            ? 'bg-emerald-500'
                            : status.value === 'Pending'
                              ? 'bg-amber-500'
                              : status.value === 'Rejected'
                                ? 'bg-red-500'
                                : 'bg-gray-400'
                        }`}
                      />
                      {status.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          );
        },
      }),
      columnHelper.accessor('created_at', {
        header: 'Date',
        cell: (info) => (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {new Date(info.getValue()).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => {
          const reg = info.row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:hover:bg-white/10 dark:hover:text-white">
                    <MoreVertical className="h-4.5 w-4.5" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="animate-in fade-in zoom-in-95 z-50 min-w-[180px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#1a1a24]"
                    sideOffset={8}
                    align="end"
                  >
                    <DropdownMenu.Item
                      onClick={() => onView(reg)}
                      className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-gray-700 outline-none select-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                      <Eye className="group-hover:text-brand-gold mr-2 h-4 w-4 text-gray-400" />
                      View Details
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="my-1 h-px bg-gray-100 dark:bg-white/5" />
                    <DropdownMenu.Label className="px-2 py-1 text-[9px] font-semibold tracking-wider text-gray-400 uppercase">
                      Generate Documents
                    </DropdownMenu.Label>

                    <DropdownMenu.Item
                      onClick={() => {
                        sessionStorage.setItem('allotmentPrefillRegistration', JSON.stringify(reg));
                        window.location.href = '/admin/allotment-letter?prefillRegistration=true';
                      }}
                      className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-gray-700 outline-none select-none hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Allotment Letter
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      onClick={() => {
                        sessionStorage.setItem('receiptPrefillRegistration', JSON.stringify(reg));
                        window.location.href = '/admin/payment-receipt?prefillRegistration=true';
                      }}
                      className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-gray-700 outline-none select-none hover:bg-green-50 hover:text-green-600 dark:text-gray-300 dark:hover:bg-green-500/10 dark:hover:text-green-400"
                    >
                      <Receipt className="mr-2 h-4 w-4" />
                      Payment Receipt
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      onClick={() => {
                        sessionStorage.setItem('emailPrefillRegistration', JSON.stringify(reg));
                        window.location.href = '/admin/email?tab=compose&prefillRegistration=true';
                      }}
                      className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-gray-700 outline-none select-none hover:bg-purple-50 hover:text-purple-600 dark:text-gray-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="my-1 h-px bg-gray-100 dark:bg-white/5" />
                    <DropdownMenu.Item
                      onClick={() => onDelete(reg)}
                      className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-red-600 outline-none select-none hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Record
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          );
        },
      }),
    ],
    [onStarToggle, onStatusChange, onView, onDelete]
  );

  const table = useReactTable({
    data: registrations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#111118]/80">
      {/* Decorative top border */}
      <div className="via-brand-gold/50 absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

      {loading ? (
        <TableSkeleton />
      ) : registrations.length === 0 ? (
        <EmptyState hasFilters={hasFilters} hasSearch={hasSearch} onClear={onClearFilters} />
      ) : (
        <div className="no-scrollbar relative max-h-[700px] w-full overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/75 dark:border-white/10 dark:bg-[#15151c]/95">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : 'auto' }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {table.getRowModel().rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.015, duration: 0.3 }}
                  className="group transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && total > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-gray-50/50 px-6 py-4 sm:flex-row dark:border-white/10 dark:bg-transparent">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Showing <span className="font-bold text-gray-900 dark:text-white">{startItem}</span> to{' '}
            <span className="font-bold text-gray-900 dark:text-white">{endItem}</span> of{' '}
            <span className="font-bold text-gray-900 dark:text-white">{total}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="hover:border-brand-gold hover:text-brand-gold dark:hover:border-brand-gold dark:hover:text-brand-gold flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex h-9 min-w-[2.5rem] items-center justify-center rounded-lg bg-gray-100 px-3 text-xs font-bold text-gray-900 dark:bg-white/10 dark:text-white">
              {page}
            </div>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!hasMore}
              className="hover:border-brand-gold hover:text-brand-gold dark:hover:border-brand-gold dark:hover:text-brand-gold flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
