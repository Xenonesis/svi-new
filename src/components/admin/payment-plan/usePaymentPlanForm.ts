'use client';

import { useState } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import {
  PaymentPlanFormData,
  PaymentPlanScheduleItem,
  PaymentPlanTotals,
  UsePaymentPlanFormReturn,
} from './types';

const initialFormData: PaymentPlanFormData = {
  unitNo: '',
  plotSize: '',
  propertyType: 'Residential Farm House',
  costPerSqYd: '',
  bookingAmount: '',
  emis: '12',
  startDate: new Date().toISOString().split('T')[0],
};

export function usePaymentPlanForm(): UsePaymentPlanFormReturn {
  const { token } = useAuthStore();
  const [formData, setFormData] = useState<PaymentPlanFormData>(initialFormData);
  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<PaymentPlanScheduleItem[]>([]);
  const [totals, setTotals] = useState<PaymentPlanTotals>({
    totalCost: 0,
    balance: 0,
    emiAmount: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculatePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    const size = parseFloat(formData.plotSize) || 0;
    const rate = parseFloat(formData.costPerSqYd) || 0;
    const booking = parseFloat(formData.bookingAmount) || 0;
    const emiCount = parseInt(formData.emis) || 1;

    const totalCost = size * rate;
    const balance = totalCost - booking;
    const emiAmount = balance / emiCount;

    const newSchedule: PaymentPlanScheduleItem[] = [];
    const start = new Date(formData.startDate);

    for (let i = 1; i <= emiCount; i++) {
      const emiDate = new Date(start);
      emiDate.setMonth(start.getMonth() + i);

      newSchedule.push({
        month: i,
        date: emiDate.toLocaleDateString('en-GB'),
        amount: emiAmount.toFixed(2),
      });
    }

    setTotals({ totalCost, balance, emiAmount });
    setSchedule(newSchedule);

    // Save document record to database
    if (token) {
      try {
        const response = await fetch('/api/admin/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            document_type: 'payment_plan',
            form_data: {
              ...formData,
              schedule: newSchedule,
              totals: { totalCost, balance, emiAmount },
            },
            status: 'draft',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setDocumentId(data?.document?.id || data?.id || null);
        }
      } catch (error) {
        console.error('Failed to save document:', error);
      }
    }

    setPreview(true);
  };

  const handleDownloadPDF = async () => {
    try {
      await exportToPDF({
        elementId: 'planPreview',
        filename: 'Payment_Plan.pdf',
      });

      // Update document status to completed
      if (documentId && token) {
        try {
          await fetch(`/api/admin/documents/${documentId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'completed' }),
          });
        } catch (error) {
          console.error('Failed to update document status:', error);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDownloadImage = async () => {
    try {
      await exportToImage({
        elementId: 'planPreview',
        filename: 'Payment_Plan.png',
      });
    } catch (error) {
      console.error('Error generating Image:', error);
    }
  };

  return {
    formData,
    setFormData,
    preview,
    setPreview,
    documentId,
    setDocumentId,
    schedule,
    setSchedule,
    totals,
    setTotals,
    handleChange,
    calculatePlan,
    handleDownloadPDF,
    handleDownloadImage,
  };
}
