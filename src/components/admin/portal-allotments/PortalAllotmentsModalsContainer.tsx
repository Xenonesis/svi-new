import React from 'react';
import { PortalAllotmentFormModal } from './PortalAllotmentFormModal';
import { ReceiptViewModal } from '../payment-receipts/ReceiptViewModal';
import { ReceiptWhatsAppModal } from '../payment-receipts/ReceiptWhatsAppModal';
import { ReceiptLedgersModal } from '../payment-receipts/ReceiptLedgersModal';
import { ReceiptLedgerDrawer } from '../payment-receipts/ReceiptLedgerDrawer';
import type { AllotmentFormData, ProfileSummary, PropertySummary } from './types';
import type { SavedReceipt } from '../payment-receipts/ReceiptTypes';

export interface PortalAllotmentsModalsContainerProps {
  // Manual Allotment Modal
  showModal: boolean;
  closeModal: () => void;
  editingId: string | null;
  formData: AllotmentFormData;
  setFormData: React.Dispatch<React.SetStateAction<AllotmentFormData>>;
  profiles: ProfileSummary[];
  properties: PropertySummary[];
  advisors: string[];
  handleSave: (e: React.FormEvent) => Promise<void> | void;

  // View & Print Receipt Modal
  selectedReceipt: SavedReceipt | null;
  setSelectedReceipt: (receipt: SavedReceipt | null) => void;
  pdfLoading: boolean;
  imageLoading: boolean;
  handleDownloadPDF: () => Promise<void> | void;
  handleDownloadImage: () => Promise<void> | void;

  // WhatsApp Share Receipt Modal
  whatsAppReceipt: SavedReceipt | null;
  setWhatsAppReceipt: (receipt: SavedReceipt | null) => void;

  // Master Customer Ledgers Modal (Overall Ledger)
  isLedgersModalOpen: boolean;
  setIsLedgersModalOpen: (open: boolean) => void;
  allLedgerReceipts: SavedReceipt[];
  dealValuesMap: Record<string, number>;
  openClientLedger: (refId: string) => void;

  // Per-Client Ledger Statement Drawer
  activeLedgerRefId: string | null;
  setActiveLedgerRefId: (refId: string | null) => void;
  getDealValueForRef: (refId: string | null) => number;
  getPlotAreaForRef: (refId: string | null) => number | string | null | undefined;
  handleSaveDealValue: (
    normalizedRefId: string,
    newDealValue: number,
    extra?: { area?: number; ratePerSqYd?: number }
  ) => Promise<void> | void;
}

export function PortalAllotmentsModalsContainer({
  showModal,
  closeModal,
  editingId,
  formData,
  setFormData,
  profiles,
  properties,
  advisors,
  handleSave,
  selectedReceipt,
  setSelectedReceipt,
  pdfLoading,
  imageLoading,
  handleDownloadPDF,
  handleDownloadImage,
  whatsAppReceipt,
  setWhatsAppReceipt,
  isLedgersModalOpen,
  setIsLedgersModalOpen,
  allLedgerReceipts,
  dealValuesMap,
  openClientLedger,
  activeLedgerRefId,
  setActiveLedgerRefId,
  getDealValueForRef,
  getPlotAreaForRef,
  handleSaveDealValue,
}: PortalAllotmentsModalsContainerProps): React.JSX.Element {
  return (
    <>
      {/* Manual Allotment Modal */}
      <PortalAllotmentFormModal
        isOpen={showModal}
        onClose={closeModal}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        profiles={profiles}
        properties={properties}
        advisors={advisors}
        onSave={handleSave}
      />

      {/* View & Print Receipt Modal */}
      <ReceiptViewModal
        selectedReceipt={selectedReceipt}
        setSelectedReceipt={setSelectedReceipt}
        pdfLoading={pdfLoading}
        imageLoading={imageLoading}
        handleDownloadPDF={handleDownloadPDF}
        handleDownloadImage={handleDownloadImage}
      />

      {/* WhatsApp Share Receipt Modal */}
      <ReceiptWhatsAppModal receipt={whatsAppReceipt} onClose={() => setWhatsAppReceipt(null)} />

      {/* Master Customer Ledgers Modal (Overall Ledger) */}
      {isLedgersModalOpen && (
        <ReceiptLedgersModal
          receipts={allLedgerReceipts}
          dealValuesMap={dealValuesMap}
          onSelectLedger={(refId) => {
            setIsLedgersModalOpen(false);
            openClientLedger(refId);
          }}
          onClose={() => setIsLedgersModalOpen(false)}
        />
      )}

      {/* Per-Client Ledger Statement Drawer */}
      <ReceiptLedgerDrawer
        refId={activeLedgerRefId}
        allReceipts={allLedgerReceipts}
        dealValue={getDealValueForRef(activeLedgerRefId)}
        plotArea={getPlotAreaForRef(activeLedgerRefId)}
        onSaveDealValue={handleSaveDealValue}
        onClose={() => setActiveLedgerRefId(null)}
        onSelectReceipt={setSelectedReceipt}
      />
    </>
  );
}
