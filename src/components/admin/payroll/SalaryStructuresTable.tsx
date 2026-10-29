'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Building2,
  CreditCard,
  Edit2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  DollarSign,
  ChevronRight,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Copy,
  Check,
  ExternalLink,
  Sliders,
  Award,
  Target,
  FileText,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SalaryStructure } from '@/src/lib/payroll/types';
import { formatINR } from '@/src/lib/quotation/format';

function getInitials(name?: string | null): string {
  if (!name) return 'EM';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'EM';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return dateStr;
  }
}
interface SalaryStructuresTableProps {
  structures: SalaryStructure[];
  employees: Array<{ id: string; full_name: string; email: string; department?: string | null }>;
  loading: boolean;
  onEditStructure: (structure: SalaryStructure) => void;
  onAddNew: () => void;
}

export function SalaryStructuresTable({
  structures,
  employees,
  loading,
  onEditStructure,
  onAddNew,
}: SalaryStructuresTableProps) {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const targetEmployeeId = searchParams?.get('employeeId') || searchParams?.get('employee');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string | null | undefined, label: string, key: string) => {
    if (!text) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const structureMap = useMemo(() => {
    return new Map(structures.map((s) => [s.user_id, s]));
  }, [structures]);

  // Combined list: all employees with their structure (or null if missing)
  const combinedList = useMemo(() => {
    return employees.map((emp) => {
      const struct = structureMap.get(emp.id);
      return {
        employee: emp,
        structure: struct || null,
      };
    });
  }, [employees, structureMap]);
  useEffect(() => {
    if (targetEmployeeId && combinedList.some((item) => item.employee.id === targetEmployeeId)) {
      setExpandedRows((prev) => {
        const next = new Set(prev);
        next.add(targetEmployeeId);
        return next;
      });
      const timer = setTimeout(() => {
        const el = document.getElementById(`payroll-emp-${targetEmployeeId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [targetEmployeeId, combinedList]);

  // Filtered list
  const filteredList = useMemo(() => {
    return combinedList.filter((item) => {
      const q = search.trim().toLowerCase();
      const nameMatch =
        item.employee.full_name.toLowerCase().includes(q) ||
        item.employee.email.toLowerCase().includes(q);

      const designationMatch =
        item.structure?.offer_designation?.toLowerCase().includes(q) ?? false;
      const locationMatch =
        (item.structure?.offer_location?.toLowerCase().includes(q) ||
          item.structure?.offer_candidate_address?.toLowerCase().includes(q)) ??
        false;

      const matchesSearch = !q || nameMatch || designationMatch || locationMatch;

      const deptMatch =
        departmentFilter === 'all' ||
        (item.employee.department &&
          item.employee.department.toLowerCase() === departmentFilter.toLowerCase());

      return matchesSearch && deptMatch;
    });
  }, [combinedList, search, departmentFilter]);

  // Summary Metrics
  const totalLiability = structures.reduce((sum, s) => sum + (s.base_salary || 0), 0);
  const configuredCount = structures.length;
  const missingCount = Math.max(0, employees.length - configuredCount);

  // Departments for dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#111118]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Total Monthly Payroll Liability
            </span>
            <div className="bg-brand-gold/10 text-brand-gold flex h-9 w-9 items-center justify-center rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-serif text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {formatINR(totalLiability)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Fixed monthly gross commitments</p>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#111118]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Configured Staff
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-serif text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            {configuredCount} / {employees.length}
          </p>
          <p className="mt-1 text-xs text-gray-500">Salary structures active</p>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#111118]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Missing Setup
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-serif text-2xl font-black tracking-tight text-red-600 dark:text-red-400">
            {missingCount}
          </p>
          <p className="mt-1 text-xs text-gray-500">Needs salary configuration</p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee by name, email, designation, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
            />
          </div>

          {departments.length > 0 && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="focus:border-brand-gold rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="button"
          onClick={onAddNew}
          className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" /> Setup New Salary
        </button>
      </div>

      {/* Salary Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs dark:border-white/10 dark:bg-[#111118]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-4 py-3.5 text-right">Base Monthly (CTC)</th>
                <th className="px-4 py-3.5 text-center">Offer Target / Slab</th>
                <th className="px-4 py-3.5 text-right">Basic Pay</th>
                <th className="px-4 py-3.5 text-right">HRA</th>
                <th className="px-4 py-3.5 text-center">Bank Account</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                    Loading salary structures...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                    No employees matching your filter.
                  </td>
                </tr>
              ) : (
                filteredList.map(({ employee, structure }) => {
                  const isExpanded = expandedRows.has(employee.id);
                  return (
                    <React.Fragment key={employee.id}>
                      <tr
                        id={`payroll-emp-${employee.id}`}
                        className={`group transition-all duration-150 ${
                          isExpanded
                            ? 'from-brand-gold/[0.12] via-brand-gold/[0.04] border-l-brand-gold dark:from-brand-gold/[0.15] border-l-4 bg-gradient-to-r to-transparent dark:via-[#131726] dark:to-[#0f1220]'
                            : 'hover:bg-gray-50/70 dark:hover:bg-white/[0.03]'
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {/* Accordion Micro-Button */}
                            <button
                              type="button"
                              onClick={() => toggleExpand(employee.id)}
                              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
                                isExpanded
                                  ? 'border-brand-gold/60 bg-brand-gold/20 text-brand-gold shadow-xs'
                                  : 'hover:border-brand-gold/40 hover:bg-brand-gold/10 hover:text-brand-gold dark:hover:border-brand-gold/40 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold border-gray-200/80 bg-gray-50/80 text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
                              }`}
                              title={
                                isExpanded
                                  ? 'Collapse employee dossier'
                                  : 'Expand full employee dossier'
                              }
                              aria-label="Toggle details"
                            >
                              <ChevronRight
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  isExpanded
                                    ? 'text-brand-gold rotate-90'
                                    : 'group-hover:text-brand-gold text-gray-400'
                                }`}
                              />
                            </button>

                            {/* Initials Avatar */}
                            <div className="border-brand-gold/30 from-brand-gold/20 via-brand-gold/5 text-brand-gold flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br to-transparent text-xs font-bold tracking-wider shadow-2xs">
                              {getInitials(employee.full_name)}
                            </div>

                            {/* Name & Details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                                  {employee.full_name}
                                </span>
                                {structure?.offer_designation ? (
                                  <span className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold">
                                    <Briefcase className="h-2.5 w-2.5" />
                                    {structure.offer_designation}
                                  </span>
                                ) : employee.department ? (
                                  <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                                    {employee.department}
                                  </span>
                                ) : null}
                              </div>

                              <div className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                {employee.email}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-2.5 text-[10px] text-gray-500 dark:text-gray-400">
                                {(structure?.offer_appointment_date ||
                                  structure?.employee_created_at) && (
                                  <span className="inline-flex items-center gap-1">
                                    <Calendar className="text-brand-gold h-3 w-3" />
                                    <span>
                                      Joined:{' '}
                                      <strong className="font-semibold text-gray-700 dark:text-gray-300">
                                        {formatDate(
                                          structure.offer_appointment_date ||
                                            structure.employee_created_at
                                        )}
                                      </strong>
                                    </span>
                                  </span>
                                )}

                                {(structure?.offer_candidate_address ||
                                  structure?.offer_location) && (
                                  <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                    <MapPin className="h-3 w-3 flex-shrink-0 text-emerald-500" />
                                    <span
                                      className="max-w-[160px] truncate"
                                      title={
                                        structure.offer_candidate_address ||
                                        structure.offer_location ||
                                        ''
                                      }
                                    >
                                      {structure.offer_candidate_address ||
                                        structure.offer_location}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right">
                          {structure ? (
                            <div>
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                                  {formatINR(structure.base_salary)}
                                </span>
                                {structure.salary_type === 'in_hand' ? (
                                  <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 uppercase dark:text-emerald-400">
                                    In-Hand
                                  </span>
                                ) : (
                                  <span className="rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 uppercase dark:text-blue-400">
                                    CTC
                                  </span>
                                )}
                              </div>
                              <span className="block text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                / month
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Not configured</span>
                          )}
                        </td>

                        {/* Offer Target & Slab */}
                        <td className="px-4 py-4 text-center">
                          {structure?.monthly_target || structure?.offer_target ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                {structure.monthly_target ?? structure.offer_target}{' '}
                                {structure.target_unit || structure.offer_target_unit || 'Sq. Yd.'}
                              </span>
                              {structure.offer_slab && (
                                <span className="mt-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-300">
                                  Slab {structure.offer_slab}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-right">
                          {structure ? (
                            <span className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300">
                              {formatINR(structure.basic_pay)}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-right">
                          {structure ? (
                            <span className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300">
                              {formatINR(structure.hra)}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-center">
                          {structure?.account_number ? (
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                              <CreditCard className="h-3 w-3 text-emerald-500" />
                              <span>
                                {structure.bank_name || 'Bank'} (••
                                {structure.account_number.slice(-4)})
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                              Pending Info
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-center">
                          {structure ? (
                            structure.offer_document_id ? (
                              <a
                                href={`/admin/offer-letter-records?id=${structure.offer_document_id}&search=${encodeURIComponent(employee.full_name)}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-700 shadow-2xs transition-colors hover:bg-emerald-500/20 dark:text-emerald-300"
                                title={`Open Offer Letter for ${employee.full_name}`}
                              >
                                <Sparkles className="text-brand-gold h-3 w-3" /> Offer Synced
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" /> Configured
                              </span>
                            )
                          ) : (
                            <span className="text-brand-gold inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold">
                              <AlertCircle className="h-3 w-3" /> Setup Needed
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (structure) {
                                onEditStructure(structure);
                              } else {
                                onAddNew();
                              }
                            }}
                            className="hover:border-brand-gold/40 hover:bg-brand-gold/10 hover:text-brand-gold dark:hover:border-brand-gold/40 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition-all dark:border-white/10 dark:text-gray-300"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>{structure ? 'Edit Structure' : 'Setup Salary'}</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Luxury Employment & Offer Dossier */}
                      {isExpanded && (
                        <tr className="border-brand-gold/25 dark:border-brand-gold/20 border-t border-b bg-gray-50/90 dark:bg-[#080a12]">
                          <td colSpan={8} className="p-3 sm:p-5">
                            <div className="border-brand-gold/25 relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#121626] via-[#0d101d] to-[#090b14] p-5 shadow-2xl backdrop-blur-md sm:p-6">
                              {/* Luxury Ambient Glows */}
                              <div className="bg-brand-gold/10 pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl" />
                              <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

                              {/* 1. Header Hero Bar */}
                              <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3.5">
                                  <div className="border-brand-gold/40 from-brand-gold/30 via-brand-gold/10 text-brand-gold ring-brand-gold/10 flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br to-transparent shadow-lg ring-4">
                                    <UserCheck className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-serif text-lg font-bold tracking-tight text-white">
                                        {employee.full_name}
                                      </h4>
                                      {structure?.offer_designation && (
                                        <span className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                                          <Briefcase className="h-2.5 w-2.5" />
                                          {structure.offer_designation}
                                        </span>
                                      )}
                                      {structure?.offer_document_id && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                                          <Sparkles className="text-brand-gold h-3 w-3" /> Offer
                                          Letter Verified
                                        </span>
                                      )}
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                      Official Employment Dossier &bull; Auto-synchronized from
                                      Offer Letter &amp; HR Records
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5">
                                  {structure?.offer_document_id ? (
                                    <a
                                      href={`/admin/offer-letter-records?id=${structure.offer_document_id}&search=${encodeURIComponent(employee.full_name)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold hover:border-brand-gold/60 hover:bg-brand-gold/20 inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all"
                                      title={`View Offer Letter for ${employee.full_name}`}
                                    >
                                      <FileText className="text-brand-gold h-3.5 w-3.5" />
                                      <span>Offer Records</span>
                                      <ExternalLink className="h-3 w-3 opacity-60" />
                                    </a>
                                  ) : (
                                    <a
                                      href={`/admin/offer-letter-records?search=${encodeURIComponent(employee.full_name)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                                      title={`Search Offer Letter Records for ${employee.full_name}`}
                                    >
                                      <FileText className="text-brand-gold h-3.5 w-3.5" />
                                      <span>Offer Records</span>
                                      <ExternalLink className="h-3 w-3 opacity-60" />
                                    </a>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (structure) onEditStructure(structure);
                                      else onAddNew();
                                    }}
                                    className="border-brand-gold/50 from-brand-gold to-brand-gold text-brand-navy inline-flex items-center gap-1.5 rounded-xl border bg-gradient-to-r via-amber-400 px-4 py-2 text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                                  >
                                    <Sliders className="h-3.5 w-3.5" />
                                    <span>Edit Full Salary Structure</span>
                                  </button>
                                </div>
                              </div>

                              {/* 2. Compensation & Benchmark Anatomy Strip */}
                              <div className="border-brand-gold/20 from-brand-gold/[0.08] relative mt-5 rounded-xl border bg-gradient-to-r via-white/[0.02] to-transparent p-4">
                                <div className="text-brand-gold flex items-center justify-between text-xs font-bold tracking-wider uppercase">
                                  <span className="flex items-center gap-1.5">
                                    <Award className="h-3.5 w-3.5" /> Monthly Compensation &amp;
                                    Performance Benchmark
                                  </span>
                                  <span className="font-mono text-[11px] text-gray-400">
                                    Annual Gross CTC:{' '}
                                    {structure ? formatINR(structure.base_salary * 12) : '—'}
                                  </span>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                                  {/* CTC */}
                                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                                    <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                      Gross Monthly (CTC)
                                    </span>
                                    <div className="mt-1 font-mono text-lg font-black text-white">
                                      {structure ? formatINR(structure.base_salary) : '—'}
                                    </div>
                                    <span className="text-brand-gold text-[10px] font-medium">
                                      Fixed Monthly Commitment
                                    </span>
                                  </div>

                                  {/* Basic Pay */}
                                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                                    <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                      Basic Pay (50%)
                                    </span>
                                    <div className="mt-1 font-mono text-lg font-black text-gray-200">
                                      {structure ? formatINR(structure.basic_pay) : '—'}
                                    </div>
                                    <span className="text-[10px] text-gray-400">
                                      Taxable Wage Base
                                    </span>
                                  </div>

                                  {/* HRA */}
                                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                                    <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                      HRA (30%)
                                    </span>
                                    <div className="mt-1 font-mono text-lg font-black text-gray-200">
                                      {structure ? formatINR(structure.hra) : '—'}
                                    </div>
                                    <span className="text-[10px] text-gray-400">
                                      House Rent Allowance
                                    </span>
                                  </div>

                                  {/* Special Allowance */}
                                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                                    <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                      Special Allowance (20%)
                                    </span>
                                    <div className="mt-1 font-mono text-lg font-black text-gray-200">
                                      {structure ? formatINR(structure.special_allowance) : '—'}
                                    </div>
                                    <span className="text-[10px] text-gray-400">
                                      Flexible component
                                    </span>
                                  </div>

                                  {/* Benchmark Target */}
                                  <div className="col-span-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 sm:col-span-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                                        Monthly Target
                                      </span>
                                      <Target className="h-3.5 w-3.5 text-emerald-400" />
                                    </div>
                                    <div className="mt-1 font-mono text-lg font-black text-emerald-300">
                                      {structure?.monthly_target || structure?.offer_target
                                        ? `${structure.monthly_target ?? structure.offer_target} ${structure.target_unit || structure.offer_target_unit || 'Sq. Yd.'}`
                                        : 'Standard'}
                                    </div>
                                    <span className="text-[10px] font-semibold text-emerald-400/90">
                                      {structure?.offer_slab
                                        ? `Incentive Slab: ${structure.offer_slab}`
                                        : 'No Slab Assigned'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* 3. Deep Dossier Cards Grid (3 spacious, clean cards) */}
                              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                                {/* Card 1: Identity & Communications */}
                                <div className="rounded-xl border border-white/10 bg-[#141824] p-4 shadow-sm">
                                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                                      <Phone className="text-brand-gold h-4 w-4" />
                                      <span>Identity &amp; Communications</span>
                                    </div>
                                    <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-gray-400">
                                      ID &amp; KYC
                                    </span>
                                  </div>

                                  <div className="mt-3 space-y-2.5 text-xs">
                                    {/* Phone */}
                                    <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
                                      <div className="min-w-0 flex-1">
                                        <span className="block text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                          Official Mobile
                                        </span>
                                        {structure?.employee_phone ? (
                                          <a
                                            href={`tel:${structure.employee_phone}`}
                                            className="font-mono font-semibold text-emerald-400 hover:underline"
                                          >
                                            +91 {structure.employee_phone}
                                          </a>
                                        ) : (
                                          <span className="text-[11px] text-gray-400 italic">
                                            Not provided
                                          </span>
                                        )}
                                      </div>
                                      {structure?.employee_phone && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleCopy(
                                              structure.employee_phone,
                                              'Phone number',
                                              `${employee.id}-phone`
                                            )
                                          }
                                          className="hover:border-brand-gold hover:text-brand-gold flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-gray-300 transition-colors"
                                          title="Copy phone number"
                                        >
                                          {copiedKey === `${employee.id}-phone` ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                                          ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                          )}
                                        </button>
                                      )}
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
                                      <div className="min-w-0 flex-1 pr-2">
                                        <span className="block text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                          Corporate Email
                                        </span>
                                        <a
                                          href={`mailto:${employee.email}`}
                                          className="block truncate font-medium text-gray-200 hover:underline"
                                          title={employee.email}
                                        >
                                          {employee.email}
                                        </a>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopy(
                                            employee.email,
                                            'Email address',
                                            `${employee.id}-email`
                                          )
                                        }
                                        className="hover:border-brand-gold hover:text-brand-gold flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-gray-300 transition-colors"
                                        title="Copy email address"
                                      >
                                        {copiedKey === `${employee.id}-email` ? (
                                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                                        ) : (
                                          <Copy className="h-3.5 w-3.5" />
                                        )}
                                      </button>
                                    </div>

                                    {/* Employee ID */}
                                    <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
                                      <div className="min-w-0 flex-1">
                                        <span className="block text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                          System Employee UUID
                                        </span>
                                        <span className="font-mono text-[11px] text-gray-300">
                                          {employee.id}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopy(
                                            employee.id,
                                            'Employee ID',
                                            `${employee.id}-id`
                                          )
                                        }
                                        className="hover:border-brand-gold hover:text-brand-gold flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-gray-300 transition-colors"
                                        title="Copy full UUID"
                                      >
                                        {copiedKey === `${employee.id}-id` ? (
                                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                                        ) : (
                                          <Copy className="h-3.5 w-3.5" />
                                        )}
                                      </button>
                                    </div>

                                    {/* Residential Address */}
                                    <div className="rounded-lg bg-white/5 p-2.5">
                                      <span className="block text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                        Candidate Residential Address
                                      </span>
                                      <p className="mt-1 text-[11px] leading-relaxed text-gray-300">
                                        {structure?.offer_candidate_address ||
                                          'As registered in HR records'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Card 2: Role, Deployment & Hierarchy */}
                                <div className="rounded-xl border border-white/10 bg-[#141824] p-4 shadow-sm">
                                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                                      <Building2 className="text-brand-gold h-4 w-4" />
                                      <span>Role &amp; Office Deployment</span>
                                    </div>
                                    <span className="bg-brand-gold/10 text-brand-gold rounded px-1.5 py-0.5 text-[9px] font-bold">
                                      DEPLOYED
                                    </span>
                                  </div>

                                  <div className="mt-3 space-y-2.5 text-xs">
                                    {/* Designation */}
                                    <div className="rounded-lg bg-white/5 p-2.5">
                                      <span className="block text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                        Designation / Role
                                      </span>
                                      <div className="mt-1 flex items-center gap-2">
                                        <span className="text-sm font-bold text-white">
                                          {structure?.offer_designation ||
                                            employee.department ||
                                            'Executive'}
                                        </span>
                                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                          Active
                                        </span>
                                      </div>
                                    </div>

                                    {/* Department */}
                                    <div className="rounded-lg bg-white/5 p-2.5">
                                      <span className="block text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                        Department
                                      </span>
                                      <span className="mt-0.5 block font-medium text-gray-200">
                                        {employee.department || 'Sales & Client Relations'}
                                      </span>
                                    </div>

                                    {/* Office Location */}
                                    <div className="rounded-lg bg-white/5 p-2.5">
                                      <span className="block text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                        Office Placement
                                      </span>
                                      <p className="mt-1 text-[11px] leading-relaxed text-gray-300">
                                        {structure?.offer_location ||
                                          'Corporate Office: Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309'}
                                      </p>
                                    </div>

                                    {/* Reporting Officer */}
                                    <div className="rounded-lg bg-white/5 p-2.5">
                                      <span className="block text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                        Reporting Authority / Manager
                                      </span>
                                      <div className="mt-1 flex items-center gap-1.5 font-semibold text-emerald-400">
                                        <UserCheck className="text-brand-gold h-3.5 w-3.5" />
                                        <span>
                                          {structure?.offer_reporting_to ||
                                            'Management / HR Operations'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Card 3: Terms & Schedule */}
                                <div className="rounded-xl border border-white/10 bg-[#141824] p-4 shadow-sm">
                                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                                      <Clock className="text-brand-gold h-4 w-4" />
                                      <span>Schedule, Terms &amp; Banking</span>
                                    </div>
                                    <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-gray-400">
                                      OPERATIONAL
                                    </span>
                                  </div>

                                  <div className="mt-3 space-y-2.5 text-xs">
                                    {/* Date of Joining */}
                                    <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
                                      <div>
                                        <span className="block text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                          Appointment / Joining Date
                                        </span>
                                        <span className="font-mono font-bold text-gray-200">
                                          {formatDate(
                                            structure?.offer_appointment_date ||
                                              structure?.employee_created_at
                                          )}
                                        </span>
                                      </div>
                                      <CalendarDays className="text-brand-gold h-4 w-4" />
                                    </div>

                                    {/* Probation Period */}
                                    <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
                                      <div>
                                        <span className="block text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                          Probation Period
                                        </span>
                                        <span className="font-semibold text-gray-200">
                                          {structure?.offer_probation_period || '3 Months Standard'}
                                        </span>
                                      </div>
                                      <span className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold rounded-full border px-2 py-0.5 text-[10px] font-bold">
                                        Evaluation
                                      </span>
                                    </div>

                                    {/* Working Hours & Shift */}
                                    <div className="rounded-lg bg-white/5 p-2.5">
                                      <span className="block text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                        Work Timings &amp; Weekly Off
                                      </span>
                                      <div className="mt-1 flex items-center justify-between text-[11px] text-gray-300">
                                        <span className="font-mono">
                                          {structure?.offer_working_hours || '10:30 am - 6:00 pm'}
                                        </span>
                                        <span className="rounded bg-white/10 px-2 py-0.5 font-medium text-gray-300">
                                          Off: {structure?.offer_weekly_off_days || 'Rotational'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Banking & Compliance Details */}
                                    <div className="rounded-lg bg-white/5 p-2.5">
                                      <span className="block text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                        Bank Settlement Account
                                      </span>
                                      {structure?.account_number ? (
                                        <div className="mt-1 flex items-center justify-between text-[11px]">
                                          <span className="font-medium text-gray-200">
                                            {structure.bank_name || 'Bank'} (••
                                            {structure.account_number.slice(-4)})
                                          </span>
                                          {structure.ifsc_code && (
                                            <span className="font-mono text-[10px] text-gray-400">
                                              IFSC: {structure.ifsc_code}
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="mt-1 flex items-center justify-between text-[11px]">
                                          <span className="flex items-center gap-1 font-medium text-amber-400">
                                            <AlertCircle className="h-3 w-3" /> Bank details not
                                            submitted
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (structure) onEditStructure(structure);
                                              else onAddNew();
                                            }}
                                            className="text-brand-gold text-[10px] font-bold hover:underline"
                                          >
                                            Update &rarr;
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
