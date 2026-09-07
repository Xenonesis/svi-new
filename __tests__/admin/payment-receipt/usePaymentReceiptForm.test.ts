import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePaymentReceiptForm } from '@/app/admin/payment-receipt/hooks/usePaymentReceiptForm';

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/src/stores/authStore', () => ({
  useAuthStore: () => ({ token: 'mock-token' }),
}));

describe('usePaymentReceiptForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/settings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ value: null }),
        });
      }
      if (url.includes('/api/admin/documents')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ documents: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  it('initializes with default form data and empty preview', () => {
    const { result } = renderHook(() => usePaymentReceiptForm());

    expect(result.current.formData.paymentMethod).toBe('UPI');
    expect(result.current.formData.salutation).toBe('Mr.');
    expect(result.current.preview).toBe(false);
    expect(result.current.termsAccepted).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('updates amount and auto-calculates amountWords via handleChange', () => {
    const { result } = renderHook(() => usePaymentReceiptForm());

    act(() => {
      result.current.handleChange({
        target: { name: 'amount', value: '16042' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.amount).toBe('16042');
    expect(result.current.formData.amountWords).toBe('Sixteen Thousand Forty Two Rupees Only');
  });

  it('resets termsAccepted if amount changed to something other than 2100', () => {
    const { result } = renderHook(() => usePaymentReceiptForm());

    act(() => {
      result.current.setTermsAccepted(true);
    });
    expect(result.current.termsAccepted).toBe(true);

    act(() => {
      result.current.handleChange({
        target: { name: 'amount', value: '5000' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.termsAccepted).toBe(false);
  });

  it('resets form state on handleResetForm', () => {
    const { result } = renderHook(() => usePaymentReceiptForm());

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Test User' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.setPreview(true);
    });

    expect(result.current.formData.name).toBe('Test User');
    expect(result.current.preview).toBe(true);

    act(() => {
      result.current.handleResetForm();
    });

    expect(result.current.formData.name).toBe('');
    expect(result.current.preview).toBe(false);
  });
});
