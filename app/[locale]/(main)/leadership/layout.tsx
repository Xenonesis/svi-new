import { createMetadata } from '@/src/lib/seo';

export const metadata = createMetadata({
  title: 'Our Leadership Team | SVI Infra Solutions',
  description:
    'Meet the experienced and visionary leadership team behind SVI Infra Solutions, driving innovation and excellence in real estate.',
  path: '/leadership',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
