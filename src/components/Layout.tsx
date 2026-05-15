import { memo, type ReactNode } from 'react';
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
  return (
    <div className="flex flex-col min-h-screen">
      <Analytics />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <WhatsAppChat />
      <BackToTop />
      <CookieConsent />
    </div>
  );
});

export default Layout;
