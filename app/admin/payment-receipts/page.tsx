'use client';

import { useAuthStore } from '@/src/stores/authStore';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
// Subcomponents
import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';
import { ReceiptStatsCards } from '@/src/components/admin/payment-receipts/ReceiptStatsCards';
import { ReceiptToolbar } from '@/src/components/admin/payment-receipts/ReceiptToolbar';
import { ReceiptsTable } from '@/src/components/admin/payment-receipts/ReceiptsTable';
import { ReceiptDeleteModal } from '@/src/components/admin/payment-receipts/ReceiptDeleteModal';
import { ReceiptViewModal } from '@/src/components/admin/payment-receipts/ReceiptViewModal';

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
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
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
      .catch((err) => {
        console.error('Error fetching receipts:', err);
        setError(err.message || 'Failed to load payment receipts');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  // Statistics calculation
  const totalCount = receipts.length;
  const totalAmount = receipts.reduce((sum, r) => sum + (parseFloat(r.form_data?.amount) || 0), 0);
  const upiCount = receipts.filter((r) => r.form_data?.paymentMethod === 'UPI').length;
  const cashCount = receipts.filter((r) => r.form_data?.paymentMethod === 'Cash').length;

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`/api/admin/documents/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (response.ok) {
        setReceipts((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        setDeleteTarget(null);
        toast.success('Payment receipt deleted successfully.');
      } else {
        const errData = await response.json().catch(() => ({}));
        toast.error(extractApiErrorMessage(errData, 'Failed to delete receipt.'));
      }
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      toast.error(
        isAbort
          ? 'Deletion request took longer than expected. Please verify your connection.'
          : 'Error deleting receipt.'
      );
    } finally {
      clearTimeout(timeoutId);
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
      <div className="mb-4 flex items-center justify-between sm:mb-8">
        <div>
          <h1 className="text-brand-navy mb-1 font-serif text-2xl tracking-tight sm:mb-2 sm:text-3xl dark:text-white">
            Receipt <span className="text-brand-gold italic">Records</span>
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            View, audit, search, download, and delete all generated client payment receipts.
          </p>
        </div>
        <button
          onClick={fetchReceipts}
          disabled={loading}
          className="dark:bg-brand-dark-surface/50 flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 sm:h-10 sm:w-10 dark:border-white/10 dark:hover:bg-white/5"
          title="Refresh List"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-gray-600 sm:h-4 sm:w-4 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <ReceiptStatsCards
        loading={loading}
        totalCount={totalCount}
        totalAmount={totalAmount}
        upiCount={upiCount}
        cashCount={cashCount}
      />

      <ReceiptToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        methodFilter={methodFilter}
        setMethodFilter={setMethodFilter}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        dateRange={dateRange}
        setDateRange={setDateRange}
        handleClearFilters={handleClearFilters}
      />

      <ReceiptsTable
        loading={loading}
        error={error}
        filteredReceipts={filteredReceipts}
        searchQuery={searchQuery}
        fetchReceipts={fetchReceipts}
        setSelectedReceipt={setSelectedReceipt}
        setDeleteTarget={setDeleteTarget}
      />

      <ReceiptDeleteModal
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        deleteLoading={deleteLoading}
        handleDelete={handleDelete}
      />

      <ReceiptViewModal
        selectedReceipt={selectedReceipt}
        setSelectedReceipt={setSelectedReceipt}
        pdfLoading={pdfLoading}
        imageLoading={imageLoading}
        handleDownloadPDF={handleDownloadPDF}
        handleDownloadImage={handleDownloadImage}
      />
    </div>
  );
}
