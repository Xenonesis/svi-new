import { useState, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/src/stores/authStore';
import { SavedReceipt } from './ReceiptTypes';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import { downloadReceiptsCsv } from '@/src/lib/receipt/receiptCsvExport';
import { exportReceiptsToExcel } from '@/src/lib/receipt/receiptExcelExport';
import { normalizeRefId } from '@/src/lib/receipt/receiptLedger';

export function parseAmount(amount: string | number | undefined | null): number {
  if (amount === undefined || amount === null) return 0;
  if (typeof amount === 'number') return isNaN(amount) ? 0 : amount;
  const parsed = parseFloat(String(amount).replace(/[^0-9.-]+/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

export interface ReceiptStats {
  total: number;
  cash: number;
  cheque: number;
  online: number;
  upi: number;
  totalCount: number;
  totalAmount: number;
  upiCount: number;
  cashCount: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface DateRange {
  start: string;
  end: string;
}

export interface UsePaymentReceiptsRecordsReturn {
  receipts: SavedReceipt[];
  setReceipts: React.Dispatch<React.SetStateAction<SavedReceipt[]>>;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  methodFilter: string;
  setMethodFilter: (m: string) => void;
  sortConfig: SortConfig;
  setSortConfig: React.Dispatch<React.SetStateAction<SortConfig>>;
  handleSort: (key: string) => void;
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  handleClearFilters: () => void;
  filteredReceipts: SavedReceipt[];
  totalAmount: number;
  totalCount: number;
  upiCount: number;
  cashCount: number;
  stats: ReceiptStats;
  fetchReceipts: () => void;
  fetchDealValues: () => void;
  selectedReceipt: SavedReceipt | null;
  setSelectedReceipt: (r: SavedReceipt | null) => void;
  deleteTarget: SavedReceipt | null;
  setDeleteTarget: (r: SavedReceipt | null) => void;
  deleteLoading: boolean;
  handleDeleteConfirm: () => Promise<void>;
  handleDelete: () => Promise<void>;
  whatsAppReceipt: SavedReceipt | null;
  setWhatsAppReceipt: (r: SavedReceipt | null) => void;
  ledgerRefId: string | null;
  setLedgerRefId: (ref: string | null) => void;
  isLedgersModalOpen: boolean;
  setIsLedgersModalOpen: (open: boolean) => void;
  dealValuesMap: Record<string, number>;
  setDealValuesMap: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleSaveDealValue: (normalizedRefId: string, newDealValue: number) => Promise<void>;
  pdfLoading: boolean;
  imageLoading: boolean;
  handleDownloadPDF: (receipt?: SavedReceipt | null) => Promise<void>;
  handleDownloadImage: (receipt?: SavedReceipt | null) => Promise<void>;
  handleExportCSV: (filename?: string) => void;
  handleExportExcel: (filename?: string) => Promise<void>;
  activeTab: 'active' | 'trash';
  setActiveTab: (tab: 'active' | 'trash') => void;
  trashedReceipts: SavedReceipt[];
  setTrashedReceipts: React.Dispatch<React.SetStateAction<SavedReceipt[]>>;
  isPermanentDelete: boolean;
  setIsPermanentDelete: (val: boolean) => void;
  handleRestore: (receipt: SavedReceipt) => Promise<void>;
  handleEmptyTrash: () => Promise<void>;
}

export function usePaymentReceiptsRecords(): UsePaymentReceiptsRecordsReturn {
  const { token } = useAuthStore();
  const [receipts, setReceipts] = useState<SavedReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'date',
    direction: 'desc',
  });
  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });

  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [trashedReceipts, setTrashedReceipts] = useState<SavedReceipt[]>([]);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState<SavedReceipt | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedReceipt | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const [whatsAppReceipt, setWhatsAppReceipt] = useState<SavedReceipt | null>(null);
  const [ledgerRefId, setLedgerRefId] = useState<string | null>(null);
  const [isLedgersModalOpen, setIsLedgersModalOpen] = useState(false);
  const [dealValuesMap, setDealValuesMap] = useState<Record<string, number>>({});

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
      .then((json: { documents?: SavedReceipt[] }) => {
        if (json.documents) {
          const allDocs = json.documents;
          const active = allDocs.filter((r) => !r.metadata?.is_trashed);
          const trashed = allDocs.filter((r) => !!r.metadata?.is_trashed);
          setReceipts(active);
          setTrashedReceipts(trashed);
        }
      })
      .catch((err: unknown) => {
        console.error('Error fetching receipts:', err);
        const message = err instanceof Error ? err.message : 'Failed to load payment receipts';
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const fetchDealValues = useCallback(() => {
    if (!token) return;
    fetch('/api/admin/settings?key=receipt_deal_values', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((json: { value?: Record<string, unknown> } | null) => {
        if (json?.value && typeof json.value === 'object') {
          const mapped: Record<string, number> = {};
          Object.entries(json.value).forEach(([k, v]) => {
            const norm = normalizeRefId(k);
            if (typeof v === 'number') {
              mapped[norm] = v;
            } else if (v && typeof v === 'object' && 'dealValue' in v) {
              const val = v.dealValue;
              mapped[norm] = typeof val === 'number' ? val : Number(val) || 0;
            }
          });
          setDealValuesMap(mapped);
        }
      })
      .catch((err: unknown) => console.error('Error fetching deal values:', err));
  }, [token]);

  const handleSaveDealValue = async (normalizedRefId: string, newDealValue: number) => {
    if (!token) return;
    const norm = normalizeRefId(normalizedRefId);
    const updated = {
      ...dealValuesMap,
      [normalizedRefId]: newDealValue,
      [norm]: newDealValue,
    };
    setDealValuesMap(updated);

    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        key: 'receipt_deal_values',
        value: updated,
      }),
    });
    if (!res.ok) {
      throw new Error('Failed to persist deal value');
    }
  };

  useEffect(() => {
    fetchReceipts();
    fetchDealValues();
  }, [fetchReceipts, fetchDealValues]);

  // Statistics calculation
  const totalAmount = useMemo(() => {
    return receipts.reduce((sum, r) => sum + parseAmount(r.form_data?.amount), 0);
  }, [receipts]);

  const totalCount = receipts.length;

  const { upiCount, cashCount, chequeCount, onlineCount } = useMemo(() => {
    let upi = 0;
    let cash = 0;
    let cheque = 0;
    let online = 0;

    receipts.forEach((r) => {
      const method = (r.form_data?.paymentMethod || '').toLowerCase();
      if (method.includes('cash')) {
        cash++;
      } else if (method.includes('cheque') || method.includes('dd') || method.includes('check')) {
        cheque++;
      } else if (method.includes('upi')) {
        upi++;
        online++;
      } else if (
        method.includes('bank') ||
        method.includes('neft') ||
        method.includes('rtgs') ||
        method.includes('imps') ||
        method.includes('online')
      ) {
        online++;
      }
    });

    return { upiCount: upi, cashCount: cash, chequeCount: cheque, onlineCount: online };
  }, [receipts]);

  const stats: ReceiptStats = useMemo(() => {
    return {
      total: totalCount,
      cash: cashCount,
      cheque: chequeCount,
      online: onlineCount,
      upi: upiCount,
      totalCount,
      totalAmount,
      upiCount,
      cashCount,
    };
  }, [totalCount, cashCount, chequeCount, onlineCount, upiCount, totalAmount]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      if (activeTab === 'trash' || isPermanentDelete) {
        const response = await fetch(`/api/admin/documents/${deleteTarget.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (response.ok) {
          setTrashedReceipts((prev) => prev.filter((r) => r.id !== deleteTarget.id));
          setReceipts((prev) => prev.filter((r) => r.id !== deleteTarget.id));
          setDeleteTarget(null);
          setIsPermanentDelete(false);
          toast.success('Payment receipt permanently deleted.');
        } else {
          const errData = await response.json().catch(() => ({}));
          toast.error(extractApiErrorMessage(errData, 'Failed to delete receipt.'));
        }
      } else {
        const targetToTrash = deleteTarget;
        const updatedMetadata = {
          ...(targetToTrash.metadata || {}),
          is_trashed: true,
          trashed_at: new Date().toISOString(),
        };
        const updatedTarget: SavedReceipt = {
          ...targetToTrash,
          metadata: updatedMetadata,
        };

        const response = await fetch(`/api/admin/documents/${targetToTrash.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ metadata: updatedMetadata }),
          signal: controller.signal,
        });

        if (response.ok) {
          setReceipts((prev) => prev.filter((r) => r.id !== targetToTrash.id));
          setTrashedReceipts((prev) => [
            updatedTarget,
            ...prev.filter((r) => r.id !== targetToTrash.id),
          ]);
          setDeleteTarget(null);
          toast.success('Payment receipt deleted successfully.');
        } else {
          const errData = await response.json().catch(() => ({}));
          toast.error(extractApiErrorMessage(errData, 'Failed to delete receipt.'));
        }
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

  const handleRestore = async (targetReceipt: SavedReceipt) => {
    if (!token) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const updatedMetadata = {
      ...(targetReceipt.metadata || {}),
      is_trashed: false,
      trashed_at: null,
      restored_at: new Date().toISOString(),
    };
    const restoredTarget: SavedReceipt = {
      ...targetReceipt,
      metadata: updatedMetadata,
    };

    setTrashedReceipts((prev) => prev.filter((r) => r.id !== targetReceipt.id));
    setReceipts((prev) => [restoredTarget, ...prev.filter((r) => r.id !== targetReceipt.id)]);

    try {
      const response = await fetch(`/api/admin/documents/${targetReceipt.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ metadata: updatedMetadata }),
        signal: controller.signal,
      });

      if (response.ok) {
        toast.success(
          `Receipt #${targetReceipt.form_data?.receiptNo || ''} restored successfully.`
        );
      } else {
        setReceipts((prev) => prev.filter((r) => r.id !== targetReceipt.id));
        setTrashedReceipts((prev) => [targetReceipt, ...prev]);
        const errData = await response.json().catch(() => ({}));
        toast.error(extractApiErrorMessage(errData, 'Failed to restore receipt.'));
      }
    } catch {
      setReceipts((prev) => prev.filter((r) => r.id !== targetReceipt.id));
      setTrashedReceipts((prev) => [targetReceipt, ...prev]);
      toast.error('Network error restoring receipt.');
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleEmptyTrash = async () => {
    if (!token || trashedReceipts.length === 0) return;
    if (
      typeof window !== 'undefined' &&
      !window.confirm(
        `Permanently delete all ${trashedReceipts.length} receipts in Trash? This action cannot be undone.`
      )
    ) {
      return;
    }
    const currentTrashed = [...trashedReceipts];
    setTrashedReceipts([]);
    try {
      await Promise.all(
        currentTrashed.map((r) =>
          fetch(`/api/admin/documents/${r.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      toast.success('Trash emptied successfully.');
    } catch {
      toast.error('Some receipts could not be deleted.');
      fetchReceipts();
    }
  };

  const handleDownloadPDF = async (receipt?: SavedReceipt | null) => {
    const target = receipt || selectedReceipt;
    setPdfLoading(true);
    try {
      const clientName = (target?.form_data?.name || '').trim().replace(/[^a-zA-Z0-9\s]/g, '');
      const receiptNo = (target?.form_data?.receiptNo || '').trim().replace(/[^a-zA-Z0-9]/g, '');
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
    } catch (err: unknown) {
      console.error('Error generating PDF:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadImage = async (receipt?: SavedReceipt | null) => {
    const target = receipt || selectedReceipt;
    setImageLoading(true);
    try {
      const clientName = (target?.form_data?.name || '').trim().replace(/[^a-zA-Z0-9\s]/g, '');
      const receiptNo = (target?.form_data?.receiptNo || '').trim().replace(/[^a-zA-Z0-9]/g, '');
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
    } catch (err: unknown) {
      console.error('Error generating Image:', err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setMethodFilter('');
    setSortConfig({ key: 'date', direction: 'desc' });
    setDateRange({ start: '', end: '' });
  }, []);

  const filteredReceipts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const sourceList = activeTab === 'trash' ? trashedReceipts : receipts;

    return sourceList
      .filter((r) => {
        if (query) {
          const name = (r.form_data?.name || '').toLowerCase();
          const no = (r.form_data?.receiptNo || '').toLowerCase();
          const ref = (r.form_data?.refId || '').toLowerCase();
          const phone = (r.form_data?.clientPhone || '').toLowerCase();
          const plot = (r.form_data?.plotNo || '').toLowerCase();
          const amt = String(r.form_data?.amount || '').toLowerCase();

          const matchesSearch =
            name.includes(query) ||
            no.includes(query) ||
            ref.includes(query) ||
            phone.includes(query) ||
            plot.includes(query) ||
            amt.includes(query);

          if (!matchesSearch) return false;
        }

        if (methodFilter && r.form_data?.paymentMethod !== methodFilter) {
          return false;
        }

        if (dateRange.start || dateRange.end) {
          const recordDate = r.form_data?.date
            ? new Date(r.form_data.date)
            : new Date(r.created_at);
          if (dateRange.start && new Date(dateRange.start) > recordDate) return false;
          if (dateRange.end) {
            const endD = new Date(dateRange.end);
            endD.setHours(23, 59, 59, 999);
            if (endD < recordDate) return false;
          }
        }

        return true;
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
          const costA = parseAmount(a.form_data?.amount);
          const costB = parseAmount(b.form_data?.amount);
          return (costA - costB) * dir;
        }
        if (sortConfig.key === 'refId') {
          const refA = (a.form_data?.refId || '').toLowerCase();
          const refB = (b.form_data?.refId || '').toLowerCase();
          return refA.localeCompare(refB) * dir;
        }
        return 0;
      });
  }, [activeTab, receipts, trashedReceipts, searchQuery, methodFilter, sortConfig, dateRange]);
  const handleExportCSV = useCallback(
    (filename?: string) => {
      if (filteredReceipts.length === 0) {
        toast.error('No receipts available to export');
        return;
      }
      downloadReceiptsCsv(filteredReceipts, filename);
      toast.success(`Exported ${filteredReceipts.length} receipts to CSV`);
    },
    [filteredReceipts]
  );

  const handleExportExcel = useCallback(
    async (filename?: string) => {
      if (filteredReceipts.length === 0) {
        toast.error('No receipts available to export');
        return;
      }
      await exportReceiptsToExcel(filteredReceipts, filename);
    },
    [filteredReceipts]
  );

  return {
    receipts,
    setReceipts,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    methodFilter,
    setMethodFilter,
    sortConfig,
    setSortConfig,
    handleSort,
    dateRange,
    setDateRange,
    handleClearFilters,
    filteredReceipts,
    totalAmount,
    totalCount,
    upiCount,
    cashCount,
    stats,
    fetchReceipts,
    fetchDealValues,
    selectedReceipt,
    setSelectedReceipt,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    handleDeleteConfirm,
    handleDelete: handleDeleteConfirm,
    whatsAppReceipt,
    setWhatsAppReceipt,
    ledgerRefId,
    setLedgerRefId,
    isLedgersModalOpen,
    setIsLedgersModalOpen,
    dealValuesMap,
    setDealValuesMap,
    handleSaveDealValue,
    pdfLoading,
    imageLoading,
    handleDownloadPDF,
    handleDownloadImage,
    handleExportCSV,
    handleExportExcel,
    activeTab,
    setActiveTab,
    trashedReceipts,
    setTrashedReceipts,
    isPermanentDelete,
    setIsPermanentDelete,
    handleRestore,
    handleEmptyTrash,
  };
}
