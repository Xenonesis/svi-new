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
  phone: string;
  email?: string | null;
  project_interest?: string | null;
  lead_source?: string | null;
  lead_status: string;
  lifecycle_status: string;
  lead_temperature?: string | null;
  summary?: string | null;
  created_at: string;
}

interface WorkLogItem {
  id: string;
  date: string;
  summary_text: string;
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

  // Tasks State
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem['priority']>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskItem['category']>('general');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  // Site Visits State
  const [siteVisits, setSiteVisits] = useState<SiteVisitItem[]>([]);

  // Leads State
  const [leads, setLeads] = useState<LeadItem[]>([]);

  // Work Logs State
  const [workLogs, setWorkLogs] = useState<WorkLogItem[]>([]);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [logSummary, setLogSummary] = useState('');
  const [clientCount, setClientCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);
  const [creatingLog, setCreatingLog] = useState(false);

  // Fetch Work Data based on Active Tab
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'tasks') {
        const res = await fetch('/api/employee/work/tasks');
        if (res.ok) {
          const json = await res.json();
          setTasks(json.tasks || []);
        }
      } else if (activeTab === 'site-visits') {
        const res = await fetch('/api/employee/work/site-visits');
        if (res.ok) {
          const json = await res.json();
          setSiteVisits(json.site_visits || []);
        }
      } else if (activeTab === 'leads') {
        const res = await fetch('/api/employee/work/leads');
        if (res.ok) {
          const json = await res.json();
          setLeads(json.leads || []);
        }
      } else if (activeTab === 'logs') {
        const res = await fetch('/api/employee/work/logs');
        if (res.ok) {
          const json = await res.json();
          setWorkLogs(json.work_logs || []);
        }
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Task Creation
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    setCreatingTask(true);
    try {
      const res = await fetch('/api/employee/work/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || null,
          priority: newTaskPriority,
          category: newTaskCategory,
          due_date: newTaskDueDate ? `${newTaskDueDate}T18:00:00` : null,
        }),
      });

      if (res.ok) {
        toast.success('Task created successfully');
        setShowAddTaskModal(false);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskPriority('medium');
        setNewTaskDueDate('');
        fetchData();
      } else {
        toast.error('Failed to create task');
      }
    } catch {
      toast.error('Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  // Handle Task Toggle
  const handleToggleTask = async (task: TaskItem) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch('/api/employee/work/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });
      if (res.ok) {
        toast.success(newStatus === 'completed' ? 'Task completed' : 'Task pending');
        fetchData();
      }
    } catch {
      toast.error('Error updating task');
    }
  };

  // Handle Task Delete
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
      toast.error('Error deleting task');
    }
  };

  // Handle Site Visit Update
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
      toast.error('Error updating visit');
    }
  };

  // Handle Lead Status Update
  const handleUpdateLeadStatus = async (id: string, lifecycle_status: string) => {
    try {
      const res = await fetch('/api/employee/work/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, lifecycle_status }),
      });
      if (res.ok) {
        toast.success(`Lead updated to ${lifecycle_status}`);
        fetchData();
      }
    } catch {
      toast.error('Error updating lead');
    }
  };

  // Handle Work Log Creation
  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logSummary.trim()) {
      toast.error('Please enter a work summary');
      return;
    }

    setCreatingLog(true);
    try {
      const res = await fetch('/api/employee/work/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary_text: logSummary.trim(),
          client_interactions_count: clientCount,
          site_visits_conducted_count: visitCount,
        }),
      });

      if (res.ok) {
        toast.success('Work log submitted');
        setShowAddLogModal(false);
        setLogSummary('');
        setClientCount(0);
        setVisitCount(0);
        fetchData();
      } else {
        toast.error('Failed to submit log');
      }
    } catch {
      toast.error('Error submitting log');
    } finally {
      setCreatingLog(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskStatusFilter === 'pending') return t.status !== 'completed';
    if (taskStatusFilter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Title */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            Daily Work Tracker
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Manage your daily tasks, customer site visits, assigned leads, and shift reports
          </p>
        </div>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1.5 dark:border-slate-800 dark:bg-slate-900/60">
        {[
          { id: 'tasks', label: 'Tasks', icon: ListTodo },
          { id: 'site-visits', label: 'Site Visits', icon: Compass },
          { id: 'leads', label: 'Leads', icon: Users },
          { id: 'logs', label: 'Daily Logs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={clsx(
                'flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all',
                isActive
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      {loading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-xs text-slate-500">Loading your items...</p>
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
                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={clsx(
                        'flex items-start justify-between rounded-2xl border p-4 shadow-sm transition-all',
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
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
                        aria-label="Delete Task"
                        className="p-1 text-slate-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 dark:border-slate-800">
                  No tasks found in this view.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SITE VISITS */}
          {activeTab === 'site-visits' && (
            <div>
              {siteVisits.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {siteVisits.map((visit) => (
                    <div
                      key={visit.id}
                      className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
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
                            'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
                            visit.status === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : visit.status === 'requested'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : visit.status === 'completed'
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                  : 'bg-slate-100 text-slate-500'
                          )}
                        >
                          {visit.status}
                        </span>
                      </div>

                      {visit.notes && (
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                          {visit.notes}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                        {visit.contact?.phone && (
                          <a
                            href={`tel:${visit.contact.phone}`}
                            className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                          >
                            <Phone className="h-3 w-3" /> Call Client
                          </a>
                        )}

                        {visit.status === 'requested' && (
                          <button
                            onClick={() => handleUpdateVisitStatus(visit.id, 'confirmed')}
                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                          >
                            Confirm Visit
                          </button>
                        )}

                        {visit.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateVisitStatus(visit.id, 'completed')}
                            className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 dark:border-slate-800">
                  No site visits currently assigned to you.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEADS CRM */}
          {activeTab === 'leads' && (
            <div>
              {leads.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {lead.name}
                            </span>
                            {lead.lead_temperature && (
                              <span
                                className={clsx(
                                  'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
                                  lead.lead_temperature === 'hot' &&
                                    'bg-red-500/10 text-red-600 dark:text-red-400',
                                  lead.lead_temperature === 'warm' &&
                                    'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                                  lead.lead_temperature === 'cold' &&
                                    'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                )}
                              >
                                {lead.lead_temperature === 'hot'
                                  ? '🔥 Hot'
                                  : lead.lead_temperature === 'warm'
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
                        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                          >
                            <Phone className="h-3.5 w-3.5" /> Call
                          </a>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 dark:border-slate-800">
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {workLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{format(parseISO(log.date), 'EEEE, d MMMM yyyy')}</span>
                        <span className="font-mono text-[11px]">
                          {format(parseISO(log.created_at), 'hh:mm a')}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-800 dark:text-slate-200">
                        {log.summary_text}
                      </p>

                      <div className="mt-3 flex gap-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800">
                        <span>📞 {log.client_interactions_count} Client Calls</span>
                        <span>🏢 {log.site_visits_conducted_count} Visits</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 dark:border-slate-800">
                  No daily work logs submitted yet.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Task</h3>
                <button
                  onClick={() => setShowAddTaskModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="E.g. Follow up with client regarding Tonk Road site"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
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
                      <option value="urgent">Urgent</option>
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

                <div className="mt-6 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingTask}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {creatingTask ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Log Modal */}
      <AnimatePresence>
        {showAddLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Daily Work Report
                </h3>
                <button
                  onClick={() => setShowAddLogModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateLog} className="mt-4 space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Work Highlights Summary
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={logSummary}
                    onChange={(e) => setLogSummary(e.target.value)}
                    placeholder="Summarize your actions, meetings, and client follow-ups..."
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Client Interactions
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={clientCount}
                      onChange={(e) => setClientCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Site Visits Conducted
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={visitCount}
                      onChange={(e) => setVisitCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddLogModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingLog}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-50"
                  >
                    {creatingLog ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Log'}
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
