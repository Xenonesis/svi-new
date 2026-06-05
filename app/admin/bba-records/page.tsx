'use client';

import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import {
  FileText,
  Search,
  Trash2,
  Eye,
  Download,
  Calendar,
  IndianRupee,
  RefreshCw,
  X,
  Building2,
  TrendingUp,
  Image as ImageIcon,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { supabase } from '@/src/lib/supabase/client';
import BbaPreviewContent from '@/src/components/admin/DocumentGenerator/BbaPreviewContent';

interface SavedBba {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  form_data: {
    salutation: string;
    clientName: string;
    aadharNumber: string;
    fatherName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    pincode: string;
    state: string;
    phone: string;
    email: string;
    projectName: string;
    unitNumber: string;
    area: string;
    bsp: string;
    plc: string;
    paymentPlan: string;
    bookingDate: string;
    secondPaymentDays: string;
    advisorName: string;
    advisorNumber: string;
    advisorEmail?: string;
  };
}

export default function BbaRecordsPage() {
  const { token } = useAdminSession();
  const [bbas, setBbas] = useState<SavedBba[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc',
  });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedBba, setSelectedBba] = useState<SavedBba | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedBba | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [projects, setProjects] = useState<string[]>(['Shyam Aangan', 'Shyam Aangan Farm House']);

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

  const [companyInfo, setCompanyInfo] = useState({
    company_name: 'SVI Infra Solutions Pvt. Ltd.',
    company_address: 'A-61 Sector 65 Noida Uttar Pradesh 201309',
    company_email: 'info@sviinfrasolutions.com',
    company_phone: '+91 9216014579',
    company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
    bank_account_name: 'Svi Infra Solutions Pvt. Ltd',
    bank_account_no: '0894102000013837',
    bank_name: 'IDBI BANK',
    bank_ifsc: 'IBKL0000894',
  });

  const fetchBbas = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/admin/documents?type=bba&limit=1000', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch documents');
        return res.json();
      })
      .then((json) => {
        if (json.documents) {
          setBbas(json.documents);
        }
      })
      .catch((err) => console.error('Error fetching BBAs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBbas();
  }, [token]);

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

  const calculateTotalCost = (formData: SavedBba['form_data']) => {
    const area = parseFloat(formData?.area) || 0;
    const bsp = parseFloat(formData?.bsp) || 0;
    const plc = parseFloat(formData?.plc) || 0;

    const base = area * bsp;
    const plcAmount = base * (plc / 100);
    return base + plcAmount;
  };

  // Statistics calculation
  const totalCount = bbas.length;
  const totalValue = bbas.reduce(
    (sum, r) => sum + (r.form_data ? calculateTotalCost(r.form_data) : 0),
    0
  );
  const avgArea = bbas.length
    ? bbas.reduce((sum, r) => sum + (parseFloat(r.form_data?.area) || 0), 0) / bbas.length
    : 0;
  const shyamAanganCount = bbas.filter((r) => r.form_data?.projectName === 'Shyam Aangan').length;

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/documents/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchBbas();
        setDeleteTarget(null);
      } else {
        alert('Failed to delete BBA record');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting BBA record');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const clientName = selectedBba?.form_data?.clientName || 'Record';
      const filename = `BBA_${clientName.replace(/\s+/g, '_')}.pdf`;
      await exportToPDF({
        elementId: 'modalBbaPreview',
        filename,
      });

      // Update status to completed in db
      if (selectedBba && token) {
        try {
          await fetch(`/api/admin/documents/${selectedBba.id}`, {
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
      const clientName = selectedBba?.form_data?.clientName || 'Record';
      const filename = `BBA_${clientName.replace(/\s+/g, '_')}.png`;
      await exportToImage({
        elementId: 'modalBbaPreview',
        filename,
      });
    } catch (error) {
      console.error('Error generating Image:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const filteredBbas = useMemo(() => {
    return bbas
      .filter((r) => {
        const query = searchQuery.toLowerCase();
        const name = (r.form_data?.clientName || '').toLowerCase();
        const advisor = (r.form_data?.advisorName || '').toLowerCase();
        const matchesSearch = name.includes(query) || advisor.includes(query);
        const matchesProject = projectFilter ? r.form_data?.projectName === projectFilter : true;

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

        return matchesSearch && matchesProject && matchesDate;
      })
      .sort((a, b) => {
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        if (sortConfig.key === 'date') {
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
        }
        if (sortConfig.key === 'name') {
          const nameA = (a.form_data?.clientName || '').toLowerCase();
          const nameB = (b.form_data?.clientName || '').toLowerCase();
          return nameA.localeCompare(nameB) * dir;
        }
        if (sortConfig.key === 'cost') {
          const costA = calculateTotalCost(a.form_data);
          const costB = calculateTotalCost(b.form_data);
          return (costA - costB) * dir;
        }
        return 0;
      });
  }, [bbas, searchQuery, projectFilter, sortConfig, dateRange]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setProjectFilter('');
    setSortConfig({ key: 'date', direction: 'desc' });
    setDateRange({ start: '', end: '' });
  };

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            BBA <span className="text-brand-gold italic">Records</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View, search, audit, download, and delete all generated Builder Buyer Agreements.
          </p>
        </div>
        <button
          onClick={fetchBbas}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#0e0e14]/50 dark:hover:bg-white/5"
          title="Refresh List"
        >
          <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Quick Statistics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5 dark:bg-[#0e0e14]/50">
          <div className="flex items-center gap-4">
            <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <FileText className="text-brand-gold h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Total BBAs
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</h3>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5 dark:bg-[#0e0e14]/50">
          <div className="flex items-center gap-4">
            <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <IndianRupee className="text-brand-gold h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Total Unit Value
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5 dark:bg-[#0e0e14]/50">
          <div className="flex items-center gap-4">
            <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <TrendingUp className="text-brand-gold h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Avg Area (Sq.Yds)
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgArea.toFixed(1)}
              </h3>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5 dark:bg-[#0e0e14]/50">
          <div className="flex items-center gap-4">
            <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <Building2 className="text-brand-gold h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Shyam Aangan
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {shyamAanganCount}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Database Table Container */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-xs">
              <Search className="text-brand-gold absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by client or advisor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-xs text-gray-900 transition-colors focus:outline-none dark:border-white/8 dark:bg-[#0e0e14] dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-brand-gold h-4 w-4" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  className="focus:border-brand-gold rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none dark:border-white/10 dark:bg-[#0e0e14] dark:text-white"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="focus:border-brand-gold rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none dark:border-white/10 dark:bg-[#0e0e14] dark:text-white"
                />
              </div>

              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="focus:border-brand-gold rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 outline-none dark:border-white/10 dark:bg-[#0e0e14] dark:text-gray-200"
              >
                <option value="">All Projects</option>
                {projects.map((proj) => (
                  <option key={proj} value={proj}>
                    {proj}
                  </option>
                ))}
              </select>

              <select
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-');
                  setSortConfig({ key, direction: direction as 'asc' | 'desc' });
                }}
                className="focus:border-brand-gold rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 outline-none dark:border-white/10 dark:bg-[#0e0e14] dark:text-gray-200"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Client (A-Z)</option>
                <option value="name-desc">Client (Z-A)</option>
                <option value="cost-desc">Value (High-Low)</option>
                <option value="cost-asc">Value (Low-High)</option>
              </select>
            </div>
          </div>

          {(searchQuery || projectFilter || dateRange.start || dateRange.end) && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Active Filters:</span>
              <button
                onClick={handleClearFilters}
                className="text-brand-gold hover:text-brand-navy flex items-center gap-1 font-medium transition-colors"
              >
                <X className="h-3 w-3" />
                Clear All
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <table className="w-full border-collapse animate-pulse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold tracking-widest text-gray-400 uppercase dark:border-white/8">
                  <th className="px-4 py-3">
                    <div className="bg-gray-250 h-3.5 w-16 rounded dark:bg-white/5" />
                  </th>
                  <th className="px-4 py-3">
                    <div className="bg-gray-250 h-3.5 w-24 rounded dark:bg-white/5" />
                  </th>
                  <th className="px-4 py-3">
                    <div className="bg-gray-250 h-3.5 w-20 rounded dark:bg-white/5" />
                  </th>
                  <th className="px-4 py-3">
                    <div className="bg-gray-250 h-3.5 w-16 rounded dark:bg-white/5" />
                  </th>
                  <th className="px-4 py-3">
                    <div className="bg-gray-250 h-3.5 w-12 rounded dark:bg-white/5" />
                  </th>
                  <th className="px-4 py-3">
                    <div className="bg-gray-250 h-3.5 w-16 rounded dark:bg-white/5" />
                  </th>
                  <th className="px-4 py-3">
                    <div className="bg-gray-250 h-3.5 w-20 rounded dark:bg-white/5" />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <div className="bg-gray-250 ml-auto h-3.5 w-24 rounded dark:bg-white/5" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {[...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {/* Date */}
                    <td className="px-4 py-4">
                      <div className="h-4 w-12 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Client Name */}
                    <td className="px-4 py-4">
                      <div className="h-4 w-28 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Project */}
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Unit/Plot */}
                    <td className="px-4 py-4">
                      <div className="h-4 w-12 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Area */}
                    <td className="px-4 py-4">
                      <div className="h-4 w-10 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Total Cost */}
                    <td className="px-4 py-4">
                      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Plan */}
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="ml-auto h-8 w-28 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : filteredBbas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
                No records found
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                We couldn't find any BBAs matching your current filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="text-brand-gold hover:bg-brand-gold/10 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold tracking-widest text-gray-400 uppercase dark:border-white/8">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Unit / Plot</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Total Cost</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700 dark:divide-white/5 dark:text-gray-300">
                {filteredBbas.map((record) => {
                  const cost = record.form_data ? calculateTotalCost(record.form_data) : 0;
                  const formattedCost = cost.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  });

                  return (
                    <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2">
                      <td className="text-brand-gold px-4 py-3.5 font-bold">
                        {record.form_data?.bookingDate
                          ? new Date(record.form_data.bookingDate).toLocaleDateString('en-GB')
                          : new Date(record.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                        {record.form_data?.clientName || 'N/A'}
                      </td>
                      <td className="px-4 py-3.5">{record.form_data?.projectName || 'N/A'}</td>
                      <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-white">
                        {record.form_data?.unitNumber || 'N/A'}
                      </td>
                      <td className="px-4 py-3.5">
                        {record.form_data?.area ? `${record.form_data.area} Sq. Yds.` : 'N/A'}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                        {formattedCost}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="bg-brand-gold/10 border-brand-gold/20 text-brand-gold rounded border px-2 py-0.5 text-[10px] font-bold">
                          {record.form_data?.paymentPlan || '12'} Months
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedBba(record)}
                            className="bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 font-bold transition-all"
                          >
                            <Eye className="h-3.5 w-3.5" /> View & Print
                          </button>
                          <button
                            onClick={() => setDeleteTarget(record)}
                            className="flex items-center justify-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 font-bold text-red-500 transition-all hover:bg-red-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredBbas.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">
                      No matching BBA records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0e0e14]">
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              Delete BBA Record
            </h3>
            <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
              Are you sure you want to permanently delete the BBA record generated for{' '}
              <strong>{deleteTarget.form_data?.clientName}</strong>?
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
          </div>
        </div>
      )}

      {/* View & Re-download overlay Modal */}
      {selectedBba && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-md dark:bg-black/90">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e0e14]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  BBA - {selectedBba.form_data?.clientName}
                </h3>
                <p className="text-[10px] text-gray-500">
                  Generated on {new Date(selectedBba.created_at).toLocaleDateString('en-GB')}
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
                  onClick={() => setSelectedBba(null)}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body with Scrollable Live Preview */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-6 dark:bg-zinc-900/30">
              <div
                id="modalBbaPreview"
                className="mx-auto w-full max-w-3xl rounded-xl bg-white p-8 font-sans text-[13px] leading-relaxed text-black shadow-sm"
              >
                <BbaPreviewContent formData={selectedBba.form_data} companyInfo={companyInfo} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
