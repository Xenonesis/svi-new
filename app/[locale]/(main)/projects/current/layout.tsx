import { createMetadata } from '@/src/lib/seo';

export const metadata = createMetadata({
  title: 'Current Projects - SVI Infra Solutions',
  description:
    'View our ongoing premium real estate projects. Invest in the future with SVI Infra Solutions in prime locations with high appreciation potential.',
  path: '/projects/current',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
