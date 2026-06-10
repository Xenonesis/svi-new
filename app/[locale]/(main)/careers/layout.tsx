import { createMetadata } from '@/src/lib/seo';

export const metadata = createMetadata({
  title: 'Careers at SVI Infra Solutions - Join Our Team',
  description:
    'Join SVI Infra Solutions and build a rewarding career in real estate development. Explore current job openings and opportunities.',
  path: '/careers',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
