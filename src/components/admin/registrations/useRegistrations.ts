'use client';
import { toast } from 'sonner';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Registration, Filters } from './types';
import {
  exportRegistrationsToCsv,
  exportRegistrationsToExcel,
} from '@/src/lib/registrations/exportRegistrations';

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
  const [reassignTargets, setReassignTargets] = useState<Registration[] | null>(null);
  const [showAdvisorSettings, setShowAdvisorSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length;

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
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

  // ── Supabase Realtime: live-sync new registrations ──────────────────────────
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Only subscribe once we have a valid admin token
    if (!token) return;

    // Tear down any previous channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel('realtime:registrations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        // Any change (INSERT / UPDATE / DELETE) instantly refreshes the list
        queryClient.invalidateQueries({ queryKey: ['registrations'] });
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [token, queryClient]);
  // ────────────────────────────────────────────────────────────────────────────

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

  const { data: activeAdvisors = [] } = useQuery<string[]>({
    queryKey: ['activeAdvisors'],
    queryFn: async () => {
      const res = await fetch('/api/registration');
      if (!res.ok)
        return [
          'Direct / SVI Official',
          'Ajeet Kumar',
          'Sanjay Sharma',
          'Pooja Singh',
          'Vikram Rathore',
        ];
      const data = await res.json();
      return (data.advisors as string[]) || [];
    },
    staleTime: 60 * 1000,
  });

  const availableAdvisors = useMemo(() => {
    const list = new Set<string>([
      'Direct / SVI Official',
      ...activeAdvisors,
      ...(filterOptions.advisors || []),
    ]);
    return Array.from(list)
      .filter(Boolean)
      .sort((a, b) => {
        if (a === 'Direct / SVI Official') return -1;
        if (b === 'Direct / SVI Official') return 1;
        return a.localeCompare(b);
      });
  }, [activeAdvisors, filterOptions.advisors]);

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

  const registrations: Registration[] = registrationsData?.registrations || [];
  const total = registrationsData?.total || 0;
  const hasMore = registrationsData?.hasMore || false;

  // Mutations
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      let authToken = token;
      if (!authToken) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        authToken = session?.access_token || '';
      }
      const normalizedStatus = status.toLowerCase();
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ id, status: normalizedStatus }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || 'Failed to update status');
      }
      return { id, status: normalizedStatus };
    },
    onSuccess: (data) => {
      showToast('success', `Status updated to ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      if (selectedReg?.id === data.id) {
        setSelectedReg((prev) => (prev ? { ...prev, status: data.status } : null));
      }
    },
    onError: (err: Error) => showToast('error', err?.message || 'Failed to update status'),
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

  const updateAdvisorMutation = useMutation({
    mutationFn: async ({ ids, advisorName }: { ids: string[]; advisorName: string }) => {
      let authToken = token;
      if (!authToken) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        authToken = session?.access_token || '';
      }
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(
          ids.length === 1
            ? { id: ids[0], advisor_name: advisorName }
            : { ids, advisor_name: advisorName }
        ),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || 'Failed to update advisor');
      }
      return { ids, advisorName };
    },
    onSuccess: (data) => {
      const count = data.ids.length;
      if (count === 1) {
        showToast('success', `Advisor updated to "${data.advisorName}"`);
      } else {
        showToast('success', `Reassigned ${count} clients to "${data.advisorName}"`);
        clearSelection();
      }
      setReassignTargets(null);
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['filterOptions'] });
      if (selectedReg && data.ids.includes(selectedReg.id)) {
        setSelectedReg((prev) => (prev ? { ...prev, advisor_name: data.advisorName } : null));
      }
    },
    onError: (err: Error) => showToast('error', err?.message || 'Failed to update advisor'),
  });

  const handleOpenReassign = useCallback((targets: Registration | Registration[]) => {
    const list = Array.isArray(targets) ? targets : [targets];
    if (list.length > 0) setReassignTargets(list);
  }, []);

  const handleCloseReassign = useCallback(() => {
    setReassignTargets(null);
  }, []);

  const handleConfirmReassign = useCallback(
    async (advisorName: string) => {
      if (!reassignTargets || reassignTargets.length === 0) return;
      const ids = reassignTargets.map((r) => r.id);
      await updateAdvisorMutation.mutateAsync({ ids, advisorName });
    },
    [reassignTargets, updateAdvisorMutation]
  );

  const handleUpdateSingleAdvisor = useCallback(
    async (id: string, advisorName: string) => {
      await updateAdvisorMutation.mutateAsync({ ids: [id], advisorName });
    },
    [updateAdvisorMutation]
  );

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

      queryClient.setQueryData<{
        registrations: Registration[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
      }>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          registrations: old.registrations.map((r) => (r.id === id ? { ...r, is_important } : r)),
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
    setSelectedIds(new Set());
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setSelectedIds(new Set());
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

  // ── Multi-select management ────────────────────────────────────────────────
  const toggleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === registrations.length && registrations.length > 0) {
        return new Set();
      }
      return new Set(registrations.map((r) => r.id));
    });
  }, [registrations]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedRegistrations = useMemo(() => {
    return registrations.filter((r) => selectedIds.has(r.id));
  }, [registrations, selectedIds]);

  const handleExportSelectedCsv = useCallback(() => {
    exportRegistrationsToCsv(selectedRegistrations);
  }, [selectedRegistrations]);

  const handleExportSelectedExcel = useCallback(async () => {
    await exportRegistrationsToExcel(selectedRegistrations);
  }, [selectedRegistrations]);
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
      'Investment Amount',
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
    reassignTargets,
    reassignLoading: updateAdvisorMutation.isPending,
    availableAdvisors,
    handleOpenReassign,
    handleCloseReassign,
    handleConfirmReassign,
    handleUpdateSingleAdvisor,
    showFilters,
    sortBy,
    sortOrder,
    filters,
    filterOptions,
    activeFilterCount,
    startItem,
    endItem,
    selectedIds,
    selectedRegistrations,
    selectedCount: selectedIds.size,
    isAllSelected: registrations.length > 0 && selectedIds.size === registrations.length,
    setSearch,
    setSelectedReg,
    setDeleteTarget,
    setShowAdvisorSettings,
    setShowFilters,
    setSortBy,
    setSortOrder,
    setPage,
    setSelectedIds,
    toggleSelectOne,
    toggleSelectAll,
    clearSelection,
    handleExportSelectedCsv,
    handleExportSelectedExcel,
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
