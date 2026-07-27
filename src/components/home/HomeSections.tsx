'use client';

import dynamic from 'next/dynamic';

import AboutSection from '@/src/components/home/AboutSection';
import TrustAndBanks from '@/src/components/home/TrustAndBanks';
import FeaturesSection from '@/src/components/home/FeaturesSection';
import ProjectsSection from '@/src/components/home/ProjectsSection';
import InteractiveCalculator from '@/src/components/home/InteractiveCalculator';
import LeadershipSection from '@/src/components/home/LeadershipSection';
import HomeBlogs from '@/src/components/home/HomeBlogs';
import TimelineSection from '@/src/components/home/TimelineSection';
import CTASection from '@/src/components/home/CTASection';
import HomeFAQ from '@/src/components/home/HomeFAQ';
import StatsCounterSection from '@/src/components/home/StatsCounterSection';

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
