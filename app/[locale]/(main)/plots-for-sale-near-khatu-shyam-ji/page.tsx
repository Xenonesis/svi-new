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
  KHATU_PAGE_KEYWORDS,
  KHATU_PAGE_META,
  KHATU_FAQS_EN,
  KHATU_FAQS_HI,
} from '@/src/components/plots/khatu-shyam/khatuData';
import { KhatuHeroSection } from '@/src/components/plots/khatu-shyam/KhatuHeroSection';
import { KhatuStrategicGrowthSection } from '@/src/components/plots/khatu-shyam/KhatuStrategicGrowthSection';
import { KhatuTownshipSpotlight } from '@/src/components/plots/khatu-shyam/KhatuTownshipSpotlight';
import { KhatuTransitMatrixSection } from '@/src/components/plots/khatu-shyam/KhatuTransitMatrixSection';
import { KhatuDueDiligenceSection } from '@/src/components/plots/khatu-shyam/KhatuDueDiligenceSection';
import { KhatuFaqAccordion } from '@/src/components/plots/khatu-shyam/KhatuFaqAccordion';
import { KhatuCtaBanner } from '@/src/components/plots/khatu-shyam/KhatuCtaBanner';

export const revalidate = 86400;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHindi = locale === 'hi';
  const title = isHindi ? KHATU_PAGE_META.titleHi : KHATU_PAGE_META.titleEn;
  const description = isHindi ? KHATU_PAGE_META.descHi : KHATU_PAGE_META.descEn;

  return {
    title,
    description,
    keywords: KHATU_PAGE_KEYWORDS,
    alternates: buildAlternates('/plots-for-sale-near-khatu-shyam-ji', locale),
    openGraph: {
      title,
      description,
      url: localizedUrl('/plots-for-sale-near-khatu-shyam-ji', locale),
      locale: isHindi ? 'hi_IN' : 'en_IN',
      images: [{ url: `${SITE_URL}/Shivani Vatika 11/gate.webp`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/Shivani Vatika 11/gate.webp`],
    },
  };
}

export default async function PlotsNearKhatuShyamJiPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';
  const faqs = isHindi ? KHATU_FAQS_HI : KHATU_FAQS_EN;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <BreadcrumbSchema
        items={[
          { name: 'Home', item: '/' },
          { name: isHindi ? 'कॉरिडोर्स' : 'Corridors', item: '/areas/khatu-shyam-highway' },
          {
            name: isHindi ? 'खाटू श्याम जी के पास प्लॉट्स' : 'Plots Near Khatu Shyam Ji',
            item: '/plots-for-sale-near-khatu-shyam-ji',
          },
        ]}
      />
      <PlaceAndAreaSchema
        name={
          isHindi
            ? 'जयपुर - खाटू श्याम जी हाईवे कॉरिडोर'
            : 'Jaipur to Khatu Shyam Ji Highway Corridor'
        }
        description={
          isHindi
            ? 'खाटू श्याम जी मंदिर के पास 4-लेन राजमार्ग पर आवासीय एवं कमर्शियल प्लॉटेड टाउनशिप कॉरिडोर।'
            : 'High-growth plotted residential township corridor on the Jaipur to Khatu Shyam Ji 4-lane highway near Harsholi and Renwal.'
        }
        url={localizedUrl('/plots-for-sale-near-khatu-shyam-ji', locale)}
        latitude={27.130247}
        longitude={75.422285}
        addressLocality="Harsholi, Kishangarh Renwal"
        addressRegion="Rajasthan"
        postalCode="303603"
        image={`${SITE_URL}/Shivani Vatika 11/gate.webp`}
      />

      <RealEstateListingSchema
        name="Shivani Vatika 11th - Plots Near Khatu Shyam Ji"
        description="Gated residential plotted society of 230 plots (80 to 250 sq. yds.) on Jaipur - Khatu Shyam Ji Highway at Harsholi, 20-25 mins from temple."
        image="/Shivani Vatika 11/gate.webp"
        location="Harsholi, Jaipur to Khatu Shyam Ji Highway"
        status="InStock"
        price="1500000"
        url={localizedUrl('/plots-for-sale-near-khatu-shyam-ji', locale)}
        pdfUrl="/Shivani Vatika 11/master-plan-layout.pdf"
      />
      <FAQSchema questions={faqs} />
      <KhatuHeroSection isHindi={isHindi} />
      <KhatuStrategicGrowthSection isHindi={isHindi} />
      <KhatuTownshipSpotlight isHindi={isHindi} />
      <KhatuTransitMatrixSection isHindi={isHindi} />
      <KhatuDueDiligenceSection isHindi={isHindi} />
      <KhatuFaqAccordion isHindi={isHindi} faqs={faqs} />
      <KhatuCtaBanner isHindi={isHindi} />

      <SiteVisitPill
        areaName="Shivani Vatika 11th (Khatu Shyam Highway)"
        defaultPickup="Doorstep Pickup in Jaipur City"
      />
    </div>
  );
}
