'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useAuthStore } from '@/src/stores/authStore';
import {
  Receipt,
  Search,
  Trash2,
  Eye,
  Download,
  Calendar,
  IndianRupee,
  RefreshCw,
  X,
  CreditCard,
  Image as ImageIcon,
  FileText,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';

interface SavedReceipt {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  form_data: {
    receiptNo: string;
    date: string;
    salutation: string;
    name: string;
    refId: string;
    amount: string;
    amountWords: string;
    paymentRef: string;
    drawnOn: string;
    plotNo: string;
    plotSize: string;
    account: string;
    paymentMethod: string;
  };
}

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

export default function ReceiptRecordsPage() {
  const { token } = useAuthStore();
  const [receipts, setReceipts] = useState<SavedReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc',
  });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedReceipt, setSelectedReceipt] = useState<SavedReceipt | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedReceipt | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const fetchReceipts = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/admin/documents?type=payment_receipt&limit=1000', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch documents');
        return res.json();
      })
      .then((json) => {
        if (json.documents) {
          setReceipts(json.documents);
        }
      })
      .catch((err) => console.error('Error fetching receipts:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReceipts();
  }, [token]);

  // Statistics calculation
  const totalCount = receipts.length;
  const totalAmount = receipts.reduce((sum, r) => sum + (parseFloat(r.form_data?.amount) || 0), 0);
  const upiCount = receipts.filter((r) => r.form_data?.paymentMethod === 'UPI').length;
  const cashCount = receipts.filter((r) => r.form_data?.paymentMethod === 'Cash').length;

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/documents/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchReceipts();
        setDeleteTarget(null);
      } else {
        alert('Failed to delete receipt');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting receipt');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const clientName = (selectedReceipt?.form_data?.name || '')
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, '');
      const receiptNo = (selectedReceipt?.form_data?.receiptNo || '')
        .trim()
        .replace(/[^a-zA-Z0-9]/g, '');
      const filename =
        clientName && receiptNo
          ? `${clientName} ${receiptNo}.pdf`
          : clientName
            ? `${clientName}.pdf`
            : 'Receipt.pdf';

      await exportToPDF({
        elementId: 'modalReceiptPreview',
        filename,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    setImageLoading(true);
    try {
      const clientName = (selectedReceipt?.form_data?.name || '')
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, '');
      const receiptNo = (selectedReceipt?.form_data?.receiptNo || '')
        .trim()
        .replace(/[^a-zA-Z0-9]/g, '');
      const filename =
        clientName && receiptNo
          ? `${clientName} ${receiptNo}.png`
          : clientName
            ? `${clientName}.png`
            : 'Receipt.png';

      await exportToImage({
        elementId: 'modalReceiptPreview',
        filename,
      });
    } catch (error) {
      console.error('Error generating Image:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const filteredReceipts = useMemo(() => {
    return receipts
      .filter((r) => {
        const query = searchQuery.toLowerCase();
        const name = (r.form_data?.name || '').toLowerCase();
        const no = (r.form_data?.receiptNo || '').toLowerCase();
        const matchesSearch = name.includes(query) || no.includes(query);
        const matchesMethod = methodFilter ? r.form_data?.paymentMethod === methodFilter : true;

        let matchesDate = true;
        if (dateRange.start || dateRange.end) {
          const recordDate = r.form_data?.date
            ? new Date(r.form_data.date)
            : new Date(r.created_at);
          if (dateRange.start && new Date(dateRange.start) > recordDate) matchesDate = false;
          if (dateRange.end) {
            const endD = new Date(dateRange.end);
            endD.setHours(23, 59, 59, 999);
            if (endD < recordDate) matchesDate = false;
          }
        }

        return matchesSearch && matchesMethod && matchesDate;
      })
      .sort((a, b) => {
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        if (sortConfig.key === 'date') {
          const dateA = a.form_data?.date ? new Date(a.form_data.date) : new Date(a.created_at);
          const dateB = b.form_data?.date ? new Date(b.form_data.date) : new Date(b.created_at);
          return (dateA.getTime() - dateB.getTime()) * dir;
        }
        if (sortConfig.key === 'name') {
          const nameA = (a.form_data?.name || '').toLowerCase();
          const nameB = (b.form_data?.name || '').toLowerCase();
          return nameA.localeCompare(nameB) * dir;
        }
        if (sortConfig.key === 'amount') {
          const costA = parseFloat(a.form_data?.amount || '0');
          const costB = parseFloat(b.form_data?.amount || '0');
          return (costA - costB) * dir;
        }
        return 0;
      });
  }, [receipts, searchQuery, methodFilter, sortConfig, dateRange]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setMethodFilter('');
    setSortConfig({ key: 'date', direction: 'desc' });
    setDateRange({ start: '', end: '' });
  };

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Receipt <span className="text-brand-gold italic">Records</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View, audit, search, download, and delete all generated client payment receipts.
          </p>
        </div>
        <button
          onClick={fetchReceipts}
          className="dark:bg-brand-dark-surface/50 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
          title="Refresh List"
        >
          <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Quick Statistics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <Receipt className="text-brand-gold h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Total Receipts
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</h3>
            </div>
          </div>
        </div>

        <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <IndianRupee className="text-brand-gold h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Total Collected
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
            </div>
          </div>
        </div>

        <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <CreditCard className="text-brand-gold h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                UPI Receipts
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{upiCount}</h3>
            </div>
          </div>
        </div>

        <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <Calendar className="text-brand-gold h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Cash Receipts
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{cashCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-xs">
            <Search className="text-brand-gold absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client or receipt no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:border-brand-gold dark:bg-brand-dark-surface w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-xs text-gray-900 transition-colors focus:outline-none dark:border-white/8 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-brand-gold h-4 w-4" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                className="focus:border-brand-gold dark:bg-brand-dark-surface rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 [color-scheme:light] outline-none dark:border-white/10 dark:text-white dark:[color-scheme:dark]"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className="focus:border-brand-gold dark:bg-brand-dark-surface rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 [color-scheme:light] outline-none dark:border-white/10 dark:text-white dark:[color-scheme:dark]"
              />
            </div>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="focus:border-brand-gold dark:bg-brand-dark-surface rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 [color-scheme:light] outline-none dark:border-white/10 dark:text-gray-200 dark:[color-scheme:dark]"
            >
              <option value="">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>

            <select
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split('-');
                setSortConfig({ key, direction: direction as 'asc' | 'desc' });
              }}
              className="focus:border-brand-gold dark:bg-brand-dark-surface rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 [color-scheme:light] outline-none dark:border-white/10 dark:text-gray-200 dark:[color-scheme:dark]"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Client (A-Z)</option>
              <option value="name-desc">Client (Z-A)</option>
              <option value="amount-desc">Amount (High-Low)</option>
              <option value="amount-asc">Amount (Low-High)</option>
            </select>
          </div>
        </div>

        {(searchQuery || methodFilter || dateRange.start || dateRange.end) && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400">Active Filters:</span>
            <button
              onClick={handleClearFilters}
              className="text-brand-gold hover:text-brand-navy flex items-center gap-1 font-medium transition-colors dark:hover:text-white"
            >
              <X className="h-3 w-3" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Database Table Container */}
      <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl transition-colors duration-300 dark:border-white/8">
        <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="overflow-x-auto">
          {loading ? (
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-md transition-colors duration-300 dark:border-white/5 dark:bg-white/5">
                  {[
                    'Receipt No',
                    'Client Name',
                    'Date',
                    'Amount',
                    'Method',
                    'Plot Info',
                    'Actions',
                  ].map((h, idx) => (
                    <th
                      key={h}
                      className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400 ${idx === 6 ? 'text-right' : 'text-left'}`}
                    >
                      <div
                        className={`h-3 rounded bg-gray-200 dark:bg-white/5 ${idx === 6 ? 'ml-auto w-16' : 'w-24'}`}
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
                      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-4 w-12 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-4 w-40 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="ml-auto h-8 w-28 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : filteredReceipts.length === 0 ? (
            <div className="py-24 text-center font-sans">
              <Receipt className="mx-auto mb-4 h-12 w-12 text-gray-400 transition-colors duration-300 dark:text-gray-700" />
              <p className="text-sm font-medium text-gray-500 transition-colors duration-300 dark:text-gray-400">
                {searchQuery ? 'No matches found.' : 'No receipt records generated yet.'}
              </p>
            </div>
          ) : (
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-md transition-colors duration-300 dark:border-white/5 dark:bg-white/5">
                  {[
                    'Receipt No',
                    'Client Name',
                    'Date',
                    'Amount',
                    'Method',
                    'Plot Info',
                    'Actions',
                  ].map((h, idx) => (
                    <th
                      key={h}
                      className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400 ${idx === 6 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredReceipts.map((receipt, i) => {
                  const amountVal = parseFloat(receipt.form_data?.amount || '0');
                  const formattedAmount = amountVal.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  });

                  return (
                    <motion.tr
                      key={receipt.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.3, ease: 'easeOut' }}
                      className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                    >
                      <td className="px-6 py-4">
                        <span className="text-brand-gold border-brand-gold/20 bg-brand-gold/10 rounded-full border px-2 py-1 text-xs font-bold">
                          {receipt.form_data?.receiptNo || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {receipt.form_data?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {receipt.form_data?.date
                          ? new Date(receipt.form_data.date).toLocaleDateString('en-GB')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {formattedAmount}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-brand-gold/10 border-brand-gold/20 text-brand-gold rounded border px-2 py-0.5 text-[10px] font-bold">
                          {receipt.form_data?.paymentMethod || 'UPI'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {receipt.form_data?.plotNo
                          ? `Plot ${receipt.form_data.plotNo} (${receipt.form_data.plotSize} Sq. Yds.)`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedReceipt(receipt)}
                            className="hover:text-brand-gold hover:bg-brand-gold/10 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors"
                            title="View & Print"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/admin/payment-receipt?templateId=${receipt.id}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                            title="Use as Template"
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => {
                              sessionStorage.setItem('emailPrefillRecord', JSON.stringify(receipt));
                              window.location.href = '/admin/email?tab=compose&prefillReceipt=true';
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
                            title="Email Client"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(receipt)}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="dark:border-brand-gold/20 dark:bg-brand-dark-surface relative w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-2xl transition-colors duration-300"
            >
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-red-500/50" />
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-brand-navy mb-2 font-serif text-lg tracking-tight transition-colors duration-300 dark:text-white">
                Delete Receipt?
              </h3>
              <p className="mb-6 font-sans text-xs text-gray-500 transition-colors duration-300 dark:text-gray-400">
                Are you sure you want to permanently delete receipt number{' '}
                <strong className="text-red-500">{deleteTarget.form_data?.receiptNo}</strong>{' '}
                generated for <strong>{deleteTarget.form_data?.name}</strong>? This action is
                irreversible.
              </p>
              <div className="flex gap-3 font-sans">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteLoading}
                  className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-gray-100 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-lg transition-all hover:bg-red-500"
                >
                  {deleteLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View & Re-download overlay Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-md dark:bg-black/90">
          <div className="dark:bg-brand-dark-surface relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Payment Receipt No: {selectedReceipt.form_data?.receiptNo}
                </h3>
                <p className="text-[10px] text-gray-500">
                  Generated on {new Date(selectedReceipt.created_at).toLocaleDateString('en-GB')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase shadow-md transition-all disabled:opacity-50"
                >
                  {pdfLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Download PDF
                </button>
                <button
                  onClick={handleDownloadImage}
                  disabled={imageLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white uppercase shadow-md transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  {imageLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="h-3.5 w-3.5" />
                  )}
                  Save as PNG
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body with Scrollable Live Preview */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-6 dark:bg-zinc-900/30">
              <div
                id="modalReceiptPreview"
                className="mx-auto w-full max-w-3xl rounded-xl bg-white p-8 font-sans text-black shadow-sm"
              >
                {/* Header */}
                <div className="border-brand-gold mb-6 flex items-start justify-between border-b-2 pb-6">
                  <div>
                    <h1 className="mb-2 text-2xl font-bold tracking-wide text-[#1e3a8a] uppercase">
                      SVI INFRA SOLUTIONS PVT. LTD
                    </h1>
                    <p className="text-[13px] text-gray-700">
                      Cell: +91 9216014579 | Email: info@sviinfrasolutions.com
                    </p>
                    <p className="text-[13px] text-gray-700">
                      Website: www.sviinfrasolutions.in | www.sviinfrasolutions.com
                    </p>
                    <p className="text-[13px] text-gray-700">
                      Office Address : A-61 Sector 65 Noida Uttar Pradesh 201309
                    </p>
                  </div>
                  <div className="w-48">
                    <img
                      src="/logo.png"
                      alt="SVI Infra Solutions"
                      className="h-auto w-full object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                </div>

                <div className="mb-6 text-center">
                  <h2 className="inline-block rounded bg-[#1e3a8a] px-6 py-2 text-lg font-bold tracking-widest text-white uppercase shadow-md">
                    Payment Receipt
                  </h2>
                </div>

                <div className="mb-8 flex justify-between font-sans text-sm font-bold">
                  <p className="rounded border-l-4 border-[#1e3a8a] bg-gray-50 px-4 py-2 shadow-sm">
                    Receipt No:{' '}
                    <span className="ml-1 text-red-600">
                      {selectedReceipt.form_data?.receiptNo || '___________'}
                    </span>
                  </p>
                  <p className="rounded border-l-4 border-[#1e3a8a] bg-gray-50 px-4 py-2 shadow-sm">
                    Date:{' '}
                    <span className="ml-1 text-red-600">
                      {selectedReceipt.form_data?.date
                        ? new Date(selectedReceipt.form_data.date).toLocaleDateString('en-GB')
                        : '___________'}
                    </span>
                  </p>
                </div>

                <div className="relative space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-6 font-sans text-[15px] leading-relaxed shadow-sm">
                  {/* Watermark */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.12]">
                    <img
                      src="/logo.png"
                      alt=""
                      className="w-96"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>

                  <div className="relative z-10 flex items-end">
                    <span className="mr-2 whitespace-nowrap">
                      Received with thanks from {selectedReceipt.form_data?.salutation} :
                    </span>
                    <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold text-[#1e3a8a] italic">
                      {selectedReceipt.form_data?.name}
                    </span>
                  </div>

                  <div className="relative z-10 flex items-end">
                    <span className="mr-2 whitespace-nowrap">Ref. Id :</span>
                    <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                      {selectedReceipt.form_data?.refId}
                    </span>
                  </div>

                  <div className="relative z-10 flex items-end">
                    <span className="mr-2 whitespace-nowrap">The sum of Rupees :</span>
                    <span className="flex-1 border-b border-gray-400 pb-0.5 text-lg font-bold text-gray-800">
                      ₹{' '}
                      {parseFloat(selectedReceipt.form_data?.amount || '0').toLocaleString(
                        'en-IN',
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>

                  <div className="relative z-10 flex items-end">
                    <span className="mr-2 whitespace-nowrap">Rupees in Words :</span>
                    <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold text-[#1e3a8a] italic">
                      {selectedReceipt.form_data?.amountWords}
                    </span>
                  </div>

                  <div className="relative z-10 flex items-end">
                    <span className="mr-2 whitespace-nowrap">
                      By{' '}
                      {selectedReceipt.form_data?.paymentMethod === 'UPI' ||
                      selectedReceipt.form_data?.paymentMethod === 'Cheque'
                        ? 'UPI No / Cheque no'
                        : selectedReceipt.form_data?.paymentMethod}{' '}
                      No :
                    </span>
                    <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                      {selectedReceipt.form_data?.paymentRef}
                    </span>
                  </div>

                  <div className="relative z-10 flex justify-between gap-6 pt-2">
                    <div className="flex flex-1 items-end">
                      <span className="mr-2 whitespace-nowrap">Drawn On :</span>
                      <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                        {selectedReceipt.form_data?.drawnOn
                          ? new Date(selectedReceipt.form_data.drawnOn).toLocaleDateString('en-GB')
                          : ''}
                      </span>
                    </div>
                    <div className="flex flex-1 items-end">
                      <span className="mr-2 whitespace-nowrap">Plot No :</span>
                      <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold text-red-600">
                        {selectedReceipt.form_data?.plotNo}
                      </span>
                    </div>
                    <div className="flex flex-1 items-end">
                      <span className="mr-2 whitespace-nowrap">Plot Size :</span>
                      <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                        {selectedReceipt.form_data?.plotSize} Sq. Yds.
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-end pt-2">
                    <span className="mr-2 whitespace-nowrap">On Account of :</span>
                    <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                      {selectedReceipt.form_data?.account}
                    </span>
                  </div>

                  {parseFloat(selectedReceipt.form_data?.amount || '0') === 2100 && (
                    <div className="relative z-10 mt-6 rounded-lg border-2 border-red-500 bg-red-50 p-4">
                      <p className="text-sm font-bold text-red-700">Terms & Conditions:</p>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        This is a refundable amount of ₹2100. If your name is not selected in the
                        draw, the amount will be automatically refunded within the next 48 hours.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-12 flex items-end justify-between pb-8">
                  <div className="rounded-lg border-2 border-[#1e3a8a] bg-white px-8 py-4 text-2xl font-bold text-[#1e3a8a] shadow-md">
                    ₹{' '}
                    {parseFloat(selectedReceipt.form_data?.amount || '0').toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                    {'/-'}
                  </div>
                  <div className="relative text-center">
                    <img
                      src="/signature.png"
                      alt="Signature"
                      className="absolute bottom-10 left-1/2 h-28 w-auto -translate-x-1/2 opacity-95 mix-blend-multiply"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="relative z-10 w-56 border-t-2 border-black pt-2">
                      <p className="text-sm font-bold text-[#1e3a8a]">
                        For SVI INFRA SOLUTIONS PVT. LTD
                      </p>
                      <p className="mt-1 text-xs font-bold text-gray-700">Authorized Signatory</p>
                    </div>
                  </div>
                </div>

                <p className="mt-8 border-t border-gray-200 pt-4 text-center text-[11px] text-gray-500 italic">
                  Thank you for your business. Please keep this receipt for your records. This is a
                  computer generated document.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
