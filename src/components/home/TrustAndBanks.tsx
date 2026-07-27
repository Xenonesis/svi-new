'use client';

import React from 'react';
import { ShieldCheck, Award, Building2, Landmark, CheckCircle2 } from 'lucide-react';
import AnimatedSection from '@/src/components/ui/AnimatedSection';

const APPROVED_BANKS = [
  { name: 'State Bank of India', short: 'SBI Home Loans' },
  { name: 'HDFC Bank', short: 'HDFC Bank' },
  { name: 'ICICI Bank', short: 'ICICI Bank' },
  { name: 'Bank of Baroda', short: 'Bank of Baroda' },
  { name: 'Axis Bank', short: 'Axis Bank' },
];

const TRUST_METRICS = [
  {
    icon: ShieldCheck,
    title: 'RERA Registered',
    desc: '100% compliant projects & clear land titles',
  },
  { icon: Landmark, title: 'Bank Loan Approval', desc: 'Up to 80-90% instant land & home loans' },
  {
    icon: Award,
    title: 'ISO 9001:2015',
    desc: 'Certified quality construction & township planning',
  },
  { icon: Building2, title: '15+ Years Legacy', desc: '5,000+ satisfied family home buyers' },
];

export default function TrustAndBanks() {
  return (
    <section className="border-y border-gray-200 bg-slate-50 py-12 transition-colors duration-300 md:py-16 dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Trust Badges Row */}
        <AnimatedSection type="fadeIn">
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_METRICS.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div
                  key={idx}
                  className="hover:border-brand-gold/50 flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="dark:text-brand-gold shrink-0 rounded-lg bg-amber-500/10 p-3 text-amber-600">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-gray-900 dark:text-gray-100">
                      {metric.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed font-normal text-gray-600 dark:text-gray-400">
                      {metric.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Bank Approvals Showcase */}
        <AnimatedSection type="fadeUp" delay={0.2}>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-8 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 text-center md:flex md:items-center md:justify-between md:text-left">
              <div>
                <span className="dark:text-brand-gold text-[10px] font-bold tracking-widest text-amber-600 uppercase">
                  FINANCIAL PARTNERSHIPS
                </span>
                <h3 className="mt-1 font-serif text-xl font-bold text-gray-900 md:text-2xl dark:text-gray-100">
                  Approved by India&apos;s Leading Nationalized Banks
                </h3>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 md:mt-0 dark:text-emerald-400">
                <CheckCircle2 size={16} />
                <span>Instant 80-90% Sanction Available</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {APPROVED_BANKS.map((bank, i) => (
                <div
                  key={i}
                  className="group hover:border-brand-gold relative flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50/80 p-4 text-center transition-all duration-300 hover:bg-white hover:shadow-md dark:border-gray-800 dark:bg-gray-800/80 dark:hover:bg-gray-800"
                >
                  <Landmark className="text-brand-navy dark:text-brand-gold mb-2 h-6 w-6 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    {bank.short}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
