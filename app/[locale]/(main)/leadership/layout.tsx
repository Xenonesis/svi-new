import type { Metadata } from 'next';
import { createMetadata } from '@/src/lib/seo';
import BreadcrumbSchema from '@/src/components/common/BreadcrumbSchema';

export const metadata: Metadata = createMetadata({
  title: 'Our Leadership Team | SVI Infra Solutions',
  description:
    'Meet the experienced and visionary leadership team behind SVI Infra Solutions, driving innovation and excellence in real estate.',
  path: '/leadership',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Leadership', path: '/leadership' }]} />
      {children}
    </>
  );
}
