'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import type { Registration, FilterOptions, Filters } from './types';

const DEFAULT_FILTERS: Filters = {
  project: '',
  advisor: '',
  propertyType: '',
  propertySize: '',
  plotPreference: '',
  paymentPlan: '',
  paymentMode: '',
  dateFrom: '',
  dateTo: '',
  status: '',
};

export function useRegistrations() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showAdvisorSettings, setShowAdvisorSettings] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    projects: [],
    advisors: [],
    propertyTypes: [],
    propertySizes: [],
    plotPreferences: [],
    paymentPlans: [],
    paymentModes: [],
  });

  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length;

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchFilterOptions = useCallback(async (tkn: string) => {
    const res = await fetch('/api/admin/registrations/filters', {
      headers: { Authorization: `Bearer ${tkn}` },
    });
    if (!res.ok) return;
    const json = await res.json();

    setFilterOptions({
      projects: json.projects || [],
      advisors: json.advisors || [],
      propertyTypes: json.propertyTypes || [],
      propertySizes: json.propertySizes || [],
      plotPreferences: json.plotPreferences || [],
      paymentPlans: json.paymentPlans || [],
      paymentModes: json.paymentModes || [],
    });
  }, []);

  const fetchRegistrations = useCallback(
    async (tkn: string, q: string = '', p: number = 1) => {
      setLoading(true);
      const params = new URLSearchParams({ limit: '50', page: String(p) });
      if (q) params.set('search', q);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      if (filters.project) params.set('project', filters.project);
      if (filters.advisor) params.set('advisor', filters.advisor);
      if (filters.propertyType) params.set('propertyType', filters.propertyType);
      if (filters.propertySize) params.set('propertySize', filters.propertySize);
      if (filters.plotPreference) params.set('plotPreference', filters.plotPreference);
      if (filters.paymentPlan) params.set('paymentPlan', filters.paymentPlan);
      if (filters.paymentMode) params.set('paymentMode', filters.paymentMode);
      if (filters.status) params.set('status', filters.status);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);

      const res = await fetch(`/api/admin/registrations?${params}`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      if (res.ok) {
        const json = await res.json();
        setRegistrations(json.registrations);
        setTotal(json.total);
        setHasMore(json.hasMore);
        setPage(json.page);
      }
      setLoading(false);
    },
    [sortBy, sortOrder, filters]
  );

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/admin');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.replace('/admin');
        return;
      }

      const tkn = session.access_token;
      setToken(tkn);
      fetchRegistrations(tkn);
      fetchFilterOptions(tkn);
    });
  }, [router, fetchRegistrations, fetchFilterOptions]);

  // Refetch when filters/sort change
  useEffect(() => {
    if (token) fetchRegistrations(token, search, 1);
  }, [filters, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistrations(token, search, 1);
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      showToast('success', `Status updated to ${newStatus}`);
      fetchRegistrations(token, search, page);
      if (selectedReg?.id === id) {
        setSelectedReg((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch {
      showToast('error', 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('success', 'Registration deleted');
      setDeleteTarget(null);
      setSelectedReg(null);
      fetchRegistrations(token, search, page);
    } catch {
      showToast('error', 'Failed to delete registration');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = async () => {
    const params = new URLSearchParams({ limit: '1000' });
    if (search) params.set('search', search);
    if (filters.project) params.set('project', filters.project);
    if (filters.advisor) params.set('advisor', filters.advisor);
    if (filters.propertyType) params.set('propertyType', filters.propertyType);
    if (filters.propertySize) params.set('propertySize', filters.propertySize);
    if (filters.plotPreference) params.set('plotPreference', filters.plotPreference);
    if (filters.paymentPlan) params.set('paymentPlan', filters.paymentPlan);
    if (filters.paymentMode) params.set('paymentMode', filters.paymentMode);
    if (filters.status) params.set('status', filters.status);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);

    const res = await fetch(`/api/admin/registrations?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const json = await res.json();
    const regs: Registration[] = json.registrations || [];

    const headers = [
      'Submission ID',
      'Name',
      'Last Name',
      'Email',
      'Phone',
      'S/O W/O D/O',
      'DOB',
      'Aadhar',
      'PAN',
      'State',
      'City',
      'Address',
      'Advisor',
      'Project',
      'Property Size',
      'Property Type',
      'Plot Preference',
      'Payment Plan',
      'Payment Mode',
      'Scheme Amount',
      'Status',
      'Date',
    ];

    const rows = regs.map((r) => [
      r.submission_id || '',
      r.name,
      r.last_name || '',
      r.email,
      r.phone,
      r.so_wo_do || '',
      r.preferred_date || '',
      r.aadhar_number || '',
      r.pan_number || '',
      r.state || '',
      r.city || '',
      r.address || '',
      r.advisor_name || '',
      r.project || '',
      r.property_size || '',
      r.property_type || '',
      r.plot_preference || '',
      r.payment_plan || '',
      r.payment_mode || '',
      r.scheme_amount || '',
      r.status,
      new Date(r.created_at).toLocaleDateString('en-IN'),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', `Exported ${regs.length} registrations`);
  };

  const handleStarToggle = async (reg: Registration) => {
    const nextVal = !reg.is_important;
    setRegistrations((prev) =>
      prev.map((r) => (r.id === reg.id ? { ...r, is_important: nextVal } : r))
    );
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: reg.id, is_important: nextVal }),
      });
      if (!res.ok) throw new Error();
      showToast('success', nextVal ? 'Marked as important' : 'Unmarked from important');
    } catch {
      setRegistrations((prev) =>
        prev.map((r) => (r.id === reg.id ? { ...r, is_important: !nextVal } : r))
      );
      showToast('error', 'Failed to update');
    }
  };

  const startItem = total === 0 ? 0 : (page - 1) * 50 + 1;
  const endItem = Math.min(page * 50, total);

  return {
    // State
    registrations,
    loading,
    token,
    search,
    selectedReg,
    deleteTarget,
    deleteLoading,
    total,
    page,
    hasMore,
    showAdvisorSettings,
    toast,
    showFilters,
    sortBy,
    sortOrder,
    filters,
    filterOptions,
    activeFilterCount,
    startItem,
    endItem,

    // Setters
    setSearch,
    setSelectedReg,
    setDeleteTarget,
    setShowAdvisorSettings,
    setShowFilters,
    setSortBy,
    setSortOrder,
    setPage,

    // Handlers
    handleSearch,
    updateFilter,
    clearFilters,
    handleStatusChange,
    handleDelete,
    handleExportCSV,
    handleStarToggle,
    fetchRegistrations,
    showToast,
  };
}
