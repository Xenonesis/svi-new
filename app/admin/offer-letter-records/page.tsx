'use client';

import { useOfferLetterRecords } from '@/src/components/admin/offer-letter-records/useOfferLetterRecords';
import { OfferLetterRecordsHeader } from '@/src/components/admin/offer-letter-records/OfferLetterRecordsHeader';
import { OfferLetterStatsCards } from '@/src/components/admin/offer-letter-records/OfferLetterStatsCards';
import { OfferLetterTable } from '@/src/components/admin/offer-letter-records/OfferLetterTable';
import { OfferLetterPreviewModal } from '@/src/components/admin/offer-letter-records/OfferLetterPreviewModal';
import { DeleteConfirm } from '@/src/components/admin/modals/DeleteConfirm';

export default function OfferLetterRecordsPage() {
  const {
    offers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortConfig,
    setSortConfig,
    dateRange,
    setDateRange,
    selectedOffer,
    setSelectedOffer,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    pdfLoading,
    imageLoading,
    companyInfo,
    stats,
    fetchOffers,
    handleDelete,
    handleDownloadPDF,
    handleDownloadImage,
    handleClearFilters,
  } = useOfferLetterRecords();

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <OfferLetterRecordsHeader loading={loading} onRefresh={fetchOffers} />

      <OfferLetterStatsCards
        loading={loading}
        totalCount={stats.totalCount}
        totalCtc={stats.totalCtc}
        uniqueDesignations={stats.uniqueDesignations}
        completedCount={stats.completedCount}
      />

      <OfferLetterTable
        offers={offers}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        onClearFilters={handleClearFilters}
        onView={setSelectedOffer}
        onDelete={setDeleteTarget}
        onRetry={fetchOffers}
      />

      <OfferLetterPreviewModal
        offer={selectedOffer}
        companyInfo={companyInfo}
        onClose={() => setSelectedOffer(null)}
        onDownloadPDF={handleDownloadPDF}
        onDownloadImage={handleDownloadImage}
        pdfLoading={pdfLoading}
        imageLoading={imageLoading}
      />

      {deleteTarget && (
        <DeleteConfirm
          title="Delete Offer Letter Record?"
          itemName={
            deleteTarget.form_data?.name
              ? `${deleteTarget.form_data.name}${deleteTarget.form_data.designation ? ` (${deleteTarget.form_data.designation})` : ''}`
              : 'Offer Letter Record'
          }
          itemType="offer letter record"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
