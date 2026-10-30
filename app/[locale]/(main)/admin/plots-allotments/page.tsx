'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
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
  PlotsAllotmentsHeaderV2,
  PlotsAllotmentsTabsV2,
} from '@/src/components/admin/portal-allotments-v2';
import { exportAllotmentsToCSV } from '@/src/components/admin/portal-allotments/exportAllotmentsToCSV';

export default function PlotsAllotmentsPage(): ReactElement {
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
  const setActiveTab = (tab: 'pending' | 'active'): void => {
    setTabOverride(tab);
    hookSetActiveTab(tab);
  };

  const handleExportSelected = (): void => {
    exportAllotmentsToCSV(selectedAllotments, getAllotmentFinancials);
  };

  return (
    <div className="mx-auto w-full max-w-7xl pb-16 font-sans">
      <PlotsAllotmentsHeaderV2
        activeAccountsCount={salesRevenueStats.activeAccountsCount}
        onOpenLedgersModal={() => setIsLedgersModalOpen(true)}
        onOpenCreateModal={openCreateModal}
      />

      <PortalAllotmentsStatsGridV2
        stats={salesRevenueStats}
        onOpenLedgersModal={() => setIsLedgersModalOpen(true)}
      />

      <PlotsAllotmentsTabsV2
        activeTab={activeTab}
        onTabChange={setActiveTab}
        candidatesCount={candidates.length}
        allotmentsCount={allotments.length}
      />

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

      {activeTab === 'active' && (
        <PortalAllotmentsFloatingDock
          selectedCount={selectedIds.size}
          selectedTotalBalance={selectedTotalBalance}
          onOpenBulkWhatsApp={() => setIsBulkWhatsAppOpen(true)}
          onExportSelected={handleExportSelected}
          onClearSelection={clearSelection}
        />
      )}

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

      <BulkWhatsAppReminderModal
        isOpen={isBulkWhatsAppOpen}
        onClose={() => setIsBulkWhatsAppOpen(false)}
        selectedAllotments={selectedAllotments}
        getAllotmentFinancials={getAllotmentFinancials}
      />
    </div>
  );
}
