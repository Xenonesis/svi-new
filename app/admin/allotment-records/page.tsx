'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AllotmentHeader,
  AllotmentStats,
  AllotmentFilters,
  AllotmentTable,
  AllotmentDeleteModal,
  AllotmentViewModal,
  useAllotmentRecords,
} from '@/src/components/admin/allotment-records';
import { CrossNavReturnBanner } from '@/src/components/admin/Shared/CrossNavReturnBanner';

function AllotmentRecordsContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams?.get('id') || searchParams?.get('documentId');
  const targetSearch =
    searchParams?.get('search') ||
    searchParams?.get('refId') ||
    searchParams?.get('ticketId') ||
    searchParams?.get('q');
  const options = useMemo(() => ({ targetId, targetSearch }), [targetId, targetSearch]);
  const records = useAllotmentRecords(options);
  const isNavigatedFromPlots = Boolean(targetSearch || targetId);
  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <AllotmentHeader loading={records.loading} onRefresh={records.fetchAllotments} />

      <AllotmentStats loading={records.loading} allotments={records.allotments} />

      {isNavigatedFromPlots && records.searchQuery && (
        <CrossNavReturnBanner
          searchQuery={records.searchQuery}
          onClear={() => records.setSearchQuery('')}
          recordTypeLabel="allotment letters"
        />
      )}

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

export default function AllotmentRecordsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center p-12 text-sm text-gray-400">
          Loading allotment records...
        </div>
      }
    >
      <AllotmentRecordsContent />
    </Suspense>
  );
}
