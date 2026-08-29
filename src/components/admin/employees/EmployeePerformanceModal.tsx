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
  Briefcase,
  PhoneCall,
  MessageSquare,
  Copy,
  ChevronRight,
  ShieldCheck,
  Building2,
  Check,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmployeeLeadsTable, LeadItem } from './EmployeeLeadsTable';

interface EmployeePerformanceModalProps {
  employee: {
    id: string;
    full_name: string;
    email: string;
    real_email?: string | null;
    phone?: string | null;
    department?: string | null;
    created_at: string;
    notes?: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

interface PerformanceData {
  profile?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string | null;
    department?: string | null;
    notes?: string | null;
    created_at: string;
    role?: string | null;
  };
  attendance: {
    total_days: number;
    present_days: number;
    half_days: number;
    leave_days: number;
    absent_days: number;
    late_days: number;
    punctuality_rate: number;
    geofence_compliance_rate: number;
    total_hours: number;
    avg_daily_hours: number;
    today: {
      status: string;
      punch_in?: string | null;
      punch_out?: string | null;
      is_late?: boolean;
      total_hours?: number | string | null;
    } | null;
  };
  leads: {
    total: number;
    won: number;
    conversion_rate: number;
    hot: number;
    warm: number;
    cold: number;
    new: number;
    contacted: number;
    qualified: number;
    visit_scheduled: number;
    lost: number;
    overdue_followups: number;
    today_followups: number;
  };
  activity: {
    total_calls_logged: number;
    recent_activities_count: number;
  };
}

export function EmployeePerformanceModal({
  employee,
  isOpen,
  onClose,
  token,
}: EmployeePerformanceModalProps) {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [activeTab, setActiveTab] = useState<'kpi' | 'leads'>('kpi');
  const [selectedLeadTemperature, setSelectedLeadTemperature] = useState<
    'all' | 'hot' | 'warm' | 'cold'
  >('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFilterByTemperature = (temp: 'hot' | 'warm' | 'cold') => {
    setSelectedLeadTemperature(temp);
    setActiveTab('leads');
  };

  if (!isOpen || !employee) return null;

  const attendance = performanceData?.attendance;
  const leadStats = performanceData?.leads;
  const department =
    performanceData?.profile?.department || employee.department || 'Sales & Operations';

  const cleanPhone = employee.phone ? employee.phone.replace(/\D/g, '') : '';
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`
    : null;

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
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#12121c]"
        >
          {/* Top Gold Accent Line */}
          <div className="via-brand-gold absolute top-0 right-0 left-0 z-20 h-1 bg-gradient-to-r from-transparent to-transparent opacity-60" />

          {/* Executive Header */}
          <div className="shrink-0 border-b border-gray-100 bg-gray-50/80 p-5 sm:p-6 dark:border-white/5 dark:bg-[#161624]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Employee Identity */}
              <div className="flex items-center gap-4">
                {/* Avatar with gold ring & online status indicator */}
                <div className="relative shrink-0">
                  <div className="via-brand-gold/15 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 p-0.5 shadow-md">
                    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white font-serif text-2xl font-bold text-amber-700 shadow-inner dark:bg-[#181828] dark:text-amber-400">
                      {employee.full_name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span
                    className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-xs dark:border-[#12121c]"
                    title="Active Employee"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                      {employee.full_name}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase dark:bg-emerald-500/15 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active Staff
                    </span>
                    <span className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold">
                      <Briefcase size={11} />
                      {department}
                    </span>
                  </div>

                  {/* Contact Chips */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1 rounded-lg bg-gray-100/80 px-2 py-0.5 font-sans dark:bg-white/5">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span>{employee.email}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(employee.email, 'Email')}
                        className="ml-0.5 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-white"
                        title="Copy email"
                      >
                        {copiedField === 'Email' ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    {employee.phone && (
                      <div className="flex items-center gap-1 rounded-lg bg-gray-100/80 px-2 py-0.5 font-mono dark:bg-white/5">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{employee.phone}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(employee.phone || '', 'Phone')}
                          className="ml-0.5 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-white"
                          title="Copy phone"
                        >
                          {copiedField === 'Phone' ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    )}

                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="h-3 w-3 text-gray-400" /> Joined{' '}
                      {new Date(employee.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Quick Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {employee.phone && (
                  <a
                    href={`tel:${employee.phone}`}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-xs transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
                    title={`Call ${employee.full_name}`}
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Call</span>
                  </a>
                )}
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-emerald-600 shadow-xs transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-emerald-400 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10"
                    title={`WhatsApp ${employee.full_name}`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={fetchPerformance}
                  disabled={loading}
                  className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 shadow-xs transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                  title="Refresh live metrics"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? 'animate-spin text-amber-500' : ''}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 shadow-xs transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                  title="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Segmented Glass Tab Switcher */}
            <div className="mt-5 flex gap-2 border-t border-gray-200/70 pt-3 dark:border-white/5">
              <div className="flex items-center gap-1.5 rounded-2xl border border-gray-200/80 bg-gray-100/70 p-1 backdrop-blur-md dark:border-white/10 dark:bg-[#11111a]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('kpi');
                    setSelectedLeadTemperature('all');
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase transition-all ${
                    activeTab === 'kpi'
                      ? 'border-brand-gold/40 bg-white text-amber-600 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-amber-400'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>KPI Performance Overview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('leads')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase transition-all ${
                    activeTab === 'leads'
                      ? 'border-brand-gold/40 bg-white text-amber-600 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-amber-400'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Assigned Leads</span>
                  <span className="py-0.2 rounded-full bg-amber-500/15 px-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    {leads.length}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="scrollbar-gold flex-1 overflow-y-auto p-5 sm:p-6">
            {loading ? (
              /* Shimmering Skeleton Loader instead of blank spinner */
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse space-y-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-white/5 dark:bg-white/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
                        <div className="h-7 w-7 rounded-xl bg-gray-200 dark:bg-white/10" />
                      </div>
                      <div className="h-7 w-24 rounded-lg bg-gray-200 dark:bg-white/10" />
                      <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-white/10" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="animate-pulse space-y-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-5 dark:border-white/5 dark:bg-white/5">
                    <div className="h-4 w-40 rounded-md bg-gray-200 dark:bg-white/10" />
                    <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-white/10" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 rounded-xl bg-gray-200 dark:bg-white/10" />
                      <div className="h-16 rounded-xl bg-gray-200 dark:bg-white/10" />
                      <div className="h-16 rounded-xl bg-gray-200 dark:bg-white/10" />
                    </div>
                  </div>
                  <div className="animate-pulse space-y-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-5 dark:border-white/5 dark:bg-white/5">
                    <div className="h-4 w-40 rounded-md bg-gray-200 dark:bg-white/10" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 rounded-xl bg-gray-200 dark:bg-white/10" />
                      <div className="h-16 rounded-xl bg-gray-200 dark:bg-white/10" />
                      <div className="h-16 rounded-xl bg-gray-200 dark:bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'kpi' ? (
              <div className="space-y-6">
                {/* 4 Bento KPI Highlight Cards */}
                <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                  {/* Card 1: Lead Conversion */}
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/70 p-4 shadow-xs transition-all hover:shadow-md dark:border-white/10 dark:from-[#161624] dark:to-[#12121e]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                        Lead Conversion Rate
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Award className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                        {leadStats?.conversion_rate || 0}%
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {leadStats?.won || 0} won
                      </span>
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                      <div
                        style={{ width: `${Math.min(leadStats?.conversion_rate || 0, 100)}%` }}
                        className="bg-gradient-to-r from-amber-500 to-emerald-500"
                      />
                    </div>
                    <p className="mt-2 text-[10px] text-gray-400">
                      Out of {leadStats?.total || 0} total assigned leads
                    </p>
                  </div>

                  {/* Card 2: Punctuality Score */}
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/70 p-4 shadow-xs transition-all hover:shadow-md dark:border-white/10 dark:from-[#161624] dark:to-[#12121e]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                        Punctuality Score
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                        {attendance?.punctuality_rate || 100}%
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          (attendance?.late_days || 0) > 0 ? 'text-amber-500' : 'text-emerald-500'
                        }`}
                      >
                        {attendance?.late_days || 0} late
                      </span>
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                      <div
                        style={{ width: `${Math.min(attendance?.punctuality_rate || 100, 100)}%` }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-400"
                      />
                    </div>
                    <p className="mt-2 text-[10px] text-gray-400">
                      Geofence rate: {attendance?.geofence_compliance_rate || 100}%
                    </p>
                  </div>

                  {/* Card 3: Shift Hours */}
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/70 p-4 shadow-xs transition-all hover:shadow-md dark:border-white/10 dark:from-[#161624] dark:to-[#12121e]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                        Total Hours Worked
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                        {attendance?.total_hours || 0}
                      </span>
                      <span className="text-xs text-gray-500">hrs</span>
                    </div>
                    {/* Sub details badge */}
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-100/70 px-2 py-1 text-[10px] font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-400">
                      <span>Daily Average:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {attendance?.avg_daily_hours || 0}h / day
                      </span>
                    </div>
                  </div>

                  {/* Card 4: Overdue Follow-ups */}
                  <div
                    className={`relative overflow-hidden rounded-2xl border p-4 shadow-xs transition-all hover:shadow-md ${
                      (leadStats?.overdue_followups || 0) > 0
                        ? 'border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/10 dark:from-red-950/20 dark:to-[#161624]'
                        : 'border-gray-200/80 bg-gradient-to-br from-white to-gray-50/70 dark:border-white/10 dark:from-[#161624] dark:to-[#12121e]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                        Overdue Follow-ups
                      </span>
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-xl ${
                          (leadStats?.overdue_followups || 0) > 0
                            ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span
                        className={`font-serif text-2xl font-bold sm:text-3xl ${
                          (leadStats?.overdue_followups || 0) > 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {leadStats?.overdue_followups || 0}
                      </span>
                      {(leadStats?.overdue_followups || 0) > 0 ? (
                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[9px] font-bold text-red-600 dark:text-red-400">
                          Needs Attention
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                          All Caught Up
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-100/70 px-2 py-1 text-[10px] font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-400">
                      <span>Due Today:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {leadStats?.today_followups || 0} scheduled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Sections: Leads Funnel & Attendance Breakdown */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Card 1: Leads Funnel & Priority Breakdown */}
                  <div className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#161624]">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                        <Users className="text-brand-gold h-4 w-4" /> Leads Funnel & Distribution
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLeadTemperature('all');
                          setActiveTab('leads');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline dark:text-amber-400"
                      >
                        <span>View Table ({leads.length})</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Priority Buttons / Badges (Interactive) */}
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Priority Filter (Click to inspect):</span>
                          <span className="font-mono text-[11px]">
                            Total: {leadStats?.total || 0}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleFilterByTemperature('hot')}
                            className="group flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-2.5 transition-all hover:border-red-500/40 hover:bg-red-500/10 active:scale-95"
                          >
                            <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                              <Flame className="h-3.5 w-3.5" /> Hot Leads
                            </span>
                            <span className="mt-1 font-serif text-lg font-bold text-gray-900 group-hover:text-red-600 dark:text-white">
                              {leadStats?.hot || 0}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFilterByTemperature('warm')}
                            className="group flex flex-col items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/5 p-2.5 transition-all hover:border-amber-500/40 hover:bg-amber-500/10 active:scale-95"
                          >
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <Zap className="h-3.5 w-3.5" /> Warm Leads
                            </span>
                            <span className="mt-1 font-serif text-lg font-bold text-gray-900 group-hover:text-amber-600 dark:text-white">
                              {leadStats?.warm || 0}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFilterByTemperature('cold')}
                            className="group flex flex-col items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/5 p-2.5 transition-all hover:border-blue-500/40 hover:bg-blue-500/10 active:scale-95"
                          >
                            <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                              <Snowflake className="h-3.5 w-3.5" /> Cold Leads
                            </span>
                            <span className="mt-1 font-serif text-lg font-bold text-gray-900 group-hover:text-blue-600 dark:text-white">
                              {leadStats?.cold || 0}
                            </span>
                          </button>
                        </div>

                        {/* Visual Ratio Bar */}
                        {(leadStats?.total || 0) > 0 && (
                          <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                            <div
                              style={{
                                width: `${((leadStats?.hot || 0) / (leadStats?.total || 1)) * 100}%`,
                              }}
                              className="bg-red-500 transition-all duration-500"
                              title={`Hot: ${leadStats?.hot || 0}`}
                            />
                            <div
                              style={{
                                width: `${((leadStats?.warm || 0) / (leadStats?.total || 1)) * 100}%`,
                              }}
                              className="bg-amber-500 transition-all duration-500"
                              title={`Warm: ${leadStats?.warm || 0}`}
                            />
                            <div
                              style={{
                                width: `${((leadStats?.cold || 0) / (leadStats?.total || 1)) * 100}%`,
                              }}
                              className="bg-blue-500 transition-all duration-500"
                              title={`Cold: ${leadStats?.cold || 0}`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Stage Progression Grid */}
                      <div className="border-t border-gray-100 pt-3 dark:border-white/5">
                        <span className="mb-2 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                          Pipeline Stage Distribution
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="rounded-xl bg-gray-50/80 p-2.5 dark:bg-white/5">
                            <span className="text-[10px] text-gray-500 uppercase">New</span>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {leadStats?.new || 0}
                            </p>
                          </div>
                          <div className="rounded-xl bg-gray-50/80 p-2.5 dark:bg-white/5">
                            <span className="text-[10px] text-gray-500 uppercase">Contacted</span>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {leadStats?.contacted || 0}
                            </p>
                          </div>
                          <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-700 dark:text-purple-300">
                            <span className="text-[10px] font-bold uppercase">Site Visits</span>
                            <p className="font-bold">{leadStats?.visit_scheduled || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Attendance & Shift Health Card */}
                  <div className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#161624]">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                        <Clock className="h-4 w-4 text-emerald-500" /> Attendance & Shift Health
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {attendance?.total_days || 0} Total Records
                      </span>
                    </div>

                    {/* Today's Live Status Banner */}
                    <div
                      className={`mb-4 flex items-center justify-between rounded-2xl border p-3 ${
                        attendance?.today?.status === 'present'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/20 dark:text-emerald-300'
                          : 'border-gray-200 bg-gray-50 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            attendance?.today?.status === 'present'
                              ? 'animate-pulse bg-emerald-500'
                              : 'bg-gray-400'
                          }`}
                        />
                        <div>
                          <p className="text-xs font-bold">
                            {attendance?.today?.status === 'present'
                              ? "Today's Shift: Punched In"
                              : "Today's Shift: Not Punched In"}
                          </p>
                          {attendance?.today?.punch_in && (
                            <p className="font-mono text-[10px] opacity-80">
                              Punch In: {attendance.today.punch_in}
                            </p>
                          )}
                        </div>
                      </div>
                      {attendance?.today?.total_hours && (
                        <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          {attendance.today.total_hours} hrs
                        </span>
                      )}
                    </div>

                    {/* Attendance Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-700 dark:text-emerald-300">
                        <span className="text-[10px] font-bold uppercase">Present</span>
                        <p className="text-base font-bold">{attendance?.present_days || 0}</p>
                      </div>
                      <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-700 dark:text-amber-300">
                        <span className="text-[10px] font-bold uppercase">Half Day</span>
                        <p className="text-base font-bold">{attendance?.half_days || 0}</p>
                      </div>
                      <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-700 dark:text-blue-300">
                        <span className="text-[10px] font-bold uppercase">Leaves</span>
                        <p className="text-base font-bold">{attendance?.leave_days || 0}</p>
                      </div>
                      <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-700 dark:text-rose-300">
                        <span className="text-[10px] font-bold uppercase">Absent</span>
                        <p className="text-base font-bold">{attendance?.absent_days || 0}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-xs dark:border-white/5">
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                          Geofence Verification:
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {attendance?.geofence_compliance_rate || 100}% compliance
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Leads Table View */
              <EmployeeLeadsTable
                leads={leads}
                loading={loading}
                token={token}
                initialTemperature={selectedLeadTemperature}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
