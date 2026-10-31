import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SITE_URL, SITE_NAME, buildAlternates, localizedUrl } from '@/src/lib/seo';
import { BreadcrumbSchema, RealEstateListingSchema } from '@/src/components/common/Schema';
import AnalyticsTracker from '@/src/components/ui/AnalyticsTracker';
import { ShivaniVatika13thPageClient } from '@/src/components/projects/shivani-vatika-13th/ShivaniVatika13thPageClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const isHindi = locale === 'hi';
  const title = isHindi
    ? 'शिवानी वाटिका 13th | 60 आवासीय प्लॉट्स, सांभर-फुलेरा | SVI Infra'
    : 'Shivani Vatika 13th | 60 Residential Plots in Sambhar–Phulera | SVI Infra';

  const description = isHindi
    ? 'सांभर-फुलेरा, राजस्थान में 60 सुनियोजित आवासीय भूखंड। 30 फीट चौड़ी आंतरिक सड़कें, पार्क, मंदिर, दाखिल-खारिज सहित पक्की रजिस्ट्री एवं मात्र ₹9,999/माह (40 महीने) की आसान किस्तें।'
    : 'Exclusive 60 residential plots township in Sambhar–Phulera, Rajasthan. Features 30 ft internal roads, park, temple, verified registry with mutation, and easy ₹9,999/month installment plan for 40 months.';

  const url = localizedUrl('/projects/shivani-vatika-13th', locale);

  return {
    title,
    description,
    alternates: buildAlternates('/projects/shivani-vatika-13th', locale),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: locale === 'hi' ? 'hi_IN' : 'en_IN',
      type: 'website',
      images: [
        {
          url: `${SITE_URL}/Shivani Vatika 11/gate.webp`,
          width: 1200,
          height: 630,
          alt: 'Shivani Vatika 13th Grand Entrance Gate',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/Shivani Vatika 11/gate.webp`],
    },
  };
}

export default async function ShivaniVatika13thPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';

  const pageTitle = isHindi ? 'शिवानी वाटिका 13th' : 'Shivani Vatika 13th';
  const pageDesc = isHindi
    ? 'सांभर-फुलेरा में 60 सुनियोजित आवासीय प्लॉट्स, 30 फीट चौड़ी सड़कें, पार्क और मंदिर युक्त विशेष टाउनशिप।'
    : 'Exclusive 60-plot residential township in Sambhar-Phulera with 30 ft roads, park, temple, and ₹9,999/month installment plan.';

  return (
    <>
      <BreadcrumbSchema
        items={[
          {
            name: isHindi ? 'होम' : 'Home',
            item: locale === 'en' ? '/' : `/${locale}`,
          },
          {
            name: isHindi ? 'प्रोजेक्ट्स' : 'Projects',
            item: locale === 'en' ? '/projects/current' : `/${locale}/projects/current`,
          },
          {
            name: pageTitle,
            item:
              locale === 'en'
                ? '/projects/shivani-vatika-13th'
                : `/${locale}/projects/shivani-vatika-13th`,
          },
        ]}
      />

      <RealEstateListingSchema
        name={pageTitle}
        description={pageDesc}
        image="/Shivani Vatika 11/gate.webp"
        location={isHindi ? 'सांभर-फुलेरा, राजस्थान' : 'Sambhar–Phulera, Rajasthan'}
        status="Booking Open"
        url={localizedUrl('/projects/shivani-vatika-13th', locale)}
        pdfUrl="/Shivani Vatika 11/shivani-vatika-11th-brochure.pdf"
      />

      <AnalyticsTracker event="project_view" data={{ slug: 'shivani-vatika-13th' }} />

      <ShivaniVatika13thPageClient isHindi={isHindi} />
    </>
  );
}
