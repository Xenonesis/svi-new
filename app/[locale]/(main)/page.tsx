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
    src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop',
    alt: 'SVI Infra luxury residential property in Jaipur with modern architecture',
  },
  {
    src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop',
    alt: 'Premium commercial real estate development in Noida by SVI Infra',
  },
  {
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    alt: 'Elegant apartment complex in Phulera Smart City Rajasthan',
  },
  {
    src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
    alt: 'Modern luxury villas by SVI Infra',
  },
  {
    src: 'https://images.unsplash.com/photo-1600566753086-00f18efc2291?q=80&w=2070&auto=format&fit=crop',
    alt: 'Exclusive premium residences with stunning views',
  },
  {
    src: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=2070&auto=format&fit=crop',
    alt: 'Architectural excellence in commercial spaces',
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
