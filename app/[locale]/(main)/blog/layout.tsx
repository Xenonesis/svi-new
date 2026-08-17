import type { Metadata } from 'next';
import { createMetadata } from '@/src/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Real Estate Blog & Insights',
  description:
    'Read the latest news, insights, and market trends in the real estate sector from the experts at SVI Infra Solutions.',
  path: '/blog',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  // BreadcrumbList JSON-LD is emitted per page: the index page renders its own
  // trail, and each post renders Home > Blog > Post (see [slug]/page.tsx).
  return <>{children}</>;
}
