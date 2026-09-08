import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmployeePayroll } from '@/src/components/employee/payroll/useEmployeePayroll';
import { supabase } from '@/src/lib/supabase/client';
import { toast } from 'sonner';
import type { PayrollItem, SalaryStructure } from '@/src/lib/payroll/types';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockGetSession = vi.fn();

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
    },
  },
}));

describe('useEmployeePayroll', () => {
  const mockSalaryStructure: SalaryStructure = {
    id: 'struct-1',
    user_id: 'user-1',
    base_salary: 50000,
    basic_pay: 25000,
    hra: 15000,
    special_allowance: 10000,
    conveyance_allowance: 0,
    medical_allowance: 0,
    pf_deduction: 0,
    esi_deduction: 0,
    professional_tax: 200,
    tds: 0,
    is_active: true,
    bank_name: 'HDFC Bank',
    account_number: '1234567890',
    ifsc_code: 'HDFC0001234',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const mockPayrolls: Array<PayrollItem & { is_downloadable: boolean; status_message: string }> = [
    {
      id: 'pay-1',
      payroll_id: 'pr-1',
      user_id: 'user-1',
      month_year: '2026-08',
      base_salary: 50000,
      basic_pay: 25000,
      hra: 15000,
      special_allowance: 10000,
      conveyance_allowance: 0,
      medical_allowance: 0,
      gross_earnings: 50000,
      lop_deduction: 0,
      pf_deduction: 0,
      esi_deduction: 0,
      professional_tax: 200,
      tds: 0,
      advance_deduction: 0,
      other_deductions: 0,
      working_days: 26,
      present_days: 26,
      half_days: 0,
      paid_leaves: 0,
      absent_days: 0,
      lop_days: 0,
      net_salary: 49800,
      total_deductions: 200,
      total_month_days: 31,
      incentive_bonus: 0,
      payment_status: 'paid',
      is_download_allowed: true,
      download_count: 0,
      is_downloadable: true,
      status_message: 'Approved for download',
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
    },
    {
      id: 'pay-2',
      payroll_id: 'pr-1',
      user_id: 'user-1',
      month_year: '2026-07',
      base_salary: 50000,
      basic_pay: 25000,
      hra: 15000,
      special_allowance: 10000,
      conveyance_allowance: 0,
      medical_allowance: 0,
      gross_earnings: 50000,
      lop_deduction: 4800,
      pf_deduction: 0,
      esi_deduction: 0,
      professional_tax: 200,
      tds: 0,
      advance_deduction: 0,
      other_deductions: 0,
      working_days: 26,
      present_days: 24,
      half_days: 0,
      paid_leaves: 0,
      absent_days: 2,
      lop_days: 2,
      net_salary: 45000,
      total_deductions: 5000,
      total_month_days: 31,
      incentive_bonus: 0,
      payment_status: 'pending',
      is_download_allowed: false,
      download_count: 0,
      is_downloadable: false,
      status_message: 'Pending Admin review',
      created_at: '2026-08-01T00:00:00Z',
      updated_at: '2026-08-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'mock-token',
        },
      },
      error: null,
    });

    global.fetch = vi.fn().mockImplementation(async (url: string | URL | Request) => {
      const urlStr = url.toString();

      if (urlStr === '/api/employee/payroll') {
        return {
          ok: true,
          json: async () => ({
            salaryStructure: mockSalaryStructure,
            payrolls: mockPayrolls,
          }),
        } as Response;
      }

      if (urlStr.includes('/payslip')) {
        return {
          ok: true,
          json: async () => ({
            locked: false,
            item: mockPayrolls[0],
          }),
        } as Response;
      }

      return { ok: true, json: async () => ({}) } as Response;
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads payroll overview on mount with token', async () => {
    const { result } = renderHook(() => useEmployeePayroll());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.viewingPayslipItem).toBe(null);
    expect(result.current.fetchingDetailId).toBe(null);

    await act(async () => {
      await result.current.fetchOverview();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data?.salaryStructure?.bank_name).toBe('HDFC Bank');
    expect(result.current.data?.payrolls).toHaveLength(2);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/employee/payroll',
      expect.objectContaining({
        headers: { Authorization: 'Bearer mock-token' },
      })
    );
  });

  it('shows error if session token is missing during fetchOverview', async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useEmployeePayroll());

    await act(async () => {
      await result.current.fetchOverview();
    });

    expect(toast.error).toHaveBeenCalledWith('Session expired. Please log in.');
  });

  it('blocks opening payslip if not downloadable', async () => {
    const { result } = renderHook(() => useEmployeePayroll());

    await act(async () => {
      await result.current.fetchOverview();
    });

    const lockedItem = mockPayrolls[1];

    await act(async () => {
      await result.current.handleOpenPayslip(lockedItem);
    });

    expect(toast.error).toHaveBeenCalledWith(
      'Payslip download is strictly locked until allowed by Admin.'
    );
    expect(result.current.viewingPayslipItem).toBe(null);
  });

  it('fetches payslip document when item is downloadable', async () => {
    const { result } = renderHook(() => useEmployeePayroll());

    await act(async () => {
      await result.current.fetchOverview();
    });

    const downloadableItem = mockPayrolls[0];

    await act(async () => {
      await result.current.handleOpenPayslip(downloadableItem);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/employee/payroll/${downloadableItem.id}/payslip`,
      expect.objectContaining({
        headers: { Authorization: 'Bearer mock-token' },
      })
    );
    expect(result.current.viewingPayslipItem?.id).toBe(downloadableItem.id);
    expect(result.current.fetchingDetailId).toBe(null);
  });

  it('handles locked response from payslip endpoint', async () => {
    vi.mocked(global.fetch).mockImplementation(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('/payslip')) {
        return {
          ok: true,
          json: async () => ({
            locked: true,
            message: 'Payslip currently locked',
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          salaryStructure: mockSalaryStructure,
          payrolls: mockPayrolls,
        }),
      } as Response;
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useEmployeePayroll());

    await act(async () => {
      await result.current.fetchOverview();
    });

    await act(async () => {
      await result.current.handleOpenPayslip(mockPayrolls[0]);
    });

    expect(toast.error).toHaveBeenCalledWith('Payslip currently locked');
    expect(result.current.viewingPayslipItem).toBe(null);
  });
});
