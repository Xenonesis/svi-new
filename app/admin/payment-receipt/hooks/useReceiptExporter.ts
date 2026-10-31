import { toast } from 'sonner';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import type { ReceiptLike } from '@/src/lib/receipt/receiptNumber';
import type { PaymentReceiptFormData } from '../types';

interface UseReceiptExporterParams {
  formData: PaymentReceiptFormData;
  documentId: string | null;
  token: string | null;
  setReceipts: React.Dispatch<React.SetStateAction<ReceiptLike[]>>;
}

export function useReceiptExporter({
  formData,
  documentId,
  token,
  setReceipts,
}: UseReceiptExporterParams) {
  const markDocumentCompleted = async () => {
    if (!documentId || !token) return;
    try {
      await fetch(`/api/admin/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'completed' }),
      });
      setReceipts((prev) =>
        prev.map((d) => (d.id === documentId ? { ...d, status: 'completed' } : d))
      );
    } catch (error) {
      console.error('Failed to update document status:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const clientName = formData.name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
      const receiptNo = formData.receiptNo.trim().replace(/[^a-zA-Z0-9]/g, '');
      const filename =
        clientName && receiptNo
          ? `${clientName} ${receiptNo}.pdf`
          : clientName
            ? `${clientName}.pdf`
            : 'Receipt.pdf';

      await exportToPDF({
        elementId: 'receiptPreview',
        filename,
      });

      await markDocumentCompleted();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleDownloadImage = async () => {
    try {
      const clientName = formData.name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
      const receiptNo = formData.receiptNo.trim().replace(/[^a-zA-Z0-9]/g, '');
      const filename =
        clientName && receiptNo
          ? `${clientName} ${receiptNo}.png`
          : clientName
            ? `${clientName}.png`
            : 'Receipt.png';

      await exportToImage({
        elementId: 'receiptPreview',
        filename,
      });

      await markDocumentCompleted();
    } catch (error) {
      console.error('Error generating Image:', error);
      toast.error('Failed to generate Image');
    }
  };

  return {
    handleDownloadPDF,
    handleDownloadImage,
  };
}
