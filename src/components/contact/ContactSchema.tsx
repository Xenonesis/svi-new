import { SITE_URL } from '@/src/lib/seo';

export function ContactSchema(): React.JSX.Element {
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'SVI Infra Solutions Pvt. Ltd.',
    image: `${SITE_URL}/logo-app-badge.png`,
    url: `${SITE_URL}/contact`,
    telephone: '+91-73000-07643',
    email: 'info@sviinfrasolutions.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Block E-220, 2nd Floor, Sector 63',
      addressLocality: 'Noida',
      addressRegion: 'Uttar Pradesh',
      postalCode: '201309',
      addressCountry: 'IN',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 28.624047, longitude: 77.387221 },
    hasMap: 'https://maps.app.goo.gl/9GKzv3BuNVRKxUsb7',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '10:00',
        closes: '16:00',
      },
    ],
    areaServed: [
      { '@type': 'City', name: 'Jaipur' },
      { '@type': 'City', name: 'Noida' },
      { '@type': 'City', name: 'Phulera' },
    ],
    priceRange: '$$$',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
    />
  );
}
