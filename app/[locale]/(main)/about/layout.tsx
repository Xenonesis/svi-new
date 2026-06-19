import type { Metadata } from 'next';
import { createMetadata } from '@/src/lib/seo';
import BreadcrumbSchema from '@/src/components/common/BreadcrumbSchema';

export const metadata: Metadata = createMetadata({
  title: 'About SVI Infra Solutions - Our Story & Values',
  description:
    'Learn about SVI Infra Solutions Pvt. Ltd., our core values, mission, and our 15+ years of legacy in building premium real estate in Jaipur and Noida.',
  path: '/about',
});

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://sviiinfrasolutions.com/about#page',
  name: 'About SVI Infra Solutions',
  description:
    'Learn about SVI Infra Solutions Pvt. Ltd., our core values, mission, and our 15+ years of legacy in building premium real estate in Jaipur and Noida.',
  url: 'https://sviiinfrasolutions.com/about',
  mainEntity: {
    '@id': 'https://sviiinfrasolutions.com/#organization',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'About', path: '/about' }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      {children}
    </>
  );
}
