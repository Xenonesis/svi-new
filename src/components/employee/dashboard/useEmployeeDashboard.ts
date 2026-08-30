'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import type { DashboardData } from '@/src/components/employee/dashboard/types';
import type { TaskItem } from '@/src/components/employee/work/types';

export function useEmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Live time ticker
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/employee/work/dashboard', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const json = await res.json();
        // Support both direct root and nested dashboard envelope
        const payload: DashboardData = json.dashboard || json;
        setData(payload);
        if (isRefresh) {
          toast.success('Dashboard synchronized with latest shift records');
        }
      } else {
        const errJson = await res.json().catch(() => null);
        const errorMsg = errJson?.message || `Server responded with status ${res.status}`;
        setFetchError(errorMsg);
        toast.error('Unable to synchronize dashboard', { description: errorMsg });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network connection failed';
      setFetchError(errorMsg);
      toast.error('Network Error', {
        description: 'Please check your internet connection and tap Refresh.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Live timer tick for active shift
  useEffect(() => {
    const punchStatus = data?.today?.punch_status;
    const punchInTime = data?.today?.punch_in_time;

    if (punchStatus === 'punched_in' && punchInTime) {
      const calculateDuration = () => {
        let startTime: number;
        if (punchInTime.includes('T') || punchInTime.includes('-')) {
          startTime = new Date(punchInTime).getTime();
        } else {
          // Format like "09:30"
          const [hours, minutes] = punchInTime.split(':').map(Number);
          const start = new Date();
          start.setHours(hours, minutes, 0, 0);
          startTime = start.getTime();
        }

        const now = Date.now();
        const diffMs = Math.max(0, now - startTime);
        const diffSec = Math.floor(diffMs / 1000);

        const h = Math.floor(diffSec / 3600);
        const m = Math.floor((diffSec % 3600) / 60);
        const s = diffSec % 60;

        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      };

      setElapsedTime(calculateDuration());
      const interval = setInterval(() => {
        setElapsedTime(calculateDuration());
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setElapsedTime('00:00:00');
    }
  }, [data?.today?.punch_status, data?.today?.punch_in_time]);

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, [currentTime]);

  const firstName = useMemo(() => {
    const rawName = data?.employee?.full_name || data?.employee?.name;
    if (!rawName) return 'Team Member';
    return rawName.split(' ')[0];
  }, [data?.employee?.full_name, data?.employee?.name]);

  // Toggle Task Handler
  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    // Optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        urgent_tasks: prev.urgent_tasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        ),
      };
    });

    try {
      const res = await fetch('/api/employee/work/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });

      if (res.ok) {
        toast.success(
          newStatus === 'completed' ? 'Task marked as completed' : 'Task marked as pending'
        );
        fetchDashboard();
      } else {
        toast.error('Failed to update task status');
        fetchDashboard(); // Rollback
      }
    } catch {
      toast.error('Network error updating task');
      fetchDashboard();
    }
  };

  // Inline Quick Task Create
  const handleQuickCreateTask = async (title: string) => {
    try {
      const res = await fetch('/api/employee/work/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          priority: 'high',
          category: 'general',
        }),
      });

      if (res.ok) {
        toast.success('Priority task created successfully');
        fetchDashboard();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || 'Failed to create task');
      }
    } catch {
      toast.error('Unable to create task. Please check connection.');
    }
  };

  // Full Task Modal Submit
  const handleCreateTaskModal = async (taskData: {
    title: string;
    description: string;
    priority: TaskItem['priority'];
    category: TaskItem['category'];
    due_date: string;
  }) => {
    const res = await fetch('/api/employee/work/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });

    if (res.ok) {
      toast.success('Task created successfully');
      fetchDashboard();
    } else {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to create task');
    }
  };

  // Leave Modal Submit
  const handleApplyLeaveModal = async (leaveData: {
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
  }) => {
    const res = await fetch('/api/employee/attendance/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData),
    });

    if (res.ok) {
      toast.success('Leave application submitted for supervisor approval');
      fetchDashboard();
    } else {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to submit leave application');
    }
  };

  // Shift Log Modal Submit
  const handleSubmitShiftLogModal = async (logData: {
    summary_text: string;
    client_interactions_count: number;
    site_visits_conducted_count: number;
  }) => {
    const res = await fetch('/api/employee/attendance/shift-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });

    if (res.ok) {
      toast.success('Shift work summary recorded successfully');
      fetchDashboard();
    } else {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to submit shift log');
    }
  };

  return {
    data,
    loading,
    refreshing,
    elapsedTime,
    fetchError,
    currentTime,
    greeting,
    firstName,
    fetchDashboard,
    toggleTask,
    handleQuickCreateTask,
    handleCreateTaskModal,
    handleApplyLeaveModal,
    handleSubmitShiftLogModal,
  };
}
