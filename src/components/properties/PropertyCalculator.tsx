'use client';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import ProjectSelector from './ProjectSelector';
import TabSwitcher from './TabSwitcher';
import EMITab from './EMITab';
import ROITab from './ROITab';

// ─── EMI Formula ──────────────────────────────────────────────────────────────
function calculateEMI(P: number, annualRate: number, tenureMonths: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return P / tenureMonths;
  return (P * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = 'emi' | 'roi';

// ─── Project Options ──────────────────────────────────────────────────────────
const PROJECT_OPTIONS = [
  { id: '', name: 'Custom Amount', pricePerSqYd: 0 },
  { id: 'shivani-vatika-11th', name: 'Shivani Vatika 11th', pricePerSqYd: 7500 },
];

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

  // ── Project Selection ───────────────────────────────────────────────────────
  const [selectedProjectId, setSelectedProjectId] = useState('shivani-vatika-11th');
  const [plotSize, setPlotSize] = useState(100);

  const selectedProject =
    PROJECT_OPTIONS.find((p) => p.id === selectedProjectId) ?? PROJECT_OPTIONS[0];
  const hasFixedPrice = selectedProject.pricePerSqYd > 0;
  const totalPlotValue = hasFixedPrice ? plotSize * selectedProject.pricePerSqYd : investmentAmount;
  const effectiveInvestment = hasFixedPrice ? totalPlotValue : investmentAmount;

  const roiData = Array.from({ length: investmentYears + 1 }, (_, i) => {
    const year = i;
    const value = effectiveInvestment * Math.pow(1 + growthRate / 100, year);
    const gain = value - effectiveInvestment;
    return {
      year: `Year ${year}`,
      yearShort: `Y${year}`,
      value: Math.round(value),
      gain: Math.round(gain),
      investment: effectiveInvestment,
    };
  });

  const finalValue = roiData[investmentYears].value;
  const totalGain = finalValue - effectiveInvestment;
  const roiPercent = Math.round((totalGain / effectiveInvestment) * 100);

  // ── Formatters ──────────────────────────────────────────────────────────────
  const formatCurrency = (val: number) =>
    '₹ ' + val.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const inputCls =
    'w-full accent-brand-gold h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 outline-none';
  const labelCls = 'text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400';
  const valueCls = 'text-brand-gold font-bold text-lg';

  const tabs = [
    { id: 'emi' as Tab, label: 'EMI Calculator' },
    { id: 'roi' as Tab, label: 'ROI Tracker' },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ProjectSelector
        projectOptions={PROJECT_OPTIONS}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        plotSize={plotSize}
        onPlotSizeChange={setPlotSize}
        selectedProject={selectedProject}
        hasFixedPrice={hasFixedPrice}
      />

      <TabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        {activeTab === 'emi' ? (
          <EMITab
            key="emi"
            loanAmount={loanAmount}
            onLoanAmountChange={setLoanAmount}
            interestRate={interestRate}
            onInterestRateChange={setInterestRate}
            tenureYears={tenureYears}
            onTenureYearsChange={setTenureYears}
            emi={emi}
            totalInterest={totalInterest}
            totalPayment={totalPayment}
            formatCurrency={formatCurrency}
            inputCls={inputCls}
            labelCls={labelCls}
            valueCls={valueCls}
          />
        ) : (
          <ROITab
            key="roi"
            effectiveInvestment={effectiveInvestment}
            growthRate={growthRate}
            onGrowthRateChange={setGrowthRate}
            investmentYears={investmentYears}
            onInvestmentYearsChange={setInvestmentYears}
            investmentAmount={investmentAmount}
            onInvestmentAmountChange={setInvestmentAmount}
            roiData={roiData}
            finalValue={finalValue}
            totalGain={totalGain}
            roiPercent={roiPercent}
            formatCurrency={formatCurrency}
            inputCls={inputCls}
            labelCls={labelCls}
            valueCls={valueCls}
            hasFixedPrice={hasFixedPrice}
            plotSize={plotSize}
            pricePerSqYd={selectedProject.pricePerSqYd}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
