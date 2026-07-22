import type { Metadata } from 'next';
import { createMetadata } from '@/src/lib/seo';
import { BreadcrumbSchema } from '@/src/components/common/Schema';

export const metadata: Metadata = createMetadata({
  title: 'Leadership Team | SVI Infra Solutions',
  description:
    'Meet the leadership team behind SVI Infra Solutions — experienced professionals driving innovation in real estate development.',
  path: '/leadership',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Leadership', path: '/leadership' }]} includeHome />
      {children}
    </>
  );
}
