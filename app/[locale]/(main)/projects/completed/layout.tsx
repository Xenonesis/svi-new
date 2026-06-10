import { createMetadata } from '@/src/lib/seo';

export const metadata = createMetadata({
  title: 'Completed Projects - SVI Infra Solutions Portfolio',
  description:
    'Browse our successfully completed real estate projects. See the quality, design, and legacy of excellence delivered by SVI Infra Solutions.',
  path: '/projects/completed',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
