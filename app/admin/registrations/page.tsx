'use client';

import type { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { GRID_STYLE } from '@/src/components/admin/registrations/types';
import { useRegistrations } from '@/src/components/admin/registrations/useRegistrations';
import { RegistrationsHeader } from '@/src/components/admin/registrations/RegistrationsHeader';
import { RegistrationsToolbar } from '@/src/components/admin/registrations/RegistrationsToolbar';
import { FilterPanel } from '@/src/components/admin/registrations/FilterPanel';
import { RegistrationTable } from '@/src/components/admin/registrations/RegistrationTable';
import { RegistrationsModals } from '@/src/components/admin/registrations/RegistrationsModals';
import { RegistrationsFloatingDock } from '@/src/components/admin/registrations/RegistrationsFloatingDock';

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

interface RegistrationAnalyticsResponse {
  statusDistribution: { name: string; value: number; color: string }[];
}

export default function AdminRegistrations(): ReactElement {
  const h = useRegistrations();

  const { data: analyticsData, isLoading: analyticsLoading } =
    useQuery<RegistrationAnalyticsResponse>({
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
        <RegistrationsHeader
          total={h.total}
          loading={h.loading}
          analyticsLoading={analyticsLoading}
          pendingCount={pendingCount}
          approvedCount={approvedCount}
          onFilterPending={() => h.updateFilter('status', 'Pending')}
          onFilterApproved={() => h.updateFilter('status', 'Approved')}
        />

        <RegistrationAnalytics token={h.token} />

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
          onBulkReassign={() => h.handleOpenReassign(h.selectedRegistrations)}
          selectedCount={h.selectedCount}
          onClearSelection={h.clearSelection}
          onRefresh={() => h.fetchRegistrations()}
          onManageAdvisors={() => h.setShowAdvisorSettings(true)}
        />

        <FilterPanel
          show={h.showFilters}
          filters={h.filters}
          filterOptions={h.filterOptions}
          activeFilterCount={h.activeFilterCount}
          onUpdateFilter={h.updateFilter}
          onClearFilters={h.clearFilters}
        />

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
          onReassign={h.handleOpenReassign}
          onDelete={h.setDeleteTarget}
          onClearFilters={h.clearFilters}
          onPageChange={(p) => h.setPage(p)}
        />
      </div>

      <RegistrationsModals
        selectedReg={h.selectedReg}
        deleteTarget={h.deleteTarget}
        reassignTargets={h.reassignTargets}
        showAdvisorSettings={h.showAdvisorSettings}
        availableAdvisors={h.availableAdvisors}
        token={h.token}
        deleteLoading={h.deleteLoading}
        reassignLoading={h.reassignLoading}
        onCloseDetail={() => h.setSelectedReg(null)}
        onStatusChange={h.handleStatusChange}
        onDeleteFromDetail={(r) => {
          h.setSelectedReg(null);
          h.setDeleteTarget(r);
        }}
        onAdvisorChange={h.handleUpdateSingleAdvisor}
        onConfirmDelete={h.handleDelete}
        onCancelDelete={() => h.setDeleteTarget(null)}
        onConfirmReassign={h.handleConfirmReassign}
        onCancelReassign={h.handleCloseReassign}
        onCloseAdvisorSettings={() => h.setShowAdvisorSettings(false)}
        showToast={h.showToast}
      />

      <RegistrationsFloatingDock
        selectedCount={h.selectedCount}
        selectedRegistrations={h.selectedRegistrations}
        onReassign={h.handleOpenReassign}
        onExportExcel={h.handleExportSelectedExcel}
        onExportCsv={h.handleExportSelectedCsv}
        onClearSelection={h.clearSelection}
      />
    </div>
  );
}
