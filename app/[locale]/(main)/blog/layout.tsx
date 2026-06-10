import { createMetadata } from '@/src/lib/seo';

export const metadata = createMetadata({
  title: 'Real Estate Blog & Insights | SVI Infra Solutions',
  description:
    'Read the latest news, insights, and market trends in the real estate sector from the experts at SVI Infra Solutions.',
  path: '/blog',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
