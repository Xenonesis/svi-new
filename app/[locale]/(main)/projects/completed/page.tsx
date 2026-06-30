import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SITE_URL } from '@/src/lib/seo';
import type { Metadata } from 'next';
import CompletedProjectsContent from '@/src/components/projects/CompletedProjectsContent';

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await paramsPromise;
  const t = await getTranslations({ locale, namespace: 'pages.projects' });
  return {
    title: `${t('completedTitle')} - SVI Infra Solutions`,
    description: t('completedSubtitle'),
    openGraph: {
      title: `${t('completedTitle')} | SVI Infra Solutions`,
      description: t('completedSubtitle'),
      images: [{ url: `${SITE_URL}/images/project2.png`, width: 1200, height: 630 }],
    },
  };
}

const completedProjectsData = (t: any) => [
  {
    id: 'shree-shyam-residency',
    title: t('data.shreeShyamResidency.title'),
    location: t('data.shreeShyamResidency.location'),
    lat: 26.9124,
    lng: 75.7873,
    type: t('data.shreeShyamResidency.type'),
    description: t('data.shreeShyamResidency.description'),
    fullDescription: t('data.shreeShyamResidency.fullDescription'),
    status: t('data.shreeShyamResidency.status'),
    img: '/images/hero1.png',
    gallery: ['/images/hero1.png', '/images/hero2.png', '/images/hero3.png'],
    pdf: true,
  },
  {
    id: 'shivani-city',
    title: t('data.shivaniCity.title'),
    location: t('data.shivaniCity.location'),
    lat: 27.05,
    lng: 75.8,
    type: t('data.shivaniCity.type'),
    description: t('data.shivaniCity.description'),
    fullDescription: t('data.shivaniCity.fullDescription'),
    status: t('data.shivaniCity.status'),
    img: '/images/project2.png',
    gallery: ['/images/project2.png', '/images/house1.png'],
    pdf: true,
  },
  {
    id: 'shivani-residency',
    title: t('data.shivaniResidency.title'),
    location: t('data.shivaniResidency.location'),
    lat: 26.9,
    lng: 75.18,
    type: t('data.shivaniResidency.type'),
    description: t('data.shivaniResidency.description'),
    fullDescription: t('data.shivaniResidency.fullDescription'),
    status: t('data.shivaniResidency.status'),
    img: '/images/project1.png',
    gallery: ['/images/project1.png', '/images/hero3.png'],
    pdf: true,
  },
];

export default async function CompletedProjectsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.projects' });
  const projects = completedProjectsData(t);

  const realEstateListingsSchema = {
    '@context': 'https://schema.org',
    '@graph': projects.map((project) => ({
      '@type': 'RealEstateListing',
      name: project.title,
      description: project.fullDescription || project.description,
      listingType: 'SoldOut',
      address: {
        '@type': 'PostalAddress',
        addressLocality: project.location.split('(')[0].trim(),
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
        availability:
          project.status === 'Sold Out' || project.status === 'पूरी तरह से बिका'
            ? 'https://schema.org/SoldOut'
            : 'https://schema.org/InStock',
        priceStatus: 'https://schema.org/InquirePrice',
      },
      image: `https://sviiinfrasolutions.com${project.img}`,
      url: `https://sviiinfrasolutions.com/projects/completed#${project.id}`,
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
            {t('completedTitle')}
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {t('completedSubtitle')}
          </p>
        </div>
      </section>
      <CompletedProjectsContent projects={projects} />
    </div>
  );
}
