import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { toast } from 'sonner';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import type { SavedOfferLetter } from '@/src/components/admin/OfferLetter/types';

export interface CompanyInfo {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_website: string;
}

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  company_name: 'SVI Infra Solutions Pvt. Ltd.',
  company_address: 'Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309',
  company_email: 'info@sviinfrasolutions.com',
  company_phone: '+91 9216014579',
  company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
};

export function useOfferLetterRecords() {
  const { token } = useAuthStore();
  const [offers, setOffers] = useState<SavedOfferLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc',
  });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOffer, setSelectedOffer] = useState<SavedOfferLetter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedOfferLetter | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY_INFO);

  const fetchOffers = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetch('/api/admin/documents?type=offer_letter&limit=1000', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch documents');
        return res.json();
      })
      .then((json) => {
        if (json.documents) {
          setOffers(json.documents);
        }
      })
      .catch((err) => {
        console.error('Error fetching offer letters:', err);
        setError(err.message || 'Failed to load offer letter records');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/settings?key=company_info', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
      })
      .then((json) => {
        if (json.value) {
          setCompanyInfo(json.value);
        }
      })
      .catch((err) => console.error('Error fetching company info:', err));
  }, [token]);

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
        setOffers((prev) => prev.filter((o) => o.id !== deleteTarget.id));
        setDeleteTarget(null);
        toast.success('Offer letter record deleted successfully.');
      } else {
        const errData = await response.json().catch(() => ({}));
        toast.error(extractApiErrorMessage(errData, 'Failed to delete offer letter record.'));
      }
    } catch (err: unknown) {
      console.error(err);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      toast.error(
        isAbort
          ? 'Deletion request took longer than expected. Please verify your connection.'
          : 'Error deleting offer letter record.'
      );
    } finally {
      clearTimeout(timeoutId);
      setDeleteLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const candidateName = selectedOffer?.form_data?.name || 'Record';
      const filename = `Offer_Letter_${candidateName.replace(/\s+/g, '_')}.pdf`;
      await exportToPDF({
        elementId: 'modalOfferPreview',
        filename,
      });

      if (selectedOffer && token) {
        try {
          await fetch(`/api/admin/documents/${selectedOffer.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'completed' }),
          });
        } catch (error) {
          console.error('Failed to update document status:', error);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    setImageLoading(true);
    try {
      const candidateName = selectedOffer?.form_data?.name || 'Record';
      const filename = `Offer_Letter_${candidateName.replace(/\s+/g, '_')}.png`;
      await exportToImage({
        elementId: 'modalOfferPreview',
        filename,
      });
    } catch (error) {
      console.error('Error generating Image:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortConfig({ key: 'date', direction: 'desc' });
    setDateRange({ start: '', end: '' });
  };

  const totalCount = offers.length;
  const totalCtc = offers.reduce(
    (sum, r) => sum + (parseFloat(r.form_data?.salaryCtc || '0') || 0),
    0
  );
  const uniqueDesignations = new Set(offers.map((r) => r.form_data?.designation).filter(Boolean))
    .size;
  const completedCount = offers.filter((r) => r.status === 'completed').length;

  return {
    offers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortConfig,
    setSortConfig,
    dateRange,
    setDateRange,
    selectedOffer,
    setSelectedOffer,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    pdfLoading,
    imageLoading,
    companyInfo,
    stats: {
      totalCount,
      totalCtc,
      uniqueDesignations,
      completedCount,
    },
    fetchOffers,
    handleDelete,
    handleDownloadPDF,
    handleDownloadImage,
    handleClearFilters,
  };
}
