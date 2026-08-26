'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Flame,
  Zap,
  Snowflake,
  MapPin,
  FileText,
  Loader2,
  RefreshCw,
  Award,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmployeeLeadsTable } from './EmployeeLeadsTable';

interface EmployeePerformanceModalProps {
  employee: {
    id: string;
    full_name: string;
    email: string;
    phone?: string | null;
    created_at: string;
    notes?: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

export function EmployeePerformanceModal({
  employee,
  isOpen,
  onClose,
  token,
}: EmployeePerformanceModalProps) {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'kpi' | 'leads'>('kpi');

  const fetchPerformance = useCallback(async () => {
    if (!employee?.id) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [perfRes, leadsRes] = await Promise.all([
        fetch(`/api/admin/employees/${employee.id}/performance`, { headers }),
        fetch(`/api/admin/employees/${employee.id}/leads`, { headers }),
      ]);

      if (perfRes.ok) {
        const perfJson = await perfRes.json();
        setPerformanceData(perfJson);
      }
      if (leadsRes.ok) {
        const leadsJson = await leadsRes.json();
        setLeads(leadsJson.leads || []);
      }
    } catch {
      toast.error('Failed to load performance metrics');
    } finally {
      setLoading(false);
    }
  }, [employee?.id, token]);

  useEffect(() => {
    if (isOpen && employee?.id) {
      fetchPerformance();
    }
  }, [isOpen, employee?.id, fetchPerformance]);

  if (!isOpen || !employee) return null;

  const attendance = performanceData?.attendance;
  const leadStats = performanceData?.leads;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900"
        >
          {/* Header */}
          <div className="border-b border-gray-100 bg-gray-50/70 p-6 dark:border-white/5 dark:bg-white/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Employee Info */}
              <div className="flex items-center gap-4">
                <div className="to-brand-gold/10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 font-serif text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {employee.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-serif text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                      {employee.full_name}
                    </h2>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 uppercase dark:text-emerald-400">
                      Active Employee
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {employee.email}
                    </span>
                    {employee.phone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="h-3.5 w-3.5" /> {employee.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Joined{' '}
                      {new Date(employee.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions & Tab Switcher */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={fetchPerformance}
                  className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
                  title="Refresh metrics"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-6 flex gap-2 border-t border-gray-200/60 pt-4 dark:border-white/5">
              <button
                onClick={() => setActiveTab('kpi')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase transition-all ${
                  activeTab === 'kpi'
                    ? 'border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <TrendingUp className="h-4 w-4" /> KPI Performance Overview
              </button>
              <button
                onClick={() => setActiveTab('leads')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase transition-all ${
                  activeTab === 'leads'
                    ? 'border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4" /> Assigned & Created Leads ({leads.length})
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <p className="text-xs text-gray-500">Calculating personal performance stats...</p>
              </div>
            ) : activeTab === 'kpi' ? (
              <div className="space-y-6">
                {/* Highlights Row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {/* Lead Conversion */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-white/5 dark:bg-white/5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                      Lead Conversion Rate
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {leadStats?.conversion_rate || 0}%
                      </span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        {leadStats?.won || 0} won / {leadStats?.total || 0} total
                      </span>
                    </div>
                  </div>

                  {/* Punctuality Rate */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-white/5 dark:bg-white/5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                      Punctuality Score
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {attendance?.punctuality_rate || 100}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {attendance?.late_days || 0} late shifts
                      </span>
                    </div>
                  </div>

                  {/* Shift Hours */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-white/5 dark:bg-white/5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                      Total Hours Worked
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {attendance?.total_hours || 0} hrs
                      </span>
                      <span className="text-xs text-gray-500">
                        Avg {attendance?.avg_daily_hours || 0}h / day
                      </span>
                    </div>
                  </div>

                  {/* Follow-ups Due */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-white/5 dark:bg-white/5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                      Overdue Follow-ups
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span
                        className={`text-2xl font-bold ${
                          leadStats?.overdue_followups > 0
                            ? 'text-red-500'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {leadStats?.overdue_followups || 0}
                      </span>
                      <span className="text-xs text-gray-500">
                        {leadStats?.today_followups || 0} due today
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Sections: Leads Funnel & Attendance Breakdown */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Leads Funnel Card */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-gray-900">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                        <Users className="h-4 w-4 text-amber-500" /> Leads Funnel & Distribution
                      </h3>
                      <button
                        onClick={() => setActiveTab('leads')}
                        className="text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400"
                      >
                        View All ({leads.length}) &rarr;
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Priority Bar */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
                          <span>Priority Breakdown</span>
                          <span>
                            🔥 {leadStats?.hot || 0} Hot | ⚡ {leadStats?.warm || 0} Warm | ❄️{' '}
                            {leadStats?.cold || 0} Cold
                          </span>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                          {leadStats?.total > 0 && (
                            <>
                              <div
                                style={{
                                  width: `${((leadStats?.hot || 0) / leadStats.total) * 100}%`,
                                }}
                                className="bg-red-500"
                              />
                              <div
                                style={{
                                  width: `${((leadStats?.warm || 0) / leadStats.total) * 100}%`,
                                }}
                                className="bg-amber-500"
                              />
                              <div
                                style={{
                                  width: `${((leadStats?.cold || 0) / leadStats.total) * 100}%`,
                                }}
                                className="bg-blue-500"
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Stage grid */}
                      <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                        <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-white/5">
                          <span className="text-[10px] text-gray-500 uppercase">New Leads</span>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {leadStats?.new || 0}
                          </p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-white/5">
                          <span className="text-[10px] text-gray-500 uppercase">Contacted</span>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {leadStats?.contacted || 0}
                          </p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-white/5">
                          <span className="text-[10px] text-gray-500 uppercase">Site Visits</span>
                          <p className="font-bold text-purple-600 dark:text-purple-400">
                            {leadStats?.visit_scheduled || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance & Shift Card */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-gray-900">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                      <Clock className="h-4 w-4 text-emerald-500" /> Attendance & Punctuality
                    </h3>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-700 dark:text-emerald-300">
                        <span className="text-[10px] font-bold uppercase">Present Days</span>
                        <p className="text-lg font-bold">{attendance?.present_days || 0}</p>
                      </div>
                      <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-700 dark:text-amber-300">
                        <span className="text-[10px] font-bold uppercase">Half Days</span>
                        <p className="text-lg font-bold">{attendance?.half_days || 0}</p>
                      </div>
                      <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-700 dark:text-blue-300">
                        <span className="text-[10px] font-bold uppercase">Approved Leaves</span>
                        <p className="text-lg font-bold">{attendance?.leave_days || 0}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-xs dark:border-white/5">
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                        <span>Geofence Compliance:</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {attendance?.geofence_compliance_rate || 100}%
                        </span>
                      </div>
                      {attendance?.today && (
                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                          <span>Today's Shift:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {attendance.today.status === 'present'
                              ? `Punched In (${attendance.today.total_hours || 'Active'} hrs)`
                              : attendance.today.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Leads Table View */
              <EmployeeLeadsTable leads={leads} loading={loading} token={token} />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
