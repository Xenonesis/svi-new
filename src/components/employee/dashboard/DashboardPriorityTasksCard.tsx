'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ListTodo,
  CheckCircle2,
  Plus,
  Clock,
  AlertCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import type { DashboardData } from './types';

interface DashboardPriorityTasksCardProps {
  tasks: DashboardData['urgent_tasks'] | undefined;
  onToggleTask: (taskId: string, currentStatus: string) => void;
  onOpenAddTask?: () => void;
  onQuickCreateTask?: (title: string) => Promise<void>;
}

export function DashboardPriorityTasksCard({
  tasks,
  onToggleTask,
  onOpenAddTask,
  onQuickCreateTask,
}: DashboardPriorityTasksCardProps) {
  const [quickTitle, setQuickTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !onQuickCreateTask || creating) return;
    setCreating(true);
    try {
      await onQuickCreateTask(quickTitle.trim());
      setQuickTitle('');
    } finally {
      setCreating(false);
    }
  };

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
  };

  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), 'd MMM, hh:mm a');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur-xl transition-all sm:p-6 dark:border-white/10 dark:bg-slate-900/80">
      {/* Header with Title & Action */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ListTodo className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Today&apos;s Priority Tasks
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Active high-impact deliverables
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onOpenAddTask && (
            <button
              onClick={() => {
                triggerHaptic();
                onOpenAddTask();
              }}
              className="flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 transition-all hover:bg-amber-500/20 active:scale-95 dark:text-amber-300"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task</span>
            </button>
          )}
          <Link
            href="/employee/work?tab=tasks"
            className="flex items-center gap-0.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <span>All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Inline Quick Add Input */}
      {onQuickCreateTask && (
        <form onSubmit={handleQuickSubmit} className="mb-3.5 flex items-center gap-2">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Quick add high priority task & press Enter..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-900 transition-all placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
          />
          <button
            type="submit"
            disabled={!quickTitle.trim() || creating}
            className="flex h-8 items-center justify-center rounded-xl bg-slate-900 px-3 text-xs font-bold text-white transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-40 dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Add'}
          </button>
        </form>
      )}

      {/* Task List or Zero-State */}
      {!tasks || tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-7 text-center dark:border-slate-800 dark:bg-slate-950/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="mt-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            All caught up! No urgent tasks pending.
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Create a new task or review your weekly schedule.
          </p>
          {onOpenAddTask && (
            <button
              onClick={() => {
                triggerHaptic();
                onOpenAddTask();
              }}
              className="mt-3 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Plus className="h-3.5 w-3.5 text-amber-500" /> Create New Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={clsx(
                'group flex items-start justify-between rounded-2xl border p-3.5 transition-all',
                task.status === 'completed'
                  ? 'border-slate-100 bg-slate-50/40 opacity-70 dark:border-slate-800/40 dark:bg-slate-950/20'
                  : 'border-slate-100 bg-slate-50/80 hover:border-slate-300 dark:border-white/5 dark:bg-slate-950/40 dark:hover:border-white/15'
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    onToggleTask(task.id, task.status);
                  }}
                  aria-label={`Mark task ${task.title} as ${task.status === 'completed' ? 'pending' : 'completed'}`}
                  className={clsx(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all active:scale-90',
                    task.status === 'completed'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 bg-white hover:border-amber-500 dark:border-slate-600 dark:bg-slate-800'
                  )}
                >
                  {task.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                </button>
                <div>
                  <p
                    className={clsx(
                      'text-xs leading-relaxed font-semibold transition-all',
                      task.status === 'completed'
                        ? 'text-slate-400 line-through dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200'
                    )}
                  >
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                      <Clock className="h-2.5 w-2.5" />
                      <span>Due: {formatDueDate(task.due_date)}</span>
                    </p>
                  )}
                </div>
              </div>

              <span
                className={clsx(
                  'ml-2 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase',
                  task.priority === 'urgent'
                    ? 'border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
                    : task.priority === 'high'
                      ? 'border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'border border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
