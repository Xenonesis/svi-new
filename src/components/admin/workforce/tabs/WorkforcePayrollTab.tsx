'use client';

import React, { useState } from 'react';
import { Calendar, Users, Sparkles, Plus } from 'lucide-react';
import { MonthlyPayrollRunView } from '@/src/components/admin/payroll/MonthlyPayrollRunView';
import { SalaryStructuresTable } from '@/src/components/admin/payroll/SalaryStructuresTable';
import { SalaryStructureModal } from '@/src/components/admin/payroll/SalaryStructureModal';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import type { SalaryStructure, PayrollItem } from '@/src/lib/payroll/types';

export interface WorkforcePayrollTabProps {
  token: string;
  payrollSubTab: 'monthly' | 'structures';
  onPayrollSubTabChange: (subTab: 'monthly' | 'structures') => void;
  structures: SalaryStructure[];
  employees: Employee[];
  loadingStructures: boolean;
  onAddNewStructure?: () => void;
  onEditStructure?: (struct: SalaryStructure) => void;
  onViewPayslip: (item: PayrollItem) => void;
  onRefreshStructures?: () => void;
}

export function WorkforcePayrollTab({
  token,
  payrollSubTab,
  onPayrollSubTabChange,
  structures,
  employees,
  loadingStructures,
  onAddNewStructure,
  onEditStructure,
  onViewPayslip,
  onRefreshStructures,
}: WorkforcePayrollTabProps) {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [internalEditingStructure, setInternalEditingStructure] = useState<SalaryStructure | null>(
    null
  );

  const handleAddNew = () => {
    if (onAddNewStructure) {
      onAddNewStructure();
    } else {
      setInternalEditingStructure(null);
      setInternalModalOpen(true);
    }
  };

  const handleEdit = (struct: SalaryStructure) => {
    if (onEditStructure) {
      onEditStructure(struct);
    } else {
      setInternalEditingStructure(struct);
      setInternalModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payroll Sub-view Switcher & Actions Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-200/80 pb-4 sm:flex-row sm:items-center dark:border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
              Payroll &amp; Salary Administration
            </h2>
            {payrollSubTab === 'structures' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <Sparkles className="text-brand-gold h-3 w-3" /> Offer Letter Sync Active
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Configure staff CTC breakdown, auto-sync compensation terms from Offer Letters, and
            release payslips.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {payrollSubTab === 'structures' && (
            <button
              type="button"
              onClick={handleAddNew}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs transition-all hover:bg-emerald-500/20 active:scale-95 dark:text-emerald-300"
              title="Quick setup or auto-sync salary structure from employee offer letter"
            >
              <Sparkles className="text-brand-gold h-3.5 w-3.5" />
              <span>Sync from Offer Letter</span>
            </button>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-gray-50 p-1 dark:border-white/10 dark:bg-[#181822]">
            <button
              type="button"
              onClick={() => onPayrollSubTabChange('monthly')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase transition-all ${
                payrollSubTab === 'monthly'
                  ? 'border-brand-gold/30 bg-brand-gold/15 text-brand-gold border shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Monthly Runs
            </button>
            <button
              type="button"
              onClick={() => onPayrollSubTabChange('structures')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase transition-all ${
                payrollSubTab === 'structures'
                  ? 'border-brand-gold/30 bg-brand-gold/15 text-brand-gold border shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Salary Setup
            </button>
          </div>
        </div>
      </div>

      {/* Sub-view Content */}
      {payrollSubTab === 'monthly' ? (
        <MonthlyPayrollRunView token={token} onViewPayslip={onViewPayslip} />
      ) : (
        <SalaryStructuresTable
          structures={structures}
          employees={employees}
          loading={loadingStructures}
          onAddNew={handleAddNew}
          onEditStructure={handleEdit}
        />
      )}

      {/* Internal Salary Structure Modal fallback if opened directly */}
      <SalaryStructureModal
        isOpen={internalModalOpen}
        onClose={() => {
          setInternalModalOpen(false);
          setInternalEditingStructure(null);
        }}
        onSaved={() => {
          onRefreshStructures?.();
        }}
        initialData={internalEditingStructure}
        employees={employees}
        token={token}
      />
    </div>
  );
}
