'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import type { TaskItem, SiteVisitItem, LeadItem, WorkLogItem, WorkTabType } from './types';

export interface CreateTaskInput {
  title: string;
  description: string;
  priority: TaskItem['priority'];
  category: TaskItem['category'];
  due_date: string;
}

export interface CreateLogInput {
  summary_text: string;
  client_interactions_count: number;
  site_visits_conducted_count: number;
}

export interface CreateVisitInput {
  contact_id?: string;
  preferred_date?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface UseEmployeeWorkTrackerReturn {
  activeTab: WorkTabType;
  setActiveTab: (tab: WorkTabType) => void;
  loading: boolean;
  tasks: TaskItem[];
  siteVisits: SiteVisitItem[];
  leads: LeadItem[];
  workLogs: WorkLogItem[];
  pendingTasksCount: number;
  upcomingVisitsCount: number;
  // Modal states
  showAddTaskModal: boolean;
  setShowAddTaskModal: (open: boolean) => void;
  showAddLogModal: boolean;
  setShowAddLogModal: (open: boolean) => void;
  showAddLeadModal: boolean;
  setShowAddLeadModal: (open: boolean) => void;
  selectedLeadForDrawer: LeadItem | null;
  setSelectedLeadForDrawer: (lead: LeadItem | null) => void;
  // Operations
  fetchData: () => Promise<void>;
  handleToggleTask: (task: TaskItem) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleCreateTask: (taskData: CreateTaskInput) => Promise<void>;
  handleUpdateVisitStatus: (visitId: string, status: 'confirmed' | 'completed') => Promise<void>;
  handleCreateVisit: (visitData?: CreateVisitInput) => Promise<void>;
  handleUpdateLeadStatus: (leadId: string, lifecycleStatus: string) => Promise<void>;
  handleUpdateLeadStage: (leadId: string, stage: string) => Promise<void>;
  handleCreateLog: (logData: CreateLogInput) => Promise<void>;
  handleLeadAdded: () => void;
  handleLogSubmitted: () => void;
}

export function useEmployeeWorkTracker(): UseEmployeeWorkTrackerReturn {
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get?.('tab') as WorkTabType) || 'tasks';

  const [activeTab, setActiveTab] = useState<WorkTabType>(initialTab);
  const [loading, setLoading] = useState(true);

  // Data states
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisitItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLogItem[]>([]);

  // Modal states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedLeadForDrawer, setSelectedLeadForDrawer] = useState<LeadItem | null>(null);

  // Fetch all work tracker data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, visitsRes, leadsRes, logsRes] = await Promise.all([
        fetch('/api/employee/work/tasks'),
        fetch('/api/employee/work/site-visits'),
        fetch('/api/employee/work/leads'),
        fetch('/api/employee/work/logs'),
      ]);

      if (tasksRes.ok) {
        const json = (await tasksRes.json()) as { tasks?: TaskItem[] };
        setTasks(json.tasks || []);
      }
      if (visitsRes.ok) {
        const json = (await visitsRes.json()) as {
          site_visits?: SiteVisitItem[];
          visits?: SiteVisitItem[];
        };
        setSiteVisits(json.site_visits || json.visits || []);
      }
      if (leadsRes.ok) {
        const json = (await leadsRes.json()) as { leads?: LeadItem[] };
        setLeads(json.leads || []);
      }
      if (logsRes.ok) {
        const json = (await logsRes.json()) as { logs?: WorkLogItem[] };
        setWorkLogs(json.logs || []);
      }
    } catch {
      toast.error('Failed to load work items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers for Tasks
  const handleToggleTask = async (task: TaskItem) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch('/api/employee/work/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
        toast.success(newStatus === 'completed' ? 'Task completed!' : 'Task reopened');
      } else {
        toast.error('Failed to update task');
      }
    } catch {
      toast.error('Error updating task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/employee/work/tasks?id=${taskId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        toast.success('Task removed');
      } else {
        toast.error('Failed to delete task');
      }
    } catch {
      toast.error('Error deleting task');
    }
  };

  const handleCreateTask = async (taskData: CreateTaskInput) => {
    try {
      const res = await fetch('/api/employee/work/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        toast.success('Task created');
        await fetchData();
      } else {
        toast.error('Failed to create task');
      }
    } catch {
      toast.error('Error creating task');
    }
  };

  // Handlers for Site Visits
  const handleUpdateVisitStatus = async (visitId: string, status: 'confirmed' | 'completed') => {
    try {
      const res = await fetch('/api/employee/work/site-visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: visitId, status }),
      });
      if (res.ok) {
        setSiteVisits((prev) => prev.map((v) => (v.id === visitId ? { ...v, status } : v)));
        toast.success(`Visit marked as ${status}`);
      } else {
        toast.error('Failed to update visit status');
      }
    } catch {
      toast.error('Error updating visit');
    }
  };

  const handleCreateVisit = async (visitData?: CreateVisitInput) => {
    try {
      const res = await fetch('/api/employee/work/site-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitData || {}),
      });
      if (res.ok) {
        toast.success('Site visit scheduled');
        await fetchData();
      } else {
        toast.error('Failed to schedule visit');
      }
    } catch {
      toast.error('Error scheduling site visit');
    }
  };

  // Handlers for Leads
  const handleUpdateLeadStatus = async (leadId: string, lifecycleStatus: string) => {
    try {
      const res = await fetch('/api/employee/work/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, lifecycle_status: lifecycleStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, lifecycle_status: lifecycleStatus } : l))
        );
        toast.success('Lead status updated');
      } else {
        toast.error('Failed to update lead');
      }
    } catch {
      toast.error('Error updating lead');
    }
  };

  const handleUpdateLeadStage = async (leadId: string, stage: string) => {
    return handleUpdateLeadStatus(leadId, stage);
  };

  // Handlers for Shift Logs
  const handleCreateLog = async (logData: CreateLogInput) => {
    try {
      const res = await fetch('/api/employee/work/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (res.ok) {
        toast.success('Work log submitted');
        await fetchData();
      } else {
        toast.error('Failed to submit log');
      }
    } catch {
      toast.error('Error submitting log');
    }
  };

  const handleLeadAdded = () => {
    void fetchData();
  };

  const handleLogSubmitted = () => {
    void fetchData();
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const upcomingVisitsCount = siteVisits.filter((v) => v.status !== 'completed').length;

  return {
    activeTab,
    setActiveTab,
    loading,
    tasks,
    siteVisits,
    leads,
    workLogs,
    pendingTasksCount,
    upcomingVisitsCount,
    showAddTaskModal,
    setShowAddTaskModal,
    showAddLogModal,
    setShowAddLogModal,
    showAddLeadModal,
    setShowAddLeadModal,
    selectedLeadForDrawer,
    setSelectedLeadForDrawer,
    fetchData,
    handleToggleTask,
    handleDeleteTask,
    handleCreateTask,
    handleUpdateVisitStatus,
    handleCreateVisit,
    handleUpdateLeadStatus,
    handleUpdateLeadStage,
    handleCreateLog,
    handleLeadAdded,
    handleLogSubmitted,
  };
}
