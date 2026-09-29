'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/src/stores/authStore';
import type { SavedQuotation, CompanyInfo } from '@/src/lib/quotation/types';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  company_name: 'SVI INFRA SOLUTIONS PVT. LTD.',
  company_address: 'Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309',
  company_email: 'info@sviinfrasolutions.com',
  company_phone: '+91 9216014579',
  company_website: 'www.sviinfrasolutions.in',
  bank_name: 'IDBI Bank Ltd.',
  bank_account_no: '0894102000013837',
  bank_ifsc: 'IBKL0000894',
  bank_account_name: 'SVI INFRA SOLUTIONS PVT. LTD.',
};

export interface UseQuotationRecordsOptions {
  initialQuotations?: SavedQuotation[];
  initialCompanyInfo?: CompanyInfo;
  autoFetch?: boolean;
}

export interface UseQuotationRecordsReturn {
  quotations: SavedQuotation[];
  setQuotations: React.Dispatch<React.SetStateAction<SavedQuotation[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  selectedQuotation: SavedQuotation | null;
  setSelectedQuotation: (quotation: SavedQuotation | null) => void;
  deleteTarget: SavedQuotation | null;
  setDeleteTarget: (target: SavedQuotation | null) => void;
  deleteLoading: boolean;
  pdfLoading: boolean;
  imageLoading: boolean;
  companyInfo: CompanyInfo;
  setCompanyInfo: React.Dispatch<React.SetStateAction<CompanyInfo>>;
  fetchQuotations: () => Promise<void>;
  totalCount: number;
  totalValue: number;
  completedCount: number;
  draftCount: number;
  filtered: SavedQuotation[];
  handleDelete: () => Promise<void>;
  handleModalDownloadPDF: () => Promise<void>;
  handleModalDownloadPNG: () => Promise<void>;
}

export function useQuotationRecords(
  options: UseQuotationRecordsOptions = {}
): UseQuotationRecordsReturn {
  const {
    initialQuotations = [],
    initialCompanyInfo = DEFAULT_COMPANY_INFO,
    autoFetch = true,
  } = options;

  const { token } = useAuthStore();
  const [quotations, setQuotations] = useState<SavedQuotation[]>(initialQuotations);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuotation, setSelectedQuotation] = useState<SavedQuotation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedQuotation | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);

  const fetchQuotations = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/documents?type=quotation&limit=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch quotations');
      const json = await res.json();
      if (json.documents) {
        setQuotations(json.documents);
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Failed to load quotation records';
      setError(msg || 'Failed to load quotation records');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (autoFetch) {
      fetchQuotations();
    }
  }, [autoFetch, fetchQuotations]);

  useEffect(() => {
    if (!token || !autoFetch) return;
    fetch('/api/admin/settings?key=company_info', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.value) setCompanyInfo({ ...DEFAULT_COMPANY_INFO, ...json.value });
      })
      .catch(() => {});
  }, [token, autoFetch]);

  // Stats
  const totalCount = quotations.length;
  const totalValue = useMemo(
    () => quotations.reduce((sum, q) => sum + (q.form_data?.calculation?.grandTotal ?? 0), 0),
    [quotations]
  );
  const completedCount = useMemo(
    () => quotations.filter((q) => q.status === 'completed').length,
    [quotations]
  );
  const draftCount = useMemo(
    () => quotations.filter((q) => q.status === 'draft').length,
    [quotations]
  );

  // Filtering
  const filtered = useMemo(() => {
    return quotations.filter((q) => {
      // Status filter
      if (statusFilter !== 'all' && q.status !== statusFilter) {
        return false;
      }

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const fd = q.form_data;
      return (
        (fd?.quotationNo || '').toLowerCase().includes(query) ||
        (fd?.customerName || '').toLowerCase().includes(query) ||
        (fd?.customerPhone || '').toLowerCase().includes(query) ||
        (fd?.projectName || '').toLowerCase().includes(query) ||
        (fd?.plotNo || '').toLowerCase().includes(query) ||
        (fd?.area || '').toLowerCase().includes(query)
      );
    });
  }, [quotations, statusFilter, searchQuery]);

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`/api/admin/documents/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('Delete failed');
      setQuotations((prev) => prev.filter((q) => q.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Quotation deleted.');
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      toast.error(
        isAbort ? 'Request timed out while deleting quotation.' : 'Unable to delete quotation.'
      );
    } finally {
      clearTimeout(timeoutId);
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
        setQuotations((prev) =>
          prev.map((q) => (q.id === selectedQuotation.id ? { ...q, status: 'completed' } : q))
        );
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

  return {
    quotations,
    setQuotations,
    loading,
    setLoading,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedQuotation,
    setSelectedQuotation,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    pdfLoading,
    imageLoading,
    companyInfo,
    setCompanyInfo,
    fetchQuotations,
    totalCount,
    totalValue,
    completedCount,
    draftCount,
    filtered,
    handleDelete,
    handleModalDownloadPDF,
    handleModalDownloadPNG,
  };
}
