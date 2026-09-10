'use client';

import { useState, useEffect, useCallback, type SyntheticEvent } from 'react';
import { Plus, Clock, Trash2, Loader2, Check, ListTodo } from 'lucide-react';
import { toast } from 'sonner';

interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  due_date?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

interface AdminEmployeeTasksViewProps {
  employeeId: string;
  employeeName: string;
  token: string;
}

export function AdminEmployeeTasksView({
  employeeId,
  employeeName,
  token,
}: AdminEmployeeTasksViewProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [category, setCategory] = useState('general');
  const [dueDate, setDueDate] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/employees/${employeeId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = (await res.json()) as { tasks?: TaskItem[] };
        setTasks(json.tasks || []);
      }
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [employeeId, token]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/employees/${employeeId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          category,
          due_date: dueDate || undefined,
        }),
      });

      if (res.ok) {
        toast.success(`Task assigned to ${employeeName}`);
        setTitle('');
        setDescription('');
        setPriority('medium');
        setCategory('general');
        setDueDate('');
        setShowAddForm(false);
        await fetchTasks();
      } else {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        toast.error(json?.error || 'Failed to assign task');
      }
    } catch {
      toast.error('Error assigning task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTask = async (task: TaskItem) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch(`/api/admin/employees/${employeeId}/tasks`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });

      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
        toast.success(newStatus === 'completed' ? 'Task marked completed' : 'Task reopened');
      } else {
        toast.error('Failed to update task');
      }
    } catch {
      toast.error('Error updating task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/admin/employees/${employeeId}/tasks?taskId=${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
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

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            Assigned Tasks & Deliverables
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tasks assigned to {employeeName}. Employee views these on their work tracker.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm transition-all hover:bg-amber-400 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{showAddForm ? 'Close Form' : 'Assign New Task'}</span>
        </button>
      </div>

      {/* Add Task Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleCreateTask}
          className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 dark:border-amber-500/20 dark:bg-amber-950/10"
        >
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
              New Assignment for {employeeName}
            </span>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Conduct follow-up call with client & share brochure"
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Description / Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details, property name, or targets..."
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')
                }
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white"
              >
                <option value="general">General</option>
                <option value="client_followup">Client Follow-up</option>
                <option value="site_visit">Site Visit</option>
                <option value="documentation">Documentation</option>
                <option value="field_work">Field Work</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white"
              ></input>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-slate-800 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1 rounded-xl bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-amber-400 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Assigning...
                </>
              ) : (
                'Confirm & Assign Task'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500 dark:border-white/10">
          <ListTodo className="mx-auto mb-2 h-6 w-6 text-gray-400" />
          No tasks currently assigned to {employeeName}.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start justify-between rounded-2xl border p-4 shadow-xs transition-all ${
                task.status === 'completed'
                  ? 'border-gray-200/80 bg-gray-50/70 opacity-60 dark:border-white/5 dark:bg-white/5'
                  : 'border-gray-200 bg-white dark:border-white/10 dark:bg-slate-900/80'
              }`}
            >
              <div className="mr-2 flex min-w-0 flex-1 items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task)}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    task.status === 'completed'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-gray-300 text-transparent hover:border-amber-500 hover:text-amber-500 dark:border-gray-600'
                  }`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </button>

                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold text-gray-900 dark:text-white ${
                      task.status === 'completed' ? 'text-gray-500 line-through' : ''
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500 dark:text-gray-400">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px]">
                    <span
                      className={`rounded px-1.5 py-0.5 font-bold uppercase ${
                        task.priority === 'urgent'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : task.priority === 'high'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600 capitalize dark:bg-white/5 dark:text-gray-400">
                      {task.category.replace('_', ' ')}
                    </span>
                    {task.due_date && (
                      <span className="flex items-center gap-0.5 text-gray-400">
                        <Clock className="h-2.5 w-2.5" /> Due {task.due_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteTask(task.id)}
                className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                title="Remove task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
