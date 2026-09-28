import { SITE_URL, SITE_NAME } from '@/src/lib/seo';

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SVI Infra Solutions Pvt. Ltd.',
  alternateName: [
    'SVI',
    'SVI Infra',
    'SVI Infra Solutions',
    'Svi Infra',
    'एसवीआई',
    'एसवीआई इन्फ्रा',
  ],
  url: SITE_URL,
  logo: `${SITE_URL}/logo-app-badge.png`,
  image: `${SITE_URL}/logo-app-badge.png`,
  description:
    'Trusted real estate developer with 17+ years of experience. Premium residential and commercial properties in Jaipur, Noida, and DMIC corridors.',
  knowsAbout: [
    'Plots in Jaipur',
    'Residential Plots in Jaipur',
    'Plots in Jaipur Under 20 Lakhs',
    'Plots in Jaipur Below 10 Lakhs',
    'Freehold Residential Land Jaipur',
    'JDA Approved Plots Jaipur',
    'Khatu Shyam Ji Highway Real Estate',
    'Plots Near Khatu Shyam Ji Temple',
    'Shivani Vatika 11th',
    'Renwal Industrial Corridor Plots',
    'Plots Near Renwal Railway Station',
    'Phulera Smart City DMIC Corridor',
    'Rajasthan Section 90-A Land Conversion',
    'Dakhil Kharij Revenue Mutation',
    'Gated Township Development',
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Block E-220, 2nd Floor, Sector 63',
    addressLocality: 'Noida',
    addressRegion: 'Uttar Pradesh',
    postalCode: '201309',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-73000-07643',
    contactType: 'sales',
    availableLanguage: ['English', 'Hindi'],
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Jaipur',
      description:
        'Primary residential township and plot developments (Khatu Shyam Highway, Nayla, Renwal)',
    },
    {
      '@type': 'City',
      name: 'Noida',
      description: 'Corporate headquarters and North India operations',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Rajasthan',
    },
    {
      '@type': 'City',
      name: 'Kishangarh Renwal',
      description: 'RIICO Industrial Area and Railway station plotted corridor',
    },
    {
      '@type': 'City',
      name: 'Phulera',
      description: 'Smart city industrial and DMIC corridor projects',
    },
  ],
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
  url?: string;
  pdfUrl?: string;
}
export function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
    />
  );
}

export function WebSiteSchema() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SVI Infra Solutions',
    alternateName: ['SVI', 'SVI Infra', 'Svi Infra Solutions'],
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
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
  url = SITE_URL,
  pdfUrl,
}: RealEstateProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name,
    description,
    image: image.startsWith('http') ? image : `${SITE_URL}${image}`,
    url,
    itemOffered: {
      '@type': 'Product',
      name,
      description,
      image: image.startsWith('http') ? image : `${SITE_URL}${image}`,
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
    ...(pdfUrl
      ? {
          hasMap: {
            '@type': 'Map',
            mapType: 'https://schema.org/VenueMap',
            url: pdfUrl.startsWith('http') ? pdfUrl : `${SITE_URL}${pdfUrl}`,
          },
          subjectOf: {
            '@type': 'DigitalDocument',
            name: `${name} Official Master Plan Layout`,
            encodingFormat: 'application/pdf',
            url: pdfUrl.startsWith('http') ? pdfUrl : `${SITE_URL}${pdfUrl}`,
          },
        }
      : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function PlaceAndAreaSchema({
  name,
  description,
  url,
  latitude,
  longitude,
  addressLocality,
  postalCode,
  addressRegion = 'Rajasthan',
  image = `${SITE_URL}/images/project1.png`,
}: {
  name: string;
  description: string;
  url: string;
  latitude?: number;
  longitude?: number;
  addressLocality: string;
  postalCode?: string;
  addressRegion?: string;
  image?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name,
    description,
    url,
    image,
    ...(latitude && longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude,
            longitude,
          },
        }
      : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality,
      addressRegion,
      ...(postalCode ? { postalCode } : {}),
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
