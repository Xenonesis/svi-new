'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Percent, DollarSign, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { SalaryStructure } from '@/src/lib/payroll/types';
import { formatINR } from '@/src/lib/quotation/format';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';

interface EmployeeSalarySetupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: SalaryStructure | null;
  employees: Array<{ id: string; full_name: string; email: string; department?: string | null }>;
  token: string;
}

export function EmployeeSalarySetupDrawer({
  isOpen,
  onClose,
  onSaved,
  initialData,
  employees,
  token,
}: EmployeeSalarySetupDrawerProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [basicPay, setBasicPay] = useState('');
  const [hra, setHra] = useState('');
  const [specialAllowance, setSpecialAllowance] = useState('');
  const [conveyanceAllowance, setConveyanceAllowance] = useState('');
  const [medicalAllowance, setMedicalAllowance] = useState('');
  const [pfDeduction, setPfDeduction] = useState('');
  const [esiDeduction, setEsiDeduction] = useState('');
  const [professionalTax, setProfessionalTax] = useState('200');
  const [tds, setTds] = useState('');

  // Bank Info
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [uanNumber, setUanNumber] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSelectedUserId(initialData.user_id);
      setBaseSalary(initialData.base_salary ? String(initialData.base_salary) : '');
      setBasicPay(initialData.basic_pay ? String(initialData.basic_pay) : '');
      setHra(initialData.hra ? String(initialData.hra) : '');
      setSpecialAllowance(
        initialData.special_allowance ? String(initialData.special_allowance) : ''
      );
      setConveyanceAllowance(
        initialData.conveyance_allowance ? String(initialData.conveyance_allowance) : ''
      );
      setMedicalAllowance(
        initialData.medical_allowance ? String(initialData.medical_allowance) : ''
      );
      setPfDeduction(initialData.pf_deduction ? String(initialData.pf_deduction) : '');
      setEsiDeduction(initialData.esi_deduction ? String(initialData.esi_deduction) : '');
      setProfessionalTax(
        initialData.professional_tax !== undefined ? String(initialData.professional_tax) : '200'
      );
      setTds(initialData.tds ? String(initialData.tds) : '');
      setBankName(initialData.bank_name || '');
      setAccountNumber(initialData.account_number || '');
      setIfscCode(initialData.ifsc_code || '');
      setPanNumber(initialData.pan_number || '');
      setUanNumber(initialData.uan_number || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setSelectedUserId(employees[0]?.id || '');
    setBaseSalary('25000');
    applyStandardBreakdown(25000);
    setBankName('');
    setAccountNumber('');
    setIfscCode('');
    setPanNumber('');
    setUanNumber('');
  };

  const applyStandardBreakdown = (base: number) => {
    const basic = Math.round(base * 0.5); // 50% Basic
    const h = Math.round(base * 0.3); // 30% HRA
    const special = Math.max(0, base - (basic + h)); // 20% Special
    setBasicPay(String(basic));
    setHra(String(h));
    setSpecialAllowance(String(special));
    setConveyanceAllowance('0');
    setMedicalAllowance('0');
    setProfessionalTax('200');
    setPfDeduction('0');
    setEsiDeduction('0');
    setTds('0');
  };

  const handleBaseChange = (val: string) => {
    setBaseSalary(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      applyStandardBreakdown(num);
    }
  };

  // Calculations for live summary
  const numBase = parseFloat(baseSalary) || 0;
  const numBasic = parseFloat(basicPay) || 0;
  const numHra = parseFloat(hra) || 0;
  const numSpecial = parseFloat(specialAllowance) || 0;
  const numConveyance = parseFloat(conveyanceAllowance) || 0;
  const numMedical = parseFloat(medicalAllowance) || 0;

  const totalGross = numBasic + numHra + numSpecial + numConveyance + numMedical;

  const numPf = parseFloat(pfDeduction) || 0;
  const numEsi = parseFloat(esiDeduction) || 0;
  const numPt = parseFloat(professionalTax) || 0;
  const numTds = parseFloat(tds) || 0;

  const totalDeductions = numPf + numEsi + numPt + numTds;
  const netEstimated = Math.max(0, totalGross - totalDeductions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please select an employee');
      return;
    }
    if (!numBase || numBase <= 0) {
      toast.error('Please enter a valid base monthly salary');
      return;
    }

    setSaving(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/payroll/salary-structures', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: selectedUserId,
          base_salary: numBase,
          basic_pay: numBasic,
          hra: numHra,
          special_allowance: numSpecial,
          conveyance_allowance: numConveyance,
          medical_allowance: numMedical,
          pf_deduction: numPf,
          esi_deduction: numEsi,
          professional_tax: numPt,
          tds: numTds,
          bank_name: bankName.trim() || null,
          account_number: accountNumber.trim() || null,
          ifsc_code: ifscCode.trim() || null,
          pan_number: panNumber.trim() || null,
          uan_number: uanNumber.trim() || null,
          is_active: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save salary structure');
      }

      toast.success('Salary structure saved successfully');
      onSaved();
      onClose();
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, 'Error saving salary structure'));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="flex w-screen max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111118]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-white/10">
              <div>
                <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                  {initialData ? 'Edit Salary Structure' : 'Configure Staff Compensation'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Set base monthly compensation, statutory allowances, deductions, and banking info
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                  Select Employee *
                </label>
                <select
                  disabled={!!initialData}
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="focus:border-brand-gold mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 shadow-2xs focus:outline-none disabled:bg-gray-100 dark:border-white/10 dark:bg-[#181822] dark:text-white dark:disabled:bg-white/5"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.email}) {emp.department ? `• ${emp.department}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Base Gross Salary with Auto-Breakdown Preset */}
              <div className="border-brand-gold/30 bg-brand-gold/5 rounded-2xl border p-5">
                <div className="flex items-center justify-between">
                  <label className="text-brand-gold text-xs font-bold tracking-wider uppercase">
                    Monthly Base CTC / Gross Pay (₹) *
                  </label>
                  <button
                    type="button"
                    onClick={() => applyStandardBreakdown(numBase)}
                    className="text-brand-gold flex items-center gap-1 text-[11px] font-bold hover:underline"
                  >
                    <Sparkles className="h-3 w-3" /> Auto 50/30/20 Standard
                  </button>
                </div>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 font-bold text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => handleBaseChange(e.target.value)}
                    placeholder="e.g. 35000"
                    className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-8 text-base font-bold text-gray-900 shadow-2xs focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                  Changing base salary automatically balances Basic (50%), HRA (30%), and Special
                  Allowance (20%).
                </p>
              </div>

              {/* Earnings Breakdown */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                  <Percent className="text-brand-gold h-3.5 w-3.5" /> Monthly Earnings Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      Basic Pay (₹)
                    </label>
                    <input
                      type="number"
                      value={basicPay}
                      onChange={(e) => setBasicPay(e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      HRA (30%) (₹)
                    </label>
                    <input
                      type="number"
                      value={hra}
                      onChange={(e) => setHra(e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      Special Allowance (₹)
                    </label>
                    <input
                      type="number"
                      value={specialAllowance}
                      onChange={(e) => setSpecialAllowance(e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      Conveyance Allowance (₹)
                    </label>
                    <input
                      type="number"
                      value={conveyanceAllowance}
                      onChange={(e) => setConveyanceAllowance(e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                  <DollarSign className="h-3.5 w-3.5 text-red-500" /> Standard Monthly Deductions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      Professional Tax (PT)
                    </label>
                    <input
                      type="number"
                      value={professionalTax}
                      onChange={(e) => setProfessionalTax(e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      TDS / Income Tax (₹)
                    </label>
                    <input
                      type="number"
                      value={tds}
                      onChange={(e) => setTds(e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      PF Employee Share (₹)
                    </label>
                    <input
                      type="number"
                      value={pfDeduction}
                      onChange={(e) => setPfDeduction(e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      ESI Employee Share (₹)
                    </label>
                    <input
                      type="number"
                      value={esiDeduction}
                      onChange={(e) => setEsiDeduction(e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bank & Tax Details */}
              <div className="space-y-3 border-t border-gray-200 pt-5 dark:border-white/10">
                <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                  <CreditCard className="h-3.5 w-3.5 text-emerald-500" /> Bank & Statutory IDs
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 50100234567890"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 uppercase focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      PAN Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 uppercase focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-[#181822]">
                <h4 className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Estimated Monthly Take-Home
                </h4>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-serif text-2xl font-black text-gray-900 dark:text-white">
                    {formatINR(netEstimated)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Gross: {formatINR(totalGross)} &bull; Deductions: {formatINR(totalDeductions)}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : initialData
                      ? 'Update Structure'
                      : 'Save Salary Structure'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
