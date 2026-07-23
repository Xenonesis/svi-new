import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

// ISR: revalidate every 5 minutes — marketing content, fresh enough at this cadence
export const revalidate = 300;

const HeroSection = dynamic(() => import('@/src/components/home/HeroSection'), {
  ssr: true,
});

const HomeSections = dynamic(() => import('@/src/components/home/HomeSections'));

const StaggerTestimonials = dynamic(() =>
  import('@/src/components/ui/stagger-testimonials').then((mod) => mod.StaggerTestimonials)
);

const HERO_BLUR_DATA: Record<string, string> = {
  '/images/hero1.png':
    'data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADwAQCdASoKAAoABUB8JZACdACqG05r0CAA/qlVVhA9VaE0rPDQV3HxqKXOpfCgs1oOGUBdVS8cJGgwt3eEG79QAAA=',
  '/images/hero2.png':
    'data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAADQAQCdASoKAAoABUB8JQBOgBuCRWoMAADzyLr2msjgBxDUpQk6LGwZLuEX3Yu3yU6jwLPMP+iE7IAA',
  '/images/hero3.png':
    'data:image/webp;base64,UklGRj4AAABXRUJQVlA4IDIAAADQAQCdASoKAAoABUB8JQBOgCHego7kwADeV1AT0ZY2IYzptbSLuYNuqO/a6x4Elu6AAA==',
};

const HERO_IMAGES = [
  {
    src: '/images/hero1.png',
    alt: 'SVI Infra luxury residential property in Jaipur with modern architecture',
    blurDataURL: HERO_BLUR_DATA['/images/hero1.png'],
  },
  {
    src: '/images/hero2.png',
    alt: 'Premium commercial real estate development in Noida by SVI Infra',
    blurDataURL: HERO_BLUR_DATA['/images/hero2.png'],
  },
  {
    src: '/images/hero3.png',
    alt: 'Elegant apartment complex in Phulera Smart City Rajasthan',
    blurDataURL: HERO_BLUR_DATA['/images/hero3.png'],
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
