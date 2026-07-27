'use client';

import AnimatedSection from '@/src/components/ui/AnimatedSection';
import TrustMetricsGrid from './TrustMetricsGrid';
import BankApprovalsGrid from './BankApprovalsGrid';

export default function TrustAndBanks() {
  return (
    <section className="border-y border-gray-200 bg-slate-50 py-12 transition-colors duration-300 md:py-16 dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Trust Badges Row */}
        <AnimatedSection type="fadeIn">
          <TrustMetricsGrid />
        </AnimatedSection>

        {/* Bank Approvals Showcase */}
        <BankApprovalsGrid />
      </div>
    </section>
  );
}
