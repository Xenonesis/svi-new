import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/src/components/ThemeProvider';
import ErrorBoundary from '@/src/components/common/ErrorBoundary';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import ScrollToTop from '@/src/components/common/ScrollToTop';
import WhatsAppChat from '@/src/components/common/WhatsAppChat';
import BackToTop from '@/src/components/common/BackToTop';
import CookieConsent from '@/src/components/common/CookieConsent';
import Analytics from '@/src/components/common/Analytics';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SVI Infra Solutions - Premium Real Estate Developer | Jaipur & Noida',
  description: 'SVI Infra Solutions Pvt. Ltd. - Premium residential and commercial real estate developer with 15+ years of experience. Specializing in Jaipur, Noida, Phulera Smart City, and DMIC/DFC corridors.',
  keywords: ['Real Estate', 'Infra Solutions', 'SVI Infra', 'Infrastructure', 'Jaipur Properties', 'Noida Real Estate', 'Phulera Smart City', 'DMIC', 'Residential Flats', 'Commercial Properties'],
  authors: [{ name: 'SVI Infra Solutions Pvt. Ltd.' }],
  robots: 'index, follow',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    url: 'https://sviinfrasolutions.com/',
    title: 'SVI Infra Solutions - Premium Real Estate Developer',
    description: 'Trusted real estate developer with 15+ years of experience. Premium residential and commercial properties in Jaipur, Noida, and DMIC corridors.',
    siteName: 'SVI Infra Solutions',
    locale: 'en_IN',
    images: [{ url: 'https://sviinfrasolutions.com/logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SVI Infra Solutions - Premium Real Estate Developer',
    description: 'Trusted real estate developer with 15+ years of experience. Premium residential and commercial properties in Jaipur, Noida, and DMIC corridors.',
    images: ['https://sviinfrasolutions.com/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "SVI Infra Solutions Pvt. Ltd.",
              "description": "Premium residential and commercial real estate developer with 15+ years of experience in Jaipur, Noida, and DMIC/DFC corridors.",
              "url": "https://sviinfrasolutions.com/",
              "logo": "https://sviinfrasolutions.com/logo.png",
              "image": "https://sviinfrasolutions.com/logo.png",
              "telephone": "+91-73000-07643",
              "email": "info@sviinfrasolutions.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "A-61 Sector 65",
                "addressLocality": "Noida",
                "addressRegion": "Uttar Pradesh",
                "postalCode": "201309",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 28.6112,
                "longitude": 77.3820
              },
              "foundingDate": "2009",
              "priceRange": "$$$",
              "areaServed": ["Jaipur", "Noida", "Phulera", "Rajasthan", "Uttar Pradesh"],
              "sameAs": [
                "https://facebook.com/sviinfra",
                "https://twitter.com/sviinfra",
                "https://instagram.com/sviinfra",
                "https://linkedin.com/company/sviinfra"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Real Estate Services",
                "itemListElement": [
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Residential Properties" } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Commercial Properties" } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Property Management" } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Real Estate Consultancy" } }
                ]
              }
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable}`}>
        <ErrorBoundary>
          <ThemeProvider>
            <ScrollToTop />
            <Analytics />
            <Header />
            <main className="flex-grow flex flex-col min-h-screen">
              {children}
            </main>
            <Footer />
            <WhatsAppChat />
            <BackToTop />
            <CookieConsent />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
