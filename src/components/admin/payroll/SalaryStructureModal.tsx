'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CreditCard,
  Percent,
  DollarSign,
  Sparkles,
  FileText,
  Target,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Briefcase,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SalaryStructure } from '@/src/lib/payroll/types';
import { formatINR } from '@/src/lib/quotation/format';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';

export interface MatchedOfferItem {
  documentId: string;
  name: string;
  emailId: string;
  mobileNo: string;
  designation: string;
  salaryCtc: number;
  salaryType?: string;
  target: number;
  targetUnit: string;
  offerSlab: string;
  conveyanceAllowanceAmount: number;
  appointmentDate?: string;
  createdAt: string;
  score: number;
  matchReason: string;
  rawFormData: Record<string, unknown>;
}

export interface ParsedCompensation {
  baseSalary: number;
  basicPay: number;
  hra: number;
  specialAllowance: number;
  conveyanceAllowance: number;
  monthlyTarget: number;
  targetUnit: string;
  offerSlab: string;
  designation: string;
  isAnnualConverted: boolean;
}

export interface SalaryStructureModalEmployee {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  real_email?: string | null;
  department?: string | null;
}

export interface SalaryStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: SalaryStructure | null;
  employees: SalaryStructureModalEmployee[];
  token?: string;
  defaultEmployeeId?: string;
}

export function cleanPhone(phone?: string | null): string {
  return (phone || '').replace(/\D/g, '').slice(-10);
}

export function cleanName(name?: string | null): string {
  return (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Parses offer letter form data to standard compensation breakdown:
 * - baseSalary: monthly CTC (handles annual conversion if annual CTC specified or > 150,000)
 * - basicPay: 50% of base
 * - hra: 40% of base (standard statutory rate)
 * - conveyanceAllowance: parsed conveyance allowance amount
 * - specialAllowance: balancing remainder
 * - monthlyTarget: sales quota and target unit
 */
export function parseOfferCompensation(fd: Record<string, unknown>): ParsedCompensation {
  const rawSalary = String(fd.salaryCtc || fd.salary || '0')
    .replace(/,/g, '')
    .trim();
  const salaryVal = parseFloat(rawSalary) || 0;
  const rawSalaryType = String(fd.salaryType || '').toLowerCase();

  const isAnnual =
    rawSalaryType.includes('annual') ||
    rawSalaryType.includes('ctc_annual') ||
    rawSalary.toLowerCase().includes('lpa') ||
    rawSalary.toLowerCase().includes('annum') ||
    salaryVal > 150000;

  const monthlyBase = isAnnual ? Math.round(salaryVal / 12) : Math.round(salaryVal);

  // Standard compensation calculation: 50% Basic, 40% HRA, Conveyance, remainder Special Allowance
  const basic = Math.round(monthlyBase * 0.5);
  const hra = Math.round(monthlyBase * 0.4);

  const conveyanceRaw = String(fd.conveyanceAllowanceAmount || '0')
    .replace(/,/g, '')
    .trim();
  const conveyance = parseFloat(conveyanceRaw) || 0;

  const special = Math.max(0, monthlyBase - (basic + hra + conveyance));

  const targetRaw = String(fd.target || fd.monthly_target || '0')
    .replace(/,/g, '')
    .trim();
  const targetVal = parseFloat(targetRaw) || 0;
  const targetUnit = String(fd.targetUnit || 'Sq. Yd.').trim() || 'Sq. Yd.';

  const offerSlab = String(fd.offerSlab || '').trim();
  const designation = String(fd.designation || '').trim();

  return {
    baseSalary: monthlyBase,
    basicPay: basic,
    hra,
    specialAllowance: special,
    conveyanceAllowance: conveyance,
    monthlyTarget: targetVal,
    targetUnit,
    offerSlab,
    designation,
    isAnnualConverted: isAnnual,
  };
}

export function SalaryStructureModal({
  isOpen,
  onClose,
  onSaved,
  initialData,
  employees,
  token,
  defaultEmployeeId,
}: SalaryStructureModalProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [salaryType, setSalaryType] = useState<'in_hand' | 'ctc'>('ctc');
  const [basicPay, setBasicPay] = useState('');
  const [hra, setHra] = useState('');
  const [specialAllowance, setSpecialAllowance] = useState('');
  const [conveyanceAllowance, setConveyanceAllowance] = useState('');
  const [medicalAllowance, setMedicalAllowance] = useState('');
  const [pfDeduction, setPfDeduction] = useState('');
  const [esiDeduction, setEsiDeduction] = useState('');
  const [professionalTax, setProfessionalTax] = useState('200');
  const [tds, setTds] = useState('');
  const [monthlyTarget, setMonthlyTarget] = useState('');
  const [targetUnit, setTargetUnit] = useState('Sq. Yd.');

  // Bank Info
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [uanNumber, setUanNumber] = useState('');

  const [saving, setSaving] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [matchedOffers, setMatchedOffers] = useState<MatchedOfferItem[]>([]);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
  const [isSynced, setIsSynced] = useState(false);
  const [syncedDocId, setSyncedDocId] = useState<string | null>(null);

  // Initialize or reset form when initialData or isOpen changes
  useEffect(() => {
    if (initialData) {
      setSelectedUserId(initialData.user_id);
      setBaseSalary(initialData.base_salary ? String(initialData.base_salary) : '');
      setSalaryType(initialData.salary_type || 'ctc');
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

      const initialTarget = initialData.monthly_target ?? initialData.offer_target ?? null;
      setMonthlyTarget(initialTarget !== null ? String(initialTarget) : '');
      setTargetUnit(initialData.target_unit || initialData.offer_target_unit || 'Sq. Yd.');

      setBankName(initialData.bank_name || '');
      setAccountNumber(initialData.account_number || '');
      setIfscCode(initialData.ifsc_code || '');
      setPanNumber(initialData.pan_number || '');
      setUanNumber(initialData.uan_number || '');

      if (initialData.offer_document_id) {
        setIsSynced(true);
        setSyncedDocId(initialData.offer_document_id);
      } else {
        setIsSynced(false);
        setSyncedDocId(null);
      }
    } else {
      resetForm();
    }
  }, [initialData, isOpen, defaultEmployeeId, employees]);

  const resetForm = useCallback(() => {
    const fallbackId = defaultEmployeeId || employees[0]?.id || '';
    setSelectedUserId(fallbackId);
    setBaseSalary('25000');
    setSalaryType('ctc');
    applyStandardBreakdown(25000, 40);
    setMonthlyTarget('');
    setTargetUnit('Sq. Yd.');
    setBankName('');
    setAccountNumber('');
    setIfscCode('');
    setPanNumber('');
    setUanNumber('');
    setIsSynced(false);
    setSyncedDocId(null);
  }, [defaultEmployeeId, employees]);

  // Standard breakdown calculation helper
  const applyStandardBreakdown = (base: number, hraPercent = 40) => {
    const basic = Math.round(base * 0.5); // 50% Basic
    const h = Math.round(base * (hraPercent / 100)); // HRA %
    const special = Math.max(0, base - (basic + h)); // Balance
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

  const currentEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedUserId) || null;
  }, [employees, selectedUserId]);

  // Fetch matching offer letters for current selected employee
  useEffect(() => {
    if (!selectedUserId || !isOpen || !currentEmployee) {
      setMatchedOffers([]);
      return;
    }

    let isCancelled = false;
    const fetchOffers = async () => {
      setLoadingOffers(true);
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/admin/documents?type=offer_letter&limit=1000', {
          headers,
        });

        if (!res.ok) {
          throw new Error(`Failed to load documents (${res.status})`);
        }

        const data = (await res.json()) as { documents?: unknown[] };
        const docs = Array.isArray(data.documents) ? data.documents : [];

        const targetWorkEmail = (currentEmployee.email || '').toLowerCase().trim();
        const targetRealEmail = (currentEmployee.real_email || '').toLowerCase().trim();
        const targetPhone = cleanPhone(currentEmployee.phone);
        const targetName = cleanName(currentEmployee.full_name);

        const matches: MatchedOfferItem[] = [];

        for (const item of docs) {
          if (!item || typeof item !== 'object') continue;
          const doc = item as {
            id?: string;
            user_id?: string;
            created_at?: string;
            form_data?: Record<string, unknown>;
          };

          const fd = (doc.form_data || {}) as Record<string, unknown>;
          const docId = String(doc.id || '');
          const docEmail = String(fd.emailId || fd.email || '')
            .toLowerCase()
            .trim();
          const docPhone = cleanPhone(String(fd.mobileNo || fd.phone || fd.alternativeNo || ''));
          const docName = cleanName(String(fd.name || ''));

          let score = 0;
          let matchReason = '';

          if (doc.user_id && doc.user_id === currentEmployee.id) {
            score += 100;
            matchReason = `User ID (${currentEmployee.id})`;
          } else if (targetWorkEmail && docEmail && targetWorkEmail === docEmail) {
            score += 95;
            matchReason = `Work Email (${targetWorkEmail})`;
          } else if (targetRealEmail && docEmail && targetRealEmail === docEmail) {
            score += 90;
            matchReason = `Personal Email (${targetRealEmail})`;
          } else if (
            targetPhone &&
            docPhone &&
            targetPhone === docPhone &&
            targetPhone.length === 10
          ) {
            score += 80;
            matchReason = `Phone (${targetPhone})`;
          } else if (targetName && docName && targetName === docName && targetName.length >= 3) {
            score += 75;
            matchReason = `Full Name Match (${currentEmployee.full_name})`;
          } else if (
            targetName &&
            docName &&
            (targetName.includes(docName) || docName.includes(targetName)) &&
            Math.min(targetName.length, docName.length) >= 4
          ) {
            score += 50;
            matchReason = `Fuzzy Name Match`;
          }

          if (score >= 40) {
            const rawSalary = String(fd.salaryCtc || fd.salary || '0')
              .replace(/,/g, '')
              .trim();
            const salaryCtc = parseFloat(rawSalary) || 0;
            const target =
              parseFloat(
                String(fd.target || '0')
                  .replace(/,/g, '')
                  .trim()
              ) || 0;
            const targetUnit = String(fd.targetUnit || 'Sq. Yd.').trim() || 'Sq. Yd.';
            const conveyanceRaw = String(fd.conveyanceAllowanceAmount || '0')
              .replace(/,/g, '')
              .trim();
            const conveyanceAllowanceAmount = parseFloat(conveyanceRaw) || 0;

            matches.push({
              documentId: docId,
              name: String(fd.name || currentEmployee.full_name),
              emailId: docEmail || targetWorkEmail,
              mobileNo: docPhone || targetPhone,
              designation: String(fd.designation || currentEmployee.department || ''),
              salaryCtc,
              salaryType: String(fd.salaryType || 'CTC'),
              target,
              targetUnit,
              offerSlab: String(fd.offerSlab || ''),
              conveyanceAllowanceAmount,
              appointmentDate: String(fd.appointmentDate || fd.date || ''),
              createdAt: String(doc.created_at || ''),
              score,
              matchReason,
              rawFormData: fd,
            });
          }
        }

        matches.sort((a, b) => b.score - a.score || b.createdAt.localeCompare(a.createdAt));

        if (!isCancelled) {
          setMatchedOffers(matches);
          setSelectedOfferIndex(0);
        }
      } catch {
        if (!isCancelled) setMatchedOffers([]);
      } finally {
        if (!isCancelled) setLoadingOffers(false);
      }
    };

    fetchOffers();
    return () => {
      isCancelled = true;
    };
  }, [selectedUserId, isOpen, currentEmployee, token]);

  const activeMatchedOffer = matchedOffers[selectedOfferIndex] || null;

  // 1-Click Sync from Offer Letter handler
  const handleSyncFromOfferLetter = () => {
    if (!activeMatchedOffer) {
      toast.error('No matching offer letter selected to sync');
      return;
    }

    const parsed = parseOfferCompensation(activeMatchedOffer.rawFormData);

    setBaseSalary(String(parsed.baseSalary));
    setBasicPay(String(parsed.basicPay));
    setHra(String(parsed.hra));
    setSpecialAllowance(String(parsed.specialAllowance));
    setConveyanceAllowance(String(parsed.conveyanceAllowance));
    setMedicalAllowance('0');
    const offerSalaryType =
      String(activeMatchedOffer.salaryType || '').toLowerCase() === 'in_hand' ? 'in_hand' : 'ctc';
    setSalaryType(offerSalaryType);
    setProfessionalTax(offerSalaryType === 'in_hand' ? '0' : '200');

    if (parsed.monthlyTarget > 0) {
      setMonthlyTarget(String(parsed.monthlyTarget));
      setTargetUnit(parsed.targetUnit);
    }

    setIsSynced(true);
    setSyncedDocId(activeMatchedOffer.documentId);

    const conversionNote = parsed.isAnnualConverted ? ' (converted from Annual CTC)' : '';
    toast.success(
      `Synchronized: ₹${parsed.baseSalary.toLocaleString('en-IN')}/mo Base${conversionNote} & ${parsed.monthlyTarget} ${parsed.targetUnit} Target!`
    );
  };

  const handleBaseChange = (val: string) => {
    setBaseSalary(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      applyStandardBreakdown(num, 40);
    }
  };

  // Calculations for live financial summary
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
  const numTarget = parseFloat(monthlyTarget) || 0;

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
          salary_type: salaryType,
          basic_pay: numBasic,
          hra: numHra,
          special_allowance: numSpecial,
          conveyance_allowance: numConveyance,
          medical_allowance: numMedical,
          pf_deduction: numPf,
          esi_deduction: numEsi,
          professional_tax: numPt,
          tds: numTds,
          monthly_target: numTarget > 0 ? numTarget : null,
          target_unit: numTarget > 0 ? targetUnit : null,
          offer_document_id: syncedDocId || null,
          bank_name: bankName.trim() || null,
          account_number: accountNumber.trim() || null,
          ifsc_code: ifscCode.trim() || null,
          pan_number: panNumber.trim() || null,
          uan_number: uanNumber.trim() || null,
          is_active: true,
        }),
      });

      const data = (await res.json()) as { message?: string };
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
      <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
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
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                    {initialData ? 'Edit Salary Structure' : 'Configure Staff Compensation'}
                  </h2>
                  {isSynced && (
                    <span
                      data-testid="offer-synced-badge"
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300"
                    >
                      <Sparkles className="text-brand-gold h-3 w-3" /> Offer Synced
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Set base monthly compensation, statutory allowances, sales quotas, and banking
                  details
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Employee Selection */}
              <div>
                <label
                  htmlFor="salary-structure-employee-select"
                  className="block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
                >
                  Select Employee *
                </label>
                <select
                  id="salary-structure-employee-select"
                  aria-label="Select Employee"
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

              {/* Offer Letter Sync Banner / Selector */}
              {loadingOffers && (
                <div className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-gray-50/80 p-3.5 text-xs text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                  <RefreshCw className="text-brand-gold h-4 w-4 animate-spin" />
                  <span>Checking for matching official offer letters...</span>
                </div>
              )}

              {!loadingOffers && matchedOffers.length > 0 && activeMatchedOffer && (
                <div
                  data-testid="offer-letter-detected-banner"
                  className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 transition-all"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                            Active Offer Letter Detected
                          </span>
                          <span className="py-0.2 rounded-full bg-emerald-500/20 px-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                            {matchedOffers.length > 1
                              ? `${matchedOffers.length} Documents Found`
                              : activeMatchedOffer.matchReason}
                          </span>
                        </div>

                        {matchedOffers.length > 1 && (
                          <div className="mt-1.5">
                            <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                              Select Matching Offer Document:
                            </label>
                            <select
                              aria-label="Select Matching Offer Document"
                              value={selectedOfferIndex}
                              onChange={(e) => setSelectedOfferIndex(Number(e.target.value))}
                              className="mt-1 w-full rounded-lg border border-emerald-500/40 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-gray-900 focus:outline-none dark:bg-[#181822] dark:text-white"
                            >
                              {matchedOffers.map((offer, idx) => (
                                <option key={offer.documentId} value={idx}>
                                  {offer.designation || 'Offer'} • ₹
                                  {offer.salaryCtc.toLocaleString('en-IN')}{' '}
                                  {offer.appointmentDate ? `(${offer.appointmentDate})` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-700 dark:text-gray-300">
                          {activeMatchedOffer.designation && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3 text-gray-400" />
                              Role: <strong>{activeMatchedOffer.designation}</strong>
                            </span>
                          )}
                          <span>
                            CTC:{' '}
                            <strong>₹{activeMatchedOffer.salaryCtc.toLocaleString('en-IN')}</strong>
                          </span>
                          {activeMatchedOffer.target > 0 && (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <Target className="h-3 w-3" />
                              Target:{' '}
                              <strong>
                                {activeMatchedOffer.target} {activeMatchedOffer.targetUnit}
                              </strong>
                            </span>
                          )}
                          {activeMatchedOffer.offerSlab && (
                            <span className="rounded bg-emerald-600/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              Slab: {activeMatchedOffer.offerSlab}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSyncFromOfferLetter}
                        data-testid="sync-from-offer-letter-btn"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Sync from Offer Letter
                      </button>
                    </div>

                    {isSynced && (
                      <div className="flex items-center gap-2 border-t border-emerald-500/20 pt-2 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>
                          Pre-filled from Offer Letter ({syncedDocId?.slice(0, 8)}...). Manual
                          overrides can be edited below.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Base Gross Salary with Auto-Breakdown Presets */}
              <div className="border-brand-gold/30 bg-brand-gold/5 rounded-2xl border p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-brand-gold text-xs font-bold tracking-wider uppercase">
                      {salaryType === 'in_hand'
                        ? 'Monthly In-Hand Pay (₹) *'
                        : 'Monthly Base CTC / Gross Pay (₹) *'}
                    </label>
                    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 dark:border-white/10 dark:bg-white/5">
                      <button
                        type="button"
                        onClick={() => {
                          setSalaryType('in_hand');
                          setProfessionalTax('0');
                        }}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-all ${
                          salaryType === 'in_hand'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        In-Hand
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSalaryType('ctc');
                          setProfessionalTax('200');
                        }}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-all ${
                          salaryType === 'ctc'
                            ? 'bg-brand-navy dark:bg-brand-gold text-white shadow-xs dark:text-gray-950'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        CTC
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => applyStandardBreakdown(numBase, 40)}
                      className="text-brand-gold flex items-center gap-1 text-[11px] font-bold hover:underline"
                    >
                      <Sparkles className="h-3 w-3" /> 50/40 Standard
                    </button>
                    <span className="text-gray-400">•</span>
                    <button
                      type="button"
                      onClick={() => applyStandardBreakdown(numBase, 30)}
                      className="text-brand-gold flex items-center gap-1 text-[11px] font-bold hover:underline"
                    >
                      50/30/20
                    </button>
                  </div>
                </div>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 font-bold text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    data-testid="base-salary-input"
                    aria-label="Base Salary"
                    value={baseSalary}
                    onChange={(e) => handleBaseChange(e.target.value)}
                    placeholder="e.g. 35000"
                    className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-8 text-base font-bold text-gray-900 shadow-2xs focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                  Changing base salary automatically balances Basic (50%), HRA (40%), and Special
                  Allowance.
                </p>
              </div>

              {/* Monthly Sales Target / Quota Benchmark */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-[#181822]/60">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                    <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Monthly Sales Target / Quota
                  </label>
                  <span className="text-[11px] text-gray-400">Optional Performance Quota</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <input
                      type="number"
                      data-testid="monthly-target-input"
                      aria-label="Monthly Sales Target"
                      value={monthlyTarget}
                      onChange={(e) => setMonthlyTarget(e.target.value)}
                      placeholder="e.g. 500"
                      className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                  <div>
                    <select
                      aria-label="Target Unit"
                      value={targetUnit}
                      onChange={(e) => setTargetUnit(e.target.value)}
                      className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    >
                      <option value="Sq. Yd.">Sq. Yd.</option>
                      <option value="Sq. Ft.">Sq. Ft.</option>
                      <option value="Lakhs">Lakhs (₹)</option>
                      <option value="Crores">Crores (₹)</option>
                      <option value="Units">Units</option>
                    </select>
                  </div>
                </div>
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
                      data-testid="basic-pay-input"
                      aria-label="Basic Pay"
                      value={basicPay}
                      onChange={(e) => setBasicPay(e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      HRA (40% Standard) (₹)
                    </label>
                    <input
                      type="number"
                      data-testid="hra-input"
                      aria-label="HRA"
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
                      data-testid="special-allowance-input"
                      aria-label="Special Allowance"
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
                      data-testid="conveyance-allowance-input"
                      aria-label="Conveyance Allowance"
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
                      aria-label="Professional Tax"
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
                      aria-label="TDS"
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
                      aria-label="PF Deduction"
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
                      aria-label="ESI Deduction"
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
                  <CreditCard className="h-3.5 w-3.5 text-emerald-500" /> Bank &amp; Statutory IDs
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

// Aliases for seamless drop-in compatibility
export const SalaryStructureDrawer = SalaryStructureModal;
export const EmployeeSalarySetupDrawer = SalaryStructureModal;
export default SalaryStructureModal;
