import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { createMetadata } from '@/src/lib/seo';

// ISR: revalidate every 5 minutes — marketing content, fresh enough at this cadence
export const revalidate = 300;

import HeroSection from '@/src/components/home/HeroSection';
import { OrganizationSchema, WebSiteSchema } from '@/src/components/common/Schema';
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
  const t = await getTranslations({ locale, namespace: 'pages.home' });
  const title = t('title');
  const description = t('description');
  return createMetadata({
    title,
    description,
    path: '/',
    locale,
    keywords: [
      'SVI',
      'SVI Infra',
      'SVI Infra Solutions',
      'svi jaipur',
      'Plots in Jaipur',
      'Jaipur Plots',
      'Buy Plot in Jaipur',
      'Residential Plots Jaipur',
      'Residential Land in Jaipur',
      'Plots in Jaipur Under 20 Lakhs',
      'Plots in Jaipur Below 10 Lakhs',
      'Plots Near Khatu Shyam Ji',
      'Plots on Ringas Road Jaipur',
      'Plots Near Renwal Railway Station',
      'Plots in Phulera Smart City',
      'JDA Approved Plots Jaipur',
      'Section 90A Plots Jaipur',
      'Gated Community Plots Jaipur',
      'Shivani Vatika 11th',
      '7500 per sq yard plots Jaipur',
      '100 gaj plot in jaipur',
      '111 gaj plot in jaipur',
      '150 gaj plots near renwal',
      '200 gaj plots jaipur',
      '80% bank loan plots in jaipur',
      'sbi approved plot loan jaipur',
      'plots near jobner jaipur',
      'jobner renwal road plots',
      'patta registry plots in jaipur',
      'dakhil kharij plots jaipur',
      '100 गज प्लॉट जयपुर',
      'जयपुर में 100 गज का प्लॉट',
      'पट्टा रजिस्ट्री प्लॉट जयपुर',
      'एसवीआई',
      'एसवीआई इन्फ्रा',
      'जयपुर में प्लॉट',
      'जयपुर में सस्ते प्लॉट',
      'खाटू श्याम जी प्लॉट',
    ],
  });
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="page-transition flex w-full flex-col overflow-x-hidden">
      <OrganizationSchema />
      <WebSiteSchema />
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
