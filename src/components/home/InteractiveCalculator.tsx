'use client';

import { useState, useMemo } from 'react';
import { Sparkles, Tag, MapPin } from 'lucide-react';
import AnimatedSection from '@/src/components/ui/AnimatedSection';
import { calculateEMI } from '@/src/lib/emi';
import EMISliders from './calculator/EMISliders';
import EMIResults from './calculator/EMIResults';

type Plan = 'onetime' | '1year' | '24months';

const PROJECT_OPTIONS = [
  { id: 'custom', name: 'Custom Amount', pricePerSqYd: 0 },
  { id: 'shivani-vatika-11th', name: 'Shivani Vatika 11th', pricePerSqYd: 7500 },
];

const PLANS: { id: Plan; label: string; rate: number; noCost: boolean }[] = [
  { id: 'onetime', label: 'One-Time', rate: 7500, noCost: false },
  { id: '1year', label: 'Up to 1 Year', rate: 7750, noCost: true },
  { id: '24months', label: '24 Months', rate: 8000, noCost: true },
];

export default function InteractiveCalculator() {
  const [projectId, setProjectId] = useState('custom');
  const [plan, setPlan] = useState<Plan>('onetime');
  const [plotSize, setPlotSize] = useState(100);

  // Custom amount state (when no project selected)
  const [customLoanLakhs, setCustomLoanLakhs] = useState(25);
  const [tenureMonths, setTenureMonths] = useState(12);
  const [interestRate, setInterestRate] = useState(8.5);

  const selectedProject = PROJECT_OPTIONS.find((p) => p.id === projectId) ?? PROJECT_OPTIONS[0];
  const hasFixedPrice = selectedProject.pricePerSqYd > 0;
  const selectedPlan = PLANS.find((p) => p.id === plan) ?? PLANS[0];

  // Derived values
  const baseAmount = hasFixedPrice ? plotSize * selectedPlan.rate : 0;
  const plcAmount = hasFixedPrice ? baseAmount * 0.05 : 0; // PLC: 5%
  const edcAmount = hasFixedPrice ? plotSize * 150 : 0; // EDC: ₹150/sq.yd
  const derivedAmount = baseAmount + plcAmount + edcAmount;
  const derivedLoanLakhs = hasFixedPrice ? derivedAmount / 100000 : customLoanLakhs;
  const effectiveInterestRate = hasFixedPrice && selectedPlan.noCost ? 0 : interestRate;
  const effectiveTenureYears = hasFixedPrice
    ? plan === '24months'
      ? 2
      : plan === '1year'
        ? 1
        : tenureMonths / 12
    : tenureMonths / 12;

  const { monthlyEmi, totalInterest, projectedValuation } = useMemo(
    () => calculateEMI(derivedLoanLakhs, effectiveTenureYears, effectiveInterestRate),
    [derivedLoanLakhs, effectiveTenureYears, effectiveInterestRate]
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
            Calculate your monthly installment and forecast 5-year capital appreciation for SVI
            Infra townships in Jaipur & Phulera.
          </p>
        </AnimatedSection>

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Controls Column */}
          <AnimatedSection
            type="fadeLeft"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl md:p-8 lg:col-span-7 dark:border-gray-800 dark:bg-gray-900"
          >
            {/* Project Selector */}
            <div className="mb-6 border-b border-gray-100 pb-6 dark:border-gray-800">
              <label
                htmlFor="calc-project-select"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                <MapPin size={12} />
                Select Project
              </label>
              <select
                id="calc-project-select"
                aria-label="Select Project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="focus:border-brand-gold focus:ring-brand-gold/20 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-gray-900 transition-all outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {PROJECT_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project-Specific Pricing */}
            {hasFixedPrice ? (
              <div className="space-y-6">
                {/* Payment Plan Tabs */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-gray-200">
                      Payment Plan
                    </label>
                    {selectedPlan.noCost && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                        <Tag size={10} />
                        No Cost EMI
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {PLANS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlan(p.id)}
                        className={`rounded-lg border px-2 py-2.5 text-xs font-bold transition-all ${
                          plan === p.id
                            ? 'dark:border-brand-gold dark:bg-brand-gold dark:text-brand-navy border-amber-500 bg-amber-500 text-white shadow-sm'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-500/50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        <div className="text-[10px] font-semibold tracking-wider uppercase opacity-80">
                          {p.label}
                        </div>
                        <div className="mt-0.5 text-sm font-bold">
                          ₹{p.rate.toLocaleString('en-IN')}/sq.yd
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plot Size */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="calc-plot-size"
                      className="text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-gray-200"
                    >
                      Plot Size
                    </label>
                    <span className="dark:text-brand-gold text-lg font-bold text-amber-600">
                      {plotSize} sq.yd
                    </span>
                  </div>
                  <input
                    id="calc-plot-size"
                    aria-label="Plot Size in Square Yards"
                    type="range"
                    min={50}
                    max={300}
                    step={10}
                    value={plotSize}
                    onChange={(e) => setPlotSize(Number(e.target.value))}
                    className="dark:accent-brand-gold h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-amber-500 dark:bg-gray-700"
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                    <span>50 sq.yd</span>
                    <span>150 sq.yd</span>
                    <span>300 sq.yd</span>
                  </div>
                </div>

                {/* Total Value Display */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-50/50 p-4 dark:bg-amber-500/5">
                  <div className="mb-3 flex items-baseline justify-between border-b border-amber-500/20 pb-2 dark:border-amber-500/20">
                    <span className="text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
                      Base Price
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      ₹ {baseAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-baseline justify-between text-gray-600 dark:text-gray-400">
                      <span>PLC (5%)</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        ₹ {Math.round(plcAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-gray-600 dark:text-gray-400">
                      <span>EDC (₹150/sq.yd)</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        ₹ {Math.round(edcAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between border-t border-amber-500/20 pt-2">
                    <span className="text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                      Total Plot Value
                    </span>
                    <span className="text-brand-gold text-2xl font-bold">
                      ₹ {(derivedAmount / 100000).toFixed(2)} Lakhs
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                    {plotSize} sq.yd × ₹{selectedPlan.rate.toLocaleString('en-IN')}/sq.yd + PLC &
                    EDC
                    {plan !== 'onetime' && (
                      <> · Pay over {plan === '1year' ? '12 months' : '24 months'} at 0% interest</>
                    )}
                  </p>
                </div>

                {/* Tenure Override (only for one-time) */}
                {plan === 'onetime' && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="calc-tenure-months"
                        className="text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-gray-200"
                      >
                        Loan Tenure (Months)
                      </label>
                      <span className="dark:text-brand-gold text-lg font-bold text-amber-600">
                        {tenureMonths} {tenureMonths === 1 ? 'Month' : 'Months'}
                      </span>
                    </div>
                    <input
                      id="calc-tenure-months"
                      aria-label="Loan Tenure in Months"
                      type="range"
                      min={1}
                      max={24}
                      step={1}
                      value={tenureMonths}
                      onChange={(e) => setTenureMonths(Number(e.target.value))}
                      className="dark:accent-brand-gold h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-amber-500 dark:bg-gray-700"
                    />
                    <div className="mt-1 flex justify-between text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                      <span>1 Mo</span>
                      <span>12 Mo</span>
                      <span>24 Mo</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EMISliders
                loanAmountLakhs={customLoanLakhs}
                tenureMonths={tenureMonths}
                interestRate={interestRate}
                onLoanAmountChange={setCustomLoanLakhs}
                onTenureChange={setTenureMonths}
                onInterestRateChange={setInterestRate}
              />
            )}
          </AnimatedSection>

          {/* Results Summary Column */}
          <AnimatedSection type="fadeRight" className="lg:col-span-5">
            <EMIResults
              monthlyEmi={monthlyEmi}
              loanAmountLakhs={derivedLoanLakhs}
              totalInterest={totalInterest}
              projectedValuation={projectedValuation}
              isNoCostEmi={hasFixedPrice && selectedPlan.noCost}
              paymentMonths={plan === '1year' ? 12 : plan === '24months' ? 24 : null}
            />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
