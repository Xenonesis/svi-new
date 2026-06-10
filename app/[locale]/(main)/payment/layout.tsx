import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Payment Gateway | SVI Infra Solutions',
  description:
    'Make secure online payments for your property investments and bookings with SVI Infra Solutions.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
