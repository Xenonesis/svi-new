import { useState, useCallback } from 'react';
import type React from 'react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import type { SalaryStructure, PayrollItem } from '@/src/lib/payroll/types';

export interface UseWorkforcePageModalsOptions {
  tokenRef: React.MutableRefObject<string>;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export interface UseWorkforcePageModalsReturn {
  // Modal / Drawer visibility & targets
  showAddModal: boolean;
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  showBulkImportModal: boolean;
  setShowBulkImportModal: React.Dispatch<React.SetStateAction<boolean>>;
  editingEmployee: Employee | null;
  setEditingEmployee: React.Dispatch<React.SetStateAction<Employee | null>>;
  resetTarget: Employee | null;
  setResetTarget: React.Dispatch<React.SetStateAction<Employee | null>>;
  performanceTarget: Employee | null;
  setPerformanceTarget: React.Dispatch<React.SetStateAction<Employee | null>>;
  isMarkModalOpen: boolean;
  setIsMarkModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // UI Confirmation Modal targets & loading state
  employeeToDelete: Employee | null;
  setEmployeeToDelete: React.Dispatch<React.SetStateAction<Employee | null>>;
  deletingEmployee: boolean;
  setDeletingEmployee: React.Dispatch<React.SetStateAction<boolean>>;
  toggleActiveTarget: Employee | null;
  setToggleActiveTarget: React.Dispatch<React.SetStateAction<Employee | null>>;
  togglingActive: boolean;
  setTogglingActive: React.Dispatch<React.SetStateAction<boolean>>;

  // Payroll sub-tab & drawer state
  payrollSubTab: 'monthly' | 'structures';
  setPayrollSubTab: React.Dispatch<React.SetStateAction<'monthly' | 'structures'>>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingStructure: SalaryStructure | null;
  setEditingStructure: React.Dispatch<React.SetStateAction<SalaryStructure | null>>;
  previewPayslipItem: PayrollItem | null;
  setPreviewPayslipItem: React.Dispatch<React.SetStateAction<PayrollItem | null>>;

  // Action handlers
  handleConfirmDeleteEmployee: () => Promise<void>;
  handleConfirmToggleActive: () => Promise<void>;

  // Toast helper
  showToast: (type: 'success' | 'error', text: string) => void;
}

export function useWorkforcePageModals(
  options: UseWorkforcePageModalsOptions
): UseWorkforcePageModalsReturn;
export function useWorkforcePageModals(
  tokenRef: React.MutableRefObject<string>,
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>
): UseWorkforcePageModalsReturn;
export function useWorkforcePageModals(
  tokenRefOrOptions: React.MutableRefObject<string> | UseWorkforcePageModalsOptions,
  setEmployeesArg?: React.Dispatch<React.SetStateAction<Employee[]>>
): UseWorkforcePageModalsReturn {
  const tokenRef = 'tokenRef' in tokenRefOrOptions ? tokenRefOrOptions.tokenRef : tokenRefOrOptions;
  const setEmployees =
    'setEmployees' in tokenRefOrOptions ? tokenRefOrOptions.setEmployees : setEmployeesArg!;

  // Modal / Drawer visibility & targets
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [resetTarget, setResetTarget] = useState<Employee | null>(null);
  const [performanceTarget, setPerformanceTarget] = useState<Employee | null>(null);
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);

  // UI Confirmation Modal targets
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState(false);
  const [toggleActiveTarget, setToggleActiveTarget] = useState<Employee | null>(null);
  const [togglingActive, setTogglingActive] = useState(false);

  // Payroll sub-tab & drawer state
  const [payrollSubTab, setPayrollSubTab] = useState<'monthly' | 'structures'>('monthly');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);
  const [previewPayslipItem, setPreviewPayslipItem] = useState<PayrollItem | null>(null);

  // Toast Helper
  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    if (type === 'success') toast.success(text);
    else toast.error(text);
  }, []);

  // Delete Employee Handler (triggered from UI modal)
  const handleConfirmDeleteEmployee = useCallback(async () => {
    if (!employeeToDelete) return;
    try {
      setDeletingEmployee(true);
      const activeToken = tokenRef.current;
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch(`/api/admin/employees/${employeeToDelete.id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, 'Failed to delete employee'));
      }
      setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete.id));
      showToast('success', 'Employee removed successfully');
      setEmployeeToDelete(null);
    } catch (err: unknown) {
      showToast('error', extractApiErrorMessage(err, 'Failed to delete employee'));
    } finally {
      setDeletingEmployee(false);
    }
  }, [employeeToDelete, tokenRef, setEmployees, showToast]);

  // Toggle Employee Enable / Disable (triggered from UI modal)
  const handleConfirmToggleActive = useCallback(async () => {
    if (!toggleActiveTarget) return;
    const currentActive = toggleActiveTarget.is_active ?? true;
    const nextStatus = !currentActive;
    const actionLabel = nextStatus ? 'enabled' : 'disabled';

    try {
      setTogglingActive(true);
      const activeToken = tokenRef.current;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch(`/api/admin/employees/${toggleActiveTarget.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_active: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          extractApiErrorMessage(data, `Failed to ${nextStatus ? 'enable' : 'disable'} employee`)
        );
      }

      setEmployees((prev) =>
        prev.map((e) => (e.id === toggleActiveTarget.id ? { ...e, is_active: nextStatus } : e))
      );
      showToast('success', `${toggleActiveTarget.full_name} has been ${actionLabel}`);
      setToggleActiveTarget(null);
    } catch (err: unknown) {
      showToast(
        'error',
        extractApiErrorMessage(err, `Failed to ${nextStatus ? 'enable' : 'disable'} employee`)
      );
    } finally {
      setTogglingActive(false);
    }
  }, [toggleActiveTarget, tokenRef, setEmployees, showToast]);

  return {
    showAddModal,
    setShowAddModal,
    showBulkImportModal,
    setShowBulkImportModal,
    editingEmployee,
    setEditingEmployee,
    resetTarget,
    setResetTarget,
    performanceTarget,
    setPerformanceTarget,
    isMarkModalOpen,
    setIsMarkModalOpen,
    employeeToDelete,
    setEmployeeToDelete,
    deletingEmployee,
    setDeletingEmployee,
    toggleActiveTarget,
    setToggleActiveTarget,
    togglingActive,
    setTogglingActive,
    payrollSubTab,
    setPayrollSubTab,
    isDrawerOpen,
    setIsDrawerOpen,
    editingStructure,
    setEditingStructure,
    previewPayslipItem,
    setPreviewPayslipItem,
    handleConfirmDeleteEmployee,
    handleConfirmToggleActive,
    showToast,
  };
}
