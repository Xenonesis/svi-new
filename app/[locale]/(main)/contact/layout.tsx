import { createMetadata } from '@/src/lib/seo';

export const metadata = createMetadata({
  title: 'Contact SVI Infra Solutions | Get in Touch',
  description:
    'Contact SVI Infra Solutions for inquiries about our premium residential and commercial properties. We are here to help you find your dream home or investment.',
  path: '/contact',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
