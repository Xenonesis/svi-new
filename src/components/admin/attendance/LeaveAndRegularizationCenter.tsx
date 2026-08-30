'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, AlertCircle, Search, RefreshCw, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import type { LeaveItem } from '@/src/lib/attendance/leaveStore';
import type { RegularizationItem } from '@/src/lib/attendance/regularizationStore';
import { LeaveApprovalTable } from './approvals/LeaveApprovalTable';
import { RegularizationApprovalTable } from './approvals/RegularizationApprovalTable';
import { ApprovalReviewModal } from './approvals/ApprovalReviewModal';

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
            Approvals &amp; Exception Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review and resolve employee leave requests, half-day leaves, and punch regularizations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (section === 'leaves' ? fetchLeaves(true) : fetchRegularizations(true))}
            disabled={refreshing || loading}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
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
            <span className="text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              Pending Leaves
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {pendingLeavesCount}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">Applications awaiting review</p>
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
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
              Pending Regularizations
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {pendingRegsCount}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">Missed punches to reconcile</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Total Resolved
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {leaves.filter((l) => l.status !== 'pending').length +
              regularizations.filter((r) => r.status !== 'pending').length}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">Processed exceptions to date</p>
        </div>
      </div>

      {/* Segmented Section Switcher & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        {/* Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => {
              setSection('leaves');
              setStatusFilter('pending');
            }}
            className={clsx(
              'flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all',
              section === 'leaves'
                ? 'border border-slate-200/50 bg-white text-slate-900 shadow-xs dark:border-transparent dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Leave Requests</span>
            {pendingLeavesCount > 0 && (
              <span className="py-0.2 rounded-full bg-amber-500/20 px-1.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
                {pendingLeavesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setSection('regularizations');
              setStatusFilter('pending');
            }}
            className={clsx(
              'flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all',
              section === 'regularizations'
                ? 'border border-slate-200/50 bg-white text-slate-900 shadow-xs dark:border-transparent dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Regularizations</span>
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
                type="button"
                onClick={() => setStatusFilter(st)}
                className={clsx(
                  'cursor-pointer rounded-md px-2.5 py-1 capitalize transition-all',
                  statusFilter === st
                    ? 'bg-white font-bold text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-white'
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
      {section === 'leaves' ? (
        <LeaveApprovalTable
          leaves={filteredLeaves}
          loading={loading}
          onReview={(leave, action) => {
            setSelectedLeave({ item: leave, action });
            setAdminNote('');
          }}
        />
      ) : (
        <RegularizationApprovalTable
          regularizations={filteredRegs}
          loading={loading}
          onReview={(reg, action) => {
            setSelectedReg({ item: reg, action });
            setAdminNote('');
          }}
        />
      )}

      {/* Leave Review Modal */}
      {selectedLeave && (
        <ApprovalReviewModal
          title={
            selectedLeave.action === 'approved' ? 'Approve Leave Request' : 'Reject Leave Request'
          }
          subtitle={`${selectedLeave.item.full_name} (${selectedLeave.item.leave_type.replace('_', ' ')}) • ${format(new Date(selectedLeave.item.start_date), 'dd MMM yyyy')} to ${format(new Date(selectedLeave.item.end_date), 'dd MMM yyyy')} (${selectedLeave.item.total_days} days)`}
          reason={selectedLeave.item.reason}
          action={selectedLeave.action}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          submittingReview={submittingReview}
          onClose={() => setSelectedLeave(null)}
          onConfirm={handleConfirmLeaveReview}
        />
      )}

      {/* Regularization Review Modal */}
      {selectedReg && (
        <ApprovalReviewModal
          title={
            selectedReg.action === 'approved'
              ? 'Approve Punch Regularization'
              : 'Reject Regularization Request'
          }
          subtitle={`${selectedReg.item.full_name} • Date: ${format(new Date(selectedReg.item.date), 'dd MMM yyyy')} • ${selectedReg.item.punch_type.replace('_', ' ')} at ${format(new Date(selectedReg.item.suggested_time), 'hh:mm a')}`}
          reason={selectedReg.item.reason}
          action={selectedReg.action}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          submittingReview={submittingReview}
          onClose={() => setSelectedReg(null)}
          onConfirm={handleConfirmRegReview}
        />
      )}
    </div>
  );
}
