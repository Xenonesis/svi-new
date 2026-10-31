import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { getNextReceiptNumber, type ReceiptLike } from '@/src/lib/receipt/receiptNumber';
import { numberToWords } from '@/src/lib/receipt/numberToWords';
import type { PaymentReceiptFormData } from '../types';

interface UseReceiptPrefillParams {
  receipts: ReceiptLike[];
  setFormData: React.Dispatch<React.SetStateAction<PaymentReceiptFormData>>;
  setDocumentId: React.Dispatch<React.SetStateAction<string | null>>;
  setPreview: React.Dispatch<React.SetStateAction<boolean>>;
}

const PROJECT_NAME_MAP: Record<string, string> = {
  'shyam-aangan': 'Shyam Aangan',
  'shyam-aangan-phase-1': 'Shyam Aangan Phase 1',
  'shyam-aangan-farm-house': 'Shyam Aangan Farm House',
  'shivani-vatika': 'Shivani Vatika',
  'shivani-vatika-11th': 'Shivani Vatika 11th',
  'shivani-vatika-11': 'Shivani Vatika 11th',
  'shivani vatika 11th': 'Shivani Vatika 11th',
  'shivani vatika': 'Shivani Vatika',
  'phulera-smartcity': 'Phulera SmartCity',
  'phulera-smart-city': 'Phulera SmartCity',
};

export function useReceiptPrefill({
  receipts,
  setFormData,
  setDocumentId,
  setPreview,
}: UseReceiptPrefillParams) {
  const templateProcessed = useRef(false);

  const loadFromRecord = useCallback(
    (id: string, recordsList: ReceiptLike[]) => {
      const record = recordsList.find((r) => r.id === id);
      if (record?.form_data) {
        const fd = record.form_data;
        const nextNo = getNextReceiptNumber(recordsList);
        setFormData({
          receiptNo: nextNo,
          date: new Date().toISOString().split('T')[0],
          salutation: (fd.salutation as string) || 'Mr.',
          name: (fd.name as string) || '',
          refId: (fd.refId as string) || '',
          amount: (fd.amount as string) || '',
          amountWords: (fd.amountWords as string) || '',
          paymentRef: (fd.paymentRef as string) || '',
          drawnOn: (fd.drawnOn as string) || '',
          plotNo: (fd.plotNo as string) || '',
          plotSize: (fd.plotSize as string) || '',
          account: (fd.account as string) || '',
          paymentMethod: (fd.paymentMethod as string) || 'UPI',
          clientPhone: (fd.clientPhone as string) || '',
        });
        setDocumentId(null);
        setPreview(false);
        toast.info(`Loaded template with next Receipt No: ${nextNo}`);
      }
    },
    [setFormData, setDocumentId, setPreview]
  );

  useEffect(() => {
    if (receipts.length > 0 && typeof window !== 'undefined' && !templateProcessed.current) {
      const searchParams = new URLSearchParams(window.location.search);
      const templateId = searchParams.get('templateId');
      if (templateId) {
        templateProcessed.current = true;
        loadFromRecord(templateId, receipts);
      }
    }
  }, [receipts, loadFromRecord]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const prefillRegistration = searchParams.get('prefillRegistration');
      if (prefillRegistration === 'true') {
        const storedReg = sessionStorage.getItem('receiptPrefillRegistration');
        if (storedReg) {
          try {
            const regData = JSON.parse(storedReg);

            let proj = regData.project || regData.property_interest;
            if (proj) {
              proj = PROJECT_NAME_MAP[proj.toLowerCase().trim()] || proj;
            }

            const schemeAmount = regData.scheme_amount || '';

            setFormData((prev) => ({
              ...prev,
              name: `${regData.name || ''} ${regData.last_name || ''}`.trim(),
              account: proj || prev.account,
              amount: schemeAmount || prev.amount,
              amountWords: schemeAmount ? numberToWords(schemeAmount) : prev.amountWords,
              refId: regData.submission_id || prev.refId,
            }));

            sessionStorage.removeItem('receiptPrefillRegistration');
          } catch (e) {
            console.error('Failed to parse prefill registration', e);
          }
        }
      }
    }
  }, [setFormData]);

  return {
    loadFromRecord,
  };
}
