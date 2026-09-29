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
  PHULERA_PAGE_META,
  PHULERA_PAGE_KEYWORDS,
  PHULERA_FAQS_EN,
  PHULERA_FAQS_HI,
  PHULERA_CORRIDOR_NAME,
  PHULERA_CORRIDOR_DESC,
  PHULERA_LISTING_DESC,
} from '@/src/components/plots/phulera/phuleraData';
import { PhuleraHeroSection } from '@/src/components/plots/phulera/PhuleraHeroSection';
import { PhuleraAdvantageSection } from '@/src/components/plots/phulera/PhuleraAdvantageSection';
import { PhuleraTownshipSpotlight } from '@/src/components/plots/phulera/PhuleraTownshipSpotlight';
import { PhuleraCommuteTable } from '@/src/components/plots/phulera/PhuleraCommuteTable';
import { PhuleraFaqSection } from '@/src/components/plots/phulera/PhuleraFaqSection';
import { PhuleraLeadCaptureSection } from '@/src/components/plots/phulera/PhuleraLeadCaptureSection';

export const revalidate = 86400;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHindi = locale === 'hi';
  const title = isHindi ? PHULERA_PAGE_META.titleHi : PHULERA_PAGE_META.titleEn;
  const description = isHindi ? PHULERA_PAGE_META.descHi : PHULERA_PAGE_META.descEn;
  const url = localizedUrl('/plots-for-sale-in-phulera', locale);
  const image = `${SITE_URL}/images/landmarks/phulera-dmic.webp`;

  return {
    title: { absolute: title },
    description,
    keywords: PHULERA_PAGE_KEYWORDS,
    alternates: buildAlternates('/plots-for-sale-in-phulera', locale),
    openGraph: {
      title,
      description,
      url,
      locale: isHindi ? 'hi_IN' : 'en_IN',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function PlotsForSaleInPhuleraPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';
  const faqItems = isHindi ? PHULERA_FAQS_HI : PHULERA_FAQS_EN;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <BreadcrumbSchema
        items={[
          { name: isHindi ? 'होम' : 'Home', item: '/' },
          { name: isHindi ? 'कॉरिडोर्स' : 'Corridors', item: '/areas' },
          {
            name: isHindi ? 'फुलेरा में प्लॉट्स' : 'Plots for Sale in Phulera',
            item: '/plots-for-sale-in-phulera',
          },
        ]}
      />
      <PlaceAndAreaSchema
        name={isHindi ? PHULERA_CORRIDOR_NAME.hi : PHULERA_CORRIDOR_NAME.en}
        description={isHindi ? PHULERA_CORRIDOR_DESC.hi : PHULERA_CORRIDOR_DESC.en}
        url={localizedUrl('/plots-for-sale-in-phulera', locale)}
        latitude={26.9}
        longitude={75.18}
        postalCode="303338"
        addressRegion="Rajasthan"
        addressLocality="Phulera DMIC Corridor, Jaipur District"
        image={`${SITE_URL}/images/landmarks/phulera-dmic.webp`}
      />
      <FAQSchema questions={faqItems} />
      <RealEstateListingSchema
        name="Residential & Commercial Plots in Phulera Smart City"
        description={PHULERA_LISTING_DESC}
        image="/images/landmarks/phulera-dmic.webp"
        location="Phulera Smart City, Jaipur, Rajasthan"
        status="InStock"
        lowPrice="1500000"
        highPrice="4500000"
        offerCount={85}
        url={localizedUrl('/plots-for-sale-in-phulera', locale)}
      />

      <PhuleraHeroSection isHindi={isHindi} />
      <PhuleraAdvantageSection isHindi={isHindi} />
      <PhuleraTownshipSpotlight isHindi={isHindi} />
      <PhuleraCommuteTable isHindi={isHindi} />
      <PhuleraFaqSection isHindi={isHindi} faqItems={faqItems} />
      <PhuleraLeadCaptureSection isHindi={isHindi} />

      <SiteVisitPill
        areaName="Phulera DMIC Smart City"
        defaultPickup="Jaipur City or Phulera Junction"
      />
    </div>
  );
}
