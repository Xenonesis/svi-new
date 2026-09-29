import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SITE_URL, buildAlternates, localizedUrl } from '@/src/lib/seo';
import {
  BreadcrumbSchema,
  FAQSchema,
  PlaceAndAreaSchema,
  RealEstateListingSchema,
} from '@/src/components/common/Schema';
import SiteVisitPill from '@/src/components/common/SiteVisitPill';
import {
  JAIPUR_FAQS_EN,
  JAIPUR_FAQS_HI,
  JAIPUR_PAGE_KEYWORDS,
  JAIPUR_PAGE_META,
  JAIPUR_PLACE_SCHEMA,
  JAIPUR_LISTING_SCHEMA,
} from '@/src/components/plots/jaipur/jaipurPlotsData';
import { JaipurPlotsHero } from '@/src/components/plots/jaipur/JaipurPlotsHero';
import { JaipurProjectsInventoryGrid } from '@/src/components/plots/jaipur/JaipurProjectsInventoryGrid';
import { JaipurCorridorDiscoveryHub } from '@/src/components/plots/jaipur/JaipurCorridorDiscoveryHub';
import { JaipurPlotsFaqSection } from '@/src/components/plots/jaipur/JaipurPlotsFaqSection';

export const revalidate = 86400;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHindi = locale === 'hi';
  const title = isHindi ? JAIPUR_PAGE_META.titleHi : JAIPUR_PAGE_META.titleEn;
  const description = isHindi ? JAIPUR_PAGE_META.descHi : JAIPUR_PAGE_META.descEn;

  return {
    title,
    description,
    keywords: JAIPUR_PAGE_KEYWORDS,
    alternates: buildAlternates('/plots-in-jaipur', locale),
    openGraph: {
      title,
      description,
      url: localizedUrl('/plots-in-jaipur', locale),
      locale: isHindi ? 'hi_IN' : 'en_IN',
      images: [{ url: `${SITE_URL}/images/project1.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function PlotsInJaipurPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';
  const faqs = isHindi ? JAIPUR_FAQS_HI : JAIPUR_FAQS_EN;
  const url = localizedUrl('/plots-in-jaipur', locale);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <BreadcrumbSchema
        items={[
          { name: 'Home', item: '/' },
          { name: isHindi ? 'जयपुर में प्लॉट्स' : 'Plots in Jaipur', item: '/plots-in-jaipur' },
        ]}
      />
      <PlaceAndAreaSchema {...JAIPUR_PLACE_SCHEMA} url={url} />
      <FAQSchema questions={faqs} />
      <RealEstateListingSchema {...JAIPUR_LISTING_SCHEMA} url={url} />

      <JaipurPlotsHero isHindi={isHindi} />
      <JaipurProjectsInventoryGrid isHindi={isHindi} locale={locale} />
      <JaipurCorridorDiscoveryHub isHindi={isHindi} />
      <JaipurPlotsFaqSection isHindi={isHindi} faqs={faqs} />

      <SiteVisitPill
        areaName="Jaipur Residential Townships"
        defaultPickup="Doorstep in Jaipur City"
      />
    </div>
  );
}
