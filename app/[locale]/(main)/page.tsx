import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

const HeroSection = dynamic(() => import('@/src/components/home/HeroSection'), {
  ssr: true,
});

const HomeSections = dynamic(() => import('@/src/components/home/HomeSections'));

const StaggerTestimonials = dynamic(() =>
  import('@/src/components/ui/stagger-testimonials').then((mod) => mod.StaggerTestimonials)
);

const HERO_IMAGES = [
  {
    src: '/images/hero1.png',
    alt: 'SVI Infra luxury residential property in Jaipur with modern architecture',
  },
  {
    src: '/images/hero2.png',
    alt: 'Premium commercial real estate development in Noida by SVI Infra',
  },
  { src: '/images/hero3.png', alt: 'Elegant apartment complex in Phulera Smart City Rajasthan' },
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
      <Suspense fallback={null}>
        <HomeSections />
      </Suspense>
      <Suspense fallback={null}>
        <StaggerTestimonials />
      </Suspense>
    </div>
  );
}
