import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SITE_URL } from '@/src/lib/seo';
import type { Metadata } from 'next';
import CurrentProjectsContent from '@/src/components/projects/CurrentProjectsContent';

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await paramsPromise;
  const t = await getTranslations({ locale, namespace: 'pages.projects' });
  return {
    title: `${t('currentTitle')} - SVI Infra Solutions`,
    description: t('currentSubtitle'),
    openGraph: {
      title: `${t('currentTitle')} | SVI Infra Solutions`,
      description: t('currentSubtitle'),
      images: [{ url: `${SITE_URL}/images/project1.png`, width: 1200, height: 630 }],
    },
  };
}

const currentProjectsData = (t: any) => [
  {
    id: 'shivani-vatika',
    title: t('data.shivaniVatika.title'),
    location: t('data.shivaniVatika.location'),
    lat: 26.85,
    lng: 76.0,
    type: t('data.shivaniVatika.type'),
    description: t('data.shivaniVatika.description'),
    fullDescription: t('data.shivaniVatika.fullDescription'),
    status: t('data.shivaniVatika.status'),
    img: '/images/project2.png',
    gallery: ['/images/project2.png', '/images/hero1.png'],
  },
  {
    id: 'shyam-aangan',
    title: t('data.shyamAangan.title'),
    location: t('data.shyamAangan.location'),
    lat: 26.65,
    lng: 75.85,
    type: t('data.shyamAangan.type'),
    description: t('data.shyamAangan.description'),
    fullDescription: t('data.shyamAangan.fullDescription'),
    status: t('data.shyamAangan.status'),
    img: '/images/project1.png',
    gallery: ['/images/project1.png'],
  },
];

export default async function CurrentProjectsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.projects' });
  const projects = currentProjectsData(t);

  const realEstateListingsSchema = {
    '@context': 'https://schema.org',
    '@graph': projects.map((project) => ({
      '@type': 'RealEstateListing',
      name: project.title,
      description: project.fullDescription || project.description,
      listingType: 'ForSale',
      address: {
        '@type': 'PostalAddress',
        addressLocality: project.location,
        addressRegion: 'Rajasthan',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: project.lat,
        longitude: project.lng,
      },
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/PreOrderAction',
        priceStatus: 'https://schema.org/InquirePrice',
      },
      image: `https://sviiinfrasolutions.com${project.img}`,
      url: `https://sviiinfrasolutions.com/projects/current#${project.id}`,
    })),
  };

  return (
    <div className="dark:bg-brand-dark-bg min-h-screen bg-gray-50 pt-20 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateListingsSchema) }}
      />
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-20 dark:border-gray-700 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 font-serif text-3xl leading-tight sm:text-4xl md:text-6xl dark:text-gray-100">
            {t('currentTitle')}
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {t('currentSubtitle')}
          </p>
        </div>
      </section>
      <CurrentProjectsContent projects={projects} />
    </div>
  );
}
