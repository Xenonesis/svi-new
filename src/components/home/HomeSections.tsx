'use client';

import dynamic from 'next/dynamic';

import AboutSection from '@/src/components/home/AboutSection';
import TrustAndBanks from '@/src/components/home/TrustAndBanks';
const StatsCounterSection = dynamic(() => import('@/src/components/home/StatsCounterSection'));
const FeaturesSection = dynamic(() => import('@/src/components/home/FeaturesSection'));
const ProjectsSection = dynamic(() => import('@/src/components/home/ProjectsSection'));
const CorridorDiscovery = dynamic(() => import('@/src/components/home/CorridorDiscovery'));
// Below-the-fold dynamic imports to reduce initial main-thread script execution & bootup time
const InteractiveCalculator = dynamic(() => import('@/src/components/home/InteractiveCalculator'), {
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-100 dark:bg-gray-900" />,
});
const LeadershipSection = dynamic(() => import('@/src/components/home/LeadershipSection'));
const HomeBlogs = dynamic(() => import('@/src/components/home/HomeBlogs'));
const TimelineSection = dynamic(() => import('@/src/components/home/TimelineSection'));
const CTASection = dynamic(() => import('@/src/components/home/CTASection'));
const HomeFAQ = dynamic(() => import('@/src/components/home/HomeFAQ'));

// Keep ssr:false for interactive-only components that rely on browser APIs
const LotteryCTA = dynamic(() => import('@/src/components/lottery/LotteryCTA'), { ssr: false });

export default function HomeSections() {
  return (
    <>
      <TrustAndBanks />
      <AboutSection />
      <div className="cv-auto">
        <StatsCounterSection />
      </div>
      <div className="cv-auto">
        <FeaturesSection />
      </div>
      <div className="cv-auto">
        <TimelineSection />
      </div>
      <div className="cv-auto">
        <ProjectsSection />
      </div>
      <div className="cv-auto">
        <CorridorDiscovery />
      </div>
      <div className="cv-auto">
        <InteractiveCalculator />
      </div>
      <div className="cv-auto">
        <LeadershipSection />
      </div>
      <div className="cv-auto">
        <HomeBlogs />
      </div>
      <div className="cv-auto">
        <LotteryCTA />
      </div>
      <div className="cv-auto">
        <HomeFAQ />
      </div>
      <div className="cv-auto">
        <CTASection />
      </div>
    </>
  );
}
