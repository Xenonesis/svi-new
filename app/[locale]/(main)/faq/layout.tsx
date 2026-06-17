import type { Metadata } from 'next';
import { createMetadata } from '@/src/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Frequently Asked Questions (FAQ) | SVI Infra Solutions',
  description:
    'Find answers to common questions about buying property, investments, and our real estate projects at SVI Infra Solutions.',
  path: '/faq',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
