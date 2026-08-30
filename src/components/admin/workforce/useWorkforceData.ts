import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import type { EmployeeLiveStatus } from '@/src/lib/supabase/types';
import type { SalaryStructure } from '@/src/lib/payroll/types';
import type { WorkforceTeam } from './types';

export function useWorkforceData(token: string) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [teams, setTeams] = useState<WorkforceTeam[]>([]);
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([]);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [pendingRegularizationsCount, setPendingRegularizationsCount] = useState(0);
  const [liveStatuses, setLiveStatuses] = useState<EmployeeLiveStatus[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const tokenRef = useRef(token);
  tokenRef.current = token;

  const fetchEmployees = useCallback(async () => {
    try {
      setLoadingEmployees(true);
      const activeToken = tokenRef.current;
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch('/api/admin/employees', { headers });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data.employees || []);
      } else {
        toast.error('Failed to load employees', {
          description: extractApiErrorMessage(data, 'Please refresh the page.'),
        });
      }
    } catch {
      toast.error('Network error loading employees');
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const activeToken = tokenRef.current;
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch('/api/admin/teams', { headers });
      const data = await res.json();
      if (res.ok) {
        setTeams(data.teams || []);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchSalaryStructures = useCallback(async () => {
    try {
      const activeToken = tokenRef.current;
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch('/api/admin/payroll/structures', { headers });
      const data = await res.json();
      if (res.ok) {
        setSalaryStructures(data.structures || []);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const activeToken = tokenRef.current;
      if (!activeToken) return;

      const [leavesRes, regsRes, liveRes] = await Promise.all([
        fetch('/api/admin/attendance/leaves?status=pending', {
          headers: { Authorization: `Bearer ${activeToken}` },
        })
          .then((r) => r.json())
          .catch(() => ({ stats: { pending: 0 } })),
        fetch('/api/admin/attendance/regularizations?status=pending', {
          headers: { Authorization: `Bearer ${activeToken}` },
        })
          .then((r) => r.json())
          .catch(() => ({ stats: { pending: 0 } })),
        fetch('/api/admin/attendance/live', {
          headers: { Authorization: `Bearer ${activeToken}` },
        })
          .then((r) => r.json())
          .catch(() => ({ statuses: [] })),
      ]);

      if (leavesRes?.stats?.pending !== undefined) {
        setPendingLeavesCount(leavesRes.stats.pending);
      }
      if (regsRes?.stats?.pending !== undefined) {
        setPendingRegularizationsCount(regsRes.stats.pending);
      }
      if (liveRes?.statuses) {
        setLiveStatuses(liveRes.statuses);
      }
    } catch {
      // ignore
    }
  }, []);

  const refetchAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchEmployees(), fetchTeams(), fetchSalaryStructures(), fetchMetrics()]);
    setRefreshing(false);
  }, [fetchEmployees, fetchTeams, fetchSalaryStructures, fetchMetrics]);

  useEffect(() => {
    if (token) {
      fetchEmployees();
      fetchTeams();
      fetchSalaryStructures();
      fetchMetrics();
    }
  }, [token, fetchEmployees, fetchTeams, fetchSalaryStructures, fetchMetrics]);

  const liveStatusMap = useMemo(() => {
    const map = new Map<string, EmployeeLiveStatus>();
    liveStatuses.forEach((s) => map.set(s.user_id, s));
    return map;
  }, [liveStatuses]);

  return {
    employees,
    setEmployees,
    loadingEmployees,
    teams,
    salaryStructures,
    setSalaryStructures,
    pendingLeavesCount,
    pendingRegularizationsCount,
    liveStatuses,
    liveStatusMap,
    refreshing,
    refetchAll,
    fetchEmployees,
    fetchTeams,
    fetchSalaryStructures,
    fetchMetrics,
  };
}
