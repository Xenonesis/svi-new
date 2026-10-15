'use client';

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  CheckCheck,
  Download,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { GRID_STYLE } from '@/src/components/admin/registrations/types';
import { useRegistrations } from '@/src/components/admin/registrations/useRegistrations';
import dynamic from 'next/dynamic';
const RegistrationAnalytics = dynamic(
  () =>
    import('@/src/components/admin/registrations/RegistrationAnalytics').then(
      (m) => m.RegistrationAnalytics
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
    ),
  }
);
import { RegistrationsToolbar } from '@/src/components/admin/registrations/RegistrationsToolbar';
import { FilterPanel } from '@/src/components/admin/registrations/FilterPanel';
import { RegistrationTable } from '@/src/components/admin/registrations/RegistrationTable';
import { DetailModal } from '@/src/components/admin/registrations/DetailModal';
import { DeleteConfirmModal } from '@/src/components/admin/registrations/DeleteConfirmModal';
import { AdvisorSettingsModal } from '@/src/components/admin/modals/AdvisorSettingsModal';

export default function AdminRegistrations() {
  const h = useRegistrations();

  // Fetch analytics for the quick-stat cards (pending + approved)
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<{
    statusDistribution: { name: string; value: number; color: string }[];
  }>({
    queryKey: ['registrationAnalytics', h.token],
    queryFn: async () => {
      const res = await fetch('/api/admin/registrations/analytics', {
        headers: { Authorization: `Bearer ${h.token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: !!h.token,
    staleTime: 30_000,
  });

  const pendingCount =
    analyticsData?.statusDistribution.find((s) => s.name === 'Pending')?.value ?? '—';
  const approvedCount =
    analyticsData?.statusDistribution.find((s) => s.name === 'Approved')?.value ?? '—';

  return (
    <div className="relative w-full font-sans">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-[450px] w-[450px] rounded-full blur-[120px]" />
        <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-brand-navy mb-2 font-serif text-4xl tracking-tight dark:text-white">
            Property{' '}
            <span
              className="text-gradient-gold animate-bg-pan inline-block pr-2.5 italic"
              style={{
                backgroundSize: '200% 200%',
                backgroundImage:
                  'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
              }}
            >
              Registrations
            </span>
          </h1>
          <p className="text-xs tracking-wide text-gray-600 dark:text-gray-400">
            View and manage all property registration submissions.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Total */}
          <div className="dark:border-brand-gold/15 dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-5 shadow-lg backdrop-blur-xl">
            <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
            <div className="mb-3 flex items-center justify-between">
              <div className="bg-brand-gold/10 border-brand-gold/25 flex h-11 w-11 items-center justify-center rounded-lg border">
                <FileText className="text-brand-gold h-5 w-5" />
              </div>
            </div>
            {h.loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
            ) : (
              <p className="text-brand-navy text-3xl font-bold tracking-tight dark:text-white">
                {h.total}
              </p>
            )}
            <p className="mt-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
              Total Registrations
            </p>
          </div>

          {/* Pending */}
          <div
            role="button"
            tabIndex={0}
            title="Show pending registrations"
            onClick={() => h.updateFilter('status', 'Pending')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') h.updateFilter('status', 'Pending');
            }}
            className="hover-lift-sm btn-tactile dark:bg-brand-dark-surface/65 relative cursor-pointer overflow-hidden rounded-xl border border-amber-200/60 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-amber-500/20"
          >
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-200/60 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-900/20">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            {analyticsLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
            ) : (
              <p className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {pendingCount}
              </p>
            )}
            <p className="mt-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
              Pending Review
            </p>
          </div>

          {/* Approved */}
          <div
            role="button"
            tabIndex={0}
            title="Show approved registrations"
            onClick={() => h.updateFilter('status', 'Approved')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') h.updateFilter('status', 'Approved');
            }}
            className="hover-lift-sm btn-tactile dark:bg-brand-dark-surface/65 relative cursor-pointer overflow-hidden rounded-xl border border-emerald-200/60 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-emerald-500/20"
          >
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-200/60 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-900/20">
                <CheckCheck className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            {analyticsLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
            ) : (
              <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {approvedCount}
              </p>
            )}
            <p className="mt-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
              Approved
            </p>
          </div>
        </div>

        {/* Analytics Command Center */}
        <RegistrationAnalytics token={h.token} />

        {/* Toolbar */}
        <RegistrationsToolbar
          search={h.search}
          sortBy={h.sortBy}
          sortOrder={h.sortOrder}
          showFilters={h.showFilters}
          activeFilterCount={h.activeFilterCount}
          onSearchChange={h.setSearch}
          onSearchSubmit={h.handleSearch}
          onSearchClear={() => {
            h.setSearch('');
            h.setPage(1);
          }}
          onSortByChange={h.setSortBy}
          onSortOrderToggle={() => h.setSortOrder(h.sortOrder === 'asc' ? 'desc' : 'asc')}
          onFilterToggle={() => h.setShowFilters(!h.showFilters)}
          onExport={h.handleExportCSV}
          onExportSelectedCsv={h.handleExportSelectedCsv}
          onExportSelectedExcel={h.handleExportSelectedExcel}
          selectedCount={h.selectedCount}
          onClearSelection={h.clearSelection}
          onRefresh={() => h.fetchRegistrations()}
          onManageAdvisors={() => h.setShowAdvisorSettings(true)}
        />

        {/* Filter panel — handles its own open/close animation via show prop */}
        <FilterPanel
          show={h.showFilters}
          filters={h.filters}
          filterOptions={h.filterOptions}
          activeFilterCount={h.activeFilterCount}
          onUpdateFilter={h.updateFilter}
          onClearFilters={h.clearFilters}
        />

        {/* Table */}
        <RegistrationTable
          registrations={h.registrations}
          loading={h.loading}
          hasFilters={h.activeFilterCount > 0}
          hasSearch={h.search.length > 0}
          total={h.total}
          page={h.page}
          hasMore={h.hasMore}
          startItem={h.startItem}
          endItem={h.endItem}
          selectedIds={h.selectedIds}
          isAllSelected={h.isAllSelected}
          onToggleSelectOne={h.toggleSelectOne}
          onToggleSelectAll={h.toggleSelectAll}
          onStarToggle={h.handleStarToggle}
          onStatusChange={h.handleStatusChange}
          onView={h.setSelectedReg}
          onDelete={h.setDeleteTarget}
          onClearFilters={h.clearFilters}
          onPageChange={(p) => h.setPage(p)}
        />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {h.selectedReg && (
          <DetailModal
            reg={h.selectedReg}
            onClose={() => h.setSelectedReg(null)}
            onStatusChange={h.handleStatusChange}
            onDelete={(r) => {
              h.setSelectedReg(null);
              h.setDeleteTarget(r);
            }}
          />
        )}
        {h.deleteTarget && (
          <DeleteConfirmModal
            reg={h.deleteTarget}
            onConfirm={h.handleDelete}
            onCancel={() => h.setDeleteTarget(null)}
            loading={h.deleteLoading}
          />
        )}
        {h.showAdvisorSettings && (
          <AdvisorSettingsModal
            token={h.token}
            showToast={h.showToast}
            onClose={() => h.setShowAdvisorSettings(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Bulk Action Dock for Selected Registrations */}
      <AnimatePresence>
        {h.selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="border-brand-gold/30 bg-brand-navy/95 fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-wrap items-center gap-3 rounded-2xl border px-5 py-3 text-white shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2 border-r border-white/10 pr-3">
              <span className="bg-brand-gold text-brand-navy flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
                {h.selectedCount}
              </span>
              <span className="text-xs font-semibold">Registrations Selected</span>
            </div>

            {/* Export Excel Button */}
            <button
              type="button"
              onClick={h.handleExportSelectedExcel}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-600/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-600/40 hover:text-white"
              title="Export selected registrations to Excel"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Excel (.xlsx)</span>
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={h.handleExportSelectedCsv}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-gray-200 transition-all hover:bg-white/20 hover:text-white"
              title="Export selected registrations to CSV"
            >
              <Download className="text-brand-gold h-3.5 w-3.5" />
              <span>CSV (.csv)</span>
            </button>

            {/* Deselect / Clear Selection Button */}
            <button
              type="button"
              onClick={h.clearSelection}
              className="flex cursor-pointer items-center gap-1 rounded-xl px-2 py-1.5 text-xs text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
              <span className="text-[11px]">Clear</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
