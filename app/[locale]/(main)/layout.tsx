import ClientProviders from '@/src/components/ClientProviders';
import Breadcrumbs from '@/src/components/ui/Breadcrumbs';
import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <Breadcrumbs />
      {children}
    </ClientProviders>
  );
}
