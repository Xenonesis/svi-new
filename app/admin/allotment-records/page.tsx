'use client';

import { motion } from 'motion/react';
import { useAuthStore } from '@/src/stores/authStore';
import {
  FileText,
  Search,
  Trash2,
  Eye,
  Download,
  IndianRupee,
  RefreshCw,
  X,
  Building2,
  TrendingUp,
  Image as ImageIcon,
  Mail,
  AlertCircle,
  WifiOff,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { supabase } from '@/src/lib/supabase/client';
import Link from 'next/link';
import { AllotmentLetterPreview } from '@/src/components/admin/DocumentGenerator/AllotmentLetterPreview';
import { SkeletonBlock } from '@/src/components/ui/DynamicSkeleton';

interface SavedAllotment {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  form_data: {
    clientName: string;
    salutation: string;
    address: string;
    ticketId: string;
    projectName: string;
    unitNumber: string;
    area: string;
    bsp: string;
    plc: string;
    edc?: string;
    paymentPlan: string;
    bookingDate: string;
    secondPaymentDays: string;
    advisorName: string;
    advisorNumber: string;
    advisorEmail?: string;
    aadharNumber?: string;
    fatherName?: string;
    onBookingPaymentRef?: string;
    within15DaysPaymentRef?: string;
  };
}

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
          className="flex items-center gap-4 border-b border-gray-100 px-6 py-4 dark:border-white/5"
        >
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-28" />
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

const defaultCompanyInfo = {
  company_name: 'SVI Infra Solutions Pvt. Ltd.',
  company_address: 'A-61 Sector 65 Noida Uttar Pradesh 201309',
  company_email: 'info@sviinfrasolutions.com',
  company_phone: '+91 9216014579',
  company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
  bank_account_name: 'Svi Infra Solutions Pvt. Ltd',
  bank_account_no: '0894102000013837',
  bank_name: 'IDBI BANK',
  bank_ifsc: 'IBKL0000894',
};

export default function AllotmentRecordsPage() {
  const { token } = useAuthStore();
  const [allotments, setAllotments] = useState<SavedAllotment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [selectedAllotment, setSelectedAllotment] = useState<SavedAllotment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedAllotment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [projects, setProjects] = useState<string[]>(['Shyam Aangan', 'Shyam Aangan Farm House']);
  const [companyInfo, setCompanyInfo] = useState(defaultCompanyInfo);

  useEffect(() => {
    async function loadProjects() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('name')
          .eq('active', true)
          .order('name', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setProjects(data.map((p) => p.name));
        }
      } catch (err) {
        console.error('Error loading projects:', err);
      }
    }
    loadProjects();
  }, []);

  const fetchAllotments = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetch('/api/admin/documents?type=allotment_letter&limit=1000', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch documents');
        return res.json();
      })
      .then((json) => {
        if (json.documents) {
          setAllotments(json.documents);
        }
      })
      .catch((err) => {
        console.error('Error fetching allotments:', err);
        setError(err.message || 'Failed to load allotment records');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchAllotments();
  }, [fetchAllotments]);

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

  const calculateTotalCost = (formData: SavedAllotment['form_data']) => {
    const area = parseFloat(formData?.area) || 0;
    const bsp = parseFloat(formData?.bsp) || 0;
    const plc = parseFloat(formData?.plc) || 0;
    const edc = parseFloat(formData?.edc || '0') || 0;
    const base = area * bsp;
    const plcAmount = base * (plc / 100);
    return base + plcAmount + edc;
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

  const totalCount = allotments.length;
  const totalValue = allotments.reduce(
    (sum, r) => sum + (r.form_data ? calculateTotalCost(r.form_data) : 0),
    0
  );
  const avgArea = allotments.length
    ? allotments.reduce((sum, r) => sum + (parseFloat(r.form_data?.area) || 0), 0) /
      allotments.length
    : 0;
  const shyamAanganCount = allotments.filter(
    (r) => r.form_data?.projectName === 'Shyam Aangan'
  ).length;

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/documents/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setAllotments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        alert('Failed to delete allotment record');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting allotment record');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const clientName = selectedAllotment?.form_data?.clientName || 'Record';
      const filename = `Allotment_Letter_${clientName.replace(/\s+/g, '_')}.pdf`;
      await exportToPDF({
        elementId: 'modalAllotmentPreview',
        filename,
      });
      if (selectedAllotment && token) {
        try {
          await fetch(`/api/admin/documents/${selectedAllotment.id}`, {
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
      const clientName = selectedAllotment?.form_data?.clientName || 'Record';
      const filename = `Allotment_Letter_${clientName.replace(/\s+/g, '_')}.png`;
      await exportToImage({
        elementId: 'modalAllotmentPreview',
        filename,
      });
    } catch (error) {
      console.error('Error generating Image:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const filteredAllotments = allotments.filter((r) => {
    const query = searchQuery.toLowerCase();
    const name = (r.form_data?.clientName || '').toLowerCase();
    const ticket = (r.form_data?.ticketId || '').toLowerCase();
    const advisor = (r.form_data?.advisorName || '').toLowerCase();
    const matchesSearch = name.includes(query) || ticket.includes(query) || advisor.includes(query);
    const matchesProject = projectFilter ? r.form_data?.projectName === projectFilter : true;
    return matchesSearch && matchesProject;
  });

  const ticketIdCounts: Record<string, number> = {};
  allotments.forEach((r) => {
    const tId = r.form_data?.ticketId;
    if (tId) {
      ticketIdCounts[tId] = (ticketIdCounts[tId] || 0) + 1;
    }
  });
  const duplicateTicketIds = new Set(
    Object.keys(ticketIdCounts).filter((tId) => ticketIdCounts[tId] > 1)
  );

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between sm:mb-8">
        <div>
          <h1 className="text-brand-navy mb-1 font-serif text-2xl tracking-tight sm:mb-2 sm:text-3xl dark:text-white">
            Allotment <span className="text-brand-gold italic">Records</span>
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            View, search, audit, download, and delete all generated client allotment letters.
          </p>
        </div>
        <button
          onClick={fetchAllotments}
          disabled={loading}
          className="dark:bg-brand-dark-surface/50 flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 sm:h-10 sm:w-10 dark:border-white/10 dark:hover:bg-white/5"
          title="Refresh List"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-gray-600 sm:h-4 sm:w-4 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Quick Statistics Cards */}
      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
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
              className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5"
            >
              <div className="flex items-center gap-2.5 sm:gap-4">
                <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
                  <FileText className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
                    Total Letters
                  </p>
                  <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
                    {totalCount}
                  </h3>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5"
            >
              <div className="flex items-center gap-2.5 sm:gap-4">
                <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
                  <IndianRupee className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
                    Total Unit Value
                  </p>
                  <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
                    ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </h3>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5"
            >
              <div className="flex items-center gap-2.5 sm:gap-4">
                <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
                  <TrendingUp className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
                    Avg Area (Sq.Yds)
                  </p>
                  <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
                    {avgArea.toFixed(1)}
                  </h3>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5"
            >
              <div className="flex items-center gap-2.5 sm:gap-4">
                <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
                  <Building2 className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
                    Shyam Aangan
                  </p>
                  <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
                    {shyamAanganCount}
                  </h3>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-2.5 font-sans sm:mb-6 sm:flex-row sm:gap-3">
        <div className="relative flex-1">
          <Search className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 sm:left-3.5 sm:h-4 sm:w-4" />
          <input
            type="text"
            placeholder="Search by client, ticket ID or advisor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white py-2 pr-9 pl-9 text-xs text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none sm:py-3 sm:pr-10 sm:pl-10 sm:text-sm dark:border-white/10 dark:text-white dark:placeholder-gray-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="hover:text-brand-gold absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 sm:right-3.5"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            aria-label="Filter by project"
            className="focus:border-brand-gold dark:bg-brand-dark-surface/85 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-semibold tracking-wider text-gray-700 transition-all outline-none hover:bg-gray-50 sm:w-auto sm:px-5 sm:py-3 sm:text-xs sm:font-bold sm:tracking-widest dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <option value="" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
              ALL PROJECTS
            </option>
            {projects.map((proj) => (
              <option
                key={proj}
                value={proj}
                className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
              >
                {proj.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl transition-colors duration-300 dark:border-white/8">
        <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="overflow-x-auto">
          {loading ? (
            <>
              {/* Table header skeleton */}
              <div className="animate-pulse border-b border-gray-200 bg-gray-50/80 px-6 py-5 dark:border-white/5 dark:bg-white/5">
                <div className="flex items-center gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <SkeletonBlock key={i} className="h-3 w-24" />
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
                onClick={fetchAllotments}
                className="text-brand-gold hover:text-brand-gold-light mx-auto mt-2 flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          ) : filteredAllotments.length === 0 ? (
            <div className="py-24 text-center font-sans">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-700" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? 'No matches found for your search.'
                  : 'No allotment records generated yet.'}
              </p>
              <Link
                href="/admin/allotment-letter"
                className="bg-brand-gold mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold text-white uppercase shadow-md transition-all hover:bg-yellow-500"
              >
                <FileText className="h-3.5 w-3.5" />
                Create New Allotment
              </Link>
            </div>
          ) : (
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-md transition-colors duration-300 dark:border-white/5 dark:bg-white/5">
                  {[
                    'Ticket ID',
                    'Client Name',
                    'Project',
                    'Unit / Plot',
                    'Area',
                    'Total Cost',
                    'Plan',
                    'Date & Time',
                    'Actions',
                  ].map((h, idx) => (
                    <th
                      key={h}
                      className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400 ${idx === 8 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredAllotments.map((record, i) => {
                  const cost = record.form_data ? calculateTotalCost(record.form_data) : 0;
                  const formattedCost = cost.toLocaleString('en-IN', {
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
                      className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-brand-gold border-brand-gold/20 bg-brand-gold/10 rounded-full border px-2 py-1 text-xs font-bold">
                            {record.form_data?.ticketId || 'N/A'}
                          </span>
                          {record.form_data?.ticketId &&
                            duplicateTicketIds.has(record.form_data.ticketId) && (
                              <span
                                className="inline-flex cursor-help items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                title="Duplicate found! Check details using the Eye (View) icon, and safely delete older or incorrect copies using the Trash button on the right to resolve the duplication."
                              >
                                ⚠️ Duplicate
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {record.form_data?.clientName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {record.form_data?.projectName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {record.form_data?.unitNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {record.form_data?.area ? `${record.form_data.area} Sq. Yds.` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {formattedCost}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {record.form_data?.paymentPlan || '12'} Months
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {record.created_at ? formatDateTime(record.created_at) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAllotment(record)}
                            className="hover:text-brand-gold hover:bg-brand-gold/10 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors"
                            title="View & Print"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/admin/allotment-letter?templateId=${record.id}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                            title="Use as Template"
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/bba?allotmentId=${record.id}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                            title="Create BBA"
                          >
                            <Building2 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => {
                              sessionStorage.setItem('emailPrefillRecord', JSON.stringify(record));
                              window.location.href =
                                '/admin/email?tab=compose&prefillAllotment=true';
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
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="dark:bg-brand-dark-surface relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10"
          >
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              Delete Allotment Record
            </h3>
            <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
              Are you sure you want to permanently delete the allotment record with Ticket ID{' '}
              <strong className="text-red-500">{deleteTarget.form_data?.ticketId}</strong> generated
              for <strong>{deleteTarget.form_data?.clientName}</strong>?
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
        </div>
      )}

      {/* View & Re-download overlay Modal */}
      {selectedAllotment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-2 backdrop-blur-md sm:p-4 dark:bg-black/90">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="dark:bg-brand-dark-surface relative flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl dark:border-white/10"
          >
            {/* Modal Header */}
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4 dark:border-white/8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 sm:text-lg dark:text-white">
                    Allotment Letter - {selectedAllotment.form_data?.ticketId}
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    Generated on{' '}
                    {new Date(selectedAllotment.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAllotment(null)}
                  aria-label="Close modal"
                  className="text-gray-500 hover:text-gray-800 sm:hidden dark:text-gray-400 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase shadow-md transition-all disabled:opacity-50 sm:flex-initial sm:px-4 sm:py-2 sm:text-xs"
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
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white uppercase shadow-md transition-all hover:bg-emerald-700 disabled:opacity-50 sm:flex-initial sm:px-4 sm:py-2 sm:text-xs"
                >
                  {imageLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="h-3.5 w-3.5" />
                  )}
                  Save as PNG
                </button>
                <button
                  onClick={() => setSelectedAllotment(null)}
                  aria-label="Close modal"
                  className="hidden text-gray-500 hover:text-gray-800 sm:block dark:text-gray-400 dark:hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-2 sm:p-6 dark:bg-zinc-900/30">
              <AllotmentLetterPreview
                id="modalAllotmentPreview"
                className="mx-auto w-full max-w-3xl rounded-xl bg-white p-4 font-sans text-xs leading-relaxed text-black shadow-sm sm:p-8 sm:text-[13px]"
                formData={selectedAllotment.form_data}
                companyInfo={companyInfo}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
