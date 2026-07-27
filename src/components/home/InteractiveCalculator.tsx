'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import AnimatedSection from '@/src/components/ui/AnimatedSection';

export default function InteractiveCalculator() {
  const [loanAmountLakhs, setLoanAmountLakhs] = useState<number>(25); // ₹25 Lakhs
  const [tenureYears, setTenureYears] = useState<number>(15); // 15 years
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5% p.a.

  // Calculated EMI
  const { monthlyEmi, totalInterest, projectedValuation } = useMemo(() => {
    const P = loanAmountLakhs * 100000;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - P;

    // Projected 5-year appreciation at 14% p.a. compound growth along Jaipur/Phulera corridors
    const appreciated5yr = P * Math.pow(1 + 0.14, 5);

    return {
      monthlyEmi: Math.round(emi),
      totalPayment: Math.round(total),
      totalInterest: Math.round(interest),
      projectedValuation: Math.round(appreciated5yr),
    };
  }, [loanAmountLakhs, tenureYears, interestRate]);

  return (
    <section className="border-y border-gray-200 bg-slate-50 py-16 transition-colors duration-300 md:py-24 dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <AnimatedSection type="fadeUp" className="mb-12 text-center">
          <div className="dark:text-brand-gold inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600">
            <Sparkles size={14} />
            <span>INTERACTIVE FINANCIAL TOOL</span>
          </div>
          <h2 className="mt-4 font-serif text-3xl font-bold text-gray-900 md:text-5xl dark:text-gray-100">
            Smart Plot Investment & EMI Estimator
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 md:text-base dark:text-gray-400">
            Calculate your monthly home loan installment and forecast 5-year capital appreciation
            for SVI Infra townships in Jaipur & Phulera.
          </p>
        </AnimatedSection>

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Controls Column */}
          <AnimatedSection
            type="fadeLeft"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl md:p-8 lg:col-span-7 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="space-y-6">
              {/* Slider 1: Loan/Investment Amount */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-gray-200">
                    Property / Investment Amount
                  </label>
                  <span className="dark:text-brand-gold text-lg font-bold text-amber-600">
                    ₹ {loanAmountLakhs} Lakhs
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={1}
                  value={loanAmountLakhs}
                  onChange={(e) => setLoanAmountLakhs(Number(e.target.value))}
                  className="dark:accent-brand-gold h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-amber-500 dark:bg-gray-700"
                />
                <div className="mt-1 flex justify-between text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                  <span>₹ 5 Lakhs</span>
                  <span>₹ 50 Lakhs</span>
                  <span>₹ 1 Crore</span>
                </div>
              </div>

              {/* Slider 2: Loan Tenure */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-gray-200">
                    Loan Tenure (Years)
                  </label>
                  <span className="dark:text-brand-gold text-lg font-bold text-amber-600">
                    {tenureYears} Years
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={30}
                  step={1}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="dark:accent-brand-gold h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-amber-500 dark:bg-gray-700"
                />
                <div className="mt-1 flex justify-between text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                  <span>3 Yrs</span>
                  <span>15 Yrs</span>
                  <span>30 Yrs</span>
                </div>
              </div>

              {/* Interest Rate Selector */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-gray-200">
                    Interest Rate (% p.a.)
                  </label>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {interestRate}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[8.4, 8.5, 8.75, 9.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setInterestRate(rate)}
                      className={`rounded-lg border py-2 text-xs font-bold transition-all ${
                        interestRate === rate
                          ? 'dark:border-brand-gold dark:bg-brand-gold dark:text-brand-navy border-amber-500 bg-amber-500 text-white shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-500/50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Results Summary Column */}
          <AnimatedSection type="fadeRight" className="lg:col-span-5">
            <div className="dark:border-brand-gold/30 relative overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900 p-6 text-white shadow-2xl md:p-8">
              <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />

              <div className="mb-6">
                <span className="dark:text-brand-gold text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                  ESTIMATED MONTHLY INSTALLMENT
                </span>
                <div className="dark:text-brand-gold mt-2 font-serif text-4xl font-bold text-amber-400 md:text-5xl">
                  ₹ {monthlyEmi.toLocaleString('en-IN')}
                  <span className="ml-2 font-sans text-xs font-normal text-gray-300">/ month</span>
                </div>
              </div>

              <div className="space-y-4 border-t border-white/10 pt-4 text-xs">
                <div className="flex items-center justify-between text-gray-300">
                  <span>Principal Amount:</span>
                  <span className="font-semibold text-white">
                    ₹ {(loanAmountLakhs * 100000).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Total Payable Interest:</span>
                  <span className="font-semibold text-white">
                    ₹ {totalInterest.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-amber-500/30 bg-white/10 p-4">
                  <div className="dark:text-brand-gold mb-1 flex items-center gap-2 text-xs font-semibold text-amber-400">
                    <TrendingUp size={16} />
                    <span>Projected 5-Year Property Value</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    ₹ {projectedValuation.toLocaleString('en-IN')}
                  </div>
                  <p className="mt-1 text-[10px] text-gray-300">
                    Based on ~14% avg historical growth in JDA corridors.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <Link
                  href="/calculators"
                  className="dark:text-brand-gold inline-flex items-center gap-2 text-xs font-semibold text-amber-400 transition-colors hover:text-white"
                >
                  <span>Use Full Financial Suite</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/contact"
                  className="dark:bg-brand-gold text-brand-navy rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold shadow-md transition-all hover:bg-white"
                >
                  Apply Loan
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
