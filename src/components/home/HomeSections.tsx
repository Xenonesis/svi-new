'use client';

import dynamic from 'next/dynamic';

import AboutSection from '@/src/components/home/AboutSection';
import TrustAndBanks from '@/src/components/home/TrustAndBanks';
import FeaturesSection from '@/src/components/home/FeaturesSection';
import ProjectsSection from '@/src/components/home/ProjectsSection';
import StatsCounterSection from '@/src/components/home/StatsCounterSection';

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
      <StatsCounterSection />
      <FeaturesSection />
      <TimelineSection />
      <ProjectsSection />
      <InteractiveCalculator />
      <LeadershipSection />
      <HomeBlogs />
      <LotteryCTA />
      <HomeFAQ />
      <CTASection />
    </>
  );
}
