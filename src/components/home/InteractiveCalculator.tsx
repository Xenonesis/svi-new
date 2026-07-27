'use client';

import { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import AnimatedSection from '@/src/components/ui/AnimatedSection';
import { calculateEMI } from '@/src/lib/emi';
import EMISliders from './calculator/EMISliders';
import EMIResults from './calculator/EMIResults';

export default function InteractiveCalculator() {
  const [loanAmountLakhs, setLoanAmountLakhs] = useState(25);
  const [tenureYears, setTenureYears] = useState(15);
  const [interestRate, setInterestRate] = useState(8.5);

  const { monthlyEmi, totalInterest, projectedValuation } = useMemo(
    () => calculateEMI(loanAmountLakhs, tenureYears, interestRate),
    [loanAmountLakhs, tenureYears, interestRate]
  );

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
            <EMISliders
              loanAmountLakhs={loanAmountLakhs}
              tenureYears={tenureYears}
              interestRate={interestRate}
              onLoanAmountChange={setLoanAmountLakhs}
              onTenureChange={setTenureYears}
              onInterestRateChange={setInterestRate}
            />
          </AnimatedSection>

          {/* Results Summary Column */}
          <AnimatedSection type="fadeRight" className="lg:col-span-5">
            <EMIResults
              monthlyEmi={monthlyEmi}
              loanAmountLakhs={loanAmountLakhs}
              totalInterest={totalInterest}
              projectedValuation={projectedValuation}
            />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
