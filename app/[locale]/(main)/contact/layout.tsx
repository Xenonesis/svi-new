import type { Metadata } from 'next';
import { createMetadata } from '@/src/lib/seo';
import BreadcrumbSchema from '@/src/components/common/BreadcrumbSchema';

export const metadata: Metadata = createMetadata({
  title: 'Contact SVI Infra Solutions | Get in Touch',
  description:
    'Contact SVI Infra Solutions for inquiries about our premium residential and commercial properties. We are here to help you find your dream home or investment.',
  path: '/contact',
});

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://sviiinfrasolutions.com/#contact',
  name: 'SVI Infra Solutions Pvt. Ltd.',
  description:
    'Premium residential and commercial real estate developer in Jaipur, Noida, and Phulera Smart City.',
  url: 'https://sviiinfrasolutions.com/contact',
  telephone: '+91-73000-07643',
  email: 'info@sviinfrasolutions.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'A-61 Sector 65',
    addressLocality: 'Noida',
    addressRegion: 'Uttar Pradesh',
    postalCode: '201309',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 28.6112,
    longitude: 77.382,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '10:00',
    closes: '18:00',
  },
  image: 'https://sviiinfrasolutions.com/logo.png',
  priceRange: '$$$',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Contact', path: '/contact' }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      {children}
    </>
  );
}
