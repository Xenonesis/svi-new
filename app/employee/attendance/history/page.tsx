'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Loader2,
  FileCheck2,
  Palmtree,
  ShieldAlert,
  X,
  History,
  TrendingUp,
} from 'lucide-react';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
} from 'date-fns';
import { clsx } from 'clsx';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  punch_in_time: string | null;
  punch_out_time: string | null;
  total_hours: number | null;
  is_late: boolean;
  is_geofence_verified: boolean;
  notes?: string | null;
}

interface MonthlyStats {
  total_records: number;
  present_count: number;
  late_count: number;
  half_day_count: number;
  leave_count: number;
  total_hours_worked: number;
  avg_daily_hours: number;
}

interface LeaveQuota {
  casual_total: number;
  sick_total: number;
  earned_total: number;
  casual_taken: number;
  sick_taken: number;
  earned_taken: number;
  unpaid_taken: number;
}

interface LeaveRecord {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
}

export default function EmployeeAttendanceHistoryPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [quota, setQuota] = useState<LeaveQuota | null>(null);

  // Modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);
  const [selectedDayRecord, setSelectedDayRecord] = useState<AttendanceRecord | null>(null);

  // Leave Form
  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [leaveReason, setLeaveReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Regularization Form
  const [regDate, setRegDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [regPunchType, setRegPunchType] = useState('punch_in');
  const [regTime, setRegTime] = useState('09:00');
  const [regReason, setRegReason] = useState('');
  const [submittingReg, setSubmittingReg] = useState(false);

  const fetchMonthHistory = useCallback(async (date: Date) => {
    setLoading(true);
    const monthKey = format(date, 'yyyy-MM');
    try {
      const [histRes, leaveRes] = await Promise.all([
        fetch(`/api/employee/attendance/history?month=${monthKey}`),
        fetch('/api/employee/attendance/leaves'),
      ]);

      if (histRes.ok) {
        const histData = await histRes.json();
        setRecords(histData.records || []);
        setStats(histData.stats || null);
      }

      if (leaveRes.ok) {
        const leaveData = await leaveRes.json();
        setLeaves(leaveData.leaves || []);
        setQuota(leaveData.quota || null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonthHistory(currentMonth);
  }, [currentMonth, fetchMonthHistory]);

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(next);
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) {
      toast.error('Please provide a reason for the leave');
      return;
    }

    setSubmittingLeave(true);
    try {
      const res = await fetch('/api/employee/attendance/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason: leaveReason.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.message || 'Failed to submit leave');

      toast.success('Leave request submitted successfully!');
      setShowLeaveModal(false);
      setLeaveReason('');
      fetchMonthHistory(currentMonth);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error submitting leave';
      toast.error(message);
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleCancelLeave = async (id: string) => {
    try {
      const res = await fetch('/api/employee/attendance/leaves', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success('Leave request cancelled');
        fetchMonthHistory(currentMonth);
      }
    } catch {
      toast.error('Could not cancel leave request');
    }
  };

  const handleRegularize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setSubmittingReg(true);
    try {
      const suggestedTimestamp = `${regDate}T${regTime}:00`;
      const res = await fetch('/api/employee/attendance/regularize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: regDate,
          punch_type: regPunchType,
          suggested_time: suggestedTimestamp,
          reason: regReason.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || json.message || 'Submission failed');

      toast.success('Regularization request submitted to Admin!');
      setShowRegularizeModal(false);
      setRegReason('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit regularization';
      toast.error(message);
    } finally {
      setSubmittingReg(false);
    }
  };

  // Calendar Day Calculation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0 = Sunday

  return (
    <div className="space-y-6 pb-6">
      {/* Title & Month Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Attendance & Leaves
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monthly log calendar and leave applications
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={handlePrevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[76px] px-2 text-center text-xs font-semibold text-slate-900 dark:text-white">
            {format(currentMonth, 'MMM yyyy')}
          </span>
          <button
            onClick={handleNextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Monthly Statistics Bar */}
      {stats && (
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-center dark:bg-emerald-950/20">
            <span className="text-[10px] font-semibold text-emerald-600 uppercase dark:text-emerald-400">
              Present
            </span>
            <p className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">
              {stats.present_count}
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-center dark:bg-amber-950/20">
            <span className="text-[10px] font-semibold text-amber-600 uppercase dark:text-amber-400">
              Late
            </span>
            <p className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">
              {stats.late_count}
            </p>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-2.5 text-center dark:bg-blue-950/20">
            <span className="text-[10px] font-semibold text-blue-600 uppercase dark:text-blue-400">
              Leaves
            </span>
            <p className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">
              {stats.leave_count}
            </p>
          </div>

          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-2.5 text-center dark:bg-purple-950/20">
            <span className="text-[10px] font-semibold text-purple-600 uppercase dark:text-purple-400">
              Hours
            </span>
            <p className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">
              {stats.total_hours_worked}h
            </p>
          </div>
        </div>
      )}

      {/* Visual Calendar Grid */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank prefix days */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-10 rounded-lg bg-transparent" />
            ))}

            {/* Days in Month */}
            {daysInMonth.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const rec = records.find((r) => r.date === dateStr);
              const isToday = isSameDay(day, new Date());

              let statusColor =
                'bg-slate-50 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300';
              if (rec) {
                if (rec.status === 'present') {
                  statusColor = rec.is_late
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30';
                } else if (rec.status === 'half_day') {
                  statusColor =
                    'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30';
                } else if (rec.status === 'leave') {
                  statusColor =
                    'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30';
                }
              }

              return (
                <button
                  key={dateStr}
                  onClick={() => rec && setSelectedDayRecord(rec)}
                  disabled={!rec}
                  className={clsx(
                    'flex h-11 flex-col items-center justify-center rounded-xl text-xs transition-all',
                    statusColor,
                    isToday &&
                      'font-bold ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-950',
                    rec ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
                  )}
                >
                  <span className="font-semibold">{format(day, 'd')}</span>
                  {rec && (
                    <span className="font-mono text-[9px] opacity-80">
                      {rec.total_hours ? `${rec.total_hours}h` : rec.status}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-3 border-t border-slate-100 pt-3 text-[10px] text-slate-500 dark:border-slate-800">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Present
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Late
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-purple-500" /> Leave
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Half Day
          </span>
        </div>
      </div>

      {/* Quick Actions (Apply Leave & Missed Punch) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowLeaveModal(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/10 dark:bg-blue-950/20 dark:text-blue-400"
        >
          <Palmtree className="h-4 w-4" />
          Apply for Leave
        </button>

        <button
          onClick={() => setShowRegularizeModal(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <History className="h-4 w-4" />
          Missed Punch Request
        </button>
      </div>

      {/* Leave Quota Cards */}
      {quota && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <h3 className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Annual Leave Balances
          </h3>

          <div className="space-y-2.5">
            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Casual Leave</span>
                <span>
                  {quota.casual_total - quota.casual_taken} / {quota.casual_total} days left
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${Math.min(100, (quota.casual_taken / quota.casual_total) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Sick Leave</span>
                <span>
                  {quota.sick_total - quota.sick_taken} / {quota.sick_total} days left
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${Math.min(100, (quota.sick_taken / quota.sick_total) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Earned Leave</span>
                <span>
                  {quota.earned_total - quota.earned_taken} / {quota.earned_total} days left
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{
                    width: `${Math.min(100, (quota.earned_taken / quota.earned_total) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Leave Requests */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          Leave Applications
        </h3>

        {leaves.length > 0 ? (
          <div className="space-y-2">
            {leaves.slice(0, 5).map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 capitalize dark:text-white">
                      {l.leave_type} Leave ({l.total_days} day{l.total_days > 1 ? 's' : ''})
                    </span>
                    <span
                      className={clsx(
                        'rounded-md px-2 py-0.5 text-[9px] font-semibold uppercase',
                        l.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : l.status === 'rejected'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : l.status === 'cancelled'
                              ? 'bg-slate-500/10 text-slate-500'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {l.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {format(parseISO(l.start_date), 'MMM dd')} –{' '}
                    {format(parseISO(l.end_date), 'MMM dd, yyyy')}
                  </p>
                  <p className="mt-1 line-clamp-1 text-[11px] text-slate-600 italic dark:text-slate-300">
                    "{l.reason}"
                  </p>
                </div>

                {l.status === 'pending' && (
                  <button
                    onClick={() => handleCancelLeave(l.id)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50 dark:border-slate-800 dark:text-red-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500 dark:border-slate-800">
            No leave requests recorded.
          </div>
        )}
      </div>

      {/* Day Details Modal */}
      <AnimatePresence>
        {selectedDayRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Attendance for {format(parseISO(selectedDayRecord.date), 'EEEE, MMM dd, yyyy')}
                </h3>
                <button
                  onClick={() => setSelectedDayRecord(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-100 py-1.5 dark:border-slate-800">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-blue-600 uppercase dark:text-blue-400">
                    {selectedDayRecord.status}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-100 py-1.5 dark:border-slate-800">
                  <span className="text-slate-500">Punch In Time</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedDayRecord.punch_in_time
                      ? format(parseISO(selectedDayRecord.punch_in_time), 'hh:mm a')
                      : '--:--'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-100 py-1.5 dark:border-slate-800">
                  <span className="text-slate-500">Punch Out Time</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedDayRecord.punch_out_time
                      ? format(parseISO(selectedDayRecord.punch_out_time), 'hh:mm a')
                      : '--:--'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-100 py-1.5 dark:border-slate-800">
                  <span className="text-slate-500">Total Duration</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedDayRecord.total_hours ? `${selectedDayRecord.total_hours} hrs` : '--'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-100 py-1.5 dark:border-slate-800">
                  <span className="text-slate-500">Geofence Verified</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {selectedDayRecord.is_geofence_verified
                      ? 'Yes (Office Radius)'
                      : 'Standard Location'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedDayRecord(null)}
                className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {showLeaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Apply for Leave
                </h3>
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleApplyLeave} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Leave Type
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="earned">Earned Leave</option>
                    <option value="half_day">Half Day Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Reason for Leave
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Brief explanation for the leave request..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingLeave}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500"
                  >
                    {submittingLeave ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Missed Punch Regularization Modal */}
      <AnimatePresence>
        {showRegularizeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Missed Punch Regularization
                </h3>
                <button
                  onClick={() => setShowRegularizeModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleRegularize} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Missed Date
                  </label>
                  <input
                    type="date"
                    required
                    value={regDate}
                    onChange={(e) => setRegDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Punch Type
                    </label>
                    <select
                      value={regPunchType}
                      onChange={(e) => setRegPunchType(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="punch_in">Missed Punch In</option>
                      <option value="punch_out">Missed Punch Out</option>
                      <option value="full_day">Missed Entire Day</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Estimated Time
                    </label>
                    <input
                      type="time"
                      required
                      value={regTime}
                      onChange={(e) => setRegTime(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Reason for Missed Scan
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={regReason}
                    onChange={(e) => setRegReason(e.target.value)}
                    placeholder="e.g. Device battery died while on site visit at Green Meadows..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRegularizeModal(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReg}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500"
                  >
                    {submittingReg ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Submit to Admin'
                    )}
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
