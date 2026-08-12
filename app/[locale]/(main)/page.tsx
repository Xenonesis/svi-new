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
    src: '/images/hero1_new.webp',
    alt: 'SVI Infra luxury residential township in Jaipur with modern architecture',
    blurDataURL:
      'data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADQAQCdASoKAAoABUB8JQBYdhucggzMgAD+qN2QfMkzXlstCgRGNj+KQfscTQgVIRopnYUuRGD46doemR/AAA==',
  },
  {
    src: '/images/hero2_new.webp',
    alt: 'Premium commercial real estate & office space development in Noida by SVI Infra',
    blurDataURL:
      'data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADQAQCdASoKAAoABUB8JQBOgB5vmC8gAAD+g0ZiYjuxVFC3IjnrX63fNZgebRBCaIIdwkI6gsAAAA==',
  },
  {
    src: '/images/hero3_new.webp',
    alt: 'Elegant smart city residential development in Phulera Rajasthan',
    blurDataURL:
      'data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAADwAQCdASoKAAoABUB8JZgCw7EOfFeE/AAA/LTWtRMgQryE5e/uj619KxYKTiXcAAA==',
  },
  {
    src: '/images/hero4_new.webp',
    alt: 'Modern luxury villas and gated communities by SVI Infra',
    blurDataURL:
      'data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAACwAQCdASoKAAoABUB8JQBOgBsxJN0AAPY0kPYY2a10hKcVC22ZBazzsKaXRA3YMQZso7jQW4hvtsymE3TgAA==',
  },
  {
    src: '/images/hero5_new.webp',
    alt: 'Exclusive premium residences with stunning scenic views',
    blurDataURL:
      'data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADwAQCdASoKAAoABUB8JbACdAEO05ND4gAA/eMQyg2KW8WD2BQxY1wA+ntF3FDlN1AzPtitYH/J8+4AAAA=',
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
