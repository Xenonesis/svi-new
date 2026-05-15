"use client";

import { memo, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import WhatsAppChat from './common/WhatsAppChat';
import BackToTop from './common/BackToTop';
import CookieConsent from './common/CookieConsent';
import Analytics from './common/Analytics';

interface LayoutProps {
  children: ReactNode;
}

const Layout = memo(function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      <Analytics />
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-grow flex flex-col"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <WhatsAppChat />
      <BackToTop />
      <CookieConsent />
    </div>
  );
});

export default Layout;
