import type { Metadata } from 'next';
import { createMetadata } from '@/src/lib/seo';
import { BreadcrumbSchema } from '@/src/components/common/Schema';

export const metadata: Metadata = createMetadata({
  title: 'About Us - Our Story & Values',
  description:
    'Learn about SVI Infra Solutions Pvt. Ltd., our core values, mission, and our 15+ years of legacy in building premium real estate in Jaipur and Noida.',
  path: '/about',
});

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://www.sviinfrasolutions.com/about#page',
  name: 'About SVI Infra Solutions',
  description:
    'Learn about SVI Infra Solutions Pvt. Ltd., our core values, mission, and our 15+ years of legacy in building premium real estate in Jaipur and Noida.',
  url: 'https://www.sviinfrasolutions.com/about',
  mainEntity: {
    '@id': 'https://www.sviinfrasolutions.com/#organization',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'About', path: '/about' }]} includeHome />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      {children}
    </>
  );
}
