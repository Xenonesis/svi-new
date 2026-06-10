import { createMetadata } from '@/src/lib/seo';

export const metadata = createMetadata({
  title: 'Our Projects - Premium Real Estate Portfolio',
  description:
    'Explore SVI Infra Solutions portfolio of premium residential and commercial projects. Discover our latest and completed developments in Jaipur, Noida, and DMIC corridors.',
  path: '/projects',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
