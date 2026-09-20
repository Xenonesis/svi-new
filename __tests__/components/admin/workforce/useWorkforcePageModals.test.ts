import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type React from 'react';
import { toast } from 'sonner';
import { useWorkforcePageModals } from '@/src/components/admin/workforce/useWorkforcePageModals';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import type { SalaryStructure, PayrollItem } from '@/src/lib/payroll/types';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useWorkforcePageModals', () => {
  let tokenRef: React.MutableRefObject<string>;
  let setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  const mockEmployee: Employee = {
    id: 'emp-1',
    full_name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    department: 'Sales',
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    is_active: true,
  };

  const mockStructure: SalaryStructure = {
    id: 'struct-1',
    user_id: 'emp-1',
    base_salary: 50000,
    basic_pay: 30000,
    hra: 15000,
    special_allowance: 5000,
    conveyance_allowance: 0,
    medical_allowance: 0,
    pf_deduction: 1800,
    esi_deduction: 0,
    professional_tax: 200,
    tds: 0,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const mockPayrollItem: PayrollItem = {
    id: 'payroll-item-1',
    payroll_id: 'run-1',
    user_id: 'emp-1',
    month_year: '2026-01',
    employee_name: 'John Doe',
    employee_email: 'john@example.com',
    employee_department: 'Sales',
    employee_phone: '1234567890',
    total_month_days: 31,
    working_days: 26,
    present_days: 26,
    half_days: 0,
    paid_leaves: 0,
    lop_days: 0,
    absent_days: 0,
    base_salary: 50000,
    basic_pay: 30000,
    hra: 15000,
    special_allowance: 5000,
    conveyance_allowance: 0,
    medical_allowance: 0,
    gross_earnings: 50000,
    lop_deduction: 0,
    pf_deduction: 1800,
    esi_deduction: 0,
    professional_tax: 200,
    tds: 0,
    advance_deduction: 0,
    other_deductions: 0,
    incentive_bonus: 0,
    total_deductions: 2000,
    net_salary: 48000,
    payment_status: 'paid',
    is_download_allowed: true,
    download_count: 0,
  };
  beforeEach(() => {
    vi.clearAllMocks();
    tokenRef = { current: 'test-token' };
    setEmployees = vi.fn();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with correct default state values', () => {
    const { result } = renderHook(() => useWorkforcePageModals(tokenRef, setEmployees));

    expect(result.current.showAddModal).toBe(false);
    expect(result.current.showBulkImportModal).toBe(false);
    expect(result.current.editingEmployee).toBeNull();
    expect(result.current.resetTarget).toBeNull();
    expect(result.current.performanceTarget).toBeNull();
    expect(result.current.isMarkModalOpen).toBe(false);

    expect(result.current.employeeToDelete).toBeNull();
    expect(result.current.deletingEmployee).toBe(false);
    expect(result.current.toggleActiveTarget).toBeNull();
    expect(result.current.togglingActive).toBe(false);

    expect(result.current.payrollSubTab).toBe('monthly');
    expect(result.current.isDrawerOpen).toBe(false);
    expect(result.current.editingStructure).toBeNull();
    expect(result.current.previewPayslipItem).toBeNull();
  });

  it('supports options object signature as well as positional signature', () => {
    const { result: positionalResult } = renderHook(() =>
      useWorkforcePageModals(tokenRef, setEmployees)
    );
    const { result: optionsResult } = renderHook(() =>
      useWorkforcePageModals({ tokenRef, setEmployees })
    );

    expect(positionalResult.current.payrollSubTab).toBe('monthly');
    expect(optionsResult.current.payrollSubTab).toBe('monthly');
  });

  it('updates modal and drawer visibility state when setters are called', () => {
    const { result } = renderHook(() => useWorkforcePageModals(tokenRef, setEmployees));

    act(() => {
      result.current.setShowAddModal(true);
      result.current.setShowBulkImportModal(true);
      result.current.setEditingEmployee(mockEmployee);
      result.current.setResetTarget(mockEmployee);
      result.current.setPerformanceTarget(mockEmployee);
      result.current.setIsMarkModalOpen(true);
      result.current.setPayrollSubTab('structures');
      result.current.setIsDrawerOpen(true);
      result.current.setEditingStructure(mockStructure);
      result.current.setPreviewPayslipItem(mockPayrollItem);
    });

    expect(result.current.showAddModal).toBe(true);
    expect(result.current.showBulkImportModal).toBe(true);
    expect(result.current.editingEmployee).toEqual(mockEmployee);
    expect(result.current.resetTarget).toEqual(mockEmployee);
    expect(result.current.performanceTarget).toEqual(mockEmployee);
    expect(result.current.isMarkModalOpen).toBe(true);
    expect(result.current.payrollSubTab).toBe('structures');
    expect(result.current.isDrawerOpen).toBe(true);
    expect(result.current.editingStructure).toEqual(mockStructure);
    expect(result.current.previewPayslipItem).toEqual(mockPayrollItem);
  });

  describe('handleConfirmDeleteEmployee', () => {
    it('does nothing if employeeToDelete is null', async () => {
      const { result } = renderHook(() => useWorkforcePageModals(tokenRef, setEmployees));

      await act(async () => {
        await result.current.handleConfirmDeleteEmployee();
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(setEmployees).not.toHaveBeenCalled();
    });

    it('successfully deletes an employee and updates state', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { result } = renderHook(() => useWorkforcePageModals(tokenRef, setEmployees));

      act(() => {
        result.current.setEmployeeToDelete(mockEmployee);
      });

      await act(async () => {
        await result.current.handleConfirmDeleteEmployee();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/admin/employees/emp-1', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer test-token' },
      });
      expect(setEmployees).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Employee removed successfully');
      expect(result.current.employeeToDelete).toBeNull();
      expect(result.current.deletingEmployee).toBe(false);
    });

    it('handles delete failure gracefully and shows toast error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Forbidden' }),
      } as Response);

      const { result } = renderHook(() => useWorkforcePageModals(tokenRef, setEmployees));

      act(() => {
        result.current.setEmployeeToDelete(mockEmployee);
      });

      await act(async () => {
        await result.current.handleConfirmDeleteEmployee();
      });

      expect(toast.error).toHaveBeenCalledWith('Forbidden');
      expect(result.current.deletingEmployee).toBe(false);
    });
  });

  describe('handleConfirmToggleActive', () => {
    it('does nothing if toggleActiveTarget is null', async () => {
      const { result } = renderHook(() => useWorkforcePageModals(tokenRef, setEmployees));

      await act(async () => {
        await result.current.handleConfirmToggleActive();
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(setEmployees).not.toHaveBeenCalled();
    });

    it('successfully disables an active employee', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { result } = renderHook(() => useWorkforcePageModals(tokenRef, setEmployees));

      act(() => {
        result.current.setToggleActiveTarget(mockEmployee);
      });

      await act(async () => {
        await result.current.handleConfirmToggleActive();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/admin/employees/emp-1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ is_active: false }),
      });
      expect(setEmployees).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('John Doe has been disabled');
      expect(result.current.toggleActiveTarget).toBeNull();
      expect(result.current.togglingActive).toBe(false);
    });

    it('successfully enables an inactive employee', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { result } = renderHook(() => useWorkforcePageModals(tokenRef, setEmployees));

      act(() => {
        result.current.setToggleActiveTarget({ ...mockEmployee, is_active: false });
      });

      await act(async () => {
        await result.current.handleConfirmToggleActive();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/admin/employees/emp-1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ is_active: true }),
      });
      expect(toast.success).toHaveBeenCalledWith('John Doe has been enabled');
      expect(result.current.toggleActiveTarget).toBeNull();
      expect(result.current.togglingActive).toBe(false);
    });

    it('handles toggle failure gracefully and shows toast error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      } as Response);

      const { result } = renderHook(() => useWorkforcePageModals(tokenRef, setEmployees));

      act(() => {
        result.current.setToggleActiveTarget(mockEmployee);
      });

      await act(async () => {
        await result.current.handleConfirmToggleActive();
      });

      expect(toast.error).toHaveBeenCalledWith('Server error');
      expect(result.current.togglingActive).toBe(false);
    });
  });

  describe('showToast helper', () => {
    it('dispatches to toast.success and toast.error', () => {
      const { result } = renderHook(() => useWorkforcePageModals(tokenRef, setEmployees));

      act(() => {
        result.current.showToast('success', 'Operation succeeded');
        result.current.showToast('error', 'Operation failed');
      });

      expect(toast.success).toHaveBeenCalledWith('Operation succeeded');
      expect(toast.error).toHaveBeenCalledWith('Operation failed');
    });
  });
});
