import { Eye, FileText, Mail, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
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
  if (loading) {
    return (
      <table className="w-full border-collapse animate-pulse text-left text-xs">
        <thead>
          <tr className="border-b border-gray-100 text-[11px] font-bold tracking-widest text-gray-400 uppercase dark:border-white/8">
            <th className="px-4 py-3">
              <div className="bg-gray-250 h-3.5 w-16 rounded dark:bg-white/5" />
            </th>
            <th className="px-4 py-3">
              <div className="bg-gray-250 h-3.5 w-24 rounded dark:bg-white/5" />
            </th>
            <th className="px-4 py-3">
              <div className="bg-gray-250 h-3.5 w-20 rounded dark:bg-white/5" />
            </th>
            <th className="px-4 py-3">
              <div className="bg-gray-250 h-3.5 w-16 rounded dark:bg-white/5" />
            </th>
            <th className="px-4 py-3">
              <div className="bg-gray-250 h-3.5 w-12 rounded dark:bg-white/5" />
            </th>
            <th className="px-4 py-3">
              <div className="bg-gray-250 h-3.5 w-16 rounded dark:bg-white/5" />
            </th>
            <th className="px-4 py-3">
              <div className="bg-gray-250 h-3.5 w-20 rounded dark:bg-white/5" />
            </th>
            <th className="px-4 py-3 text-right">
              <div className="bg-gray-250 ml-auto h-3.5 w-24 rounded dark:bg-white/5" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {[...Array(6)].map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-4">
                <div className="h-4 w-12 rounded bg-gray-200 dark:bg-white/5" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-28 rounded bg-gray-200 dark:bg-white/5" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/5" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-12 rounded bg-gray-200 dark:bg-white/5" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-10 rounded bg-gray-200 dark:bg-white/5" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/5" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/5" />
              </td>
              <td className="px-4 py-4 text-right">
                <div className="ml-auto h-8 w-28 rounded bg-gray-200 dark:bg-white/5" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (filteredBbas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">No records found</h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          We couldn't find any BBAs matching your current filters.
        </p>
        <button
          onClick={onClearFilters}
          className="text-brand-gold hover:bg-brand-gold/10 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-gray-100 text-[11px] font-bold tracking-widest text-gray-400 uppercase dark:border-white/8">
          <th className="px-4 py-3">Date</th>
          <th className="px-4 py-3">Client Name</th>
          <th className="px-4 py-3">Project</th>
          <th className="px-4 py-3">Unit / Plot</th>
          <th className="px-4 py-3">Area</th>
          <th className="px-4 py-3">Total Cost</th>
          <th className="px-4 py-3">Plan</th>
          <th className="px-4 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 text-xs text-gray-700 dark:divide-white/5 dark:text-gray-300">
        {filteredBbas.map((record) => {
          const cost = record.form_data ? calculateTotalCost(record.form_data) : 0;
          const formattedCost = cost.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          });

          return (
            <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2">
              <td className="text-brand-gold px-4 py-3.5 font-bold">
                {record.form_data?.bookingDate
                  ? new Date(record.form_data.bookingDate).toLocaleDateString('en-GB')
                  : new Date(record.created_at).toLocaleDateString('en-GB')}
                {record.form_data?.language === 'hi' && (
                  <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    HI
                  </span>
                )}
              </td>
              <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                {record.form_data?.clientName || 'N/A'}
              </td>
              <td className="px-4 py-3.5">{record.form_data?.projectName || 'N/A'}</td>
              <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-white">
                {record.form_data?.unitNumber || 'N/A'}
              </td>
              <td className="px-4 py-3.5">
                {record.form_data?.area ? `${record.form_data.area} Sq. Yds.` : 'N/A'}
              </td>
              <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                {formattedCost}
              </td>
              <td className="px-4 py-3.5">
                <span className="bg-brand-gold/10 border-brand-gold/20 text-brand-gold rounded border px-2 py-0.5 text-[10px] font-bold">
                  {record.form_data?.paymentPlan || '12'} Months
                </span>
              </td>
              <td className="px-4 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onSelectBba(record)}
                    className="hover:text-brand-gold hover:bg-brand-gold/10 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors"
                    title="View & Print"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/admin/bba?templateId=${record.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                    title="Use as Template"
                  >
                    <FileText className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => {
                      sessionStorage.setItem('emailPrefillRecord', JSON.stringify(record));
                      window.location.href = '/admin/email?tab=compose&prefillBba=true';
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
                    title="Email Client"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteBba(record)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
