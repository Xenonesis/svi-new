'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ListTodo,
  Compass,
  Users,
  FileText,
  Plus,
  Clock,
  Phone,
  MessageSquare,
  Calendar,
  Trash2,
  X,
  Loader2,
  Check,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { toast } from 'sonner';

interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  category: 'general' | 'client_followup' | 'site_visit' | 'documentation' | 'field_work';
  due_date?: string | null;
  completed_at?: string | null;
  created_at: string;
}

interface SiteVisitItem {
  id: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  preferred_date?: string | null;
  confirmed_date?: string | null;
  notes?: string | null;
  contact?: {
    name?: string;
    phone?: string;
  };
  conversation?: {
    project_id?: string;
  };
  created_at: string;
}

interface LeadItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  project_interest?: string | null;
  lifecycle_status: string;
  temperature?: string | null;
  summary?: string | null;
  created_at: string;
}

interface WorkLogItem {
  id: string;
  date: string;
  summary: string;
  client_interactions_count: number;
  site_visits_conducted_count: number;
  created_at: string;
}

export default function EmployeeWorkTrackerPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'tasks';

  const [activeTab, setActiveTab] = useState<'tasks' | 'site-visits' | 'leads' | 'logs'>(
    (initialTab as 'tasks' | 'site-visits' | 'leads' | 'logs') || 'tasks'
  );

  const [loading, setLoading] = useState(true);

  // Data States
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisitItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLogItem[]>([]);

  // Task Filter
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Modals
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddLogModal, setShowAddLogModal] = useState(false);

  // New Task Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem['priority']>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskItem['category']>('general');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  // New Log Form
  const [logSummary, setLogSummary] = useState('');
  const [logClientCount, setLogClientCount] = useState(0);
  const [logVisitCount, setLogVisitCount] = useState(0);
  const [submittingLog, setSubmittingLog] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [taskRes, visitRes, leadRes, logRes] = await Promise.all([
        fetch('/api/employee/work/tasks'),
        fetch('/api/employee/work/site-visits'),
        fetch('/api/employee/work/leads'),
        fetch('/api/employee/work/logs'),
      ]);

      if (taskRes.ok) {
        const d = await taskRes.json();
        setTasks(d.tasks || []);
      }
      if (visitRes.ok) {
        const d = await visitRes.json();
        setSiteVisits(d.visits || []);
      }
      if (leadRes.ok) {
        const d = await leadRes.json();
        setLeads(d.leads || []);
      }
      if (logRes.ok) {
        const d = await logRes.json();
        setWorkLogs(d.logs || []);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to load work items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tasks actions
  const handleToggleTask = async (task: TaskItem) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch('/api/employee/work/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });
      if (res.ok) {
        toast.success(newStatus === 'completed' ? 'Task marked complete!' : 'Task reopened');
        fetchData();
      }
    } catch {
      toast.error('Could not update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/employee/work/tasks?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Task deleted');
        fetchData();
      }
    } catch {
      toast.error('Could not delete task');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    setSubmittingTask(true);
    try {
      const res = await fetch('/api/employee/work/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim() || undefined,
          priority: newTaskPriority,
          category: newTaskCategory,
          due_date: newTaskDueDate || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.message || 'Failed to create task');

      toast.success('Task added successfully!');
      setShowAddTaskModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDueDate('');
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error creating task';
      toast.error(message);
    } finally {
      setSubmittingTask(false);
    }
  };

  // Site Visit Actions
  const handleUpdateVisitStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/employee/work/site-visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        toast.success(`Visit marked as ${status}`);
        fetchData();
      }
    } catch {
      toast.error('Could not update visit status');
    }
  };

  // Lead Lifecycle Actions
  const handleUpdateLeadStatus = async (id: string, lifecycle_status: string) => {
    try {
      const res = await fetch('/api/employee/work/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, lifecycle_status }),
      });
      if (res.ok) {
        toast.success(`Lead moved to ${lifecycle_status.replace('_', ' ')}`);
        fetchData();
      }
    } catch {
      toast.error('Could not update lead status');
    }
  };

  // Submit Work Log
  const handleCreateWorkLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logSummary.trim()) {
      toast.error('Please enter a work summary');
      return;
    }

    setSubmittingLog(true);
    try {
      const res = await fetch('/api/employee/work/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: logSummary.trim(),
          client_interactions_count: logClientCount,
          site_visits_conducted_count: logVisitCount,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.message || 'Failed to submit log');

      toast.success('Work log submitted successfully!');
      setShowAddLogModal(false);
      setLogSummary('');
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error submitting log';
      toast.error(message);
    } finally {
      setSubmittingLog(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskStatusFilter === 'pending') return t.status !== 'completed';
    if (taskStatusFilter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-5 pb-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Work Tracker
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your tasks, site visits, leads, and daily logs
        </p>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex rounded-xl bg-slate-200/70 p-1 dark:bg-slate-900">
        <button
          onClick={() => setActiveTab('tasks')}
          className={clsx(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all',
            activeTab === 'tasks'
              ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <ListTodo className="h-3.5 w-3.5" />
          Tasks ({tasks.filter((t) => t.status !== 'completed').length})
        </button>

        <button
          onClick={() => setActiveTab('site-visits')}
          className={clsx(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all',
            activeTab === 'site-visits'
              ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <Compass className="h-3.5 w-3.5" />
          Visits ({siteVisits.length})
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={clsx(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all',
            activeTab === 'leads'
              ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <Users className="h-3.5 w-3.5" />
          Leads ({leads.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={clsx(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all',
            activeTab === 'logs'
              ? 'bg-white text-purple-600 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          Logs
        </button>
      </div>

      {loading ? (
        <div className="flex h-56 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* TAB 1: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {(['all', 'pending', 'completed'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTaskStatusFilter(filter)}
                      className={clsx(
                        'rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors',
                        taskStatusFilter === filter
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Task
                </button>
              </div>

              {filteredTasks.length > 0 ? (
                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={clsx(
                        'flex items-start justify-between rounded-xl border p-3.5 shadow-sm transition-all',
                        task.status === 'completed'
                          ? 'border-slate-200 bg-slate-50/70 opacity-70 dark:border-slate-800/60 dark:bg-slate-900/30'
                          : 'border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900/70'
                      )}
                    >
                      <div className="mr-2 flex min-w-0 flex-1 items-start gap-3">
                        <button
                          onClick={() => handleToggleTask(task)}
                          className={clsx(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                            task.status === 'completed'
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-300 text-transparent hover:border-blue-500 hover:text-blue-500 dark:border-slate-700'
                          )}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </button>

                        <div className="min-w-0">
                          <p
                            className={clsx(
                              'text-xs font-semibold text-slate-900 dark:text-white',
                              task.status === 'completed' &&
                                'text-slate-500 line-through dark:text-slate-400'
                            )}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span
                              className={clsx(
                                'rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase',
                                task.priority === 'urgent' &&
                                  'bg-red-500/10 text-red-600 dark:text-red-400',
                                task.priority === 'high' &&
                                  'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                                task.priority === 'medium' &&
                                  'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                                task.priority === 'low' &&
                                  'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                              )}
                            >
                              {task.priority}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 capitalize dark:bg-slate-800 dark:text-slate-400">
                              {task.category.replace('_', ' ')}
                            </span>
                            {task.due_date && (
                              <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                                <Clock className="h-2.5 w-2.5" /> Due{' '}
                                {format(parseISO(task.due_date), 'MMM dd')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-slate-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800">
                  No tasks found in this view.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SITE VISITS */}
          {activeTab === 'site-visits' && (
            <div className="space-y-3">
              {siteVisits.length > 0 ? (
                siteVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {visit.contact?.name || 'Customer Site Visit'}
                        </span>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {visit.preferred_date
                            ? format(parseISO(visit.preferred_date), 'EEEE, MMM dd • hh:mm a')
                            : 'Date pending'}
                        </p>
                      </div>
                      <span
                        className={clsx(
                          'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase',
                          visit.status === 'confirmed' &&
                            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                          visit.status === 'completed' &&
                            'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                          visit.status === 'cancelled' &&
                            'bg-red-500/10 text-red-600 dark:text-red-400',
                          visit.status === 'requested' &&
                            'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        )}
                      >
                        {visit.status}
                      </span>
                    </div>

                    {visit.notes && (
                      <p className="mt-2 text-xs text-slate-600 italic dark:text-slate-300">
                        "{visit.notes}"
                      </p>
                    )}

                    {/* Actions Bar */}
                    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      {visit.contact?.phone && (
                        <a
                          href={`tel:${visit.contact.phone}`}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
                        >
                          <Phone className="h-3.5 w-3.5" /> Call ({visit.contact.phone})
                        </a>
                      )}

                      {visit.status === 'requested' && (
                        <button
                          onClick={() => handleUpdateVisitStatus(visit.id, 'confirmed')}
                          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                        >
                          Confirm
                        </button>
                      )}

                      {visit.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateVisitStatus(visit.id, 'completed')}
                          className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800">
                  No site visits currently assigned to you.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEADS */}
          {activeTab === 'leads' && (
            <div className="space-y-3">
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {lead.name}
                          </span>
                          {lead.temperature && (
                            <span
                              className={clsx(
                                'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
                                lead.temperature === 'hot' &&
                                  'bg-red-500/10 text-red-600 dark:text-red-400',
                                lead.temperature === 'warm' &&
                                  'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                                lead.temperature === 'cold' &&
                                  'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              )}
                            >
                              {lead.temperature === 'hot'
                                ? '🔥 Hot'
                                : lead.temperature === 'warm'
                                  ? '⚡ Warm'
                                  : '❄️ Cold'}
                            </span>
                          )}
                        </div>
                        {lead.project_interest && (
                          <p className="mt-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                            Project: {lead.project_interest}
                          </p>
                        )}
                      </div>

                      <select
                        value={lead.lifecycle_status}
                        onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="visit_requested">Visit Scheduled</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>

                    {lead.summary && (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                        {lead.summary}
                      </p>
                    )}

                    {lead.phone && (
                      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                        <a
                          href={`tel:${lead.phone}`}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                        >
                          <Phone className="h-3 w-3" /> Call
                        </a>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                        >
                          <MessageSquare className="h-3 w-3" /> WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800">
                  No leads currently assigned to you.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DAILY WORK LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Your submitted shift reports</p>
                <button
                  onClick={() => setShowAddLogModal(true)}
                  className="flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-purple-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Submit Log
                </button>
              </div>

              {workLogs.length > 0 ? (
                <div className="space-y-3">
                  {workLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {format(parseISO(log.date), 'EEEE, MMM dd, yyyy')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {format(parseISO(log.created_at), 'hh:mm a')}
                        </span>
                      </div>

                      <p className="mt-2.5 text-xs text-slate-700 dark:text-slate-300">
                        {log.summary}
                      </p>

                      <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
                        <span>📞 {log.client_interactions_count} Client Calls</span>
                        <span>🧭 {log.site_visits_conducted_count} Site Visits</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800">
                  No work logs submitted yet.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Create New Action Task
                </h3>
                <button
                  onClick={() => setShowAddTaskModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Task Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Call Mr. Sharma regarding Green Meadows site visit..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Additional context or notes..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Priority
                    </label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as TaskItem['priority'])}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent 🔥</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Category
                    </label>
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value as TaskItem['category'])}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="general">General</option>
                      <option value="client_followup">Client Follow-up</option>
                      <option value="site_visit">Site Visit</option>
                      <option value="documentation">Documentation</option>
                      <option value="field_work">Field Work</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTask}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500"
                  >
                    {submittingTask ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Work Log Modal */}
      <AnimatePresence>
        {showAddLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Submit Shift Work Log
                </h3>
                <button
                  onClick={() => setShowAddLogModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateWorkLog} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Summary of Today’s Work
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={logSummary}
                    onChange={(e) => setLogSummary(e.target.value)}
                    placeholder="Describe completed tasks, client negotiations, site inspections..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Client Calls / Meetings
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={logClientCount}
                      onChange={(e) =>
                        setLogClientCount(Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Site Visits Done
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={logVisitCount}
                      onChange={(e) => setLogVisitCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLogModal(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingLog}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-purple-500"
                  >
                    {submittingLog ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Log'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
