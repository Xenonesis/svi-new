import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account Login',
  description: 'Secure account access for SVI Infra Solutions customers.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
