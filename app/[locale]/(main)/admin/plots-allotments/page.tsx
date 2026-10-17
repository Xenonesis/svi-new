'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import {
  usePortalAllotmentsAdmin,
  PortalAllotmentsPendingView,
  PortalAllotmentsModalsContainer,
  PortalAllotmentsFloatingDock,
  BulkWhatsAppReminderModal,
} from '@/src/components/admin/portal-allotments';
import {
  PortalAllotmentsStatsGridV2,
  PortalAllotmentsActiveViewV2,
} from '@/src/components/admin/portal-allotments-v2';
import { exportAllotmentsToCSV } from '@/src/components/admin/portal-allotments/exportAllotmentsToCSV';

export default function PlotsAllotmentsPage() {
  const t = useTranslations('pages.adminPortalAllotments');
  const [isBulkWhatsAppOpen, setIsBulkWhatsAppOpen] = useState(false);
  const [tabOverride, setTabOverride] = useState<'pending' | 'active' | null>('active');

  const {
    activeTab: hookActiveTab,
    setActiveTab: hookSetActiveTab,
    allotments,
    filteredAllotments,
    candidates,
    filteredCandidates,
    profiles,
    properties,
    advisors,
    selectedProperty,
    setSelectedProperty,
    selectedPaymentStatus,
    setSelectedPaymentStatus,
    selectedSaleMode,
    setSelectedSaleMode,
    selectedAdvisor,
    setSelectedAdvisor,
    sortField,
    sortDirection,
    handleSort,
    activeFilterCount,
    resetFilters,
    loading,
    loadingCandidates,
    searchTerm,
    setSearchTerm,
    showModal,
    editingId,
    expandedAllotment,
    setExpandedAllotment,
    formData,
    setFormData,
    handleSave,
    handleDelete,
    togglePaymentStatus,
    openCreateModal,
    openEditModal,
    closeModal,
    handleApproveCandidate,
    approvingTicketId,
    selectedReceipt,
    setSelectedReceipt,
    whatsAppReceipt,
    setWhatsAppReceipt,
    pdfLoading,
    imageLoading,
    handleDownloadPDF,
    handleDownloadImage,
    allLedgerReceipts,
    dealValuesMap,
    handleSaveDealValue,
    isLedgersModalOpen,
    setIsLedgersModalOpen,
    activeLedgerRefId,
    setActiveLedgerRefId,
    openClientLedger,
    getDealValueForRef,
    getPlotAreaForRef,
    salesRevenueStats,
    getAllotmentFinancials,
    selectedIds,
    toggleSelectRow,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected,
    selectedAllotments,
    selectedTotalBalance,
  } = usePortalAllotmentsAdmin();

  const activeTab = tabOverride ?? hookActiveTab;
  const setActiveTab = (tab: 'pending' | 'active') => {
    setTabOverride(tab);
    hookSetActiveTab(tab);
  };

  const handleExportSelected = () => {
    exportAllotmentsToCSV(selectedAllotments, getAllotmentFinancials);
  };

  return (
    <div className="mx-auto w-full max-w-7xl pb-16 font-sans">
      {/* 1. Luxury Real Estate Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-normal tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            <span className="font-serif font-bold">Plots</span>{' '}
            <span className="font-serif text-amber-500 italic dark:text-[#E5B842]">Allotments</span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-[#8E9BAE]">
            Manage customer plot allotments and their payment schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsLedgersModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white active:scale-[0.98] dark:border-white/[0.08] dark:bg-[#161D2C] dark:text-white dark:hover:border-white/[0.15] dark:hover:bg-[#1D263B]"
          >
            <BookOpen className="h-4 w-4 text-amber-500 dark:text-[#E5B842]" />
            <span className="font-medium">Overall Ledger</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {salesRevenueStats.activeAccountsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98] dark:bg-[#E5B842] dark:hover:bg-[#f0c34e]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Allotment</span>
          </button>
        </div>
      </div>

      {/* 2. Architectural Mercury-Grade Financial Cards */}
      <PortalAllotmentsStatsGridV2
        stats={salesRevenueStats}
        onOpenLedgersModal={() => setIsLedgersModalOpen(true)}
      />

      {/* 3. Luxury Real Estate Tab Bar matching Image #1 */}
      <div className="mb-6 flex items-center gap-8 border-b border-slate-200/80 text-sm font-bold dark:border-white/[0.08]">
        {/* Pending Approvals Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`relative flex items-center gap-2.5 pb-3.5 transition-all ${
            activeTab === 'pending'
              ? 'text-slate-900 dark:text-[#E5B842]'
              : 'text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-slate-200'
          }`}
        >
          <Clock
            className={`h-4 w-4 stroke-[2.2] ${
              activeTab === 'pending'
                ? 'text-slate-900 dark:text-[#E5B842]'
                : 'text-slate-400 dark:text-[#94A3B8]'
            }`}
          />
          <span className="tracking-wide">Pending Approvals</span>
          {candidates.length > 0 && (
            <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-[#FF9800] px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
              {candidates.length}
            </span>
          )}
          {activeTab === 'pending' && (
            <span className="absolute right-0 bottom-0 left-0 h-[2.5px] rounded-full bg-slate-900 dark:bg-[#E5B842]" />
          )}
        </button>

        {/* Active Allotments Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`relative flex items-center gap-2.5 pb-3.5 transition-all ${
            activeTab === 'active'
              ? 'text-slate-900 dark:text-[#E5B842]'
              : 'text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-slate-200'
          }`}
        >
          <CheckCircle2
            className={`h-4 w-4 stroke-[2.2] ${
              activeTab === 'active'
                ? 'text-slate-900 dark:text-[#E5B842]'
                : 'text-slate-400 dark:text-[#94A3B8]'
            }`}
          />
          <span className="tracking-wide">Active Allotments</span>
          <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-slate-200/90 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-[#253246] dark:text-[#CBD5E1]">
            {allotments.length}
          </span>
          {activeTab === 'active' && (
            <span className="absolute right-0 bottom-0 left-0 h-[2.5px] rounded-full bg-slate-900 dark:bg-[#E5B842]" />
          )}
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'pending' ? (
        <PortalAllotmentsPendingView
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          loading={loadingCandidates}
          candidates={candidates}
          filteredCandidates={filteredCandidates}
          onApproveCandidate={handleApproveCandidate}
          approvingTicketId={approvingTicketId}
        />
      ) : (
        <PortalAllotmentsActiveViewV2
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={t('searchPlaceholder')}
          loading={loading}
          loadingText={t('loading')}
          noAllotmentsFoundText={t('noAllotmentsFound')}
          filteredAllotments={filteredAllotments}
          allotments={allotments}
          getAllotmentFinancials={getAllotmentFinancials}
          expandedAllotment={expandedAllotment}
          onToggleExpand={(id) => setExpandedAllotment(expandedAllotment === id ? null : id)}
          onOpenLedger={openClientLedger}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onTogglePaymentStatus={togglePaymentStatus}
          onSelectReceipt={setSelectedReceipt}
          onShareWhatsApp={setWhatsAppReceipt}
          selectedProperty={selectedProperty}
          setSelectedProperty={setSelectedProperty}
          selectedPaymentStatus={selectedPaymentStatus}
          setSelectedPaymentStatus={setSelectedPaymentStatus}
          selectedSaleMode={selectedSaleMode}
          setSelectedSaleMode={setSelectedSaleMode}
          selectedAdvisor={selectedAdvisor}
          setSelectedAdvisor={setSelectedAdvisor}
          advisors={advisors}
          properties={properties}
          activeFilterCount={activeFilterCount}
          resetFilters={resetFilters}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          selectedIds={selectedIds}
          onToggleSelectRow={toggleSelectRow}
          onToggleSelectAll={toggleSelectAll}
          isAllSelected={isAllSelected}
          isSomeSelected={isSomeSelected}
          onExportSelected={handleExportSelected}
        />
      )}

      {/* Floating Selection Dock */}
      {activeTab === 'active' && (
        <PortalAllotmentsFloatingDock
          selectedCount={selectedIds.size}
          selectedTotalBalance={selectedTotalBalance}
          onOpenBulkWhatsApp={() => setIsBulkWhatsAppOpen(true)}
          onExportSelected={handleExportSelected}
          onClearSelection={clearSelection}
        />
      )}

      {/* Modals & Dialogs */}
      <PortalAllotmentsModalsContainer
        showModal={showModal}
        closeModal={closeModal}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        profiles={profiles}
        properties={properties}
        advisors={advisors}
        candidates={candidates}
        handleSave={handleSave}
        selectedReceipt={selectedReceipt}
        setSelectedReceipt={setSelectedReceipt}
        pdfLoading={pdfLoading}
        imageLoading={imageLoading}
        handleDownloadPDF={handleDownloadPDF}
        handleDownloadImage={handleDownloadImage}
        whatsAppReceipt={whatsAppReceipt}
        setWhatsAppReceipt={setWhatsAppReceipt}
        isLedgersModalOpen={isLedgersModalOpen}
        setIsLedgersModalOpen={setIsLedgersModalOpen}
        allLedgerReceipts={allLedgerReceipts}
        dealValuesMap={dealValuesMap}
        openClientLedger={openClientLedger}
        activeLedgerRefId={activeLedgerRefId}
        setActiveLedgerRefId={setActiveLedgerRefId}
        getDealValueForRef={getDealValueForRef}
        getPlotAreaForRef={getPlotAreaForRef}
        handleSaveDealValue={handleSaveDealValue}
      />

      {/* Bulk WhatsApp Reminder Modal */}
      <BulkWhatsAppReminderModal
        isOpen={isBulkWhatsAppOpen}
        onClose={() => setIsBulkWhatsAppOpen(false)}
        selectedAllotments={selectedAllotments}
        getAllotmentFinancials={getAllotmentFinancials}
      />
    </div>
  );
}
