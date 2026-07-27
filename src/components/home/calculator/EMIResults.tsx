'use client';

import Link from 'next/link';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface EMIResultsProps {
  monthlyEmi: number;
  loanAmountLakhs: number;
  totalInterest: number;
  projectedValuation: number;
}

export default function EMIResults({
  monthlyEmi,
  loanAmountLakhs,
  totalInterest,
  projectedValuation,
}: EMIResultsProps) {
  return (
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
          className="text-brand-navy dark:bg-brand-gold rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold shadow-md transition-all hover:bg-white"
        >
          Apply Loan
        </Link>
      </div>
    </div>
  );
}
