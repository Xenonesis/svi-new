import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Portal Login',
  description: 'Secure client portal access for SVI Infra Solutions customers.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
