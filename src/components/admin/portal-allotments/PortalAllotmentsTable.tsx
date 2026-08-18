'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Eye, FileText, Building2, Mail, Trash2 } from 'lucide-react';
import type { SavedAllotment } from '@/src/components/admin/allotment-records/types';
import { calculateTotalCost } from '@/src/components/admin/allotment-records/types';

interface PortalAllotmentsTableProps {
  loading: boolean;
  records: SavedAllotment[];
  searchQuery: string;
  onSelectRecord: (record: SavedAllotment) => void;
  onDeleteRecord: (record: SavedAllotment) => void;
}

export function PortalAllotmentsTable({
  loading,
  records,
  searchQuery,
  onSelectRecord,
  onDeleteRecord,
}: PortalAllotmentsTableProps) {
  return (
    <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl transition-colors duration-300 dark:border-white/8">
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="overflow-x-auto">
        {loading ? (
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-md transition-colors duration-300 dark:border-white/5 dark:bg-white/5">
                {[
                  'Ticket ID',
                  'Client Name',
                  'Project',
                  'Unit / Plot',
                  'Area',
                  'Total Cost',
                  'Plan',
                  'Actions',
                ].map((h, idx) => (
                  <th
                    key={h}
                    className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400 ${idx === 7 ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`h-3 rounded bg-gray-200 dark:bg-white/5 ${idx === 7 ? 'ml-auto w-16' : 'w-24'}`}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-gray-150 divide-y dark:divide-white/5">
              {[...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4.5">
                    <div className="h-4 w-12 rounded bg-gray-200 dark:bg-white/5" />
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="h-4 w-28 rounded bg-gray-200 dark:bg-white/5" />
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/5" />
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="h-4 w-12 rounded bg-gray-200 dark:bg-white/5" />
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/5" />
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/5" />
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/5" />
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <div className="ml-auto h-8 w-28 rounded bg-gray-200 dark:bg-white/5" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : records.length === 0 ? (
          <div className="py-24 text-center font-sans">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400 transition-colors duration-300 dark:text-gray-700" />
            <p className="text-sm font-medium text-gray-500 transition-colors duration-300 dark:text-gray-400">
              {searchQuery ? 'No matches found.' : 'No allotment records generated yet.'}
            </p>
          </div>
        ) : (
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-md transition-colors duration-300 dark:border-white/5 dark:bg-white/5">
                {[
                  'Ticket ID',
                  'Client Name',
                  'Project',
                  'Unit / Plot',
                  'Area',
                  'Total Cost',
                  'Plan',
                  'Actions',
                ].map((h, idx) => (
                  <th
                    key={h}
                    className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400 ${idx === 7 ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {records.map((record, i) => {
                const cost = record.form_data ? calculateTotalCost(record.form_data) : 0;
                const formattedCost = cost.toLocaleString('en-IN', {
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
                    className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                  >
                    <td className="px-6 py-4.5">
                      <span className="text-brand-gold border-brand-gold/20 bg-brand-gold/10 rounded-full border px-2 py-1 text-xs font-bold">
                        {record.form_data?.ticketId || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-semibold text-gray-900 dark:text-white">
                      {record.form_data?.clientName || 'N/A'}
                    </td>
                    <td className="px-6 py-4.5 text-gray-600 dark:text-gray-400">
                      {record.form_data?.projectName || 'N/A'}
                    </td>
                    <td className="px-6 py-4.5 font-medium text-gray-900 dark:text-white">
                      {record.form_data?.unitNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4.5 text-gray-600 dark:text-gray-400">
                      {record.form_data?.area ? `${record.form_data.area} Sq. Yds.` : 'N/A'}
                    </td>
                    <td className="px-6 py-4.5 font-bold text-gray-900 dark:text-white">
                      {formattedCost}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {record.form_data?.paymentPlan || '12'} Months
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectRecord(record)}
                          className="hover:text-brand-gold hover:bg-brand-gold/10 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors"
                          title="View & Print"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/admin/allotment-letter?templateId=${record.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                          title="Use as Template"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/bba?allotmentId=${record.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                          title="Create BBA"
                        >
                          <Building2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            sessionStorage.setItem('emailPrefillRecord', JSON.stringify(record));
                            window.location.href = '/admin/email?tab=compose&prefillAllotment=true';
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
                          title="Email Client"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteRecord(record)}
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
