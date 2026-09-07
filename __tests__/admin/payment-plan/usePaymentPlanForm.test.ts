import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePaymentPlanForm } from '@/src/components/admin/payment-plan/usePaymentPlanForm';

const mockExportToPDF = vi.fn();
const mockExportToImage = vi.fn();

vi.mock('@/src/lib/utils/documentExporter', () => ({
  exportToPDF: (...args: unknown[]) => mockExportToPDF(...args),
  exportToImage: (...args: unknown[]) => mockExportToImage(...args),
}));

vi.mock('@/src/stores/authStore', () => ({
  useAuthStore: () => ({ token: 'test-admin-token' }),
}));

describe('usePaymentPlanForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        document: { id: 'doc-123', status: 'draft' },
      }),
    } as unknown as Response);
  });

  it('initializes with default form data and initial state', () => {
    const { result } = renderHook(() => usePaymentPlanForm());

    expect(result.current.formData.unitNo).toBe('');
    expect(result.current.formData.plotSize).toBe('');
    expect(result.current.formData.propertyType).toBe('Residential Farm House');
    expect(result.current.formData.emis).toBe('12');
    expect(result.current.preview).toBe(false);
    expect(result.current.documentId).toBeNull();
    expect(result.current.schedule).toEqual([]);
    expect(result.current.totals).toEqual({
      totalCost: 0,
      balance: 0,
      emiAmount: 0,
    });
  });

  it('updates form fields via handleChange', () => {
    const { result } = renderHook(() => usePaymentPlanForm());

    act(() => {
      result.current.handleChange({
        target: { name: 'unitNo', value: 'A-101' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.unitNo).toBe('A-101');

    act(() => {
      result.current.handleChange({
        target: { name: 'plotSize', value: '250' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.plotSize).toBe('250');
  });

  it('calculates plan, generates schedule, saves draft document and enables preview', async () => {
    const { result } = renderHook(() => usePaymentPlanForm());

    act(() => {
      result.current.handleChange({
        target: { name: 'plotSize', value: '100' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'costPerSqYd', value: '2000' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'bookingAmount', value: '50000' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'emis', value: '3' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'startDate', value: '2026-01-15' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const mockPreventDefault = vi.fn();
    await act(async () => {
      await result.current.calculatePlan({
        preventDefault: mockPreventDefault,
      } as unknown as React.FormEvent);
    });

    expect(mockPreventDefault).toHaveBeenCalled();
    expect(result.current.totals).toEqual({
      totalCost: 200000,
      balance: 150000,
      emiAmount: 50000,
    });

    expect(result.current.schedule).toHaveLength(3);
    expect(result.current.schedule[0]).toEqual({
      month: 1,
      date: expect.any(String),
      amount: '50000.00',
    });
    expect(result.current.preview).toBe(true);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/documents',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-admin-token',
        }),
      })
    );
    expect(result.current.documentId).toBe('doc-123');
  });

  it('handles handleDownloadPDF and updates document status to completed', async () => {
    const { result } = renderHook(() => usePaymentPlanForm());

    act(() => {
      result.current.setDocumentId('doc-456');
    });

    await act(async () => {
      await result.current.handleDownloadPDF();
    });

    expect(mockExportToPDF).toHaveBeenCalledWith({
      elementId: 'planPreview',
      filename: 'Payment_Plan.pdf',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/documents/doc-456',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      })
    );
  });

  it('handles handleDownloadImage', async () => {
    const { result } = renderHook(() => usePaymentPlanForm());

    await act(async () => {
      await result.current.handleDownloadImage();
    });

    expect(mockExportToImage).toHaveBeenCalledWith({
      elementId: 'planPreview',
      filename: 'Payment_Plan.png',
    });
  });
});
