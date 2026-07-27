'use client';

import StatsCounter from '@/src/components/ui/StatsCounter';

export default function StatsCounterSection() {
  return (
    <section className="border-brand-gold border-opacity-30 bg-brand-bg dark:bg-brand-dark-bg relative overflow-hidden border-y">
      <StatsCounter />
    </section>
  );
}
