'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  User,
  FileText,
  ChevronRight,
  ShieldAlert,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import type { LeaveItem } from '@/src/lib/attendance/leaveStore';
import type { RegularizationItem } from '@/src/lib/attendance/regularizationStore';

interface LeaveAndRegularizationCenterProps {
  token: string;
}

type ActiveSection = 'leaves' | 'regularizations';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function LeaveAndRegularizationCenter({ token }: LeaveAndRegularizationCenterProps) {
  const [section, setSection] = useState<ActiveSection>('leaves');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [regularizations, setRegularizations] = useState<RegularizationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Review modal states
  const [selectedLeave, setSelectedLeave] = useState<{
    item: LeaveItem;
    action: 'approved' | 'rejected';
  } | null>(null);
  const [selectedReg, setSelectedReg] = useState<{
    item: RegularizationItem;
    action: 'approved' | 'rejected';
  } | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch leaves
  const fetchLeaves = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      try {
        const res = await fetch('/api/admin/attendance/leaves', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setLeaves(data.leaves || []);
        } else {
          toast.error('Failed to load leave applications');
        }
      } catch {
        toast.error('Network error loading leaves');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  // Fetch regularizations
  const fetchRegularizations = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      try {
        const res = await fetch('/api/admin/attendance/regularizations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setRegularizations(data.regularizations || []);
        } else {
          toast.error('Failed to load regularization requests');
        }
      } catch {
        toast.error('Network error loading regularizations');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (section === 'leaves') {
      fetchLeaves();
    } else {
      fetchRegularizations();
    }
  }, [section, fetchLeaves, fetchRegularizations]);

  // Handle Leave Review
  const handleConfirmLeaveReview = async () => {
    if (!selectedLeave) return;
    setSubmittingReview(true);

    try {
      const res = await fetch(`/api/admin/attendance/leaves/${selectedLeave.item.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedLeave.action,
          admin_notes: adminNote,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          selectedLeave.action === 'approved'
            ? 'Leave approved and synced with attendance records'
            : 'Leave request rejected'
        );
        setSelectedLeave(null);
        setAdminNote('');
        fetchLeaves(true);
      } else {
        toast.error(data.error?.message || data.error || 'Failed to update leave');
      }
    } catch {
      toast.error('Error submitting leave review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Regularization Review
  const handleConfirmRegReview = async () => {
    if (!selectedReg) return;
    setSubmittingReview(true);

    try {
      const res = await fetch(`/api/admin/attendance/regularizations/${selectedReg.item.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedReg.action,
          admin_notes: adminNote,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          selectedReg.action === 'approved'
            ? 'Regularization approved and timesheet updated'
            : 'Regularization request rejected'
        );
        setSelectedReg(null);
        setAdminNote('');
        fetchRegularizations(true);
      } else {
        toast.error(data.error?.message || data.error || 'Failed to update regularization');
      }
    } catch {
      toast.error('Error submitting regularization review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filtering
  const filteredLeaves = leaves.filter((l) => {
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      l.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredRegs = regularizations.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingLeavesCount = leaves.filter((l) => l.status === 'pending').length;
  const pendingRegsCount = regularizations.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Stat Summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Approvals & Exception Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review and resolve employee leave requests, half-day leaves, and punch regularizations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => (section === 'leaves' ? fetchLeaves(true) : fetchRegularizations(true))}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw className={clsx('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div
          onClick={() => {
            setSection('leaves');
            setStatusFilter('pending');
          }}
          className={clsx(
            'cursor-pointer rounded-2xl border p-4 transition-all',
            section === 'leaves' && statusFilter === 'pending'
              ? 'border-amber-500/50 bg-amber-500/5 shadow-md shadow-amber-500/10 dark:bg-amber-500/10'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              Pending Leaves
            </span>
            <CalendarDays className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {pendingLeavesCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Awaiting management approval</p>
        </div>

        <div
          onClick={() => {
            setSection('regularizations');
            setStatusFilter('pending');
          }}
          className={clsx(
            'cursor-pointer rounded-2xl border p-4 transition-all',
            section === 'regularizations' && statusFilter === 'pending'
              ? 'border-blue-500/50 bg-blue-500/5 shadow-md shadow-blue-500/10 dark:bg-blue-500/10'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Missed Punches / Regularizations
            </span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {pendingRegsCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Requires attendance record update</p>
        </div>

        <div
          onClick={() => {
            setStatusFilter('approved');
          }}
          className={clsx(
            'cursor-pointer rounded-2xl border p-4 transition-all',
            statusFilter === 'approved'
              ? 'border-emerald-500/50 bg-emerald-500/5 shadow-md shadow-emerald-500/10 dark:bg-emerald-500/10'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Approved This Period
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {section === 'leaves'
              ? leaves.filter((l) => l.status === 'approved').length
              : regularizations.filter((r) => r.status === 'approved').length}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Processed successfully</p>
        </div>
      </div>

      {/* Section Switcher Tabs & Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        {/* Toggle Switch */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setSection('leaves')}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition-all',
              section === 'leaves'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            )}
          >
            <Calendar className="h-3.5 w-3.5 text-amber-500" />
            Leave Applications
            {pendingLeavesCount > 0 && (
              <span className="py-0.2 rounded-full bg-amber-500/20 px-1.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
                {pendingLeavesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setSection('regularizations')}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition-all',
              section === 'regularizations'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            )}
          >
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            Punch Regularizations
            {pendingRegsCount > 0 && (
              <span className="py-0.2 rounded-full bg-blue-500/20 px-1.5 text-[10px] font-extrabold text-blue-700 dark:text-blue-300">
                {pendingRegsCount}
              </span>
            )}
          </button>
        </div>

        {/* Search and Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filters */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800">
            {(['pending', 'approved', 'rejected', 'all'] as StatusFilter[]).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={clsx(
                  'rounded-md px-2.5 py-1 capitalize transition-all',
                  statusFilter === st
                    ? 'bg-white font-bold text-slate-900 shadow-xs dark:bg-slate-600 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                )}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <p className="text-xs text-slate-400">Loading requests...</p>
        </div>
      ) : section === 'leaves' ? (
        /* LEAVE REQUESTS TABLE / CARDS */
        filteredLeaves.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <Calendar className="h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              No leave requests found
            </p>
            <p className="text-xs text-slate-400">
              No leave applications match the selected status or query.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Dates & Duration</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {leave.full_name || 'Staff Member'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {leave.email || 'employee'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={clsx(
                            'inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase',
                            leave.leave_type === 'casual' &&
                              'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                            leave.leave_type === 'sick' &&
                              'bg-red-500/10 text-red-600 dark:text-red-400',
                            leave.leave_type === 'half_day' &&
                              'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                            leave.leave_type === 'earned' &&
                              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                            leave.leave_type === 'unpaid' &&
                              'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                          )}
                        >
                          {leave.leave_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {format(new Date(leave.start_date), 'dd MMM yyyy')}
                          {leave.start_date !== leave.end_date && (
                            <> → {format(new Date(leave.end_date), 'dd MMM yyyy')}</>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}
                        </div>
                      </td>
                      <td className="max-w-[260px] px-4 py-3.5">
                        <p
                          className="line-clamp-2 text-slate-600 dark:text-slate-300"
                          title={leave.reason}
                        >
                          {leave.reason}
                        </p>
                        {leave.admin_notes && (
                          <p className="mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                            Note: {leave.admin_notes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={clsx(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize',
                            leave.status === 'pending' &&
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                            leave.status === 'approved' &&
                              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                            leave.status === 'rejected' &&
                              'bg-red-500/10 text-red-600 dark:text-red-400',
                            leave.status === 'cancelled' && 'bg-slate-500/10 text-slate-500'
                          )}
                        >
                          {leave.status === 'pending' && <Clock className="h-3 w-3" />}
                          {leave.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                          {leave.status === 'rejected' && <XCircle className="h-3 w-3" />}
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {leave.status === 'pending' ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedLeave({ item: leave, action: 'approved' });
                                setAdminNote('');
                              }}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLeave({ item: leave, action: 'rejected' });
                                setAdminNote('');
                              }}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : /* REGULARIZATION REQUESTS TABLE / CARDS */
      filteredRegs.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <Clock className="h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            No punch regularization requests found
          </p>
          <p className="text-xs text-slate-400">
            No missed punch requests match the selected status or query.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Target Date</th>
                  <th className="px-4 py-3">Correction Type</th>
                  <th className="px-4 py-3">Suggested Punch Time</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredRegs.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {reg.full_name || 'Staff Member'}
                      </div>
                      <div className="text-[11px] text-slate-400">{reg.email || 'employee'}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {format(new Date(reg.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase dark:text-blue-400">
                        {reg.punch_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {format(new Date(reg.suggested_time), 'hh:mm a (IST)')}
                    </td>
                    <td className="max-w-[260px] px-4 py-3.5">
                      <p
                        className="line-clamp-2 text-slate-600 dark:text-slate-300"
                        title={reg.reason}
                      >
                        {reg.reason}
                      </p>
                      {reg.admin_notes && (
                        <p className="mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                          Note: {reg.admin_notes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize',
                          reg.status === 'pending' &&
                            'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                          reg.status === 'approved' &&
                            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                          reg.status === 'rejected' &&
                            'bg-red-500/10 text-red-600 dark:text-red-400'
                        )}
                      >
                        {reg.status === 'pending' && <Clock className="h-3 w-3" />}
                        {reg.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                        {reg.status === 'rejected' && <XCircle className="h-3 w-3" />}
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {reg.status === 'pending' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedReg({ item: reg, action: 'approved' });
                              setAdminNote('');
                            }}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReg({ item: reg, action: 'rejected' });
                              setAdminNote('');
                            }}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEAVE REVIEW MODAL */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedLeave.action === 'approved'
                ? 'Approve Leave Request'
                : 'Reject Leave Request'}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {selectedLeave.item.full_name} ({selectedLeave.item.leave_type.replace('_', ' ')}) •{' '}
              {format(new Date(selectedLeave.item.start_date), 'dd MMM yyyy')} to{' '}
              {format(new Date(selectedLeave.item.end_date), 'dd MMM yyyy')} (
              {selectedLeave.item.total_days} days)
            </p>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
              <span className="font-semibold">Reason: </span>
              {selectedLeave.item.reason}
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Admin Note / Remarks {selectedLeave.action === 'rejected' && '(Optional)'}
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Approved as discussed. Safe travels!"
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedLeave(null)}
                disabled={submittingReview}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLeaveReview}
                disabled={submittingReview}
                className={clsx(
                  'rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition-all',
                  selectedLeave.action === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {submittingReview ? 'Processing...' : `Confirm ${selectedLeave.action}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGULARIZATION REVIEW MODAL */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedReg.action === 'approved'
                ? 'Approve Punch Regularization'
                : 'Reject Regularization Request'}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {selectedReg.item.full_name} • Date:{' '}
              {format(new Date(selectedReg.item.date), 'dd MMM yyyy')} •{' '}
              {selectedReg.item.punch_type.replace('_', ' ')} at{' '}
              {format(new Date(selectedReg.item.suggested_time), 'hh:mm a')}
            </p>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
              <span className="font-semibold">Reason: </span>
              {selectedReg.item.reason}
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Admin Note / Remarks
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Verified client site visit with manager. Approved."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedReg(null)}
                disabled={submittingReview}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRegReview}
                disabled={submittingReview}
                className={clsx(
                  'rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition-all',
                  selectedReg.action === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {submittingReview ? 'Processing...' : `Confirm ${selectedReg.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
