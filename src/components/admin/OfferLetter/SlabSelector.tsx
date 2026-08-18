'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SalarySlabType {
  target: number;
  salary: number;
  offerSlab: string;
}

export const SALARY_SLABS: SalarySlabType[] = [
  { target: 120, salary: 17000, offerSlab: '3%' },
  { target: 140, salary: 18000, offerSlab: '3%' },
  { target: 160, salary: 19000, offerSlab: '3%' },
  { target: 180, salary: 20000, offerSlab: '3%' },
  { target: 210, salary: 22000, offerSlab: '3%' },
  { target: 250, salary: 25000, offerSlab: '3%' },
  { target: 290, salary: 28000, offerSlab: '3%' },
  { target: 320, salary: 30000, offerSlab: '3%' },
  { target: 380, salary: 35000, offerSlab: '3%' },
  { target: 450, salary: 40000, offerSlab: '3%' },
  { target: 520, salary: 45000, offerSlab: '3%' },
  { target: 600, salary: 50000, offerSlab: '3%' },
];

interface SlabSelectorProps {
  salaryCtc: string;
  salaryType?: string;
  target: string;
  offerSlab: string;
  onSalaryChange: (value: string) => void;
  onSalaryTypeChange?: (value: string) => void;
  onTargetChange: (value: string) => void;
  onOfferSlabChange: (value: string) => void;
  onSalarySelect: (s: SalarySlabType) => void;
  onTargetSelect: (s: SalarySlabType) => void;
}

export function SlabSelector({
  salaryCtc,
  salaryType = 'CTC',
  target,
  offerSlab,
  onSalaryChange,
  onSalaryTypeChange,
  onTargetChange,
  onOfferSlabChange,
  onSalarySelect,
  onTargetSelect,
}: SlabSelectorProps) {
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const salaryRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (salaryRef.current && !salaryRef.current.contains(e.target as Node)) setSalaryOpen(false);
    if (targetRef.current && !targetRef.current.contains(e.target as Node)) setTargetOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const matchedSlab = salaryCtc
    ? SALARY_SLABS.find((s) => s.salary === parseFloat(salaryCtc))
    : target
      ? SALARY_SLABS.find((s) => s.target === parseFloat(target))
      : null;

  const salarySuggestions = salaryCtc
    ? SALARY_SLABS.filter((s) => {
        const v = parseFloat(salaryCtc) || 0;
        return s.salary.toString().includes(salaryCtc) || (v > 0 && Math.abs(s.salary - v) <= 2000);
      })
    : SALARY_SLABS;

  const targetSuggestions = target
    ? SALARY_SLABS.filter((s) => {
        const v = parseFloat(target) || 0;
        return s.target.toString().includes(target) || (v > 0 && Math.abs(s.target - v) <= 20);
      })
    : SALARY_SLABS;

  return (
    <>
      {/* Salary Input */}
      <div ref={salaryRef} className="relative">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Salary ({salaryType === 'in_hand' ? 'In-Hand' : 'CTC'}) / month
          </label>
          {onSalaryTypeChange && (
            <div className="flex items-center rounded-md bg-gray-100 p-0.5 dark:bg-white/10">
              <button
                type="button"
                onClick={() => onSalaryTypeChange('CTC')}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold transition-all ${
                  salaryType !== 'in_hand'
                    ? 'dark:bg-brand-gold dark:text-brand-navy bg-white text-[#1e3a8a] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                CTC
              </button>
              <button
                type="button"
                onClick={() => onSalaryTypeChange('in_hand')}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold transition-all ${
                  salaryType === 'in_hand'
                    ? 'dark:bg-brand-gold dark:text-brand-navy bg-white text-[#1e3a8a] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                In-Hand
              </button>
            </div>
          )}
        </div>
        <input
          type="number"
          name="salaryCtc"
          value={salaryCtc}
          onChange={(e) => onSalaryChange(e.target.value)}
          onFocus={() => salaryCtc && setSalaryOpen(true)}
          className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-gray-900 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
        />
        {salaryCtc && matchedSlab && (
          <div className="absolute top-7 right-2.5">
            <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] leading-tight font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              {matchedSlab.target} Sq.Yd
            </span>
          </div>
        )}
        {salaryOpen && salaryCtc && (
          <div className="absolute z-50 mt-0.5 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#1a1a23]">
            <div className="py-1">
              {salarySuggestions.map((s) => {
                const isActive = s.salary === (matchedSlab?.salary || 0);
                return (
                  <button
                    key={s.salary}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSalarySelect(s);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                      isActive ? 'text-brand-gold font-medium' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>₹{s.salary.toLocaleString('en-IN')}</span>
                    <span className="text-gray-400">{s.target} Sq.Yd</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Target Input */}
      <div ref={targetRef} className="relative">
        <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
          Target (Sq. Yd.)
        </label>
        <input
          type="number"
          name="target"
          value={target}
          onChange={(e) => onTargetChange(e.target.value)}
          onFocus={() => target && setTargetOpen(true)}
          className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-gray-900 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
        />
        {target && matchedSlab && (
          <div className="absolute top-7 right-2.5">
            <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] leading-tight font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              ₹{matchedSlab.salary.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        {targetOpen && target && (
          <div className="absolute z-50 mt-0.5 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#1a1a23]">
            <div className="py-1">
              {targetSuggestions.map((s) => {
                const isActive = s.target === (matchedSlab?.target || 0);
                return (
                  <button
                    key={s.target}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onTargetSelect(s);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                      isActive ? 'text-brand-gold font-medium' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{s.target} Sq.Yd</span>
                    <span className="text-gray-400">₹{s.salary.toLocaleString('en-IN')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Offer Slab Input */}
      <div>
        <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
          Offer Slab (%)
        </label>
        <input
          type="number"
          name="offerSlab"
          value={offerSlab}
          onChange={(e) => onOfferSlabChange(e.target.value)}
          min="0"
          step="any"
          className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-gray-900 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
        />
      </div>
    </>
  );
}
