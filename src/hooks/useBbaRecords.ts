import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { SavedBba } from '@/src/types/bba';

export function calculateTotalCost(formData?: SavedBba['form_data']) {
  if (!formData) return 0;
  const area = parseFloat(formData.area) || 0;
  const bsp = parseFloat(formData.bsp) || 0;
  const plc = parseFloat(formData.plc) || 0;

  const base = area * bsp;
  const plcAmount = base * (plc / 100);
  return base + plcAmount;
}

export function useBbaRecords(token: string | null) {
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

  const fetchBbas = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/admin/documents?type=bba&limit=1000', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error('Fetch Failed:', {
            status: res.status,
            statusText: res.statusText,
            url: res.url,
            text,
          });
          throw new Error(`Failed to fetch documents: ${res.status} ${res.statusText}`);
        }
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

  const totalCount = bbas.length;
  const totalValue = bbas.reduce((sum, r) => sum + calculateTotalCost(r.form_data), 0);
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
      const filename = `BBA_${clientName.replace(/\\s+/g, '_')}.pdf`;
      await exportToPDF({
        elementId: 'modalBbaPreview',
        filename,
      });

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
      const filename = `BBA_${clientName.replace(/\\s+/g, '_')}.png`;
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

  return {
    bbas,
    loading,
    searchQuery,
    setSearchQuery,
    projectFilter,
    setProjectFilter,
    sortConfig,
    setSortConfig,
    dateRange,
    setDateRange,
    selectedBba,
    setSelectedBba,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    pdfLoading,
    imageLoading,
    projects,
    companyInfo,
    fetchBbas,
    totalCount,
    totalValue,
    avgArea,
    shyamAanganCount,
    handleDelete,
    handleDownloadPDF,
    handleDownloadImage,
    filteredBbas,
    handleClearFilters,
  };
}
