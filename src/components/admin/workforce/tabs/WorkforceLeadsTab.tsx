'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Phone,
  Mail,
  Calendar,
  Clock,
  Flame,
  Zap,
  Snowflake,
  Filter,
  PhoneCall,
  MessageSquare,
  ExternalLink,
  UserCheck,
  UserPlus,
  RefreshCw,
  Trash2,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Edit3,
  Bot,
  MapPin,
  CalendarCheck,
  Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import { DeleteConfirm } from '@/src/components/admin/modals/DeleteConfirm';

export interface WorkforceLeadItem {
  id: string;
  name: string;
  phone: string;
  normalized_phone?: string | null;
  email?: string | null;
  source: string;
  project_interest?: string | null;
  preferred_date?: string | null;
  lifecycle_status: string;
  qualification_status?: string | null;
  temperature?: 'hot' | 'warm' | 'cold' | null;
  score?: number | null;
  notes?: string | null;
  summary?: string | null;
  follow_up_at?: string | null;
  assigned_to?: string | null;
  created_at: string;
  updated_at?: string;
  profiles?: {
    id: string;
    full_name: string;
    email?: string | null;
    phone?: string | null;
  } | null;
  activities_count?: number;
  latest_activity?: {
    title: string;
    notes?: string | null;
    created_at: string;
  } | null;
}

interface WorkforceLeadsTabProps {
  token: string;
  employees: Employee[];
}

const LIFECYCLE_STATUS_OPTIONS = [
  { value: 'all', label: 'All Lifecycle Stages' },
  { value: 'captured', label: 'Captured (New)' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'visit_scheduled', label: 'Visit Scheduled' },
  { value: 'visited', label: 'Visited' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won / Converted' },
  { value: 'lost', label: 'Lost / Closed' },
];

export function WorkforceLeadsTab({ token, employees }: WorkforceLeadsTabProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [leads, setLeads] = useState<WorkforceLeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [counts, setCounts] = useState({
    total: 0,
    unassigned: 0,
    hot: 0,
    chatbot: 0,
    site_visits: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [temperatureFilter, setTemperatureFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');

  // Debounce keystrokes by 300ms to avoid firing Supabase query on each letter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Modals state
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<WorkforceLeadItem | null>(
    null
  );
  const [selectedLeadForReassign, setSelectedLeadForReassign] = useState<WorkforceLeadItem | null>(
    null
  );
  const [selectedTargetEmployee, setSelectedTargetEmployee] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassigning, setReassigning] = useState(false);

  // Edit Lead Modal state
  const [editingLead, setEditingLead] = useState<WorkforceLeadItem | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editTemperature, setEditTemperature] = useState<'hot' | 'warm' | 'cold' | ''>('');
  const [editNotes, setEditNotes] = useState('');
  const [editFollowUp, setEditFollowUp] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Lead Modal state
  const [leadToDelete, setLeadToDelete] = useState<WorkforceLeadItem | null>(null);
  const [deletingLead, setDeletingLead] = useState(false);

  // Timeline activities in detail modal
  const [timelineActivities, setTimelineActivities] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // 45-second in-memory client cache for instant 0ms tab switching
  const leadsCacheRef = useRef<
    Map<
      string,
      {
        leads: WorkforceLeadItem[];
        total: number;
        hasMore: boolean;
        counts: any;
        timestamp: number;
      }
    >
  >(new Map());

  // Fetch leads from /api/admin/leads
  const fetchLeads = useCallback(
    async (force = false) => {
      const cacheKey = `${page}_${debouncedSearch.trim()}_${sourceFilter}_${statusFilter}_${temperatureFilter}_${assignedFilter}`;
      const cached = leadsCacheRef.current.get(cacheKey);
      const now = Date.now();

      if (!force && cached && now - cached.timestamp < 45_000) {
        setLeads(cached.leads);
        setTotal(cached.total);
        setHasMore(cached.hasMore);
        if (cached.counts) setCounts(cached.counts);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          limit: '25',
        });
        if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
        if (sourceFilter !== 'all') params.set('source', sourceFilter);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (temperatureFilter !== 'all') params.set('temperature', temperatureFilter);
        if (assignedFilter !== 'all') params.set('assigned_to', assignedFilter);

        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/admin/leads?${params.toString()}`, { headers });
        const data = await res.json();

        if (res.ok) {
          const fetchedLeads = data.leads || [];
          const fetchedTotal = data.total || 0;
          const fetchedHasMore = data.hasMore || false;
          const fetchedCounts = data.counts || null;

          setLeads(fetchedLeads);
          setTotal(fetchedTotal);
          setHasMore(fetchedHasMore);
          if (fetchedCounts) setCounts(fetchedCounts);

          leadsCacheRef.current.set(cacheKey, {
            leads: fetchedLeads,
            total: fetchedTotal,
            hasMore: fetchedHasMore,
            counts: fetchedCounts,
            timestamp: now,
          });
        } else {
          toast.error(data.error || 'Failed to fetch chat leads');
        }
      } catch {
        toast.error('Network error loading leads');
      } finally {
        setLoading(false);
      }
    },
    [token, page, debouncedSearch, sourceFilter, statusFilter, temperatureFilter, assignedFilter]
  );

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Load timeline for detail view
  useEffect(() => {
    if (selectedLeadForDetail) {
      setLoadingTimeline(true);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch(`/api/employee/work/leads/${selectedLeadForDetail.id}/activities`, { headers })
        .then((res) => res.json())
        .then((data) => {
          setTimelineActivities(data.activities || []);
        })
        .catch(() => {})
        .finally(() => setLoadingTimeline(false));
    } else {
      setTimelineActivities([]);
    }
  }, [selectedLeadForDetail, token]);

  // Handle Reassign
  const handleExecuteReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForReassign) return;

    try {
      setReassigning(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          id: selectedLeadForReassign.id,
          assigned_to: selectedTargetEmployee || null,
          reason: reassignReason || 'Reassigned by Admin in Workforce Console',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Lead assigned successfully');
        setSelectedLeadForReassign(null);
        leadsCacheRef.current.clear();
        fetchLeads(true);
      } else {
        toast.error(data.error || 'Failed to assign lead');
      }
    } catch {
      toast.error('Failed to assign lead');
    } finally {
      setReassigning(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (lead: WorkforceLeadItem) => {
    setEditingLead(lead);
    setEditStatus(lead.lifecycle_status || 'captured');
    setEditTemperature(lead.temperature || '');
    setEditNotes(lead.notes || '');
    setEditFollowUp(lead.follow_up_at ? lead.follow_up_at.substring(0, 16) : '');
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      setSavingEdit(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          id: editingLead.id,
          lifecycle_status: editStatus,
          temperature: editTemperature || null,
          notes: editNotes,
          follow_up_at: editFollowUp ? new Date(editFollowUp).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Lead updated successfully');
        setEditingLead(null);
        leadsCacheRef.current.clear();
        fetchLeads(true);
      } else {
        toast.error(data.error || 'Failed to update lead');
      }
    } catch {
      toast.error('Failed to update lead');
    } finally {
      setSavingEdit(false);
    }
  };

  // Confirm delete lead
  const handleConfirmDeleteLead = async () => {
    if (!leadToDelete) return;

    try {
      setDeletingLead(true);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/leads?id=${leadToDelete.id}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Lead deleted successfully');
        if (selectedLeadForDetail?.id === leadToDelete.id) setSelectedLeadForDetail(null);
        setLeadToDelete(null);
        leadsCacheRef.current.clear();
        fetchLeads(true);
      } else {
        toast.error(data.error || 'Failed to delete lead');
      }
    } catch {
      toast.error('Failed to delete lead');
    } finally {
      setDeletingLead(false);
    }
  };

  // Helper for clean WhatsApp link
  const getWhatsAppLink = (phone: string, name: string) => {
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${name}, thank you for contacting SVI Infra Solutions. How can we assist you today?`
    );
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Leads */}
        <div className="hover-lift-sm relative overflow-hidden rounded-xl border border-gray-200/80 bg-white/70 p-4 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-[#151520]/80">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Total Inquiries
            </span>
            <div className="bg-brand-gold/10 text-brand-gold rounded-lg p-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-brand-navy mt-2 font-serif text-2xl font-bold dark:text-white">
            {counts.total}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">All captured channels</p>
        </div>

        {/* Hot Leads */}
        <div className="hover-lift-sm relative overflow-hidden rounded-xl border border-red-200/50 bg-red-50/30 p-4 shadow-xs backdrop-blur-md dark:border-red-500/20 dark:bg-red-500/5">
          <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-red-600 uppercase dark:text-red-400">
              Hot Prospects 🔥
            </span>
            <div className="rounded-lg bg-red-500/10 p-1.5 text-red-500">
              <Flame className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 font-serif text-2xl font-bold text-red-600 dark:text-red-400">
            {counts.hot}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">High buying intent</p>
        </div>

        {/* Unassigned Leads */}
        <div className="hover-lift-sm relative overflow-hidden rounded-xl border border-amber-200/50 bg-amber-50/30 p-4 shadow-xs backdrop-blur-md dark:border-amber-500/20 dark:bg-amber-500/5">
          <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              Unassigned Leads
            </span>
            <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-500">
              <UserPlus className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 font-serif text-2xl font-bold text-amber-600 dark:text-amber-400">
            {counts.unassigned}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Awaiting staff ownership</p>
        </div>

        {/* Site Visits */}
        <div className="hover-lift-sm relative overflow-hidden rounded-xl border border-emerald-200/50 bg-emerald-50/30 p-4 shadow-xs backdrop-blur-md dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              Site Visits
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-500">
              <CalendarCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {counts.site_visits}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Tours booked</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200/80 bg-gray-50/60 p-3.5 lg:flex-row lg:items-center lg:justify-between dark:border-white/10 dark:bg-[#151520]/60">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search leads by name, phone, email, project..."
            className="focus:border-brand-gold dark:focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white py-2 pr-3 pl-9 text-xs text-gray-900 transition-all focus:outline-none dark:border-white/10 dark:bg-[#1a1a26] dark:text-white"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Temperature Toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-white/10 dark:bg-[#1a1a26]">
            <button
              type="button"
              onClick={() => {
                setTemperatureFilter('all');
                setPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                temperatureFilter === 'all'
                  ? 'bg-brand-gold/15 text-brand-gold shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setTemperatureFilter('hot');
                setPage(1);
              }}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                temperatureFilter === 'hot'
                  ? 'bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                  : 'text-gray-500 hover:text-red-500 dark:text-gray-400'
              }`}
            >
              <Flame className="h-3 w-3 text-red-500" /> Hot
            </button>
            <button
              type="button"
              onClick={() => {
                setTemperatureFilter('warm');
                setPage(1);
              }}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                temperatureFilter === 'warm'
                  ? 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                  : 'text-gray-500 hover:text-amber-500 dark:text-gray-400'
              }`}
            >
              <Zap className="h-3 w-3 text-amber-500" /> Warm
            </button>
            <button
              type="button"
              onClick={() => {
                setTemperatureFilter('cold');
                setPage(1);
              }}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                temperatureFilter === 'cold'
                  ? 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                  : 'text-gray-500 hover:text-blue-500 dark:text-gray-400'
              }`}
            >
              <Snowflake className="h-3 w-3 text-blue-500" /> Cold
            </button>
          </div>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none dark:border-white/10 dark:bg-[#1a1a26] dark:text-gray-200"
          >
            <option value="all">All Sources</option>
            <option value="chatbot">AI Chatbot</option>
            <option value="site_visit">Site Visit Form</option>
            <option value="whatsapp">WhatsApp Sales</option>
            <option value="manual">Manual Entry</option>
          </select>

          {/* Stage / Lifecycle Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none dark:border-white/10 dark:bg-[#1a1a26] dark:text-gray-200"
          >
            {LIFECYCLE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Assigned Staff Filter */}
          <select
            value={assignedFilter}
            onChange={(e) => {
              setAssignedFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none dark:border-white/10 dark:bg-[#1a1a26] dark:text-gray-200"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned Only</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchLeads()}
            disabled={loading}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-100 disabled:opacity-50 dark:border-white/10 dark:bg-[#1a1a26] dark:text-gray-300 dark:hover:bg-white/5"
            title="Refresh Leads"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-xs dark:border-white/10 dark:bg-[#151520]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200/80 bg-gray-50/80 text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/10 dark:bg-[#1a1a26]/80 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Lead Contact</th>
                <th className="px-4 py-3">Source &amp; Requirement</th>
                <th className="px-4 py-3">Temperature &amp; Stage</th>
                <th className="px-4 py-3">Assigned Staff</th>
                <th className="px-4 py-3">Follow-up / Timing</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading && leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <RefreshCw className="text-brand-gold mx-auto h-7 w-7 animate-spin" />
                    <p className="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Loading chat leads...
                    </p>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Bot className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
                    <p className="text-brand-navy mt-2 text-sm font-semibold dark:text-white">
                      No Chat Leads Found
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Try adjusting your search query or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isHot = lead.temperature === 'hot';
                  const isWarm = lead.temperature === 'warm';
                  const isCold = lead.temperature === 'cold';

                  return (
                    <tr
                      key={lead.id}
                      className="transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.02]"
                    >
                      {/* Lead Contact */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-brand-navy font-bold text-gray-900 dark:text-white">
                            {lead.name}
                          </span>
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <Phone className="h-3 w-3" />
                            <span>{lead.phone}</span>
                            <div className="ml-1 flex items-center gap-1.5">
                              <a
                                href={`tel:${lead.phone}`}
                                className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                                title="Call now"
                              >
                                <PhoneCall className="h-3 w-3" />
                              </a>
                              <a
                                href={getWhatsAppLink(lead.phone, lead.name)}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                          {lead.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                              <Mail className="h-3 w-3" />
                              <span className="max-w-[180px] truncate">{lead.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Source & Requirement */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                              lead.source === 'chatbot'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300'
                                : lead.source === 'site_visit'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                                  : lead.source === 'whatsapp'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
                            }`}
                          >
                            {lead.source === 'chatbot' && <Bot className="h-2.5 w-2.5" />}
                            {lead.source === 'site_visit' && (
                              <CalendarCheck className="h-2.5 w-2.5" />
                            )}
                            {lead.source === 'whatsapp' && <Send className="h-2.5 w-2.5" />}
                            {lead.source.replace('_', ' ')}
                          </span>

                          <div className="font-medium text-gray-800 dark:text-gray-200">
                            {lead.project_interest || 'General Property Inquiry'}
                          </div>
                          {lead.preferred_date && (
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                              <Calendar className="h-3 w-3" />
                              <span>Visit: {lead.preferred_date}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Temperature & Stage */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1.5">
                          {/* Temperature Badge */}
                          <div className="flex items-center gap-1.5">
                            {isHot && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-500/20 dark:text-red-400">
                                <Flame className="h-3 w-3" /> Hot
                              </span>
                            )}
                            {isWarm && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                <Zap className="h-3 w-3" /> Warm
                              </span>
                            )}
                            {isCold && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                <Snowflake className="h-3 w-3" /> Cold
                              </span>
                            )}
                            {lead.score !== null && lead.score !== undefined && (
                              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                {lead.score}/100
                              </span>
                            )}
                          </div>

                          {/* Stage Badge */}
                          <span className="text-[11px] font-semibold text-gray-700 capitalize dark:text-gray-300">
                            {lead.lifecycle_status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Staff */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {lead.profiles ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {lead.profiles.full_name}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {lead.profiles.email || lead.profiles.phone || 'Workforce Staff'}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                              <AlertCircle className="h-3 w-3" /> Unassigned
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLeadForReassign(lead);
                              setSelectedTargetEmployee(lead.assigned_to || '');
                              setReassignReason('');
                            }}
                            className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
                            title="Assign or change staff"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Follow-up / Timing */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          {lead.follow_up_at ? (
                            <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(lead.follow_up_at).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No follow-up set</span>
                          )}
                          <span className="text-[10px] text-gray-400">
                            Captured: {new Date(lead.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLeadForDetail(lead)}
                            className="btn-tactile flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-bold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-white/10 dark:bg-[#1c1c28] dark:text-gray-200 dark:hover:bg-white/5"
                            title="View full lead info & history"
                          >
                            <FileText className="text-brand-gold h-3 w-3" />
                            <span>Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(lead)}
                            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-[#1c1c28] dark:text-gray-300 dark:hover:bg-white/5"
                            title="Edit status & notes"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setLeadToDelete(lead)}
                            className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                            title="Delete lead"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-gray-200/80 bg-gray-50/50 px-4 py-3 text-xs text-gray-500 dark:border-white/10 dark:bg-[#1a1a26]/50 dark:text-gray-400">
          <span>
            Showing {leads.length} of {total} leads
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-white/10 dark:bg-[#1a1a26] dark:text-gray-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-gray-700 dark:text-gray-200">Page {page}</span>
            <button
              type="button"
              disabled={!hasMore || loading}
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-white/10 dark:bg-[#1a1a26] dark:text-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          PORTALED MODALS: Rendered on document.body for true viewport centering
      ─────────────────────────────────────────────────────────────────────────────── */}
      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            {/* ── MODAL 1: Lead Detail & History Modal ── */}
            <AnimatePresence>
              {selectedLeadForDetail && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedLeadForDetail(null)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#12121c]"
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-gray-200/80 p-5 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="bg-brand-gold/10 text-brand-gold rounded-xl p-2.5">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-brand-navy font-serif text-lg font-bold dark:text-white">
                            {selectedLeadForDetail.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Captured via {selectedLeadForDetail.source.replace('_', ' ')} •{' '}
                            {new Date(selectedLeadForDetail.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedLeadForDetail(null)}
                        className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Modal Content Scrollable */}
                    <div className="space-y-5 overflow-y-auto p-5 text-xs">
                      {/* Quick Contact & Communication Bar */}
                      <div className="border-brand-gold/20 bg-brand-gold/5 dark:border-brand-gold/20 dark:bg-brand-gold/10 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {selectedLeadForDetail.phone}
                          </div>
                          {selectedLeadForDetail.email && (
                            <div className="text-gray-500 dark:text-gray-400">
                              {selectedLeadForDetail.email}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${selectedLeadForDetail.phone}`}
                            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-blue-700"
                          >
                            <PhoneCall className="h-3.5 w-3.5" /> Call
                          </a>
                          <a
                            href={getWhatsAppLink(
                              selectedLeadForDetail.phone,
                              selectedLeadForDetail.name
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-emerald-700"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                          </a>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Requirement
                          </span>
                          <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                            {selectedLeadForDetail.project_interest || 'General Inquiry'}
                          </p>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Stage
                          </span>
                          <p className="mt-1 font-semibold text-gray-800 capitalize dark:text-gray-200">
                            {selectedLeadForDetail.lifecycle_status.replace('_', ' ')}
                          </p>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Temperature
                          </span>
                          <p className="mt-1 font-semibold text-gray-800 capitalize dark:text-gray-200">
                            {selectedLeadForDetail.temperature || 'Not marked'}
                          </p>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Preferred Date
                          </span>
                          <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                            {selectedLeadForDetail.preferred_date || 'None'}
                          </p>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Assigned To
                          </span>
                          <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                            {selectedLeadForDetail.profiles?.full_name || 'Unassigned'}
                          </p>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Follow-up At
                          </span>
                          <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                            {selectedLeadForDetail.follow_up_at
                              ? new Date(selectedLeadForDetail.follow_up_at).toLocaleString()
                              : 'None scheduled'}
                          </p>
                        </div>
                      </div>

                      {/* Notes / Context */}
                      {selectedLeadForDetail.notes && (
                        <div className="rounded-xl border border-gray-200/80 bg-gray-50 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Lead Notes
                          </span>
                          <p className="mt-1 text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                            {selectedLeadForDetail.notes}
                          </p>
                        </div>
                      )}

                      {/* Activity History Timeline */}
                      <div>
                        <h4 className="mb-3 font-serif text-sm font-bold text-gray-900 dark:text-white">
                          Activity &amp; Interactions Log
                        </h4>
                        {loadingTimeline ? (
                          <div className="py-6 text-center">
                            <RefreshCw className="text-brand-gold mx-auto h-5 w-5 animate-spin" />
                          </div>
                        ) : timelineActivities.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">
                            No previous activities logged yet.
                          </p>
                        ) : (
                          <div className="relative space-y-3 before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5 before:bg-gray-200 dark:before:bg-white/10">
                            {timelineActivities.map((act) => (
                              <div key={act.id} className="relative flex items-start gap-3 pl-2">
                                <div className="bg-brand-gold z-10 mt-1 h-3 w-3 rounded-full border-2 border-white dark:border-[#12121c]" />
                                <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50/80 p-2.5 dark:border-white/5 dark:bg-white/[0.02]">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                      {act.title}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(act.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  {act.employee_name && (
                                    <p className="text-[10px] text-gray-500">
                                      By {act.employee_name}
                                    </p>
                                  )}
                                  {act.notes && (
                                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                      {act.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-between border-t border-gray-200/80 p-4 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const lead = selectedLeadForDetail;
                            setSelectedLeadForDetail(null);
                            setLeadToDelete(lead);
                          }}
                          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            openEditModal(selectedLeadForDetail);
                            setSelectedLeadForDetail(null);
                          }}
                          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-[#1a1a26] dark:text-gray-200"
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Edit Details
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedLeadForDetail(null)}
                        className="cursor-pointer rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* ── MODAL 2: Assign / Reassign Staff Modal ── */}
            <AnimatePresence>
              {selectedLeadForReassign && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedLeadForReassign(null)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#12121c]"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/10">
                      <h3 className="text-brand-navy font-serif text-lg font-bold dark:text-white">
                        Assign Lead Ownership
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedLeadForReassign(null)}
                        className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleExecuteReassign} className="mt-4 space-y-4 text-xs">
                      <div>
                        <span className="font-semibold text-gray-500">Lead:</span>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {selectedLeadForReassign.name} ({selectedLeadForReassign.phone})
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-gray-700 uppercase dark:text-gray-300">
                          Select Workforce Staff Member
                        </label>
                        <select
                          value={selectedTargetEmployee}
                          onChange={(e) => setSelectedTargetEmployee(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#1a1a26] dark:text-white"
                        >
                          <option value="">-- Remove Assignment (Unassigned) --</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.full_name} ({emp.department || 'Sales'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-gray-700 uppercase dark:text-gray-300">
                          Assignment Note / Instructions
                        </label>
                        <textarea
                          rows={3}
                          value={reassignReason}
                          onChange={(e) => setReassignReason(e.target.value)}
                          placeholder="E.g., Assigned for immediate follow-up on 3BHK inquiry..."
                          className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#1a1a26] dark:text-white"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedLeadForReassign(null)}
                          className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={reassigning}
                          className="btn-tactile bg-brand-gold text-brand-navy hover:bg-brand-gold-light flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-md disabled:opacity-50"
                        >
                          {reassigning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                          Save Assignment
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* ── MODAL 3: Edit Status / Temperature / Notes Modal ── */}
            <AnimatePresence>
              {editingLead && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setEditingLead(null)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#12121c]"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/10">
                      <h3 className="text-brand-navy font-serif text-lg font-bold dark:text-white">
                        Update Lead Details
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingLead(null)}
                        className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-[11px] font-bold text-gray-700 uppercase dark:text-gray-300">
                            Lifecycle Stage
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#1a1a26] dark:text-white"
                          >
                            {LIFECYCLE_STATUS_OPTIONS.filter((o) => o.value !== 'all').map(
                              (opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-bold text-gray-700 uppercase dark:text-gray-300">
                            Temperature
                          </label>
                          <select
                            value={editTemperature}
                            onChange={(e) =>
                              setEditTemperature(e.target.value as 'hot' | 'warm' | 'cold' | '')
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#1a1a26] dark:text-white"
                          >
                            <option value="">-- None --</option>
                            <option value="hot">🔥 Hot</option>
                            <option value="warm">⚡ Warm</option>
                            <option value="cold">❄️ Cold</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-gray-700 uppercase dark:text-gray-300">
                          Scheduled Follow-up Date &amp; Time
                        </label>
                        <input
                          type="datetime-local"
                          value={editFollowUp}
                          onChange={(e) => setEditFollowUp(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#1a1a26] dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-gray-700 uppercase dark:text-gray-300">
                          Lead Notes &amp; Call Summary
                        </label>
                        <textarea
                          rows={4}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Enter latest discussion points, customer budget, preferences..."
                          className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#1a1a26] dark:text-white"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingLead(null)}
                          className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingEdit}
                          className="btn-tactile bg-brand-gold text-brand-navy hover:bg-brand-gold-light flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-md disabled:opacity-50"
                        >
                          {savingEdit ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>,
          document.body
        )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL 4: Delete Lead Confirmation Modal (UI Based)
      ─────────────────────────────────────────────────────────────────────────────── */}
      {leadToDelete && (
        <DeleteConfirm
          title="Delete Chat Lead?"
          itemName={leadToDelete.name}
          itemType="chat lead"
          description={`Are you sure you want to permanently delete the lead for "${leadToDelete.name}" (${leadToDelete.phone})? This action cannot be undone.`}
          confirmLabel="Delete Lead"
          loading={deletingLead}
          onConfirm={handleConfirmDeleteLead}
          onClose={() => setLeadToDelete(null)}
        />
      )}
    </div>
  );
}
