'use client';

import { useTranslations } from 'next-intl';
import {
  usePortalAllotmentsAdmin,
  PortalAllotmentsHeader,
  PortalAllotmentsStatsGrid,
  PortalAllotmentsTabsNav,
  PortalAllotmentsPendingView,
  PortalAllotmentsActiveView,
  PortalAllotmentsModalsContainer,
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
  } = usePortalAllotmentsAdmin();

  return (
    <div className="mx-auto w-full max-w-7xl pb-12 font-sans">
      <PortalAllotmentsHeader
        title={t('title')}
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
    </div>
  );
}
