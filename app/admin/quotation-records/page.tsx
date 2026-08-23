'use client';

import { useAuthStore } from '@/src/stores/authStore';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { FileText, RefreshCw } from 'lucide-react';

import QuotationViewModal from '@/src/components/admin/quotation/QuotationViewModal';
import QuotationPreview from '@/src/components/admin/quotation/QuotationPreview';
import {
  QuotationStatsGrid,
  QuotationFilterBar,
  QuotationRecordsTable,
  QuotationDeleteDialog,
} from '@/src/components/admin/quotation-records';

import type { SavedQuotation, CompanyInfo } from '@/src/lib/quotation/types';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  company_name: 'SVI INFRA SOLUTIONS PVT. LTD.',
  company_address: 'Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309',
  company_email: 'info@sviinfrasolutions.com',
  company_phone: '+91 9216014579',
  company_website: 'www.sviinfrasolutions.in',
};

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

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between sm:mb-8">
        <div>
          <h1 className="text-brand-navy mb-1 font-serif text-2xl tracking-tight sm:mb-2 sm:text-3xl dark:text-white">
            Quotation <span className="text-brand-gold italic">Records</span>
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            View, search, and manage all generated quotation documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/quotation"
            className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase shadow-md transition-all sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Quotation</span>
            <span className="sm:hidden">New</span>
          </Link>
          <button
            onClick={fetchQuotations}
            disabled={loading}
            className="dark:bg-brand-dark-surface/50 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 sm:h-10 sm:w-10 sm:rounded-xl dark:border-white/10 dark:hover:bg-white/5"
            title="Refresh"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-gray-600 sm:h-4 sm:w-4 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <QuotationStatsGrid
        totalCount={totalCount}
        totalValue={totalValue}
        completedCount={completedCount}
      />

      {/* Search & Filter Bar */}
      <QuotationFilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Responsive Records Table */}
      <QuotationRecordsTable
        loading={loading}
        error={error}
        records={filtered}
        searchQuery={searchQuery}
        onRetry={fetchQuotations}
        onSelect={setSelectedQuotation}
        onDeleteTarget={setDeleteTarget}
      />

      {/* Delete Confirmation Modal */}
      <QuotationDeleteDialog
        target={deleteTarget}
        loading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* View Details Modal & Export Container */}
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
