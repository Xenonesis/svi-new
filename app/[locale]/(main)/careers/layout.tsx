import type { Metadata } from 'next';
import { createMetadata } from '@/src/lib/seo';
import BreadcrumbSchema from '@/src/components/common/BreadcrumbSchema';

export const metadata: Metadata = createMetadata({
  title: 'Careers at SVI Infra Solutions - Join Our Team',
  description:
    'Join SVI Infra Solutions and build a rewarding career in real estate development. Explore current job openings and opportunities.',
  path: '/careers',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Careers', path: '/careers' }]} />
      {children}
    </>
  );
}
