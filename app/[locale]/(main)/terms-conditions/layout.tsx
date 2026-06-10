import { createMetadata } from '@/src/lib/seo';

export const metadata = createMetadata({
  title: 'Terms & Conditions | SVI Infra Solutions',
  description:
    'Read the terms and conditions for using the SVI Infra Solutions website and engaging with our real estate services.',
  path: '/terms-conditions',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
