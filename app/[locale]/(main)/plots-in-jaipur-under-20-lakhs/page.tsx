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
import { CORRIDOR_COMMON_AMENITIES } from '@/src/data/corridorAmenities';
import {
  BUDGET_PAGE_KEYWORDS,
  BUDGET_PAGE_META,
  BUDGET_FAQS,
  PlotsUnder20LakhsHero,
  PlotsUnder20LakhsFeatured,
  PlotsUnder20LakhsFaq,
} from '@/src/components/plots/under-20-lakhs';

export const revalidate = 86400;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHindi = locale === 'hi';

  const title = isHindi ? BUDGET_PAGE_META.titleHi : BUDGET_PAGE_META.titleEn;
  const description = isHindi ? BUDGET_PAGE_META.descHi : BUDGET_PAGE_META.descEn;

  return {
    title,
    description,
    keywords: BUDGET_PAGE_KEYWORDS,
    alternates: buildAlternates('/plots-in-jaipur-under-20-lakhs', locale),
    openGraph: {
      title,
      description,
      url: localizedUrl('/plots-in-jaipur-under-20-lakhs', locale),
      locale: isHindi ? 'hi_IN' : 'en_IN',
      images: [{ url: `${SITE_URL}/images/project1.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function PlotsUnder20LakhsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <BreadcrumbSchema
        items={[
          { name: 'Home', item: '/' },
          { name: 'Plots in Jaipur', item: '/plots-in-jaipur' },
          {
            name: isHindi ? '20 लाख के अंदर प्लॉट्स' : 'Plots Under 20 Lakhs',
            item: '/plots-in-jaipur-under-20-lakhs',
          },
        ]}
      />

      <PlaceAndAreaSchema
        name="Affordable Residential Plots Jaipur"
        description="Low budget residential plots under 20 Lakhs in Jaipur district."
        url={localizedUrl('/plots-in-jaipur-under-20-lakhs', locale)}
        latitude={26.9124}
        longitude={75.7873}
        addressLocality="Jaipur"
        addressRegion="Rajasthan"
        postalCode="302001"
      />

      <FAQSchema questions={BUDGET_FAQS} />

      <RealEstateListingSchema
        name="Residential Plots in Jaipur Under 20 Lakhs"
        description="Affordable residential plots (80 to 150 sq. yds.) in Jaipur starting from ₹6 Lakhs to ₹15 Lakhs with 80% bank loan approval and clear 90-A patta registry."
        image="/images/project1.png"
        location="Jaipur, Rajasthan"
        status="InStock"
        lowPrice="600000"
        highPrice="1500000"
        offerCount={120}
        url={localizedUrl('/plots-in-jaipur-under-20-lakhs', locale)}
        pdfUrl="/Shivani Vatika 11/master-plan-layout.pdf"
        amenities={CORRIDOR_COMMON_AMENITIES}
      />

      <PlotsUnder20LakhsHero isHindi={isHindi} />
      <PlotsUnder20LakhsFeatured isHindi={isHindi} />
      <PlotsUnder20LakhsFaq isHindi={isHindi} />

      <SiteVisitPill areaName="Affordable Plots Jaipur" defaultPickup="Doorstep in Jaipur City" />
    </div>
  );
}
