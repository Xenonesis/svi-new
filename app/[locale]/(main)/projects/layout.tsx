import { createMetadata } from '@/src/lib/seo';

export const metadata = createMetadata({
  title: 'Our Projects - Premium Real Estate Portfolio',
  description:
    'Explore SVI Infra Solutions portfolio of premium residential and commercial projects. Discover our latest and completed developments in Jaipur, Noida, and DMIC corridors.',
  path: '/projects',
});

// BreadcrumbList JSON-LD is emitted once per child page (current/completed/[slug])
// so each page's breadcrumb trail matches its own URL.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
