'use client';

import {
  AllotmentHeader,
  AllotmentStats,
  AllotmentFilters,
  AllotmentTable,
  AllotmentDeleteModal,
  AllotmentViewModal,
  useAllotmentRecords,
} from '@/src/components/admin/allotment-records';

export default function AllotmentRecordsPage() {
  const records = useAllotmentRecords();

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <AllotmentHeader loading={records.loading} onRefresh={records.fetchAllotments} />

      <AllotmentStats loading={records.loading} allotments={records.allotments} />

      <AllotmentFilters
        searchQuery={records.searchQuery}
        setSearchQuery={records.setSearchQuery}
        projectFilter={records.projectFilter}
        setProjectFilter={records.setProjectFilter}
        projects={records.projects}
      />

      <AllotmentTable
        loading={records.loading}
        error={records.error}
        records={records.filteredAllotments}
        searchQuery={records.searchQuery}
        onRefresh={records.fetchAllotments}
        onSelectRecord={records.setSelectedAllotment}
        onDeleteRecord={records.setDeleteTarget}
      />

      <AllotmentDeleteModal
        target={records.deleteTarget}
        loading={records.deleteLoading}
        onCancel={() => records.setDeleteTarget(null)}
        onConfirm={records.handleDelete}
      />

      <AllotmentViewModal
        allotment={records.selectedAllotment}
        companyInfo={records.companyInfo}
        pdfLoading={records.pdfLoading}
        imageLoading={records.imageLoading}
        onClose={() => records.setSelectedAllotment(null)}
        onDownloadPDF={records.handleDownloadPDF}
        onDownloadImage={records.handleDownloadImage}
      />
    </div>
  );
}
