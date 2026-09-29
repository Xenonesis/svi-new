'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck, TrendingUp, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { calculateEMI } from '@/src/lib/emi';

interface PresetOption {
  label: string;
  sizeSqYd: number;
  totalCostLakhs: number;
  loanLakhs: number; // 80% bank loan
}

const PRESETS: PresetOption[] = [
  { label: '80 Sq. Yds (Compact)', sizeSqYd: 80, totalCostLakhs: 6.0, loanLakhs: 4.8 },
  { label: '150 Sq. Yds (Standard)', sizeSqYd: 150, totalCostLakhs: 11.25, loanLakhs: 9.0 },
  { label: '250 Sq. Yds (Executive)', sizeSqYd: 250, totalCostLakhs: 18.75, loanLakhs: 15.0 },
];

export interface CorridorEmiWidgetProps {
  corridorName: string;
  isHindi?: boolean;
}

export function CorridorEmiWidget({ corridorName, isHindi = false }: CorridorEmiWidgetProps) {
  const [selectedPreset, setSelectedPreset] = useState<number>(1);
  const [tenureYears, setTenureYears] = useState<number>(10);
  const interestRate = 8.5; // Benchmark home loan rate

  const activePreset = PRESETS[selectedPreset];
  const { monthlyEmi, projectedValuation } = calculateEMI(
    activePreset.loanLakhs,
    tenureYears,
    interestRate,
    0.15 // 15% estimated annual corridor appreciation
  );

  return (
    <section className="relative mx-auto my-12 max-w-5xl overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md md:p-8">
      {/* Decorative gradient glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-400 uppercase">
            <Calculator className="h-3.5 w-3.5" />
            {isHindi ? 'त्वरित ईएमआई व रिटर्न कैलकुलेटर' : 'Instant EMI & Return Estimator'}
          </div>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
            {isHindi
              ? `${corridorName} में अपने प्लॉट की ईएमआई का अनुमान लगाएं`
              : `Estimate Your Plot EMI in ${corridorName}`}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {isHindi
              ? '80% बैंक लोन सुविधा (SBI, HDFC, ICICI, BOB) और स्पष्ट सेक्शन 90-A पट्टा।'
              : 'Eligible for up to 80% bank loans with nationalized & private banks on Section 90-A clear title.'}
          </p>
        </div>

        <Link
          href="/calculators"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 transition-colors hover:text-amber-300"
        >
          <span>{isHindi ? 'विस्तृत वित्तीय कैलकुलेटर' : 'Open Full Financial Suite'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Preset selection pills */}
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PRESETS.map((p, idx) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setSelectedPreset(idx)}
            className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
              selectedPreset === idx
                ? 'border-amber-500 bg-amber-500/15 shadow-lg shadow-amber-500/10'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
            }`}
          >
            <span className="text-xs font-medium text-slate-400">{p.label}</span>
            <span className="mt-1 text-lg font-bold text-white">
              ₹{p.totalCostLakhs.toFixed(2)} Lakhs
            </span>
            <span className="mt-0.5 text-xs text-amber-400/90">
              {p.sizeSqYd} sq. yds. @ ₹7,500/yd
            </span>
          </button>
        ))}
      </div>

      {/* Tenure Slider & Result Cards */}
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
        {/* Controls Column */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 lg:col-span-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-300">
              {isHindi ? 'लोन अवधि (वर्ष)' : 'Loan Tenure'}
            </span>
            <span className="font-bold text-amber-400">
              {tenureYears} {isHindi ? 'वर्ष' : 'Years'}
            </span>
          </div>

          <input
            type="range"
            min={3}
            max={20}
            step={1}
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-amber-500"
          />

          <div className="mt-2 flex justify-between text-[11px] text-slate-500">
            <span>3 Years</span>
            <span>10 Years</span>
            <span>20 Years</span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
            <span>{isHindi ? 'ब्याज दर (वार्षिक)' : 'Interest Rate'}</span>
            <span className="font-semibold text-slate-200">8.5% p.a.</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>{isHindi ? 'लोन राशि (80%)' : 'Estimated Bank Loan (80%)'}</span>
            <span className="font-semibold text-slate-200">
              ₹{activePreset.loanLakhs.toFixed(2)} Lakhs
            </span>
          </div>
        </div>

        {/* Calculated Results Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
          {/* Monthly EMI Card */}
          <div className="flex flex-col justify-between rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-slate-900/60 p-5">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-amber-400 uppercase">
                <IndianRupee className="h-3.5 w-3.5" />
                {isHindi ? 'मासिक ईएमआई' : 'Estimated Monthly EMI'}
              </span>
              <div className="mt-2 text-3xl font-extrabold text-white">
                ₹{monthlyEmi.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-400"> /mo</span>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              {isHindi ? '80% तक बैंक लोन स्वीकृत' : 'Nationalized banks approved'}
            </p>
          </div>

          {/* 5-Year Appreciation Card */}
          <div className="flex flex-col justify-between rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-slate-900/60 p-5">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-blue-400 uppercase">
                <TrendingUp className="h-3.5 w-3.5" />
                {isHindi ? '5-वर्ष अनुमानित मूल्य' : '5-Yr Estimated Value'}
              </span>
              <div className="mt-2 text-3xl font-extrabold text-white">
                ₹{(projectedValuation / 100000).toFixed(1)} Lakhs
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {isHindi ? '15% वार्षिक कॉरिडोर विकास दर पर' : 'At ~15% p.a. infrastructure CAGR'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
