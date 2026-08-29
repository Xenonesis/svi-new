'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  CreditCard,
  Edit2,
  Plus,
  Users,
  AlertCircle,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import type { SalaryStructure } from '@/src/lib/payroll/types';
import { formatINR } from '@/src/lib/quotation/format';

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

  // Map of existing structures by user_id
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

  // Filtered list
  const filteredList = useMemo(() => {
    return combinedList.filter((item) => {
      const nameMatch =
        item.employee.full_name.toLowerCase().includes(search.toLowerCase()) ||
        item.employee.email.toLowerCase().includes(search.toLowerCase());

      const deptMatch =
        departmentFilter === 'all' ||
        (item.employee.department &&
          item.employee.department.toLowerCase() === departmentFilter.toLowerCase());

      return nameMatch && deptMatch;
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
              placeholder="Search employee by name, email..."
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
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    Loading salary structures...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    No employees matching your filter.
                  </td>
                </tr>
              ) : (
                filteredList.map(({ employee, structure }) => (
                  <tr
                    key={employee.id}
                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/3"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {employee.full_name}
                      </div>
                      <div className="text-[11px] text-gray-500">{employee.email}</div>
                      {employee.department && (
                        <span className="mt-1 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                          {employee.department}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      {structure ? (
                        <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                          {formatINR(structure.base_salary)}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      {structure ? (
                        <span className="font-mono text-gray-700 dark:text-gray-300">
                          {formatINR(structure.basic_pay)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      {structure ? (
                        <span className="font-mono text-gray-700 dark:text-gray-300">
                          {formatINR(structure.hra)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {structure?.account_number ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>
                            {structure.bank_name || 'Bank'} (••{structure.account_number.slice(-4)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Pending Bank Info</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {structure ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Configured
                        </span>
                      ) : (
                        <span className="text-brand-gold inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold">
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
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>{structure ? 'Edit Structure' : 'Setup Salary'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
