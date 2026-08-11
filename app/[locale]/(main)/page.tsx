import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

// ISR: revalidate every 5 minutes — marketing content, fresh enough at this cadence
export const revalidate = 300;

import HeroSection from '@/src/components/home/HeroSection';
import HomeSections from '@/src/components/home/HomeSections';
import { StaggerTestimonials } from '@/src/components/ui/stagger-testimonials';

const HERO_IMAGES = [
  {
    src: '/images/hero1.webp',
    alt: 'SVI Infra luxury residential property in Jaipur with modern architecture',
  },
  {
    src: '/images/hero2.webp',
    alt: 'Premium commercial real estate development in Noida by SVI Infra',
  },
  {
    src: '/images/hero3_new.webp',
    alt: 'Elegant apartment complex in Phulera Smart City Rajasthan',
  },
  {
    src: '/images/hero4_new.webp',
    alt: 'Modern luxury villas by SVI Infra',
  },
  {
    src: '/images/hero5_new.webp',
    alt: 'Exclusive premium residences with stunning views',
  },
];

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHindi = locale === 'hi';
  return {
    title: isHindi
      ? 'SVI Infra Solutions - प्रीमियम रियल एस्टेट डेवलपर, जयपुर और नोएडा'
      : 'SVI Infra Solutions - Premium Real Estate Developer | Jaipur & Noida',
  };
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="page-transition flex w-full flex-col overflow-x-hidden">
      <HeroSection images={HERO_IMAGES} />
      <Suspense fallback={<div className="bg-brand-dark/20 h-96 w-full animate-pulse" />}>
        <HomeSections />
      </Suspense>
      <Suspense fallback={<div className="bg-brand-dark/20 h-64 w-full animate-pulse" />}>
        <StaggerTestimonials />
      </Suspense>
    </div>
  );
}
