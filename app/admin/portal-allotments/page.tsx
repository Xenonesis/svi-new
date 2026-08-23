'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/lib/supabase/client';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import type { SavedAllotment, CompanyInfo } from '@/src/components/admin/allotment-records/types';
import { AllotmentViewModal } from '@/src/components/admin/allotment-records/AllotmentViewModal';
import { AllotmentDeleteModal } from '@/src/components/admin/allotment-records/AllotmentDeleteModal';
import { PortalAllotmentsStats } from '@/src/components/admin/portal-allotments/PortalAllotmentsStats';
import { PortalAllotmentsFilters } from '@/src/components/admin/portal-allotments/PortalAllotmentsFilters';
import { PortalAllotmentsTable } from '@/src/components/admin/portal-allotments/PortalAllotmentsTable';

const defaultCompanyInfo: CompanyInfo = {
  company_name: 'SVI Infra Solutions Pvt. Ltd.',
  company_address: 'Block E-220, Sector 63, Noida, Uttar Pradesh 201309',
  company_email: 'info@sviinfrasolutions.com',
  company_phone: '+91 9216014579',
  company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
  bank_account_name: 'Svi Infra Solutions Pvt. Ltd',
  bank_account_no: '0894102000013837',
  bank_name: 'IDBI BANK',
  bank_ifsc: 'IBKL0000894',
};

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
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);

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
      {/* Header */}
      <div className="mb-4 flex items-center justify-between sm:mb-8">
        <div>
          <h1 className="text-brand-navy mb-1 font-serif text-2xl tracking-tight sm:mb-2 sm:text-3xl dark:text-white">
            Portal <span className="text-brand-gold italic">Allotments</span>
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            View, search, audit, download, and delete allotments requested via the customer account
            portal.
          </p>
        </div>
        <button
          onClick={fetchAllotments}
          className="dark:bg-brand-dark-surface/50 flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 sm:h-10 sm:w-10 dark:border-white/10 dark:hover:bg-white/5"
          title="Refresh List"
        >
          <RefreshCw className="h-3.5 w-3.5 text-gray-600 sm:h-4 sm:w-4 dark:text-gray-400" />
        </button>
      </div>

      {/* Quick Statistics Cards */}
      <PortalAllotmentsStats allotments={allotments} />

      {/* Toolbar */}
      <PortalAllotmentsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        projects={projects}
      />

      {/* Records Table */}
      <PortalAllotmentsTable
        loading={loading}
        records={filteredAllotments}
        searchQuery={searchQuery}
        onSelectRecord={setSelectedAllotment}
        onDeleteRecord={setDeleteTarget}
      />

      {/* Delete Confirmation Modal */}
      <AllotmentDeleteModal
        target={deleteTarget}
        loading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* View & Re-download overlay Modal */}
      <AllotmentViewModal
        allotment={selectedAllotment}
        companyInfo={companyInfo}
        pdfLoading={pdfLoading}
        imageLoading={imageLoading}
        onClose={() => setSelectedAllotment(null)}
        onDownloadPDF={handleDownloadPDF}
        onDownloadImage={handleDownloadImage}
      />
    </div>
  );
}
