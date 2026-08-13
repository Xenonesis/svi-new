'use client';

import { useAuthStore } from '@/src/stores/authStore';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  Trash2,
  Eye,
  RefreshCw,
  X,
  IndianRupee,
  TrendingUp,
  WifiOff,
} from 'lucide-react';

import { SkeletonBlock } from '@/src/components/ui/DynamicSkeleton';
import QuotationViewModal from '@/src/components/admin/quotation/QuotationViewModal';
import QuotationPreview from '@/src/components/admin/quotation/QuotationPreview';

import type { SavedQuotation, CompanyInfo } from '@/src/lib/quotation/types';
import { formatINR, formatDateDisplay } from '@/src/lib/quotation/format';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  company_name: 'SVI INFRA SOLUTIONS PVT. LTD.',
  company_address: 'A-61 Sector 65 Noida Uttar Pradesh 201309',
  company_email: 'info@sviinfrasolutions.com',
  company_phone: '+91 9216014579',
  company_website: 'www.sviinfrasolutions.in',
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
      <div className="flex items-center gap-4">
        <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
          <Icon className="text-brand-gold h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        </div>
      </div>
    </div>
  );
}

export default function QuotationRecordsPage() {
  const { token } = useAuthStore();
  const [quotations, setQuotations] = useState<SavedQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<SavedQuotation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedQuotation | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY_INFO);

  const fetchQuotations = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetch('/api/admin/documents?type=quotation&limit=1000', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch quotations');
        return res.json();
      })
      .then((json) => {
        if (json.documents) setQuotations(json.documents);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to load quotation records');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/settings?key=company_info', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.value) setCompanyInfo({ ...DEFAULT_COMPANY_INFO, ...json.value });
      })
      .catch(() => {});
  }, [token]);

  // Stats
  const totalCount = quotations.length;
  const totalValue = quotations.reduce(
    (sum, q) => sum + (q.form_data?.calculation?.grandTotal ?? 0),
    0
  );
  const completedCount = quotations.filter((q) => q.status === 'completed').length;

  // Filtering
  const filtered = quotations.filter((q) => {
    const query = searchQuery.toLowerCase();
    const fd = q.form_data;
    return (
      (fd?.quotationNo || '').toLowerCase().includes(query) ||
      (fd?.customerName || '').toLowerCase().includes(query) ||
      (fd?.customerPhone || '').toLowerCase().includes(query) ||
      (fd?.projectName || '').toLowerCase().includes(query) ||
      (fd?.plotNo || '').toLowerCase().includes(query)
    );
  });

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/documents/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setQuotations((prev) => prev.filter((q) => q.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Quotation deleted.');
    } catch {
      toast.error('Unable to delete quotation.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalDownloadPDF = async () => {
    if (!selectedQuotation) return;
    setPdfLoading(true);
    try {
      const safeNo = (selectedQuotation.form_data?.quotationNo || 'Quotation').replace(
        /[^a-zA-Z0-9-]/g,
        '_'
      );
      await exportToPDF({
        elementId: 'modalQuotationPreview',
        filename: `SVI_Quotation_${safeNo}.pdf`,
      });
      if (token) {
        await fetch(`/api/admin/documents/${selectedQuotation.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: 'completed' }),
        }).catch(() => {});
      }
    } catch {
      toast.error('PDF generation failed.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleModalDownloadPNG = async () => {
    if (!selectedQuotation) return;
    setImageLoading(true);
    try {
      const safeNo = (selectedQuotation.form_data?.quotationNo || 'Quotation').replace(
        /[^a-zA-Z0-9-]/g,
        '_'
      );
      await exportToImage({
        elementId: 'modalQuotationPreview',
        filename: `SVI_Quotation_${safeNo}.png`,
      });
    } catch {
      toast.error('PNG generation failed.');
    } finally {
      setImageLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Quotation <span className="text-brand-gold italic">Records</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View, search, and manage all generated quotation documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/quotation"
            className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase shadow-md transition-all"
          >
            <FileText className="h-3.5 w-3.5" />
            New Quotation
          </Link>
          <button
            onClick={fetchQuotations}
            disabled={loading}
            className="dark:bg-brand-dark-surface/50 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5"
            title="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard icon={FileText} label="Total Quotations" value={String(totalCount)} />
        <StatCard
          icon={IndianRupee}
          label="Total Quoted Value"
          value={`₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
        />
        <StatCard icon={TrendingUp} label="Completed" value={String(completedCount)} />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-lg">
          <Search className="text-brand-gold absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by quotation no., customer, project, plot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white py-3 pr-10 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:text-white dark:placeholder-gray-600"
            aria-label="Search quotations"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="hover:text-brand-gold absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-500"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/8">
        <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="overflow-x-auto">
          {loading ? (
            <div className="animate-pulse">
              <div className="border-b border-gray-200 bg-gray-50/80 px-6 py-5 dark:border-white/5 dark:bg-white/5">
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <SkeletonBlock key={i} className="h-3 w-20" />
                  ))}
                </div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-gray-100 px-6 py-4 dark:border-white/5"
                >
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-4 w-16" />
                  <SkeletonBlock className="h-4 w-20" />
                  <SkeletonBlock className="h-4 w-20" />
                  <SkeletonBlock className="h-4 w-16" />
                  <div className="ml-auto flex gap-1.5">
                    <SkeletonBlock className="h-8 w-8 rounded-md" />
                    <SkeletonBlock className="h-8 w-8 rounded-md" />
                    <SkeletonBlock className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <WifiOff className="mx-auto mb-4 h-12 w-12 text-red-400" />
              <p className="mb-2 text-sm text-red-500">{error}</p>
              <button
                onClick={fetchQuotations}
                className="text-brand-gold text-xs font-bold uppercase"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-700" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No matches found.' : 'No quotations generated yet.'}
              </p>
              <Link
                href="/admin/quotation"
                className="bg-brand-gold mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold text-white uppercase shadow-md"
              >
                Create First Quotation
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 dark:border-white/5 dark:bg-white/5">
                  {[
                    'Quotation No.',
                    'Customer',
                    'Project',
                    'Plot / Unit',
                    'Area',
                    'Grand Total',
                    'Date',
                    'Status',
                    'Actions',
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400 ${i === 8 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filtered.map((record, i) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.3 }}
                    className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <span className="text-brand-gold border-brand-gold/20 bg-brand-gold/10 rounded-full border px-2 py-1 text-xs font-bold">
                        {record.form_data?.quotationNo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {record.form_data?.customerName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {record.form_data?.projectName || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {record.form_data?.plotNo || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {record.form_data?.area
                        ? `${Number(record.form_data.area).toLocaleString('en-IN')} Sq. Yds.`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      {record.form_data?.calculation?.grandTotal
                        ? formatINR(record.form_data.calculation.grandTotal)
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {record.form_data?.quotationDate
                        ? formatDateDisplay(record.form_data.quotationDate)
                        : formatDateTime(record.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                          record.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View */}
                        <button
                          onClick={() => setSelectedQuotation(record)}
                          className="hover:text-brand-gold hover:bg-brand-gold/10 flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors"
                          title="View"
                          aria-label="View quotation"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {/* Use as Template */}
                        <Link
                          href={`/admin/quotation?templateId=${record.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                          title="Use as Template"
                          aria-label="Use as template"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(record)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          title="Delete"
                          aria-label="Delete quotation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="dark:bg-brand-dark-surface relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10"
          >
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              Delete Quotation
            </h3>
            <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
              Are you sure you want to permanently delete quotation{' '}
              <strong className="text-red-500">{deleteTarget.form_data?.quotationNo}</strong> for{' '}
              <strong>{deleteTarget.form_data?.customerName}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white uppercase hover:bg-red-700 disabled:opacity-60"
              >
                {deleteLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {selectedQuotation && (
        <>
          <QuotationViewModal
            quotation={selectedQuotation}
            onClose={() => setSelectedQuotation(null)}
            onDownloadPDF={handleModalDownloadPDF}
            onDownloadPNG={handleModalDownloadPNG}
            pdfLoading={pdfLoading}
            imageLoading={imageLoading}
          />
          {/* Hidden preview element for PDF/PNG export from modal */}
          <div style={{ position: 'absolute', left: '-9999px', top: 0, visibility: 'hidden' }}>
            <div id="modalQuotationPreview">
              {selectedQuotation.form_data?.calculation && (
                // We re-render the QuotationPreview for export using saved form data
                <QuotationPreview
                  formData={selectedQuotation.form_data}
                  calculation={selectedQuotation.form_data.calculation}
                  companyInfo={companyInfo}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
