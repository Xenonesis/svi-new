'use client';

import React from 'react';
import Link from 'next/link';
import { ListTodo, ChevronRight, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import type { DashboardData } from './types';

interface DashboardPriorityTasksCardProps {
  tasks: DashboardData['urgent_tasks'] | undefined;
  onToggleTask: (taskId: string, currentStatus: string) => void;
}

export function DashboardPriorityTasksCard({
  tasks,
  onToggleTask,
}: DashboardPriorityTasksCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <ListTodo className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Today&apos;s Priority Tasks
          </h2>
        </div>
        <Link
          href="/employee/work?tab=tasks"
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          All Tasks <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {!tasks || tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-800">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            All caught up! No urgent tasks pending.
          </p>
          <Link
            href="/employee/work?tab=tasks"
            className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400"
          >
            + Add a new task
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleTask(task.id, task.status)}
                  className={clsx(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                    task.status === 'completed'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 hover:border-slate-500 dark:border-slate-700'
                  )}
                >
                  {task.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                </button>
                <div>
                  <p
                    className={clsx(
                      'text-xs font-semibold',
                      task.status === 'completed'
                        ? 'text-slate-400 line-through dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200'
                    )}
                  >
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Due: {format(new Date(task.due_date), 'd MMM, hh:mm a')}
                    </p>
                  )}
                </div>
              </div>

              <span
                className={clsx(
                  'rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase',
                  task.priority === 'urgent'
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                    : task.priority === 'high'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
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
