'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { IvrFilterState } from '@/src/components/admin/leads/IvrLeadsTable';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
export interface IvrSummaryStats {
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  hot_count: number;
  warm_count: number;
  cold_count: number;
}

export interface UseIvrLeadsManagementOptions {
  token?: string | null;
  activeTab?: string;
}

export function useIvrLeadsManagement(
  tokenOrOptions?: string | null | UseIvrLeadsManagementOptions,
  activeTabParam?: string
) {
  const token =
    typeof tokenOrOptions === 'object' && tokenOrOptions !== null
      ? tokenOrOptions.token
      : tokenOrOptions;

  const activeTab =
    typeof tokenOrOptions === 'object' && tokenOrOptions !== null
      ? tokenOrOptions.activeTab
      : activeTabParam;

  // IVR records state
  const [ivrRecords, setIvrRecords] = useState<IvrRecordItem[]>([]);
  const [ivrTotalCount, setIvrTotalCount] = useState(0);
  const [ivrPage, setIvrPage] = useState(1);
  const [ivrLimit] = useState(25);
  const [ivrFilters, setIvrFilters] = useState<IvrFilterState>({
    dial_status: 'all',
    temperature: 'all',
    advisor_id: 'all',
    q: '',
    pressed_key: 'all',
    date: '',
    duration_filter: 'all',
    sort_by: 'dial_time',
    sort_order: 'desc',
  });

  const [summary, setSummary] = useState<IvrSummaryStats>({
    total_calls: 0,
    answered_calls: 0,
    missed_calls: 0,
    hot_count: 0,
    warm_count: 0,
    cold_count: 0,
  });

  // Cached employees for advisor dropdowns (10 min stale time)
  const { data: employeesData } = useQuery({
    queryKey: ['admin', 'employees', 'dropdown'],
    queryFn: async () => {
      const res = await fetch('/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      return (data.employees || []) as Employee[];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
  });
  const employees = employeesData || [];

  // TanStack Query for cached IVR records (45s staleTime, smooth placeholderData)
  const queryKey = useMemo(
    () => ['admin', 'ivr-records', ivrPage, ivrLimit, ivrFilters],
    [ivrPage, ivrLimit, ivrFilters]
  );

  const {
    data: ivrData,
    isLoading: ivrQueryLoading,
    refetch: refetchIvrQuery,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(ivrPage),
        limit: String(ivrLimit),
        dial_status: ivrFilters.dial_status,
        temperature: ivrFilters.temperature,
        advisor_id: ivrFilters.advisor_id,
      });
      if (ivrFilters.q) params.set('q', ivrFilters.q);
      if (ivrFilters.pressed_key && ivrFilters.pressed_key !== 'all') {
        params.set('pressed_key', ivrFilters.pressed_key);
      }
      if (ivrFilters.date) {
        params.set('date', ivrFilters.date);
      }
      if (ivrFilters.duration_filter && ivrFilters.duration_filter !== 'all') {
        if (ivrFilters.duration_filter === 'lt_30') {
          params.set('max_duration', '29');
        } else if (ivrFilters.duration_filter === '30_60') {
          params.set('min_duration', '30');
          params.set('max_duration', '60');
        } else if (ivrFilters.duration_filter === 'gt_60') {
          params.set('min_duration', '61');
        }
      }
      if (ivrFilters.sort_by) {
        params.set('sort_by', ivrFilters.sort_by);
      }
      if (ivrFilters.sort_order) {
        params.set('sort_order', ivrFilters.sort_order);
      }
      const res = await fetch(`/api/admin/leads/ivr-records?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to fetch IVR records');
      }
      return {
        records: (json.records || []) as IvrRecordItem[],
        total_count: (json.total_count || 0) as number,
        summary: (json.summary || {
          total_calls: 0,
          answered_calls: 0,
          missed_calls: 0,
          hot_count: 0,
          warm_count: 0,
          cold_count: 0,
        }) as IvrSummaryStats,
      };
    },
    enabled: !!token && activeTab === 'ivr',
    staleTime: 1000 * 45,
    placeholderData: (previousData) => previousData,
  });

  // Sync query data into local state for instant optimistic updates
  useEffect(() => {
    if (ivrData) {
      setIvrRecords(ivrData.records);
      setIvrTotalCount(ivrData.total_count);
      setSummary(ivrData.summary);
    }
  }, [ivrData]);

  const ivrLoading = ivrQueryLoading && !ivrData;

  const fetchIvrRecords = useCallback(
    async (targetPage = ivrPage, filters = ivrFilters) => {
      if (targetPage !== ivrPage) setIvrPage(targetPage);
      if (filters !== ivrFilters) setIvrFilters(filters);
      await refetchIvrQuery();
    },
    [ivrPage, ivrFilters, refetchIvrQuery]
  );

  const handleFilterChange = (newFilters: Partial<IvrFilterState>) => {
    const updated = { ...ivrFilters, ...newFilters };
    setIvrFilters(updated);
    setIvrPage(1);
  };

  const handleTemperatureChange = async (
    recordId: string,
    phone: string,
    temp: 'hot' | 'warm' | 'cold'
  ) => {
    // Optimistic update
    setIvrRecords((prev) => prev.map((r) => (r.id === recordId ? { ...r, temperature: temp } : r)));

    try {
      const res = await fetch('/api/admin/leads/ivr-records', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: recordId,
          customer_phone: phone,
          temperature: temp,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update lead temperature');
      }
      toast.success(`Temperature updated to ${temp.toUpperCase()}`);
    } catch {
      toast.error('Could not save temperature update');
      fetchIvrRecords(ivrPage, ivrFilters);
    }
  };

  const handleReassignAdvisor = async (recordId: string, phone: string, advisorId: string) => {
    const matchedEmployee = employees.find((e) => e.id === advisorId);
    const newName = matchedEmployee?.full_name || 'Unassigned';

    // Optimistic update
    setIvrRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              assigned_agent_id: advisorId || null,
              assigned_agent: matchedEmployee ? { id: advisorId, full_name: newName } : null,
            }
          : r
      )
    );

    try {
      const res = await fetch('/api/admin/leads/ivr-records', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: recordId,
          customer_phone: phone,
          assigned_agent_id: advisorId || null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to reassign advisor');
      }
      toast.success(`Advisor reassigned to ${newName}`);
    } catch {
      toast.error('Could not save advisor reassignment');
      fetchIvrRecords(ivrPage, ivrFilters);
    }
  };

  return {
    ivrRecords,
    setIvrRecords,
    ivrTotalCount,
    setIvrTotalCount,
    ivrPage,
    setIvrPage,
    ivrLimit,
    ivrLoading,
    ivrFilters,
    setIvrFilters,
    summary,
    setSummary,
    employees,
    fetchIvrRecords,
    handleFilterChange,
    handleTemperatureChange,
    handleReassignAdvisor,
  };
}
