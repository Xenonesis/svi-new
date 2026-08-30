'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  UploadCloud,
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Users,
  LayoutGrid,
  List,
  UserCircle2,
} from 'lucide-react';
import DynamicSkeleton from '@/src/components/ui/DynamicSkeleton';
import { EmployeeCard, type Employee } from '@/src/components/admin/employees/EmployeeCard';
import { EmployeeTableView } from '@/src/components/admin/employees/EmployeeTableView';
import { DirectoryStatsCards } from '@/src/components/admin/employees/DirectoryStatsCards';
import {
  exportEmployeesToCSV,
  exportEmployeesToExcel,
} from '@/src/components/admin/employees/exportEmployees';
import type { EmployeeLiveStatus } from '@/src/lib/supabase/types';

interface WorkforceDirectoryTabProps {
  employees: Employee[];
  loadingEmployees: boolean;
  liveStatusMap: Map<string, EmployeeLiveStatus>;
  onRefresh: () => void;
  onBulkImport: () => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onResetPassword: (emp: Employee) => void;
  onViewPerformance: (emp: Employee) => void;
}

export function WorkforceDirectoryTab({
  employees,
  loadingEmployees,
  liveStatusMap,
  onRefresh,
  onBulkImport,
  onEditEmployee,
  onDeleteEmployee,
  onResetPassword,
  onViewPerformance,
}: WorkforceDirectoryTabProps) {
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'punched_in' | 'punched_out' | 'not_punched'
  >('all');
  const [directorySort, setDirectorySort] = useState<'recent' | 'name' | 'status'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Status Counts for Directory Filter Chips
  const statusCounts = useMemo(() => {
    let inCount = 0;
    let outCount = 0;
    let notCount = 0;
    for (const emp of employees) {
      const status = liveStatusMap.get(emp.id)?.status;
      if (status === 'punched_in') inCount++;
      else if (status === 'punched_out') outCount++;
      else notCount++;
    }
    return {
      all: employees.length,
      punched_in: inCount,
      punched_out: outCount,
      not_punched: notCount,
    };
  }, [employees, liveStatusMap]);

  // Filtered & Sorted Employees
  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.toLowerCase().trim();
    let list = employees;

    // 1. Search Query Filter
    if (q) {
      list = list.filter(
        (e) =>
          e.full_name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.real_email && e.real_email.toLowerCase().includes(q)) ||
          (e.phone && e.phone.toLowerCase().includes(q)) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    // 2. Attendance Status Filter
    if (statusFilter !== 'all') {
      list = list.filter((e) => {
        const s = liveStatusMap.get(e.id)?.status || 'not_punched';
        return s === statusFilter;
      });
    }

    // 3. Sort
    return [...list].sort((a, b) => {
      if (directorySort === 'name') {
        return a.full_name.localeCompare(b.full_name);
      }
      if (directorySort === 'status') {
        const statusOrder: Record<string, number> = {
          punched_in: 0,
          punched_out: 1,
          not_punched: 2,
        };
        const sA = statusOrder[liveStatusMap.get(a.id)?.status || 'not_punched'] ?? 3;
        const sB = statusOrder[liveStatusMap.get(b.id)?.status || 'not_punched'] ?? 3;
        if (sA !== sB) return sA - sB;
        return a.full_name.localeCompare(b.full_name);
      }
      // 'recent' default
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [employees, employeeSearch, statusFilter, directorySort, liveStatusMap]);

  return (
    <div className="space-y-6">
      {/* Directory Sub-Header & Search */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
            Employee Directory
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Search personnel, review performance summaries, and manage system credentials.
          </p>
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-400 shadow-2xs transition-all focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loadingEmployees}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-60 dark:border-white/10 dark:bg-[#181822] dark:text-gray-300 dark:hover:bg-white/5"
            title="Refresh Directory & Live Status"
          >
            <RefreshCw
              className={`text-brand-gold h-4 w-4 ${loadingEmployees ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Bulk Import Button */}
          <button
            type="button"
            onClick={onBulkImport}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs transition-all hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-[#181822] dark:text-gray-300 dark:hover:bg-white/5"
            title="Bulk Import Employees via CSV or Excel"
          >
            <UploadCloud className="text-brand-gold h-4 w-4" />
            <span className="hidden sm:inline">Bulk Import</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen((prev) => !prev)}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs transition-all hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-[#181822] dark:text-gray-300 dark:hover:bg-white/5"
              title="Export Directory"
            >
              <Download className="text-brand-gold h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {exportMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setExportMenuOpen(false)} />
                <div className="absolute top-full right-0 z-30 mt-1.5 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-[#181822]">
                  <button
                    type="button"
                    onClick={() => {
                      setExportMenuOpen(false);
                      exportEmployeesToCSV(filteredEmployees, liveStatusMap);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-gray-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                  >
                    <FileText size={14} className="text-amber-500" />
                    <div>
                      <p className="font-semibold">Export CSV</p>
                      <p className="text-[10px] text-gray-400">Plain text (.csv)</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExportMenuOpen(false);
                      exportEmployeesToExcel(filteredEmployees, liveStatusMap);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                  >
                    <FileSpreadsheet size={14} className="text-emerald-500" />
                    <div>
                      <p className="font-semibold">Export Excel</p>
                      <p className="text-[10px] text-gray-400">Styled workbook (.xlsx)</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Top KPI Metrics Strip */}
      <DirectoryStatsCards
        totalEmployees={statusCounts.all}
        punchedInCount={statusCounts.punched_in}
        punchedOutCount={statusCounts.punched_out}
        notPunchedCount={statusCounts.not_punched}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
      />

      {/* Filter Chips & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/60 pb-4 dark:border-white/5">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'border-brand-gold/40 bg-brand-gold/15 text-brand-gold border shadow-xs'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
            }`}
          >
            <Users size={12} />
            <span>All</span>
            <span className="py-0.2 ml-0.5 rounded-full bg-black/5 px-1.5 text-[10px] dark:bg-white/10">
              {statusCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('punched_in')}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'punched_in'
                ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-600 shadow-xs dark:text-emerald-400'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Punched In</span>
            <span className="py-0.2 ml-0.5 rounded-full bg-emerald-500/15 px-1.5 text-[10px] text-emerald-700 dark:text-emerald-300">
              {statusCounts.punched_in}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('punched_out')}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'punched_out'
                ? 'border border-amber-500/40 bg-amber-500/15 text-amber-600 shadow-xs dark:text-amber-400'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Punched Out</span>
            <span className="py-0.2 ml-0.5 rounded-full bg-amber-500/15 px-1.5 text-[10px] text-amber-700 dark:text-amber-300">
              {statusCounts.punched_out}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('not_punched')}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'not_punched'
                ? 'border border-slate-400/40 bg-slate-200/50 text-slate-700 shadow-xs dark:bg-white/20 dark:text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span>Not Checked In</span>
            <span className="py-0.2 ml-0.5 rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {statusCounts.not_punched}
            </span>
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">Sort:</span>
            <select
              value={directorySort}
              onChange={(e) => setDirectorySort(e.target.value as 'recent' | 'name' | 'status')}
              className="focus:border-brand-gold rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition-all focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-gray-200"
            >
              <option value="recent">Recently Joined</option>
              <option value="name">Name (A → Z)</option>
              <option value="status">Active Status</option>
            </select>
          </div>

          {/* Grid vs Table View Switcher */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-white p-0.5 dark:border-white/10 dark:bg-[#181822]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`cursor-pointer rounded-lg p-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'border-brand-gold/30 bg-brand-gold/15 text-brand-gold border shadow-xs'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`cursor-pointer rounded-lg p-1.5 transition-all ${
                viewMode === 'table'
                  ? 'border-brand-gold/30 bg-brand-gold/15 text-brand-gold border shadow-xs'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-white'
              }`}
              title="Compact Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Cards Grid or Table View */}
      {loadingEmployees ? (
        <DynamicSkeleton type="property-grid" count={3} />
      ) : viewMode === 'table' ? (
        <EmployeeTableView
          employees={filteredEmployees}
          liveStatusMap={liveStatusMap}
          onEdit={onEditEmployee}
          onDelete={onDeleteEmployee}
          onResetPassword={onResetPassword}
          onViewPerformance={onViewPerformance}
        />
      ) : filteredEmployees.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <UserCircle2 className="mx-auto mb-3 h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
            No employees found
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {employeeSearch
              ? 'Try adjusting your search terms.'
              : 'Get started by creating your first employee profile.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              liveStatus={liveStatusMap.get(emp.id)}
              onEdit={() => onEditEmployee(emp)}
              onDelete={() => onDeleteEmployee(emp.id)}
              onResetPassword={() => onResetPassword(emp)}
              onViewPerformance={() => onViewPerformance(emp)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
