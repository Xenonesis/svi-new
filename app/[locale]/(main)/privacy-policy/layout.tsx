import { createMetadata } from '@/src/lib/seo';

export const metadata = createMetadata({
  title: 'Privacy Policy | SVI Infra Solutions',
  description:
    'Read the privacy policy of SVI Infra Solutions to understand how we handle your data and protect your privacy.',
  path: '/privacy-policy',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
