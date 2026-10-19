import type React from 'react';
import { createMetadata } from '@/src/lib/seo';

export const metadata = createMetadata({
  title: 'Property Registration & Lottery Application | SVI Infra Solutions',
  description:
    'Register for luxury residential townships, priority plot allotments, and flexible payment schemes with SVI Infra Solutions.',
  path: '/registration2',
});

export default function Registration2Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
