'use client';

import { ShieldCheck, Award, Building2, Landmark } from 'lucide-react';

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

export default function TrustMetricsGrid() {
  return (
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
  );
}
