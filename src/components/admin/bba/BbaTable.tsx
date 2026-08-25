import { motion } from 'motion/react';
import { Eye, FileText, Mail, Trash2, Search, Calendar, Globe, Plus } from 'lucide-react';
import Link from 'next/link';
import { SkeletonBlock } from '@/src/components/ui/DynamicSkeleton';
import { SavedBba } from '@/src/types/bba';
import { calculateTotalCost } from '@/src/hooks/useBbaRecords';

interface BbaTableProps {
  loading: boolean;
  filteredBbas: SavedBba[];
  onClearFilters: () => void;
  onSelectBba: (bba: SavedBba) => void;
  onDeleteBba: (bba: SavedBba) => void;
}

export default function BbaTable({
  loading,
  filteredBbas,
  onClearFilters,
  onSelectBba,
  onDeleteBba,
}: BbaTableProps) {
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-4 w-12 rounded-md" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-20 rounded-full" />
            <div className="ml-auto flex gap-1.5">
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredBbas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
          <Search className="h-7 w-7 text-gray-400" />
        </div>
        <h3 className="mb-1 text-base font-bold text-gray-900 dark:text-white">No BBAs found</h3>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          We couldn't find any Builder-Buyer Agreements matching your current filters.
        </p>
        <button
          onClick={onClearFilters}
          className="text-brand-gold hover:bg-brand-gold/10 rounded-xl px-4 py-2 text-xs font-bold transition-colors"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] font-sans text-xs">
        <thead>
          <tr className="border-b border-gray-200/80 bg-gray-50/80 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            {[
              { label: 'DATE', align: 'text-left' },
              { label: 'CLIENT NAME', align: 'text-left' },
              { label: 'PROJECT', align: 'text-left' },
              { label: 'UNIT / PLOT', align: 'text-center' },
              { label: 'AREA', align: 'text-left' },
              { label: 'TOTAL COST', align: 'text-right' },
              { label: 'PLAN', align: 'text-center' },
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
          {filteredBbas.map((record, i) => {
            const cost = record.form_data ? calculateTotalCost(record.form_data) : 0;
            const formattedCost = cost.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            });
            const isHindi = record.form_data?.language === 'hi';
            const dateVal = record.form_data?.bookingDate || record.created_at;

            return (
              <motion.tr
                key={record.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.2), duration: 0.25 }}
                className="group transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.03]"
              >
                {/* Date + Hindi Badge */}
                <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 shrink-0 text-gray-400" />
                      <span className="font-mono text-[11px] font-medium text-gray-800 tabular-nums dark:text-gray-200">
                        {formatDateDisplay(dateVal)}
                      </span>
                    </div>
                    {isHindi && (
                      <span
                        className="inline-flex items-center gap-1 rounded-md border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-bold text-orange-700 dark:text-orange-300"
                        title="Bilingual: Hindi Version Document"
                      >
                        <Globe className="h-2.5 w-2.5" />
                        HI
                      </span>
                    )}
                  </div>
                </td>

                {/* Client Name */}
                <td className="px-5 py-3.5 align-middle">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-gray-900 capitalize dark:text-white">
                      {record.form_data?.clientName || 'N/A'}
                    </div>
                    {record.form_data?.phone && (
                      <div className="font-mono text-[10px] text-gray-400 dark:text-gray-500">
                        {record.form_data.phone}
                      </div>
                    )}
                  </div>
                </td>

                {/* Project */}
                <td className="px-5 py-3.5 align-middle font-medium whitespace-nowrap text-gray-700 capitalize dark:text-gray-300">
                  {record.form_data?.projectName || 'N/A'}
                </td>

                {/* Unit / Plot */}
                <td className="px-5 py-3.5 text-center align-middle">
                  {record.form_data?.unitNumber ? (
                    <span className="inline-block rounded-md border border-gray-200 bg-gray-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-gray-800 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
                      {record.form_data.unitNumber}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                {/* Area */}
                <td className="px-5 py-3.5 align-middle font-medium whitespace-nowrap text-gray-600 tabular-nums dark:text-gray-400">
                  {record.form_data?.area ? `${record.form_data.area} Sq. Yds.` : '—'}
                </td>

                {/* Total Cost */}
                <td className="px-5 py-3.5 text-right align-middle font-mono text-xs font-bold text-gray-900 tabular-nums dark:text-white">
                  {formattedCost}
                </td>

                {/* Plan */}
                <td className="px-5 py-3.5 text-center align-middle">
                  <span className="inline-block rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                    {record.form_data?.paymentPlan || '12'} Months
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5 text-right align-middle">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onSelectBba(record)}
                      className="hover:border-brand-gold/30 hover:bg-brand-gold/10 hover:text-brand-gold flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 active:scale-95"
                      title="View & Print Builder-Buyer Agreement"
                      aria-label="View & Print"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      href={`/admin/bba?templateId=${record.id}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500 active:scale-95"
                      title="Use as Template"
                      aria-label="Use as Template"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => {
                        sessionStorage.setItem('emailPrefillRecord', JSON.stringify(record));
                        window.location.href = '/admin/email?tab=compose&prefillBba=true';
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-500 active:scale-95"
                      title="Email BBA to Client"
                      aria-label="Email Client"
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteBba(record)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 active:scale-95"
                      title="Delete BBA Record"
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
    </div>
  );
}
