'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

// ─── EMI Formula ──────────────────────────────────────────────────────────────
function calculateEMI(P: number, annualRate: number, tenureMonths: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return P / tenureMonths;
  return (P * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = 'emi' | 'roi';

export default function PropertyCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>('emi');

  // ── EMI State ──────────────────────────────────────────────────────────────
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const tenureMonths = tenureYears * 12;
  const emi = calculateEMI(loanAmount, interestRate, tenureMonths);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - loanAmount;

  // ── ROI State ──────────────────────────────────────────────────────────────
  const [investmentAmount, setInvestmentAmount] = useState(5000000);
  const [growthRate, setGrowthRate] = useState(12);
  const [investmentYears, setInvestmentYears] = useState(5);

  const roiData = Array.from({ length: investmentYears + 1 }, (_, i) => {
    const year = i;
    const value = investmentAmount * Math.pow(1 + growthRate / 100, year);
    const gain = value - investmentAmount;
    return {
      year: `Year ${year}`,
      yearShort: `Y${year}`,
      value: Math.round(value),
      gain: Math.round(gain),
      investment: investmentAmount,
    };
  });

  const finalValue = roiData[investmentYears].value;
  const totalGain = finalValue - investmentAmount;
  const roiPercent = Math.round((totalGain / investmentAmount) * 100);

  // ── Formatters ──────────────────────────────────────────────────────────────
  const formatCurrency = (val: number) =>
    '₹ ' + val.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const inputCls =
    'w-full accent-[#c9a84c] h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 outline-none';
  const labelCls = 'text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400';
  const valueCls = 'text-brand-gold font-bold text-lg';

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* ── Tab Switcher ──────────────────────────────────────────────────── */}
      <div className="mb-8 flex rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
        {[
          { id: 'emi' as Tab, label: 'EMI Calculator' },
          { id: 'roi' as Tab, label: 'ROI Tracker' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 cursor-pointer rounded-full py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-brand-gold text-brand-navy shadow-md'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'emi' ? (
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
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
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
                  onChange={(e) => setInterestRate(Number(e.target.value))}
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
                  onChange={(e) => setTenureYears(Number(e.target.value))}
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
        ) : (
          <motion.div
            key="roi"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg md:p-10 dark:border-gray-700 dark:bg-gray-900"
          >
            <h3 className="text-brand-navy font-serif text-2xl font-bold dark:text-gray-100">
              Investment ROI Tracker
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              See how your investment grows over time in high-growth corridors
            </p>

            {/* Sliders */}
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {/* Investment Amount */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className={labelCls}>Investment</span>
                  <span className={valueCls}>{formatCurrency(investmentAmount)}</span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={20000000}
                  step={100000}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className={`${inputCls} mt-3`}
                />
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>₹5L</span>
                  <span>₹2Cr</span>
                </div>
              </div>

              {/* Growth Rate */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className={labelCls}>Annual Growth</span>
                  <span className={valueCls}>{growthRate}%</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={30}
                  step={0.5}
                  value={growthRate}
                  onChange={(e) => setGrowthRate(Number(e.target.value))}
                  className={`${inputCls} mt-3`}
                />
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>2%</span>
                  <span>30%</span>
                </div>
              </div>

              {/* Time Period */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className={labelCls}>Time Period</span>
                  <span className={valueCls}>{investmentYears} yrs</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={investmentYears}
                  onChange={(e) => setInvestmentYears(Number(e.target.value))}
                  className={`${inputCls} mt-3`}
                />
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>1 yr</span>
                  <span>15 yrs</span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="mt-10">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={roiData}>
                  <defs>
                    <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="yearShort" stroke="#9ca3af" fontSize={12} />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(v: number) => '₹' + (v / 100000).toFixed(1) + 'L'}
                  />
                  <Tooltip
                    formatter={function (val: any) {
                      return [formatCurrency(val), 'Projected Value'];
                    }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#c9a84c"
                    strokeWidth={2}
                    fill="url(#roiGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Results */}
            <div className="mt-8 grid gap-6 rounded-xl bg-gray-50 p-6 md:grid-cols-3 dark:bg-gray-800">
              <div className="text-center">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                  Projected Value
                </p>
                <p className="text-brand-gold mt-2 text-3xl font-bold">
                  {formatCurrency(Math.round(finalValue))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                  Total Gain
                </p>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                  +{formatCurrency(Math.round(totalGain))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                  ROI
                </p>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                  +{roiPercent}%
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400 italic">
              * Projected values based on assumed annual growth rate. Actual returns may vary. Past
              performance does not guarantee future results.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
