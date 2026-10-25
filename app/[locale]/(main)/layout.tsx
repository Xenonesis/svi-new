import ClientProviders from '@/src/components/ClientProviders';
import Breadcrumbs from '@/src/components/ui/Breadcrumbs';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <Header />
      <Breadcrumbs />
      <main className="flex min-h-screen flex-grow flex-col overflow-x-hidden">{children}</main>
      <Footer />
    </ClientProviders>
  );
}
