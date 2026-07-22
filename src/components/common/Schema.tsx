'use client';

import { SITE_URL, SITE_NAME } from '@/src/lib/seo';

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SVI Infra Solutions Pvt. Ltd.',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    'Trusted real estate developer with 15+ years of experience. Premium residential and commercial properties in Jaipur, Noida, and DMIC corridors.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'A-61 Sector 65',
    addressLocality: 'Noida',
    addressRegion: 'Uttar Pradesh',
    postalCode: '201309',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-9216014579',
    contactType: 'sales',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://www.facebook.com/sviinfrasolutions',
    'https://www.instagram.com/sviinfrasolutions',
    'https://www.linkedin.com/company/svi-infra-solutions',
  ],
};

interface BreadcrumbItem {
  name: string;
  item?: string;
  path?: string;
}

interface RealEstateProps {
  name: string;
  description: string;
  image: string;
  location: string;
  status?: string;
  price?: string;
}

export function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
    />
  );
}

export function BreadcrumbSchema({
  items,
  includeHome,
}: {
  items: BreadcrumbItem[];
  includeHome?: boolean;
}) {
  const homeItem = includeHome
    ? [{ '@type': 'ListItem' as const, position: 1, name: 'Home', item: SITE_URL }]
    : [];

  const listItems = items.map((item, i) => ({
    '@type': 'ListItem' as const,
    position: includeHome ? i + 2 : i + 1,
    name: item.name,
    item: `${SITE_URL}${(item.path ?? item.item)!}`,
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [...homeItem, ...listItems],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function RealEstateListingSchema({
  name,
  description,
  image,
  location,
  status = 'InStock',
  price,
}: RealEstateProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name,
    description,
    image: image.startsWith('http') ? image : `${SITE_URL}${image}`,
    datePosted: new Date().toISOString().split('T')[0],
    url: typeof window !== 'undefined' ? window.location.href : SITE_URL,
    itemOffered: {
      '@type': 'Product',
      name,
      description,
      image,
      offers: {
        '@type': 'Offer',
        availability: `https://schema.org/${status === 'Under Construction' ? 'PreOrder' : 'InStock'}`,
        priceCurrency: 'INR',
        ...(price ? { price } : {}),
      },
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: location,
      addressCountry: 'IN',
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ questions }: { questions: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
