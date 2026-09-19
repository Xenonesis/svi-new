'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  usePortalAllotmentsAdmin,
  PortalAllotmentsHeader,
  PortalAllotmentsStatsGrid,
  PortalAllotmentsTabsNav,
  PortalAllotmentsPendingView,
  PortalAllotmentsActiveView,
  PortalAllotmentsModalsContainer,
  PortalAllotmentsFloatingDock,
  BulkWhatsAppReminderModal,
} from '@/src/components/admin/portal-allotments';

export default function PortalAllotmentsAdmin() {
  const t = useTranslations('pages.adminPortalAllotments');
  const {
    activeTab,
    setActiveTab,
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
    handleApproveAll,
    approvingTicketId,
    isApprovingAll,
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

  const [isBulkWhatsAppOpen, setIsBulkWhatsAppOpen] = useState(false);

  const handleExportSelected = () => {
    if (selectedAllotments.length === 0) return;
    const rows = [
      [
        'Ref ID',
        'Unit Number',
        'Property',
        'Client Name',
        'Email',
        'Phone',
        'Deal Value',
        'Total Paid',
        'Balance Due',
      ],
      ...selectedAllotments.map((a) => {
        const fin = getAllotmentFinancials(a);
        return [
          fin.ticketId,
          a.unit_no || a.unit_number || '',
          a.properties?.name || '',
          a.profiles?.full_name || '',
          a.profiles?.email || '',
          a.profiles?.phone || '',
          fin.dealValue.toString(),
          fin.totalPaid.toString(),
          fin.balanceDue.toString(),
        ];
      }),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `allotments_export_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto w-full max-w-7xl pb-12 font-sans">
      <PortalAllotmentsHeader
        title={
          <>
            Plots <span className="text-brand-gold italic">Allotments</span>
          </>
        }
        subtitle={t('subtitle')}
        activeAccountsCount={salesRevenueStats.activeAccountsCount}
        onOpenOverallLedger={() => setIsLedgersModalOpen(true)}
        activeTab={activeTab}
        candidatesCount={candidates.length}
        onApproveAll={handleApproveAll}
        isApprovingAll={isApprovingAll}
        onAddAllotment={openCreateModal}
        addAllotmentLabel={t('addAllotment')}
      />

      <PortalAllotmentsStatsGrid
        stats={salesRevenueStats}
        onOpenLedgersModal={() => setIsLedgersModalOpen(true)}
      />

      <PortalAllotmentsTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        candidatesCount={candidates.length}
        activeAllotmentsCount={allotments.length}
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
        <PortalAllotmentsActiveView
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={t('searchPlaceholder')}
          loading={loading}
          loadingText={t('loading')}
          noAllotmentsFoundText={t('noAllotmentsFound')}
          filteredAllotments={filteredAllotments}
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
          properties={properties}
          advisors={advisors}
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

      {activeTab === 'active' && (
        <PortalAllotmentsFloatingDock
          selectedCount={selectedIds.size}
          selectedTotalBalance={selectedTotalBalance}
          onOpenBulkWhatsApp={() => setIsBulkWhatsAppOpen(true)}
          onExportSelected={handleExportSelected}
          onClearSelection={clearSelection}
        />
      )}

      <BulkWhatsAppReminderModal
        isOpen={isBulkWhatsAppOpen}
        onClose={() => setIsBulkWhatsAppOpen(false)}
        selectedAllotments={selectedAllotments}
        getAllotmentFinancials={getAllotmentFinancials}
      />
    </div>
  );
}
