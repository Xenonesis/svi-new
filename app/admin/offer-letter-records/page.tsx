'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useAuthStore } from '@/src/stores/authStore';
import {
  FileSignature,
  Search,
  Trash2,
  Eye,
  Download,
  Calendar,
  IndianRupee,
  RefreshCw,
  X,
  Briefcase,
  BadgeCheck,
  Image as ImageIcon,
  FileText,
  Mail,
  WifiOff,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { SkeletonBlock } from '@/src/components/ui/DynamicSkeleton';
import OfferLetterPreviewContent from '@/src/components/admin/DocumentGenerator/OfferLetterPreviewContent';

function StatCardSkeleton() {
  return (
    <div className="dark:bg-brand-dark-surface/50 animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-white/10" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-6 w-16 rounded bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-gray-100 px-4 py-4 dark:border-white/5"
        >
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-16" />
          <div className="ml-auto flex gap-1.5">
            <SkeletonBlock className="h-8 w-8 rounded-md" />
            <SkeletonBlock className="h-8 w-8 rounded-md" />
            <SkeletonBlock className="h-8 w-8 rounded-md" />
            <SkeletonBlock className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

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

  const filteredOffers = useMemo(() => {
    return offers
      .filter((r) => {
        const query = searchQuery.toLowerCase();
        const name = (r.form_data?.name || '').toLowerCase();
        const designation = (r.form_data?.designation || '').toLowerCase();
        const department = (r.form_data?.department || '').toLowerCase();
        const mobileNo = (r.form_data?.mobileNo || '').toLowerCase();
        const matchesSearch =
          name.includes(query) ||
          designation.includes(query) ||
          department.includes(query) ||
          mobileNo.includes(query);

        let matchesDate = true;
        if (dateRange.start || dateRange.end) {
          const recordDate = new Date(r.created_at);
          if (dateRange.start && new Date(dateRange.start) > recordDate) matchesDate = false;
          if (dateRange.end) {
            const endD = new Date(dateRange.end);
            endD.setHours(23, 59, 59, 999);
            if (endD < recordDate) matchesDate = false;
          }
        }

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        if (sortConfig.key === 'date') {
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
        }
        if (sortConfig.key === 'name') {
          return (a.form_data?.name || '').localeCompare(b.form_data?.name || '') * dir;
        }
        if (sortConfig.key === 'ctc') {
          const ctcA = parseFloat(a.form_data?.salaryCtc || '0');
          const ctcB = parseFloat(b.form_data?.salaryCtc || '0');
          return (ctcA - ctcB) * dir;
        }
        return 0;
      });
  }, [offers, searchQuery, sortConfig, dateRange]);

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

      {/* Quick Statistics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0, duration: 0.3 }}
              className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
                  <FileSignature className="text-brand-gold h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Total Letters
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</h3>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
                  <IndianRupee className="text-brand-gold h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Total CTC (Monthly)
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{totalCtc.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </h3>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
                  <Briefcase className="text-brand-gold h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Unique Roles
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {uniqueDesignations}
                  </h3>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
                  <BadgeCheck className="text-brand-gold h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Completed
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {completedCount}
                  </h3>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Main Table Container */}
      <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-xs">
              <Search className="text-brand-gold absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, role, department..."
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
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-');
                  setSortConfig({ key, direction: direction as 'asc' | 'desc' });
                }}
                className="focus:border-brand-gold dark:bg-brand-dark-surface rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 [color-scheme:light] outline-none dark:border-white/10 dark:text-gray-200 dark:[color-scheme:dark]"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="ctc-desc">CTC (High-Low)</option>
                <option value="ctc-asc">CTC (Low-High)</option>
              </select>
            </div>
          </div>

          {(searchQuery || dateRange.start || dateRange.end) && (
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

        <div className="overflow-x-auto">
          {loading ? (
            <>
              <div className="animate-pulse border-b border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-white/8 dark:bg-white/5">
                <div className="flex items-center gap-4">
                  {[
                    'Date',
                    'Name',
                    'Designation',
                    'Dept',
                    'Location',
                    'CTC',
                    'Status',
                    'Actions',
                  ].map((h, idx) => (
                    <SkeletonBlock
                      key={h}
                      className={`h-3.5 ${idx === 7 ? 'ml-auto w-24' : 'w-16'}`}
                    />
                  ))}
                </div>
              </div>
              <TableSkeleton />
            </>
          ) : error ? (
            <div className="py-24 text-center font-sans">
              <WifiOff className="mx-auto mb-4 h-12 w-12 text-red-400 dark:text-red-600" />
              <p className="mb-2 text-sm font-medium text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={fetchOffers}
                className="text-brand-gold hover:text-brand-gold-light mx-auto mt-2 flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
                No records found
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? "We couldn't find any offer letters matching your current filters."
                  : 'No offer letters generated yet.'}
              </p>
              {searchQuery || dateRange.start || dateRange.end ? (
                <button
                  onClick={handleClearFilters}
                  className="text-brand-gold hover:bg-brand-gold/10 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  Clear all filters
                </button>
              ) : (
                <Link
                  href="/admin/offer-letter"
                  className="bg-brand-gold mt-2 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold text-white uppercase shadow-md transition-all hover:bg-yellow-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New Offer Letter
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold tracking-widest text-gray-400 uppercase dark:border-white/8">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Candidate Name</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">CTC (Monthly)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700 dark:divide-white/5 dark:text-gray-300">
                {filteredOffers.map((record, i) => {
                  const ctc = parseFloat(record.form_data?.salaryCtc || '0');
                  const formattedCtc = ctc.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  });

                  return (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.3, ease: 'easeOut' }}
                      className="hover:bg-gray-50/50 dark:hover:bg-white/2"
                    >
                      <td className="text-brand-gold px-4 py-3.5 font-bold">
                        {record.created_at
                          ? new Date(record.created_at).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                        {record.form_data?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3.5">{record.form_data?.designation || 'N/A'}</td>
                      <td className="px-4 py-3.5">{record.form_data?.department || 'N/A'}</td>
                      <td className="px-4 py-3.5">{record.form_data?.location || 'N/A'}</td>
                      <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                        {formattedCtc}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            record.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {record.status === 'completed' ? 'Completed' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOffer(record)}
                            className="hover:text-brand-gold hover:bg-brand-gold/10 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors"
                            title="View & Print"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/admin/offer-letter?templateId=${record.id}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                            title="Use as Template"
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => {
                              sessionStorage.setItem('emailPrefillRecord', JSON.stringify(record));
                              window.location.href = '/admin/email?tab=compose&prefillOffer=true';
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
                            title="Email Client"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(record)}
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
          <motion.div
            key="delete-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="dark:bg-brand-dark-surface relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10"
            >
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                Delete Offer Letter Record
              </h3>
              <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
                Are you sure you want to permanently delete the offer letter generated for{' '}
                <strong>{deleteTarget.form_data?.name}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteLoading}
                  className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 uppercase hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* View & Re-download overlay Modal */}
      <AnimatePresence>
        {selectedOffer && (
          <motion.div
            key="view-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-md dark:bg-black/90"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="dark:bg-brand-dark-surface relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Offer Letter - {selectedOffer.form_data?.name}
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    Generated on{' '}
                    {new Date(selectedOffer.created_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
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
                    onClick={() => setSelectedOffer(null)}
                    className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body with Scrollable Live Preview */}
              <div className="flex-1 overflow-y-auto bg-gray-100 p-6 dark:bg-zinc-900/30">
                <div
                  id="modalOfferPreview"
                  className="mx-auto w-full max-w-3xl rounded-xl bg-white p-8 font-sans text-[13px] leading-relaxed text-black shadow-sm"
                >
                  <OfferLetterPreviewContent
                    formData={selectedOffer.form_data}
                    companyInfo={companyInfo}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
