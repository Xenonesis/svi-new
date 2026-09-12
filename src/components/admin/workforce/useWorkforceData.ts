import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import type { EmployeeLiveStatus } from '@/src/lib/supabase/types';
import type { SalaryStructure } from '@/src/lib/payroll/types';
import type { WorkforceTeam } from './types';

const CACHE_TTL_MS = 60_000; // 60 seconds client cache for smooth tab navigation

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

  const cacheRef = useRef<{
    employees: Employee[];
    lastEmployeesFetch: number;
    teams: WorkforceTeam[];
    lastTeamsFetch: number;
    salaryStructures: SalaryStructure[];
    lastStructuresFetch: number;
    lastMetricsFetch: number;
  }>({
    employees: [],
    lastEmployeesFetch: 0,
    teams: [],
    lastTeamsFetch: 0,
    salaryStructures: [],
    lastStructuresFetch: 0,
    lastMetricsFetch: 0,
  });

  const fetchEmployees = useCallback(async (force = false) => {
    const now = Date.now();
    if (
      !force &&
      cacheRef.current.employees.length > 0 &&
      now - cacheRef.current.lastEmployeesFetch < CACHE_TTL_MS
    ) {
      setEmployees(cacheRef.current.employees);
      setLoadingEmployees(false);
      return;
    }

    try {
      setLoadingEmployees(true);
      const activeToken = tokenRef.current;
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch('/api/admin/employees', { headers });
      const data = await res.json();
      if (res.ok) {
        const empList = data.employees || [];
        cacheRef.current.employees = empList;
        cacheRef.current.lastEmployeesFetch = Date.now();
        setEmployees(empList);
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

  const fetchTeams = useCallback(async (force = false) => {
    const now = Date.now();
    if (
      !force &&
      cacheRef.current.teams.length > 0 &&
      now - cacheRef.current.lastTeamsFetch < CACHE_TTL_MS
    ) {
      setTeams(cacheRef.current.teams);
      return;
    }

    try {
      const activeToken = tokenRef.current;
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch('/api/admin/teams', { headers });
      const data = await res.json();
      if (res.ok) {
        const teamList = data.teams || [];
        cacheRef.current.teams = teamList;
        cacheRef.current.lastTeamsFetch = Date.now();
        setTeams(teamList);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchSalaryStructures = useCallback(async (force = false) => {
    const now = Date.now();
    if (
      !force &&
      cacheRef.current.salaryStructures.length > 0 &&
      now - cacheRef.current.lastStructuresFetch < CACHE_TTL_MS
    ) {
      setSalaryStructures(cacheRef.current.salaryStructures);
      return;
    }

    try {
      const activeToken = tokenRef.current;
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch('/api/admin/payroll/structures', { headers });
      const data = await res.json();
      if (res.ok) {
        const structList = data.structures || [];
        cacheRef.current.salaryStructures = structList;
        cacheRef.current.lastStructuresFetch = Date.now();
        setSalaryStructures(structList);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchMetrics = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - cacheRef.current.lastMetricsFetch < CACHE_TTL_MS) {
      return;
    }

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
      cacheRef.current.lastMetricsFetch = Date.now();
    } catch {
      // ignore
    }
  }, []);

  const refetchAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchEmployees(true),
      fetchTeams(true),
      fetchSalaryStructures(true),
      fetchMetrics(true),
    ]);
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
    fetchEmployees: () => fetchEmployees(true),
    fetchTeams: () => fetchTeams(true),
    fetchSalaryStructures: () => fetchSalaryStructures(true),
    fetchMetrics: () => fetchMetrics(true),
    refetchAll,
  };
}
