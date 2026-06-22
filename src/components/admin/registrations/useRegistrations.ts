'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const [token, setToken] = useState('');
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null);
  const [showAdvisorSettings, setShowAdvisorSettings] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length;

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

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

      setToken(session.access_token);
    });
  }, [router]);

  // Fetch filter options via React Query
  const {
    data: filterOptions = {
      projects: [],
      advisors: [],
      propertyTypes: [],
      propertySizes: [],
      plotPreferences: [],
      paymentPlans: [],
      paymentModes: [],
    },
  } = useQuery({
    queryKey: ['filterOptions', token],
    queryFn: async () => {
      const res = await fetch('/api/admin/registrations/filters', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch filters');
      return res.json();
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 mins cache for filters
  });

  // Fetch registrations data via React Query
  const {
    data: registrationsData,
    isLoading: loading,
    refetch: fetchRegistrations,
  } = useQuery({
    queryKey: ['registrations', token, search, page, sortBy, sortOrder, filters],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50', page: String(page) });
      if (search) params.set('search', search);
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch registrations');
      return res.json();
    },
    enabled: !!token,
    // Keep showing old data while new data loads for a snappy UI
    placeholderData: (previousData) => previousData,
  });

  const registrations = registrationsData?.registrations || [];
  const total = registrationsData?.total || 0;
  const hasMore = registrationsData?.hasMore || false;

  // Mutations
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return { id, status };
    },
    onSuccess: (data) => {
      showToast('success', `Status updated to ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      if (selectedReg?.id === data.id) {
        setSelectedReg((prev) => (prev ? { ...prev, status: data.status } : null));
      }
    },
    onError: () => showToast('error', 'Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/registrations?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      showToast('success', 'Registration deleted');
      setDeleteTarget(null);
      setSelectedReg(null);
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
    onError: () => showToast('error', 'Failed to delete registration'),
  });

  const starMutation = useMutation({
    mutationFn: async ({ id, is_important }: { id: string; is_important: boolean }) => {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, is_important }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return is_important;
    },
    // Optimistic UI update for immediate response
    onMutate: async ({ id, is_important }) => {
      await queryClient.cancelQueries({ queryKey: ['registrations'] });
      const queryKey = ['registrations', token, search, page, sortBy, sortOrder, filters];
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          registrations: old.registrations.map((r: any) =>
            r.id === id ? { ...r, is_important } : r
          ),
        };
      });
      return { previousData, queryKey };
    },
    onSuccess: (is_important) => {
      showToast('success', is_important ? 'Marked as important' : 'Unmarked from important');
    },
    onError: (err, newTodo, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      showToast('error', 'Failed to update');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    statusMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  };

  const handleStarToggle = (reg: Registration) => {
    starMutation.mutate({ id: reg.id, is_important: !reg.is_important });
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

  const startItem = total === 0 ? 0 : (page - 1) * 50 + 1;
  const endItem = Math.min(page * 50, total);

  return {
    registrations,
    loading,
    token,
    search,
    selectedReg,
    deleteTarget,
    deleteLoading: deleteMutation.isPending,
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

    setSearch,
    setSelectedReg,
    setDeleteTarget,
    setShowAdvisorSettings,
    setShowFilters,
    setSortBy,
    setSortOrder,
    setPage,

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
