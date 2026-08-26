'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Plus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { WorkStatsSummary } from '@/src/components/employee/work/WorkStatsSummary';
import { WorkTabNavigation } from '@/src/components/employee/work/WorkTabNavigation';
import { TasksView } from '@/src/components/employee/work/TasksView';
import { AddTaskModal } from '@/src/components/employee/work/AddTaskModal';
import { SiteVisitsView } from '@/src/components/employee/work/SiteVisitsView';
import { LeadsView } from '@/src/components/employee/work/LeadsView';
import { DailyLogsView } from '@/src/components/employee/work/DailyLogsView';
import { SubmitShiftLogModal } from '@/src/components/employee/work/SubmitShiftLogModal';
import { AddLeadModal } from '@/src/components/employee/work/AddLeadModal';
import { LeadTrackerDrawer } from '@/src/components/employee/work/LeadTrackerDrawer';
import { FollowUpReminderBanner } from '@/src/components/employee/work/FollowUpReminderBanner';
import type {
  TaskItem,
  SiteVisitItem,
  LeadItem,
  WorkLogItem,
  WorkTabType,
} from '@/src/components/employee/work/types';

export default function EmployeeWorkTrackerPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as WorkTabType) || 'tasks';

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
        const json = await tasksRes.json();
        setTasks(json.tasks || []);
      }
      if (visitsRes.ok) {
        const json = await visitsRes.json();
        setSiteVisits(json.site_visits || []);
      }
      if (leadsRes.ok) {
        const json = await leadsRes.json();
        setLeads(json.leads || []);
      }
      if (logsRes.ok) {
        const json = await logsRes.json();
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

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    priority: TaskItem['priority'];
    category: TaskItem['category'];
    due_date: string;
  }) => {
    try {
      const res = await fetch('/api/employee/work/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        toast.success('Task created');
        fetchData();
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

  // Handlers for Shift Logs
  const handleCreateLog = async (logData: {
    summary_text: string;
    client_interactions_count: number;
    site_visits_conducted_count: number;
  }) => {
    try {
      const res = await fetch('/api/employee/work/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (res.ok) {
        toast.success('Work log submitted');
        fetchData();
      } else {
        toast.error('Failed to submit log');
      }
    } catch {
      toast.error('Error submitting log');
    }
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const upcomingVisitsCount = siteVisits.filter((v) => v.status !== 'completed').length;

  return (
    <div className="space-y-6 pb-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            Daily Work & Lead Tracker
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Manage your daily tasks, customer site visits, assigned leads, and shift reports
          </p>
        </div>

        {/* Quick Add Lead Button on Header */}
        <button
          onClick={() => setShowAddLeadModal(true)}
          className="flex items-center gap-1.5 self-start rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-102 hover:from-blue-500 hover:to-indigo-500 sm:self-auto"
        >
          <UserPlus className="h-4 w-4" /> Add Lead
        </button>
      </div>

      {/* Audio-Visual Follow-up Reminder Banner */}
      <FollowUpReminderBanner
        leads={leads}
        onSelectLead={(lead) => setSelectedLeadForDrawer(lead)}
      />

      {/* Summary Metrics */}
      <WorkStatsSummary
        pendingTasksCount={pendingTasksCount}
        upcomingVisitsCount={upcomingVisitsCount}
        assignedLeadsCount={leads.length}
        logsSubmittedCount={workLogs.length}
      />

      {/* Tab Navigation */}
      <WorkTabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          tasks: pendingTasksCount,
          siteVisits: upcomingVisitsCount,
          leads: leads.length,
          logs: workLogs.length,
        }}
      />

      {/* Tab Views */}
      {loading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-xs text-slate-500">Loading your items...</p>
        </div>
      ) : (
        <>
          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onOpenAddModal={() => setShowAddTaskModal(true)}
            />
          )}

          {activeTab === 'site-visits' && (
            <SiteVisitsView siteVisits={siteVisits} onUpdateStatus={handleUpdateVisitStatus} />
          )}

          {activeTab === 'leads' && (
            <LeadsView
              leads={leads}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onSelectLead={(lead) => setSelectedLeadForDrawer(lead)}
              onAddNewLead={() => setShowAddLeadModal(true)}
            />
          )}

          {activeTab === 'logs' && (
            <DailyLogsView workLogs={workLogs} onOpenSubmitModal={() => setShowAddLogModal(true)} />
          )}
        </>
      )}

      {/* Modals & Drawers */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onSubmit={handleCreateTask}
      />

      <SubmitShiftLogModal
        isOpen={showAddLogModal}
        onClose={() => setShowAddLogModal(false)}
        onSubmit={handleCreateLog}
      />

      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onLeadAdded={fetchData}
      />

      <LeadTrackerDrawer
        lead={selectedLeadForDrawer}
        isOpen={!!selectedLeadForDrawer}
        onClose={() => setSelectedLeadForDrawer(null)}
        onLeadUpdated={fetchData}
      />
    </div>
  );
}
