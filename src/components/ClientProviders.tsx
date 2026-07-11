'use client';

import dynamic from 'next/dynamic';
import Analytics from '@/src/components/common/Analytics';
import BackToTop from '@/src/components/ui/BackToTop';
import CookieConsent from '@/src/components/common/CookieConsent';
import ErrorBoundary from '@/src/components/ui/ErrorBoundary';
import Footer from '@/src/components/layout/Footer';
import Header from '@/src/components/layout/Header';
import { type ReactNode, useEffect, useState } from 'react';
import ScrollToTop from '@/src/components/ui/ScrollToTop';
import { ThemeProvider, useTheme } from '@/src/components/ThemeProvider';
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

const PropertyComparisonTray = dynamic(
  () => import('@/src/components/properties/PropertyComparisonTray'),
  { ssr: false }
);

const PropertyComparisonModal = dynamic(
  () => import('@/src/components/properties/PropertyComparisonModal'),
  { ssr: false }
);

const DotField = dynamic(() => import('@/src/components/ui/DotField'), {
  ssr: false,
});

function ThemeAwareBackground() {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    const updateTheme = () => {
      const isDark = root.classList.contains('dark');
      setResolvedTheme(isDark ? 'dark' : 'light');
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, [theme]);

  const gradientFrom =
    resolvedTheme === 'dark' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(17, 24, 39, 0.08)';
  const gradientTo =
    resolvedTheme === 'dark' ? 'rgba(212, 175, 55, 0.05)' : 'rgba(17, 24, 39, 0.03)';
  const glowColor =
    resolvedTheme === 'dark' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.06)';

  return (
    <div className="pointer-events-none fixed inset-0 z-[-10] h-full w-full">
      <DotField
        dotRadius={1.5}
        dotSpacing={14}
        bulgeStrength={67}
        glowRadius={160}
        sparkle={false}
        waveAmplitude={0}
        fixed={true}
        gradientFrom={gradientFrom}
        gradientTo={gradientTo}
        glowColor={glowColor}
      />
    </div>
  );
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ThemeAwareBackground />
        <ScrollToTop />
        <Header />
        <main className="flex min-h-screen flex-grow flex-col overflow-x-hidden">{children}</main>
        <Footer />
        <FloatingContact />
        <ChatBot />
        <BackToTop />
        <ExitIntentPopup />
        <PropertyComparisonTray />
        <PropertyComparisonModal />
        <CookieConsent />
        <Analytics />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
