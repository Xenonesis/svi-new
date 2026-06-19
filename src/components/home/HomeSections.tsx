'use client';

import dynamic from 'next/dynamic';

const AboutSection = dynamic(() => import('@/src/components/home/AboutSection'));
const FeaturesSection = dynamic(() => import('@/src/components/home/FeaturesSection'));
const ProjectsSection = dynamic(() => import('@/src/components/home/ProjectsSection'));
const LeadershipSection = dynamic(() => import('@/src/components/home/LeadershipSection'));
const TimelineSection = dynamic(() => import('@/src/components/home/TimelineSection'));
const CTASection = dynamic(() => import('@/src/components/home/CTASection'));
const HomeFAQ = dynamic(() => import('@/src/components/home/HomeFAQ'));
// Keep ssr:false for interactive-only components that rely on browser APIs
const LotteryCTA = dynamic(() => import('@/src/components/lottery/LotteryCTA'), { ssr: false });
const StatsCounter = dynamic(() => import('@/src/components/ui/StatsCounter'), { ssr: false });

export default function HomeSections() {
  return (
    <>
      <AboutSection />
      <section className="bg-brand-bg dark:bg-brand-dark-bg border-brand-gold border-opacity-30 relative overflow-hidden border-y">
        <StatsCounter />
      </section>
      <FeaturesSection />
      <TimelineSection />
      <ProjectsSection />
      <LeadershipSection />
      <LotteryCTA />
      <HomeFAQ />
      <CTASection />
    </>
  );
}
