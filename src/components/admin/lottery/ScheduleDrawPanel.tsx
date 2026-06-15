'use client';

import { RefreshCw, Calendar, Timer, BellRing, XCircle } from 'lucide-react';

interface ScheduleDrawPanelProps {
  scheduleInputIST: string;
  preNotifyMinutes: number;
  showCountdown: boolean;
  includeCountdownInEmail: boolean;
  scheduleSaving: boolean;
  scheduleLoading: boolean;
  existingSchedule: any;
  onScheduleInputChange: (value: string) => void;
  onPreNotifyChange: (value: number) => void;
  onShowCountdownChange: (value: boolean) => void;
  onIncludeCountdownInEmailChange: (value: boolean) => void;
  onSaveSchedule: () => void;
  onCancelSchedule: () => void;
  onQuickTimeSelect: (label: string, mins: number) => void;
}

const QUICK_TIMES = [
  { label: '+30 min', mins: 30 },
  { label: '+1 hr', mins: 60 },
  { label: '+2 hrs', mins: 120 },
  { label: '+6 hrs', mins: 360 },
  { label: '+1 day', mins: 1440 },
  { label: '+2 days', mins: 2880 },
  { label: '+1 week', mins: 10080 },
];

export function ScheduleDrawPanel({
  scheduleInputIST,
  preNotifyMinutes,
  showCountdown,
  includeCountdownInEmail,
  scheduleSaving,
  scheduleLoading,
  existingSchedule,
  onScheduleInputChange,
  onPreNotifyChange,
  onShowCountdownChange,
  onIncludeCountdownInEmailChange,
  onSaveSchedule,
  onCancelSchedule,
  onQuickTimeSelect,
}: ScheduleDrawPanelProps) {
  return (
    <div className="dark:bg-brand-dark-surface/60 relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10">
      <div className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-violet-500/10 blur-[80px]" />
      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              Schedule Automated Draw
            </h3>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-gray-400">
              Set a date & time and the system will run the draw, send reminders, and email all
              participants automatically.
            </p>
          </div>
          {existingSchedule && (
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold tracking-widest text-violet-600 uppercase dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" /> Scheduled
            </span>
          )}
        </div>

        {scheduleLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate-500 dark:text-gray-400">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading schedule...
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-gray-400">
                Draw Date & Time <span className="text-violet-500">(IST)</span>
              </label>
              <div className="mb-3 flex flex-wrap gap-2">
                {QUICK_TIMES.map(({ label, mins }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onQuickTimeSelect(label, mins)}
                    className="cursor-pointer rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700 transition-all hover:border-violet-500 hover:bg-violet-500 hover:text-white dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500 dark:hover:text-white"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Timer className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
                <input
                  type="datetime-local"
                  value={scheduleInputIST}
                  onChange={(e) => onScheduleInputChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-sm text-slate-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-violet-500 dark:focus:ring-violet-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-gray-400">
                <BellRing className="mr-1.5 inline h-3.5 w-3.5" /> Reminder Email — Minutes Before
                Draw
              </label>
              <select
                value={preNotifyMinutes}
                onChange={(e) => onPreNotifyChange(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-violet-500 dark:focus:ring-violet-500/20"
              >
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={120}>2 hours before</option>
                <option value={360}>6 hours before</option>
                <option value={720}>12 hours before</option>
                <option value={1440}>24 hours before</option>
              </select>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  Show Countdown on Public Site
                </span>
                <button
                  type="button"
                  onClick={() => onShowCountdownChange(!showCountdown)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none ${
                    showCountdown
                      ? 'border-violet-500 bg-violet-500'
                      : 'border-slate-300 bg-slate-200 dark:border-white/10 dark:bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${showCountdown ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  Include Countdown in Reminder Email
                </span>
                <button
                  type="button"
                  onClick={() => onIncludeCountdownInEmailChange(!includeCountdownInEmail)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none ${
                    includeCountdownInEmail
                      ? 'border-violet-500 bg-violet-500'
                      : 'border-slate-300 bg-slate-200 dark:border-white/10 dark:bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${includeCountdownInEmail ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <button
                onClick={onSaveSchedule}
                disabled={scheduleSaving || !scheduleInputIST}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-violet-700 hover:shadow-violet-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {scheduleSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
                {existingSchedule ? 'Update Schedule' : 'Schedule Draw'}
              </button>
              {existingSchedule && (
                <button
                  onClick={onCancelSchedule}
                  disabled={scheduleSaving}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                >
                  <XCircle className="h-4 w-4" /> Cancel Schedule
                </button>
              )}
              {existingSchedule && (
                <span className="text-xs text-slate-500 dark:text-gray-400">
                  Scheduled for{' '}
                  <strong className="text-slate-700 dark:text-gray-300">
                    {new Date(existingSchedule.scheduled_at).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}{' '}
                    IST
                  </strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
