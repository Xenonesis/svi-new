import ClientProviders from '@/src/components/ClientProviders';
import Breadcrumbs from '@/src/components/ui/Breadcrumbs';
import { OrganizationSchema } from '@/src/components/common/Schema';
import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <OrganizationSchema />
      <Breadcrumbs />
      {children}
    </ClientProviders>
  );
}
