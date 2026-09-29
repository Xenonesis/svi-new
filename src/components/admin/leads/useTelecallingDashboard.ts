import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { DashboardSummary, CachedDashboardEntry, TimeRange } from './telecallingTypes';
import type {
  AdvisorPerformanceMetric,
  CampaignPerformanceMetric,
} from '@/src/lib/types/telecalling';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';

export function useTelecallingDashboard(token?: string) {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<AdvisorPerformanceMetric[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignPerformanceMetric[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const employeesLoadedRef = useRef(false);

  const dashboardCacheRef = useRef<Map<string, CachedDashboardEntry>>(new Map());

  useEffect(() => {
    if (!token || employeesLoadedRef.current) return;
    fetch('/api/admin/employees', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.employees) {
          setEmployees(data.employees);
          employeesLoadedRef.current = true;
        }
      })
      .catch(() => {});
  }, [token]);

  const fetchDashboardData = useCallback(
    async (showRefreshAnimation = false) => {
      const cached = dashboardCacheRef.current.get(timeRange);
      const now = Date.now();

      if (!showRefreshAnimation && cached && now - cached.timestamp < 60_000) {
        setSummary(cached.summary);
        setLeaderboard(cached.leaderboard);
        setCampaigns(cached.campaigns);
        setLastUpdated(cached.lastUpdated);
        setLoading(false);
        return;
      }

      if (showRefreshAnimation) setIsRefreshing(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams();
        if (timeRange !== 'all') params.set('timeRange', timeRange);

        const res = await fetch(`/api/admin/leads/performance?${params.toString()}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const data = await res.json();
          const nextSummary = data.summary || null;
          const nextLeaderboard = data.leaderboard || [];
          const nextCampaigns = data.campaigns || [];
          const nextTime = new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          setSummary(nextSummary);
          setLeaderboard(nextLeaderboard);
          setCampaigns(nextCampaigns);
          setLastUpdated(nextTime);

          dashboardCacheRef.current.set(timeRange, {
            summary: nextSummary,
            leaderboard: nextLeaderboard,
            campaigns: nextCampaigns,
            lastUpdated: nextTime,
            timestamp: now,
          });
        } else {
          toast.error('Failed to load telecalling analytics');
        }
      } catch (err) {
        console.error('Telecalling analytics error:', err);
        toast.error('Network error loading telecalling data');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [timeRange, token]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    loading,
    timeRange,
    setTimeRange,
    summary,
    leaderboard,
    campaigns,
    isRefreshing,
    lastUpdated,
    employees,
    fetchDashboardData,
  };
}
