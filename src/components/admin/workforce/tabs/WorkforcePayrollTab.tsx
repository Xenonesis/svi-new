'use client';

import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { MonthlyPayrollRunView } from '@/src/components/admin/payroll/MonthlyPayrollRunView';
import { SalaryStructuresTable } from '@/src/components/admin/payroll/SalaryStructuresTable';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import type { SalaryStructure, PayrollItem } from '@/src/lib/payroll/types';

interface WorkforcePayrollTabProps {
  token: string;
  payrollSubTab: 'monthly' | 'structures';
  onPayrollSubTabChange: (subTab: 'monthly' | 'structures') => void;
  structures: SalaryStructure[];
  employees: Employee[];
  loadingStructures: boolean;
  onAddNewStructure: () => void;
  onEditStructure: (struct: SalaryStructure) => void;
  onViewPayslip: (item: PayrollItem) => void;
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
}: WorkforcePayrollTabProps) {
  return (
    <div className="space-y-6">
      {/* Payroll Sub-view Switcher */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-200/80 pb-4 sm:flex-row sm:items-center dark:border-white/10">
        <div>
          <h2 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
            Payroll &amp; Salary Administration
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Configure staff CTC breakdown, calculate attendance LOP deductions, and release
            payslips.
          </p>
        </div>

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

      {/* Sub-view Content */}
      {payrollSubTab === 'monthly' ? (
        <MonthlyPayrollRunView token={token} onViewPayslip={onViewPayslip} />
      ) : (
        <SalaryStructuresTable
          structures={structures}
          employees={employees}
          loading={loadingStructures}
          onAddNew={onAddNewStructure}
          onEditStructure={onEditStructure}
        />
      )}
    </div>
  );
}
