'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AttendanceHeatmapCalendar } from '@/src/components/employee/attendance/history/AttendanceHeatmapCalendar';
import { DayDetailCard } from '@/src/components/employee/attendance/history/DayDetailCard';
import { MonthlyAttendanceStats } from '@/src/components/employee/attendance/history/MonthlyAttendanceStats';
import { LeaveBalancesCard } from '@/src/components/employee/attendance/history/LeaveBalancesCard';
import { ApplyLeaveModal } from '@/src/components/employee/attendance/history/ApplyLeaveModal';
import { RegularizePunchModal } from '@/src/components/employee/attendance/history/RegularizePunchModal';
import type {
  AttendanceRecord,
  MonthlyStats,
  LeaveQuota,
  LeaveRecord,
} from '@/src/components/employee/attendance/history/types';

export default function EmployeeAttendanceHistoryPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [quota, setQuota] = useState<LeaveQuota | null>(null);

  // Modals & Inspection
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayRecord, setSelectedDayRecord] = useState<AttendanceRecord | null>(null);

  // Fetch Attendance History & Leaves
  const fetchHistory = useCallback(async (monthDate: Date) => {
    try {
      setLoading(true);
      const monthStr = format(monthDate, 'yyyy-MM');

      const [historyRes, leavesRes] = await Promise.all([
        fetch(`/api/employee/attendance/history?month=${monthStr}`),
        fetch('/api/employee/attendance/leaves'),
      ]);

      if (historyRes.ok) {
        const hJson = await historyRes.json();
        setRecords(hJson.records || []);
        setStats(hJson.stats || null);
      }

      if (leavesRes.ok) {
        const lJson = await leavesRes.json();
        setQuota(lJson.quota || null);
      }
    } catch {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(currentMonth);
  }, [currentMonth, fetchHistory]);

  const handleSelectDay = (dateStr: string, record: AttendanceRecord | null) => {
    setSelectedDate(dateStr);
    setSelectedDayRecord(record);
  };

  const handleApplyLeave = async (leaveData: {
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
  }) => {
    try {
      const res = await fetch('/api/employee/attendance/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveData),
      });
      if (res.ok) {
        toast.success('Leave application submitted for approval');
        fetchHistory(currentMonth);
      } else {
        const err = await res.json();
        toast.error(err.error?.message || 'Failed to submit leave');
      }
    } catch {
      toast.error('Error submitting leave');
    }
  };

  const handleRegularize = async (regData: {
    date: string;
    punch_type: string;
    suggested_time: string;
    reason: string;
  }) => {
    try {
      const res = await fetch('/api/employee/attendance/regularize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      if (res.ok) {
        toast.success('Regularization request sent to Admin');
        fetchHistory(currentMonth);
      } else {
        const err = await res.json();
        toast.error(err.error?.message || 'Failed to submit regularization');
      }
    } catch {
      toast.error('Error submitting regularization');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
          Attendance & Leaves
        </h1>
        <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Monthly attendance heatmap, shift records, leave quotas, and punch regularization
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Heatmap Calendar & Day Detail (7 Columns) */}
        <div className="space-y-6 lg:col-span-7">
          <AttendanceHeatmapCalendar
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            records={records}
            loading={loading}
            selectedDate={selectedDate}
            onSelectDay={handleSelectDay}
          />

          <DayDetailCard
            dateStr={selectedDate}
            record={selectedDayRecord}
            onClose={() => {
              setSelectedDate(null);
              setSelectedDayRecord(null);
            }}
            onOpenRegularizeModal={() => setShowRegularizeModal(true)}
            onOpenLeaveModal={() => setShowLeaveModal(true)}
          />
        </div>

        {/* RIGHT COLUMN: Monthly Stats & Leave Balances (5 Columns) */}
        <div className="space-y-6 lg:col-span-5">
          <MonthlyAttendanceStats stats={stats} />

          <LeaveBalancesCard
            quota={quota}
            onOpenLeaveModal={() => setShowLeaveModal(true)}
            onOpenRegularizeModal={() => setShowRegularizeModal(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <ApplyLeaveModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onSubmit={handleApplyLeave}
      />

      <RegularizePunchModal
        isOpen={showRegularizeModal}
        onClose={() => setShowRegularizeModal(false)}
        onSubmit={handleRegularize}
      />
    </div>
  );
}
