'use client';

import dynamic from 'next/dynamic';
import Analytics from '@/src/components/common/Analytics';
import BackToTop from '@/src/components/ui/BackToTop';
import CookieConsent from '@/src/components/common/CookieConsent';
import ErrorBoundary from '@/src/components/ui/ErrorBoundary';
import Footer from '@/src/components/layout/Footer';
import Header from '@/src/components/layout/Header';
import type { ReactNode } from 'react';
import ScrollToTop from '@/src/components/ui/ScrollToTop';
import { ThemeProvider } from '@/src/components/ThemeProvider';
import ExitIntentPopup from '@/src/components/common/ExitIntentPopup';

const ChatBot = dynamic(() => import('@/src/components/home/ChatBot'), {
  ssr: false,
  loading: () => null,
});

const FloatingContact = dynamic(
  () =>
    import('@/src/components/layout/FloatingContact').then((m) => ({ default: m.FloatingContact })),
  { ssr: false }
);

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ScrollToTop />
        <Header />
        <main className="flex min-h-screen flex-grow flex-col overflow-x-hidden">{children}</main>
        <Footer />
        <FloatingContact />
        <ChatBot />
        <BackToTop />
        <ExitIntentPopup />
        <CookieConsent />
        <Analytics />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
