'use client';

import { useAuthStore } from '@/src/stores/authStore';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { DeleteConfirm } from '@/src/components/admin/modals/DeleteConfirm';
import { OfferLetterStatsCards } from '@/src/components/admin/offer-letter-records/OfferLetterStatsCards';
import { OfferLetterTable } from '@/src/components/admin/offer-letter-records/OfferLetterTable';
import { OfferLetterPreviewModal } from '@/src/components/admin/offer-letter-records/OfferLetterPreviewModal';

interface SavedOfferLetter {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  form_data: {
    date: string;
    name: string;
    address: string;
    mobileNo: string;
    alternativeNo: string;
    emailId: string;
    designation: string;
    department: string;
    reportingTo: string;
    appointmentDate: string;
    location: string;
    salaryCtc: string;
    target: string;
    offerSlab: string;
    workingHoursStart: string;
    workingHoursEnd: string;
    workingDays: string;
    probationPeriod: string;
  };
}

export default function OfferLetterRecordsPage() {
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

  const [companyInfo, setCompanyInfo] = useState({
    company_name: 'SVI Infra Solutions Pvt. Ltd.',
    company_address: 'A-61 Sector 65 Noida Uttar Pradesh 201309',
    company_email: 'info@sviinfrasolutions.com',
    company_phone: '+91 9216014579',
    company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
  });

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

  // Statistics
  const totalCount = offers.length;
  const totalCtc = offers.reduce((sum, r) => sum + (parseFloat(r.form_data?.salaryCtc) || 0), 0);
  const uniqueDesignations = new Set(offers.map((r) => r.form_data?.designation).filter(Boolean))
    .size;
  const completedCount = offers.filter((r) => r.status === 'completed').length;

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/documents/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setOffers((prev) => prev.filter((o) => o.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        alert('Failed to delete offer letter record');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting offer letter record');
    } finally {
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

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Offer Letter <span className="text-brand-gold italic">Records</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View, search, audit, download, and delete all generated offer letters.
          </p>
        </div>
        <button
          onClick={fetchOffers}
          disabled={loading}
          className="dark:bg-brand-dark-surface/50 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5"
          title="Refresh List"
        >
          <RefreshCw
            className={`h-4 w-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <OfferLetterStatsCards
        loading={loading}
        totalCount={totalCount}
        totalCtc={totalCtc}
        uniqueDesignations={uniqueDesignations}
        completedCount={completedCount}
      />

      <OfferLetterTable
        offers={offers}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        onClearFilters={handleClearFilters}
        onView={setSelectedOffer}
        onDelete={setDeleteTarget}
        onRetry={fetchOffers}
      />

      <OfferLetterPreviewModal
        offer={selectedOffer}
        companyInfo={companyInfo}
        onClose={() => setSelectedOffer(null)}
        onDownloadPDF={handleDownloadPDF}
        onDownloadImage={handleDownloadImage}
        pdfLoading={pdfLoading}
        imageLoading={imageLoading}
      />

      {deleteTarget && (
        <DeleteConfirm
          user={{
            id: deleteTarget.id,
            email: deleteTarget.form_data?.emailId || '',
            full_name: deleteTarget.form_data?.name || '',
            phone: null,
            property_interest: null,
            role: 'employee',
            created_at: '',
            created_by: null,
            notes: null,
          }}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
