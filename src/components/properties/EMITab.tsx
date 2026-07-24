'use client';

import { motion } from 'motion/react';

type EMITabProps = {
  loanAmount: number;
  onLoanAmountChange: (val: number) => void;
  interestRate: number;
  onInterestRateChange: (val: number) => void;
  tenureYears: number;
  onTenureYearsChange: (val: number) => void;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  formatCurrency: (val: number) => string;
  inputCls: string;
  labelCls: string;
  valueCls: string;
};

export default function EMITab({
  loanAmount,
  onLoanAmountChange,
  interestRate,
  onInterestRateChange,
  tenureYears,
  onTenureYearsChange,
  emi,
  totalInterest,
  totalPayment,
  formatCurrency,
  inputCls,
  labelCls,
  valueCls,
}: EMITabProps) {
  return (
    <motion.div
      key="emi"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg md:p-10 dark:border-gray-700 dark:bg-gray-900"
    >
      <h3 className="text-brand-navy font-serif text-2xl font-bold dark:text-gray-100">
        Home Loan EMI Calculator
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Plan your monthly payments with ease
      </p>

      {/* Sliders */}
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {/* Loan Amount */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className={labelCls}>Loan Amount</span>
            <span className={valueCls}>{formatCurrency(loanAmount)}</span>
          </div>
          <input
            type="range"
            min={100000}
            max={20000000}
            step={100000}
            value={loanAmount}
            onChange={(e) => onLoanAmountChange(Number(e.target.value))}
            className={`${inputCls} mt-3`}
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>₹1L</span>
            <span>₹2Cr</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className={labelCls}>Interest Rate</span>
            <span className={valueCls}>{interestRate}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={0.5}
            value={interestRate}
            onChange={(e) => onInterestRateChange(Number(e.target.value))}
            className={`${inputCls} mt-3`}
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>1%</span>
            <span>20%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className={labelCls}>Tenure</span>
            <span className={valueCls}>{tenureYears} yrs</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={tenureYears}
            onChange={(e) => onTenureYearsChange(Number(e.target.value))}
            className={`${inputCls} mt-3`}
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>1 yr</span>
            <span>30 yrs</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-10 grid gap-6 rounded-xl bg-gray-50 p-6 md:grid-cols-3 dark:bg-gray-800">
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            Monthly EMI
          </p>
          <p className="text-brand-gold mt-2 text-3xl font-bold">
            {formatCurrency(Math.round(emi))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            Total Interest
          </p>
          <p className="text-brand-navy mt-2 text-3xl font-bold dark:text-gray-100">
            {formatCurrency(Math.round(totalInterest))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            Total Payment
          </p>
          <p className="text-brand-navy mt-2 text-3xl font-bold dark:text-gray-100">
            {formatCurrency(Math.round(totalPayment))}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
