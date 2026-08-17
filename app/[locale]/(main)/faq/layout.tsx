import type { Metadata } from 'next';
import { createMetadata } from '@/src/lib/seo';
import { BreadcrumbSchema } from '@/src/components/common/Schema';

export const metadata: Metadata = createMetadata({
  title: 'Frequently Asked Questions',
  description:
    'Find answers to frequently asked questions about property investment, payment plans, clear documentation, and more at SVI Infra Solutions.',
  path: '/faq',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'FAQ', path: '/faq' }]} includeHome />
      {children}
    </>
  );
}
