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
import { CorridorEmiWidget } from '@/src/components/plots/common/CorridorEmiWidget';
import { CORRIDOR_COMMON_AMENITIES } from '@/src/data/corridorAmenities';
import {
  RENWAL_PAGE_KEYWORDS,
  RENWAL_PAGE_META,
  RENWAL_FAQS,
  PlotsRenwalHero,
  PlotsRenwalFeatured,
  PlotsRenwalFaq,
} from '@/src/components/plots/renwal';

export const revalidate = 86400;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHindi = locale === 'hi';

  const title = isHindi ? RENWAL_PAGE_META.titleHi : RENWAL_PAGE_META.titleEn;
  const description = isHindi ? RENWAL_PAGE_META.descHi : RENWAL_PAGE_META.descEn;

  return {
    title,
    description,
    keywords: RENWAL_PAGE_KEYWORDS,
    alternates: buildAlternates('/plots-near-renwal-railway-station', locale),
    openGraph: {
      title,
      description,
      url: localizedUrl('/plots-near-renwal-railway-station', locale),
      locale: isHindi ? 'hi_IN' : 'en_IN',
      images: [{ url: `${SITE_URL}/Shivani Vatika 11/gate.webp`, width: 1200, height: 630 }],
    },
  };
}

export default async function PlotsNearRenwalPage({ params }: Props) {
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
            name: isHindi ? 'रेनवाल के पास प्लॉट्स' : 'Plots Near Renwal',
            item: '/plots-near-renwal-railway-station',
          },
        ]}
      />

      <PlaceAndAreaSchema
        name="Renwal Railway Station & Harsholi Residential Hub"
        description="Plotted residential developments near Renwal Railway Station on Jaipur to Khatu Shyam Ji corridor."
        url={localizedUrl('/plots-near-renwal-railway-station', locale)}
        latitude={27.0863}
        longitude={75.4052}
        addressLocality="Renwal"
        addressRegion="Rajasthan"
        postalCode="303603"
      />

      <FAQSchema questions={RENWAL_FAQS} />

      <RealEstateListingSchema
        name="Residential Plots Near Renwal Railway Station"
        description="Gated plotted development near Kishangarh Renwal Railway Station and 64-acre RIICO Industrial Area with 30 ft wide blacktop roads and 80% bank loan approval."
        image="/Shivani Vatika 11/gate.webp"
        location="Renwal, Jaipur, Rajasthan"
        status="InStock"
        lowPrice="600000"
        highPrice="1875000"
        offerCount={230}
        url={localizedUrl('/plots-near-renwal-railway-station', locale)}
        pdfUrl="/Shivani Vatika 11/master-plan-layout.pdf"
        amenities={CORRIDOR_COMMON_AMENITIES}
      />

      <PlotsRenwalHero isHindi={isHindi} />
      <PlotsRenwalFeatured isHindi={isHindi} />
      <div className="container mx-auto px-4">
        <CorridorEmiWidget
          corridorName={
            isHindi
              ? 'रेनवाल रेलवे स्टेशन व रीको इंडस्ट्रियल एरिया'
              : 'Renwal Railway Station & RIICO Industrial Hub'
          }
          isHindi={isHindi}
        />
      </div>
      <PlotsRenwalFaq isHindi={isHindi} />

      <SiteVisitPill areaName="Plots Near Renwal" defaultPickup="Doorstep in Jaipur City" />
    </div>
  );
}
