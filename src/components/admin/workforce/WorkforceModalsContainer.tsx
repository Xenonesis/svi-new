'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import type { SalaryStructure, PayrollItem } from '@/src/lib/payroll/types';
import type { WorkforceTeam } from './types';
import type { UseWorkforcePageModalsReturn } from './useWorkforcePageModals';
import type { UseWorkforceDataReturn } from './useWorkforceData';
import { DeleteConfirm } from '@/src/components/admin/modals/DeleteConfirm';

const AddEmployeeModal = dynamic(
  () => import('@/src/components/admin/modals/AddEmployeeModal').then((m) => m.AddEmployeeModal),
  { ssr: false }
);
const BulkImportEmployeesModal = dynamic(
  () =>
    import('@/src/components/admin/employees/BulkImportEmployeesModal').then(
      (m) => m.BulkImportEmployeesModal
    ),
  { ssr: false }
);
const EditEmployeeModal = dynamic(
  () =>
    import('@/src/components/admin/employees/EditEmployeeModal').then((m) => m.EditEmployeeModal),
  { ssr: false }
);
const ResetPasswordModal = dynamic(
  () =>
    import('@/src/components/admin/employees/ResetPasswordModal').then((m) => m.ResetPasswordModal),
  { ssr: false }
);
const EmployeePerformanceModal = dynamic(
  () =>
    import('@/src/components/admin/employees/EmployeePerformanceModal').then(
      (m) => m.EmployeePerformanceModal
    ),
  { ssr: false }
);
const MarkAttendance = dynamic(() => import('@/src/components/admin/attendance/MarkAttendance'), {
  ssr: false,
});
const EmployeeSalarySetupDrawer = dynamic(
  () =>
    import('@/src/components/admin/payroll/EmployeeSalarySetupDrawer').then(
      (m) => m.EmployeeSalarySetupDrawer
    ),
  { ssr: false }
);
const PayslipDocument = dynamic(
  () => import('@/src/components/admin/payroll/PayslipDocument').then((m) => m.PayslipDocument),
  { ssr: false }
);

export interface WorkforceModalsContainerProps {
  token: string;
  modals?: UseWorkforcePageModalsReturn;
  data?: UseWorkforceDataReturn;
  initialPerformanceTab?: 'kpi' | 'leads';
  showAddModal?: boolean;
  setShowAddModal?: (show: boolean) => void;
  showBulkImportModal?: boolean;
  setShowBulkImportModal?: (show: boolean) => void;
  editingEmployee?: Employee | null;
  setEditingEmployee?: (emp: Employee | null) => void;
  resetTarget?: Employee | null;
  setResetTarget?: (emp: Employee | null) => void;
  performanceTarget?: Employee | null;
  setPerformanceTarget?: (emp: Employee | null) => void;
  isMarkModalOpen?: boolean;
  setIsMarkModalOpen?: (open: boolean) => void;
  isDrawerOpen?: boolean;
  setIsDrawerOpen?: (open: boolean) => void;
  editingStructure?: SalaryStructure | null;
  setEditingStructure?: (struct: SalaryStructure | null) => void;
  previewPayslipItem?: PayrollItem | null;
  setPreviewPayslipItem?: (item: PayrollItem | null) => void;
  employees?: Employee[];
  setEmployees?: React.Dispatch<React.SetStateAction<Employee[]>>;
  teams?: WorkforceTeam[];
  teamsLoading?: boolean;
  onRefreshEmployees?: () => void;
  onRefreshMetrics?: () => void;
  onRefreshSalaryStructures?: () => void;
  showToast?: (type: 'success' | 'error', text: string) => void;
}

export function WorkforceModalsContainer(props: WorkforceModalsContainerProps) {
  const { token, initialPerformanceTab } = props;

  const showAddModal = props.modals?.showAddModal ?? props.showAddModal ?? false;
  const setShowAddModal = props.modals?.setShowAddModal ?? props.setShowAddModal ?? (() => {});
  const showBulkImportModal =
    props.modals?.showBulkImportModal ?? props.showBulkImportModal ?? false;
  const setShowBulkImportModal =
    props.modals?.setShowBulkImportModal ?? props.setShowBulkImportModal ?? (() => {});
  const editingEmployee = props.modals?.editingEmployee ?? props.editingEmployee ?? null;
  const setEditingEmployee =
    props.modals?.setEditingEmployee ?? props.setEditingEmployee ?? (() => {});
  const resetTarget = props.modals?.resetTarget ?? props.resetTarget ?? null;
  const setResetTarget = props.modals?.setResetTarget ?? props.setResetTarget ?? (() => {});
  const performanceTarget = props.modals?.performanceTarget ?? props.performanceTarget ?? null;
  const setPerformanceTarget =
    props.modals?.setPerformanceTarget ?? props.setPerformanceTarget ?? (() => {});
  const isMarkModalOpen = props.modals?.isMarkModalOpen ?? props.isMarkModalOpen ?? false;
  const setIsMarkModalOpen =
    props.modals?.setIsMarkModalOpen ?? props.setIsMarkModalOpen ?? (() => {});
  const isDrawerOpen = props.modals?.isDrawerOpen ?? props.isDrawerOpen ?? false;
  const setIsDrawerOpen = props.modals?.setIsDrawerOpen ?? props.setIsDrawerOpen ?? (() => {});
  const editingStructure = props.modals?.editingStructure ?? props.editingStructure ?? null;
  const setEditingStructure =
    props.modals?.setEditingStructure ?? props.setEditingStructure ?? (() => {});
  const previewPayslipItem = props.modals?.previewPayslipItem ?? props.previewPayslipItem ?? null;
  const setPreviewPayslipItem =
    props.modals?.setPreviewPayslipItem ?? props.setPreviewPayslipItem ?? (() => {});

  const employees = props.data?.employees ?? props.employees ?? [];
  const setEmployees = props.data?.setEmployees ?? props.setEmployees ?? (() => {});
  const teams = props.data?.teams ?? props.teams ?? [];
  const teamsLoading = props.teamsLoading ?? false;

  const onRefreshEmployees = () => {
    props.data?.fetchEmployees();
    props.onRefreshEmployees?.();
  };
  const onRefreshMetrics = () => {
    props.data?.fetchMetrics();
    props.onRefreshMetrics?.();
  };
  const onRefreshSalaryStructures = () => {
    props.data?.fetchSalaryStructures();
    props.onRefreshSalaryStructures?.();
  };
  const showToast = props.modals?.showToast ?? props.showToast ?? (() => {});

  return (
    <>
      {/* Directory Modals */}
      <AnimatePresence>
        {showAddModal && token && (
          <AddEmployeeModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              showToast('success', 'Employee profile created successfully');
              onRefreshEmployees();
            }}
            token={token}
          />
        )}
        {showBulkImportModal && token && (
          <BulkImportEmployeesModal
            onClose={() => setShowBulkImportModal(false)}
            onSuccess={() => {
              onRefreshEmployees();
              onRefreshMetrics();
            }}
            token={token}
          />
        )}
        {editingEmployee && token && (
          <EditEmployeeModal
            employee={editingEmployee}
            onClose={() => setEditingEmployee(null)}
            onSuccess={(updated) => {
              setEmployees((prev) =>
                prev.map((e) =>
                  e.id === editingEmployee.id
                    ? {
                        ...e,
                        full_name: updated.full_name,
                        phone: updated.phone,
                        department: updated.department,
                        notes: updated.notes,
                      }
                    : e
                )
              );
              setEditingEmployee(null);
            }}
            token={token}
          />
        )}
        {resetTarget && token && (
          <ResetPasswordModal
            employee={resetTarget}
            onClose={() => setResetTarget(null)}
            onSuccess={() => {
              setResetTarget(null);
              showToast('success', 'Password reset successfully');
            }}
            token={token}
          />
        )}
        {performanceTarget && (
          <EmployeePerformanceModal
            employee={performanceTarget}
            isOpen={!!performanceTarget}
            onClose={() => setPerformanceTarget(null)}
            token={token || ''}
            initialTab={initialPerformanceTab}
          />
        )}
      </AnimatePresence>

      {/* Attendance Mark Modal */}
      <AnimatePresence>
        {isMarkModalOpen && token && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMarkModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            >
              <button
                type="button"
                onClick={() => setIsMarkModalOpen(false)}
                className="absolute top-4 right-4 z-10 cursor-pointer rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <AlertCircle className="h-5 w-5 opacity-0" />
                <span className="sr-only">Close</span>
                <X className="absolute top-2 left-2 h-5 w-5" />
              </button>
              <div className="p-6 sm:p-8">
                <MarkAttendance
                  token={token}
                  showToast={showToast}
                  teams={teams}
                  teamsLoading={teamsLoading}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payroll Setup Drawer */}
      <EmployeeSalarySetupDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingStructure(null);
        }}
        onSaved={() => {
          onRefreshEmployees();
          onRefreshSalaryStructures();
        }}
        initialData={editingStructure}
        employees={employees}
        token={token || ''}
      />

      {/* Payslip Document Preview Modal */}
      {previewPayslipItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#111118]">
            <PayslipDocument
              item={previewPayslipItem}
              onClose={() => setPreviewPayslipItem(null)}
            />
          </div>
        </div>
      )}

      {/* UI Confirmation: Delete Employee Modal */}
      {props.modals?.employeeToDelete && (
        <DeleteConfirm
          title="Remove Employee?"
          itemName={props.modals.employeeToDelete.full_name}
          itemType="employee"
          description={`Are you sure you want to remove ${props.modals.employeeToDelete.full_name}? They will lose access to the workforce portal.`}
          confirmLabel="Remove"
          loading={props.modals.deletingEmployee}
          onConfirm={props.modals.handleConfirmDeleteEmployee}
          onClose={() => props.modals?.setEmployeeToDelete(null)}
        />
      )}

      {/* UI Confirmation: Toggle Active Status Modal */}
      {props.modals?.toggleActiveTarget && (
        <DeleteConfirm
          title={
            props.modals.toggleActiveTarget.is_active
              ? 'Disable Employee Account?'
              : 'Enable Employee Account?'
          }
          itemName={props.modals.toggleActiveTarget.full_name}
          itemType="employee"
          description={`Are you sure you want to ${props.modals.toggleActiveTarget.is_active ? 'disable' : 'enable'} ${props.modals.toggleActiveTarget.full_name}'s account?`}
          confirmLabel={props.modals.toggleActiveTarget.is_active ? 'Disable' : 'Enable'}
          loading={props.modals.togglingActive}
          onConfirm={props.modals.handleConfirmToggleActive}
          onClose={() => props.modals?.setToggleActiveTarget(null)}
        />
      )}
    </>
  );
}
