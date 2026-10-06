import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { usePaymentReceiptForm } from '@/app/admin/payment-receipt/hooks/usePaymentReceiptForm';
import { toast } from 'sonner';

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

  it('exports refIdProfiles and auto-fills fields via handleSelectRefProfile', () => {
    const { result } = renderHook(() => usePaymentReceiptForm());

    act(() => {
      result.current.handleSelectRefProfile({
        refId: 'SVI-TEST-100',
        name: 'Rahul Sharma',
        salutation: 'Dr.',
        clientPhone: '+91 9876543210',
        plotNo: 'Plot 42',
        plotSize: '1500 sqft',
        account: 'Project Green Hills',
        source: 'candidate',
      });
    });

    expect(result.current.formData.refId).toBe('SVI-TEST-100');
    expect(result.current.formData.name).toBe('Rahul Sharma');
    expect(result.current.formData.salutation).toBe('Dr.');
    expect(result.current.formData.clientPhone).toBe('+91 9876543210');
    expect(result.current.formData.plotNo).toBe('Plot 42');
    expect(result.current.formData.plotSize).toBe('1500 sqft');
    expect(result.current.formData.account).toBe('Project Green Hills');
    expect(toast.success).toHaveBeenCalledWith('Auto-filled details for SVI-TEST-100');
  });

  it('preserves existing form values when profile fields are blank', () => {
    const { result } = renderHook(() => usePaymentReceiptForm());

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Existing Name' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'salutation', value: 'Mrs.' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.handleSelectRefProfile({
        refId: 'PARTIAL-01',
        name: '',
        salutation: '',
        clientPhone: '',
        plotNo: '',
        plotSize: '',
        account: '',
        source: 'candidate',
      });
    });

    expect(result.current.formData.refId).toBe('PARTIAL-01');
    expect(result.current.formData.name).toBe('Existing Name');
    expect(result.current.formData.salutation).toBe('Mrs.');
  });

  it('fetches candidates and builds refIdProfiles with silent error handling', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/portal-allotments/candidates')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              candidates: [
                {
                  ticketId: 'CAND-555',
                  clientName: 'Fetched Candidate',
                  phone: '9988776655',
                  unitNo: 'Unit 5',
                  area: '2000',
                  projectName: 'Candidate Project',
                  bookingDate: '2026-03-01',
                },
              ],
            }),
        });
      }
      if (url.includes('/api/admin/documents')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              documents: [
                {
                  form_data: {
                    refId: 'RCPT-888',
                    name: 'Fetched Receipt',
                    salutation: 'Mr.',
                    clientPhone: '1122334455',
                    plotNo: 'Plot 8',
                    plotSize: '1200',
                    account: 'Receipt Project',
                  },
                },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    const { result } = renderHook(() => usePaymentReceiptForm());

    await waitFor(() => {
      expect(result.current.refIdProfiles.length).toBe(2);
    });

    const refIds = result.current.refIdProfiles.map((p) => p.refId);
    expect(refIds).toContain('CAND-555');
    expect(refIds).toContain('RCPT-888');
  });

  it('handles candidate fetch failure silently without breaking the hook', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/portal-allotments/candidates')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ documents: [] }),
      });
    });

    const { result } = renderHook(() => usePaymentReceiptForm());
    expect(result.current.refIdProfiles).toEqual([]);
  });
});
