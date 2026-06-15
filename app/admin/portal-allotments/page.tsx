'use client';

import { motion } from 'motion/react';
import { useAuthStore } from '@/src/stores/authStore';
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
  Mail,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { supabase } from '@/src/lib/supabase/client';
import Link from 'next/link';

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
    paymentPlan: string;
    bookingDate: string;
    secondPaymentDays: string;
    advisorName: string;
    advisorNumber: string;
    advisorEmail?: string;
  };
}

export default function PortalAllotmentsPage() {
  const { token } = useAuthStore();
  const [allotments, setAllotments] = useState<SavedAllotment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [selectedAllotment, setSelectedAllotment] = useState<SavedAllotment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedAllotment | null>(null);
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

  const fetchAllotments = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/admin/documents?type=allotment_letter&source=portal&limit=1000', {
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
      .catch((err) => console.error('Error fetching allotments:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllotments();
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

  const calculateTotalCost = (formData: SavedAllotment['form_data']) => {
    const area = parseFloat(formData?.area) || 0;
    const bsp = parseFloat(formData?.bsp) || 0;
    const plc = parseFloat(formData?.plc) || 0;

    const base = area * bsp;
    const plcAmount = base * (plc / 100);
    return base + plcAmount;
  };

  const calculateInitialPayment = (formData: SavedAllotment['form_data']) => {
    return calculateTotalCost(formData) * 0.05;
  };

  // Statistics calculation
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
        fetchAllotments();
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

      // Update status to completed in db
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

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Portal <span className="text-brand-gold italic">Allotments</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View, search, audit, download, and delete allotments requested via the client portal.
          </p>
        </div>
        <button
          onClick={fetchAllotments}
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
              <FileText className="text-brand-gold h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Total Letters
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
                Total Unit Value
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
            </div>
          </div>
        </div>

        <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
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

        <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
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

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 font-sans sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-brand-gold absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client, ticket ID or advisor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white py-3 pr-10 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:text-white dark:placeholder-gray-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="hover:text-brand-gold absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="focus:border-brand-gold dark:bg-brand-dark-surface/85 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 transition-all outline-none hover:bg-gray-50 sm:w-auto dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <option value="">ALL PROJECTS</option>
            {projects.map((proj) => (
              <option key={proj} value={proj}>
                {proj.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Records Table glassmorphic container */}
      <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl transition-colors duration-300 dark:border-white/8">
        {/* Subtle gold line on top */}
        <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="overflow-x-auto">
          {loading ? (
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
                    'Actions',
                  ].map((h, idx) => (
                    <th
                      key={h}
                      className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400 ${idx === 7 ? 'text-right' : 'text-left'}`}
                    >
                      <div
                        className={`h-3 rounded bg-gray-200 dark:bg-white/5 ${idx === 7 ? 'ml-auto w-16' : 'w-24'}`}
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
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-4 w-12 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="ml-auto h-8 w-28 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : filteredAllotments.length === 0 ? (
            <div className="py-24 text-center font-sans">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400 transition-colors duration-300 dark:text-gray-700" />
              <p className="text-sm font-medium text-gray-500 transition-colors duration-300 dark:text-gray-400">
                {searchQuery ? 'No matches found.' : 'No allotment records generated yet.'}
              </p>
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
                    'Actions',
                  ].map((h, idx) => (
                    <th
                      key={h}
                      className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400 ${idx === 7 ? 'text-right' : 'text-left'}`}
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
                        <span className="text-brand-gold border-brand-gold/20 bg-brand-gold/10 rounded-full border px-2 py-1 text-xs font-bold">
                          {record.form_data?.ticketId || 'N/A'}
                        </span>
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
          <div className="dark:bg-brand-dark-surface relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10">
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
          </div>
        </div>
      )}

      {/* View & Re-download overlay Modal */}
      {selectedAllotment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-md dark:bg-black/90">
          <div className="dark:bg-brand-dark-surface relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Allotment Letter - {selectedAllotment.form_data?.ticketId}
                </h3>
                <p className="text-[10px] text-gray-500">
                  Generated on {new Date(selectedAllotment.created_at).toLocaleDateString('en-GB')}
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
                  onClick={() => setSelectedAllotment(null)}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body with Scrollable Live Preview */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-6 dark:bg-zinc-900/30">
              <div
                id="modalAllotmentPreview"
                className="mx-auto w-full max-w-3xl rounded-xl bg-white p-8 font-sans text-[13px] leading-relaxed text-black shadow-sm"
              >
                {/* Watermark */}
                <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-5">
                  <img
                    src="/logo.png"
                    alt="Watermark"
                    className="w-[80%] max-w-3xl object-contain grayscale"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="mb-6 flex items-start justify-between border-b-2 border-[#1e3a8a] pb-4">
                    <div>
                      <h1 className="mb-2 text-2xl font-bold tracking-wide text-[#1e3a8a] uppercase">
                        {companyInfo.company_name}
                      </h1>
                      <p className="text-gray-700">
                        Cell: {companyInfo.company_phone} | Email: {companyInfo.company_email}
                      </p>
                      <p className="text-gray-700">Website: {companyInfo.company_website}</p>
                      <p className="text-gray-700">
                        Office Address : {companyInfo.company_address}
                      </p>
                    </div>
                    <div className="w-48">
                      <img
                        src="/logo.png"
                        alt={companyInfo.company_name}
                        className="h-auto w-full object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  </div>

                  {/* Date & To */}
                  <div className="mb-6 font-sans">
                    <p className="mb-4 font-bold">
                      Dated:{' '}
                      {selectedAllotment.form_data?.bookingDate
                        ? selectedAllotment.form_data.bookingDate.split('-').reverse().join('-')
                        : new Date(selectedAllotment.created_at)
                            .toISOString()
                            .split('T')[0]
                            .split('-')
                            .reverse()
                            .join('-')}
                    </p>
                    <p className="font-bold">To,</p>
                    <p className="font-bold">{selectedAllotment.form_data?.clientName || 'N/A'}</p>
                    <p className="font-bold whitespace-pre-wrap">
                      {selectedAllotment.form_data?.address || 'N/A'}
                    </p>
                  </div>

                  {/* Body */}
                  <div className="mb-6 font-sans">
                    <p className="mb-2">
                      Dear {selectedAllotment.form_data?.salutation || 'Mr.'}{' '}
                      <span className="font-bold">
                        {selectedAllotment.form_data?.clientName || 'N/A'}
                      </span>
                    </p>
                    <p className="mb-1 text-justify">
                      Congratulations from {companyInfo.company_name} on your new investment in{' '}
                      {selectedAllotment.form_data?.projectName} (Kishan Garh Renwal, Jaipur,
                      Rajasthan). It is a perfect choice and you are one of the few lucky ones to
                      get unit at such reasonable rates.
                    </p>
                    <p className="mb-4 text-justify">
                      We at {companyInfo.company_name} feel privileged to be part of your great
                      investment. We thank you for giving us an opportunity to assist you in making
                      this very investment. We sincerely hope that you are satisfied with our
                      services and will refer us in your circle.
                    </p>

                    <p className="mb-2 font-bold">Your Allotment is as Follows:</p>
                    <p>
                      Ticket Id :{' '}
                      <span className="font-bold">{selectedAllotment.form_data?.ticketId}</span>
                    </p>
                    <p>
                      Project Name :{' '}
                      <span className="font-bold">{selectedAllotment.form_data?.projectName}</span>
                    </p>
                    <p>
                      Unit Number :{' '}
                      <span className="font-bold">{selectedAllotment.form_data?.unitNumber}</span>
                    </p>

                    <p className="mt-4 mb-2">
                      Brief details about the total cost of the unit and payment plan are as
                      follows:
                    </p>
                  </div>

                  {/* Details Table */}
                  <div className="mb-6 overflow-hidden border border-gray-400">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-[#00b0f0] text-xs text-black">
                          <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                            Client Name
                          </th>
                          <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                            Allotted Unit
                          </th>
                          <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                            Area (Sq. Yds.)
                          </th>
                          <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                            Payment Plan
                          </th>
                          <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                            BSP (PSq.Yd)
                          </th>
                          <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                            PLC (in %)
                          </th>
                          <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                            Total Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        <tr>
                          <td className="border border-gray-400 p-2 font-bold">
                            {selectedAllotment.form_data?.clientName}
                          </td>
                          <td className="border border-gray-400 p-2 font-bold">
                            {selectedAllotment.form_data?.unitNumber}
                          </td>
                          <td className="border border-gray-400 p-2 font-bold">
                            {selectedAllotment.form_data?.area}
                          </td>
                          <td className="border border-gray-400 p-2 font-bold">
                            {selectedAllotment.form_data?.paymentPlan} Months
                          </td>
                          <td className="border border-gray-400 p-2 font-bold">
                            {selectedAllotment.form_data?.bsp}
                          </td>
                          <td className="border border-gray-400 p-2 font-bold">
                            {selectedAllotment.form_data?.plc || '0'}
                          </td>
                          <td className="border border-gray-400 p-2 font-bold">
                            {calculateTotalCost(selectedAllotment.form_data).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Payment Schedule Table */}
                  <h3 className="mb-2 text-lg font-bold text-gray-800">Payment Schedule</h3>
                  <div className="mb-6 overflow-hidden border border-gray-400">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-[#00b0f0] text-xs text-black">
                          <th className="border border-gray-400 p-2 font-bold">SNO</th>
                          <th className="border border-gray-400 p-2 font-bold">Date</th>
                          <th className="border border-gray-400 p-2 font-bold">Particulars</th>
                          <th className="border border-gray-400 p-2 font-bold">%</th>
                          <th className="border border-gray-400 p-2 font-bold">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {/* First Instalment (5%) */}
                        <tr>
                          <td className="border border-gray-400 p-2 font-bold">1</td>
                          <td className="border border-gray-400 p-2 font-bold">
                            {(() => {
                              if (!selectedAllotment.form_data?.bookingDate) return '-';
                              const d = new Date(selectedAllotment.form_data.bookingDate);
                              return d.toISOString().split('T')[0].split('-').reverse().join('-');
                            })()}
                          </td>
                          <td className="border border-gray-400 p-2 font-bold">
                            On Booking (First 3 Days)
                          </td>
                          <td className="border border-gray-400 p-2">5%</td>
                          <td className="border border-gray-400 p-2 font-bold">
                            Rs. {calculateInitialPayment(selectedAllotment.form_data).toFixed(2)}
                          </td>
                        </tr>
                        {/* Second Instalment (5%) */}
                        <tr>
                          <td className="border border-gray-400 p-2 font-bold">2</td>
                          <td className="border border-gray-400 p-2 font-bold">
                            {(() => {
                              if (!selectedAllotment.form_data?.bookingDate) return '-';
                              const d = new Date(selectedAllotment.form_data.bookingDate);
                              d.setDate(d.getDate() + 10);
                              return d.toISOString().split('T')[0].split('-').reverse().join('-');
                            })()}
                          </td>
                          <td className="border border-gray-400 p-2 font-bold">
                            Second Instalment (Next 7 Days)
                          </td>
                          <td className="border border-gray-400 p-2">5%</td>
                          <td className="border border-gray-400 p-2 font-bold">
                            Rs.{' '}
                            {(calculateTotalCost(selectedAllotment.form_data) * 0.05).toFixed(2)}
                          </td>
                        </tr>
                        {/* Third Instalment (30%) */}
                        <tr>
                          <td className="border border-gray-400 p-2 font-bold">3</td>
                          <td className="border border-gray-400 p-2 font-bold">
                            {(() => {
                              if (!selectedAllotment.form_data?.bookingDate) return '-';
                              const d = new Date(selectedAllotment.form_data.bookingDate);
                              d.setDate(d.getDate() + 25);
                              return d.toISOString().split('T')[0].split('-').reverse().join('-');
                            })()}
                          </td>
                          <td className="border border-gray-400 p-2 font-bold">
                            Third Instalment (Next 15 Days)
                          </td>
                          <td className="border border-gray-400 p-2">30%</td>
                          <td className="border border-gray-400 p-2 font-bold">
                            Rs. {(calculateTotalCost(selectedAllotment.form_data) * 0.3).toFixed(2)}
                          </td>
                        </tr>
                        {/* EMIs (Remaining 60%) */}
                        {(() => {
                          const totalCostVal = calculateTotalCost(selectedAllotment.form_data);
                          const remainingCost = totalCostVal * 0.6;
                          const months = parseInt(selectedAllotment.form_data?.paymentPlan || '12');
                          const emiAmount = remainingCost / months;
                          const emiPercent = 60 / months;

                          return Array.from({ length: months }).map((_, i) => {
                            let emiDate = '-';
                            if (selectedAllotment.form_data?.bookingDate) {
                              const d = new Date(selectedAllotment.form_data.bookingDate);
                              d.setMonth(d.getMonth() + i + 2);
                              emiDate = d
                                .toISOString()
                                .split('T')[0]
                                .split('-')
                                .reverse()
                                .join('-');
                            }

                            return (
                              <tr key={i}>
                                <td className="border border-gray-400 p-2 font-bold">{i + 4}</td>
                                <td className="border border-gray-400 p-2 font-bold">{emiDate}</td>
                                <td className="border border-gray-400 p-2 font-bold">
                                  {i + 1} EMI
                                </td>
                                <td className="border border-gray-400 p-2">
                                  {emiPercent.toFixed(1)}%
                                </td>
                                <td className="border border-gray-400 p-2 font-bold">
                                  Rs. {emiAmount.toFixed(2)}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Terms Box */}
                  <div className="mb-8 rounded-lg border-l-4 border-[#00b0f0] bg-[#f0f8ff] p-4 text-xs text-gray-800 italic">
                    <p className="mb-2">
                      Please transfer the initial amount of 5% (Rs.{' '}
                      {calculateInitialPayment(selectedAllotment.form_data).toFixed(2)}) within the
                      first 3 days (by{' '}
                      {(() => {
                        if (!selectedAllotment.form_data?.bookingDate) return '[Date]';
                        const d = new Date(selectedAllotment.form_data.bookingDate);
                        d.setDate(d.getDate() + 3);
                        return d.toISOString().split('T')[0].split('-').reverse().join('-');
                      })()}
                      ) to confirm allotment under {selectedAllotment.form_data?.projectName}.
                    </p>
                    <p className="mb-2">
                      The second instalment of 5% (Rs.{' '}
                      {(calculateTotalCost(selectedAllotment.form_data) * 0.05).toFixed(2)}) must be
                      paid in the next 7 days (by{' '}
                      {(() => {
                        if (!selectedAllotment.form_data?.bookingDate) return '[Date]';
                        const d = new Date(selectedAllotment.form_data.bookingDate);
                        d.setDate(d.getDate() + 10);
                        return d.toISOString().split('T')[0].split('-').reverse().join('-');
                      })()}
                      ), and the third instalment of 30% (Rs.{' '}
                      {(calculateTotalCost(selectedAllotment.form_data) * 0.3).toFixed(2)}) in the
                      next 15 days (by{' '}
                      {(() => {
                        if (!selectedAllotment.form_data?.bookingDate) return '[Date]';
                        const d = new Date(selectedAllotment.form_data.bookingDate);
                        d.setDate(d.getDate() + 25);
                        return d.toISOString().split('T')[0].split('-').reverse().join('-');
                      })()}
                      ).
                    </p>
                    <p className="mb-2">
                      The remaining 60% will be paid as per the selected payment plan EMIs and is
                      scheduled to complete accordingly.
                    </p>
                    <p className="mb-2">
                      Note: Allotment under {selectedAllotment.form_data?.projectName} will only be
                      confirmed upon receipt of the initial 5% (Rs.{' '}
                      {calculateInitialPayment(selectedAllotment.form_data).toFixed(2)}) by the due
                      date.
                    </p>
                    <p>
                      In the event you fail to make the payments as per the payment plan chosen by
                      you, the allotment of these plots will be automatically cancelled.
                    </p>
                  </div>

                  {/* Footer details */}
                  <div className="flex items-end justify-between pb-8">
                    <div>
                      <p className="mb-2 font-bold">
                        Payment can be transferred online using the following details:
                      </p>
                      <p>
                        <span className="font-bold">Account Name:</span>{' '}
                        {companyInfo.bank_account_name || 'Svi Infra Solutions Pvt. Ltd'}
                      </p>
                      <p>
                        <span className="font-bold">Account Number:</span>{' '}
                        {companyInfo.bank_account_no || '0894102000013837'}
                      </p>
                      <p>
                        <span className="font-bold">Bank:</span>{' '}
                        {companyInfo.bank_name || 'IDBI BANK'}
                      </p>
                      <p>
                        <span className="font-bold">IFSC CODE:</span>{' '}
                        {companyInfo.bank_ifsc || 'IBKL0000894'}
                      </p>
                      <p className="mt-4">
                        Your account manager is{' '}
                        <span className="font-bold">
                          {selectedAllotment.form_data?.advisorName}
                        </span>{' '}
                        and will be reachable on{' '}
                        <span className="font-bold">
                          {selectedAllotment.form_data?.advisorNumber}
                        </span>
                        {selectedAllotment.form_data?.advisorEmail ? (
                          <>
                            {' '}
                            (Email:{' '}
                            <span className="font-bold">
                              {selectedAllotment.form_data.advisorEmail}
                            </span>
                            )
                          </>
                        ) : (
                          ''
                        )}{' '}
                        for any queries.
                      </p>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
