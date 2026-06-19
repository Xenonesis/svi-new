import type { Metadata } from 'next';
import { createMetadata } from '@/src/lib/seo';
import BreadcrumbSchema from '@/src/components/common/BreadcrumbSchema';

export const metadata: Metadata = createMetadata({
  title: 'Real Estate Blog & Insights | SVI Infra Solutions',
  description:
    'Read the latest news, insights, and market trends in the real estate sector from the experts at SVI Infra Solutions.',
  path: '/blog',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Blog', path: '/blog' }]} />
      {children}
    </>
  );
}
