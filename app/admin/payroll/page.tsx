'use client';

import React, { useState, useEffect } from 'react';
import { Banknote, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/lib/supabase/client';
import { MonthlyPayrollRunView } from '@/src/components/admin/payroll/MonthlyPayrollRunView';
import { SalaryStructuresTable } from '@/src/components/admin/payroll/SalaryStructuresTable';
import { EmployeeSalarySetupDrawer } from '@/src/components/admin/payroll/EmployeeSalarySetupDrawer';
import { PayslipDocument } from '@/src/components/admin/payroll/PayslipDocument';
import type { SalaryStructure, PayrollItem } from '@/src/lib/payroll/types';

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

export default function AdminPayrollPage() {
  const token = useAuthStore((s) => s.token);
  const [activeTab, setActiveTab] = useState<'monthly' | 'structures'>('monthly');

  // Salary structures & employee directory
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [employees, setEmployees] = useState<
    Array<{ id: string; full_name: string; email: string; department?: string | null }>
  >([]);
  const [loadingStructures, setLoadingStructures] = useState(true);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);

  // Payslip preview modal
  const [previewPayslipItem, setPreviewPayslipItem] = useState<PayrollItem | null>(null);

  const fetchEmployeesAndStructures = async () => {
    setLoadingStructures(true);
    try {
      let activeToken = token;
      if (!activeToken) {
        const { data: sessionData } = await supabase.auth.getSession();
        activeToken = sessionData.session?.access_token || '';
      }
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      // Fetch employees
      const empRes = await fetch('/api/admin/employees', { headers });
      const empData = await empRes.json();
      if (empRes.ok && empData.employees) {
        setEmployees(empData.employees);
      }

      // Fetch salary structures
      const structRes = await fetch('/api/admin/payroll/salary-structures', { headers });
      const structData = await structRes.json();
      if (structRes.ok && structData.structures) {
        setStructures(structData.structures);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load employee salary records');
    } finally {
      setLoadingStructures(false);
    }
  };

  useEffect(() => {
    fetchEmployeesAndStructures();
  }, [token]);

  return (
    <div className="relative w-full pb-12 font-sans">
      {/* Background ambient lighting matching Admin standard */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-[450px] w-[450px] rounded-full blur-[120px]" />
        <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200/80 pb-6 sm:flex-row sm:items-center dark:border-white/10">
          <div>
            <h1 className="text-brand-navy mb-2 flex items-center gap-3 font-serif text-3xl tracking-tight sm:text-4xl dark:text-white">
              <Banknote className="text-brand-gold h-8 w-8" />
              Payroll{' '}
              <span
                className="text-gradient-gold animate-bg-pan inline-block italic"
                style={{
                  backgroundSize: '200% 200%',
                  backgroundImage:
                    'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
                }}
              >
                & Salary Management
              </span>
            </h1>
            <p className="text-xs tracking-wide text-gray-600 sm:text-sm dark:text-gray-400">
              Configure employee packages, calculate attendance LOP deductions, disburse incentives,
              and manage gated payslip releases.
            </p>
          </div>

          {/* Luxury Tab Switcher */}
          <div className="flex items-center gap-2 rounded-2xl border border-gray-200/80 bg-white p-1.5 shadow-sm dark:border-white/10 dark:bg-[#111118]">
            <button
              type="button"
              onClick={() => setActiveTab('monthly')}
              className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === 'monthly'
                  ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/25 border shadow-md'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Monthly Payroll Runs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('structures')}
              className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === 'structures'
                  ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/25 border shadow-md'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Staff Salary Setup</span>
            </button>
          </div>
        </div>

        {/* Main Views */}
        {activeTab === 'monthly' ? (
          <MonthlyPayrollRunView
            token={token || ''}
            onViewPayslip={(item) => setPreviewPayslipItem(item)}
          />
        ) : (
          <SalaryStructuresTable
            structures={structures}
            employees={employees}
            loading={loadingStructures}
            onAddNew={() => {
              setEditingStructure(null);
              setIsDrawerOpen(true);
            }}
            onEditStructure={(struct) => {
              setEditingStructure(struct);
              setIsDrawerOpen(true);
            }}
          />
        )}

        {/* Salary Setup Drawer */}
        <EmployeeSalarySetupDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setEditingStructure(null);
          }}
          onSaved={fetchEmployeesAndStructures}
          initialData={editingStructure}
          employees={employees}
          token={token || ''}
        />

        {/* Full Payslip Modal */}
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
      </div>
    </div>
  );
}
