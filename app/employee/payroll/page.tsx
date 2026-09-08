'use client';

import React from 'react';
import { Banknote } from 'lucide-react';
import { BrandedLoadingState } from '@/src/components/employee/BrandedLoadingState';
import { useEmployeePayroll } from '@/src/components/employee/payroll/useEmployeePayroll';
import { SalaryStructureCard } from '@/src/components/employee/payroll/SalaryStructureCard';
import { MonthlyPayslipsSection } from '@/src/components/employee/payroll/MonthlyPayslipsSection';
import { PayslipViewModal } from '@/src/components/employee/payroll/PayslipViewModal';

export default function EmployeePayrollPage() {
  const {
    data,
    loading,
    viewingPayslipItem,
    setViewingPayslipItem,
    fetchingDetailId,
    handleOpenPayslip,
  } = useEmployeePayroll();

  const struct = data?.salaryStructure ?? null;
  const payrolls = data?.payrolls || [];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="text-brand-gold text-[11px] font-bold tracking-wider uppercase">
          SVI Infra Employee Workspace
        </div>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          <Banknote className="text-brand-gold h-7 w-7" />
          My Compensation{' '}
          <span className="text-gradient-gold inline-block pr-2.5 italic">& Payslips</span>
        </h1>
        <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Transparent monthly compensation structure, attendance LOP metrics, and official payslips.
        </p>
      </div>

      {loading ? (
        <BrandedLoadingState
          message="Loading Payroll Details..."
          subMessage="Retrieving salary structure and approved payslips"
        />
      ) : (
        <>
          <SalaryStructureCard struct={struct} />
          <MonthlyPayslipsSection
            payrolls={payrolls}
            fetchingDetailId={fetchingDetailId}
            onOpenPayslip={handleOpenPayslip}
          />
        </>
      )}

      <PayslipViewModal
        viewingPayslipItem={viewingPayslipItem}
        onClose={() => setViewingPayslipItem(null)}
      />
    </div>
  );
}
