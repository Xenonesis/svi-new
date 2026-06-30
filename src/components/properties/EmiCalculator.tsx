'use client';

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { IndianRupee, Building2, Percent, Calculator } from 'lucide-react';

interface EmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
}

function calculateEmi(principal: number, rate: number, tenureMonths: number): EmiResult {
  const monthlyRate = rate / 12 / 100;
  const emi =
    principal *
    monthlyRate *
    (Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1));
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;
  return {
    monthlyEmi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
  };
}

export function EmiCalculator() {
  const [principal, setPrincipal] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const tenureMonths = tenure * 12;
  const result = calculateEmi(principal, rate, tenureMonths);

  const formatCurrency = useCallback(
    (val: number) =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(val),
    []
  );

  const formatCompact = useCallback(
    (val: number) => {
      if (val >= 10000000) return `${(val / 10000000).toFixed(1)} Cr`;
      if (val >= 100000) return `${(val / 100000).toFixed(1)} L`;
      return formatCurrency(val);
    },
    [formatCurrency]
  );

  return (
    <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-xl backdrop-blur-xl md:p-8 dark:border-white/8">
      <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Calculator className="text-brand-gold h-5 w-5" />
        <h3 className="text-brand-navy font-serif text-xl font-bold dark:text-white">
          EMI Calculator
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Sliders */}
        <div className="space-y-6">
          {/* Principal */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-600 uppercase dark:text-gray-400">
                <IndianRupee className="text-brand-gold h-3.5 w-3.5" />
                Loan Amount
              </label>
              <span className="text-brand-gold font-mono text-sm font-bold">
                {formatCompact(principal)}
              </span>
            </div>
            <input
              type="range"
              min={100000}
              max={50000000}
              step={100000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="range-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 outline-none dark:bg-gray-700"
              style={{
                background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${(principal / 50000000) * 100}%, #e5e7eb ${(principal / 50000000) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
              <span>₹1 L</span>
              <span>₹5 Cr</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-600 uppercase dark:text-gray-400">
                <Percent className="text-brand-gold h-3.5 w-3.5" />
                Interest Rate
              </label>
              <span className="text-brand-gold font-mono text-sm font-bold">{rate}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={18}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="range-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 outline-none dark:bg-gray-700"
              style={{
                background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${((rate - 5) / 13) * 100}%, #e5e7eb ${((rate - 5) / 13) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
              <span>5%</span>
              <span>18%</span>
            </div>
          </div>

          {/* Tenure */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-600 uppercase dark:text-gray-400">
                <Building2 className="text-brand-gold h-3.5 w-3.5" />
                Tenure
              </label>
              <span className="text-brand-gold font-mono text-sm font-bold">{tenure} years</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="range-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 outline-none dark:bg-gray-700"
              style={{
                background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${(tenure / 30) * 100}%, #e5e7eb ${(tenure / 30) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
              <span>1 yr</span>
              <span>30 yrs</span>
            </div>
          </div>
        </div>

        {/* Result */}
        <motion.div
          key={`${principal}-${rate}-${tenure}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col justify-center rounded-xl border border-gray-200 bg-gray-50/80 p-6 dark:border-gray-700/50 dark:bg-gray-800/50"
        >
          <span className="mb-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Monthly EMI
          </span>
          <span className="text-brand-gold mb-6 font-mono text-4xl font-bold">
            {formatCurrency(result.monthlyEmi)}
          </span>

          <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Principal Amount</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(principal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Interest</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(result.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-sm dark:border-gray-700">
              <span className="font-bold text-gray-700 dark:text-gray-300">Total Payment</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(result.totalPayment)}
              </span>
            </div>
          </div>

          {/* Visual bar */}
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${(principal / result.totalPayment) * 100}%`,
                background: 'linear-gradient(90deg, #d4af37, #b08f36)',
              }}
              animate={{ width: `${(principal / result.totalPayment) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>Principal</span>
            <span>Interest</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
