'use client';

import {
  QuotationHeader,
  QuotationStatsGrid,
  QuotationFilterBar,
  QuotationRecordsTable,
  QuotationDeleteDialog,
  QuotationDetailsModal,
  useQuotationRecords,
} from '@/src/components/admin/quotation-records';

export default function QuotationRecordsPage() {
  const records = useQuotationRecords();

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <QuotationHeader onRefresh={records.fetchQuotations} loading={records.loading} />

      <QuotationStatsGrid
        totalCount={records.totalCount}
        totalValue={records.totalValue}
        completedCount={records.completedCount}
      />

      <QuotationFilterBar
        searchQuery={records.searchQuery}
        onSearchChange={records.setSearchQuery}
        statusFilter={records.statusFilter}
        onStatusFilterChange={records.setStatusFilter}
        counts={{
          all: records.totalCount,
          completed: records.completedCount,
          draft: records.draftCount,
        }}
      />

      <QuotationRecordsTable
        loading={records.loading}
        error={records.error}
        records={records.filtered}
        searchQuery={records.searchQuery}
        onRetry={records.fetchQuotations}
        onSelect={records.setSelectedQuotation}
        onDeleteTarget={records.setDeleteTarget}
      />

      <QuotationDeleteDialog
        target={records.deleteTarget}
        loading={records.deleteLoading}
        onCancel={() => records.setDeleteTarget(null)}
        onConfirm={records.handleDelete}
      />

      <QuotationDetailsModal
        quotation={records.selectedQuotation}
        companyInfo={records.companyInfo}
        onClose={() => records.setSelectedQuotation(null)}
        onDownloadPDF={records.handleModalDownloadPDF}
        onDownloadPNG={records.handleModalDownloadPNG}
        pdfLoading={records.pdfLoading}
        imageLoading={records.imageLoading}
      />
    </div>
  );
}
