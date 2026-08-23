import './globals.css';

import { COMPANY_NAME, SITE_NAME, SITE_URL, absoluteUrl } from '@/src/lib/seo';
import { Outfit, Playfair_Display, Noto_Sans_Devanagari } from 'next/font/google';
import Script from 'next/script';
import type { Metadata, Viewport } from 'next';
import { getLocale } from 'next-intl/server';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'sonner';
import PwaRegister from '@/src/components/PwaRegister';
import PwaPushPrompt from '@/src/components/PwaPushPrompt';
import QueryProvider from '@/src/components/QueryProvider';
import { ThemeScript } from '@/src/components/ThemeProvider';
import { WebVitals } from '@/src/components/WebVitals';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  preload: true,
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '600', '700'],
  variable: '--font-hindi',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: 'SVI Infra Solutions - Premium Real Estate Developer | Jaipur',
    template: '%s | SVI Infra Solutions',
  },
  description:
    'Premium real estate developer with 15+ years in Jaipur, Noida, and DMIC corridors. Specializing in residential flats and commercial properties across Rajasthan and UP.',
  keywords: [
    'Real Estate',
    'Infra Solutions',
    'SVI Infra',
    'Infrastructure',
    'Jaipur Properties',
    'Noida Real Estate',
    'Phulera Smart City',
    'DMIC',
    'Residential Flats',
    'Commercial Properties',
  ],
  authors: [{ name: COMPANY_NAME, url: SITE_URL }],
  creator: COMPANY_NAME,
  publisher: COMPANY_NAME,
  category: 'Real Estate',
  alternates: {
    canonical: '/',
    languages: {
      'en-IN': '/',
      'hi-IN': '/hi',
      'x-default': '/',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'SVI Infra Solutions - Premium Real Estate Developer',
    description:
      'Trusted real estate developer with 15+ years of experience. Premium residential and commercial properties in Jaipur, Noida, and DMIC corridors.',
    siteName: SITE_NAME,
    locale: 'en_IN',
    images: [
      {
        url: absoluteUrl('/opengraph-image'),
        width: 1200,
        height: 630,
        alt: 'SVI Infra Solutions premium real estate developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SVI Infra Solutions - Premium Real Estate Developer',
    description:
      'Trusted real estate developer with 15+ years of experience. Premium residential and commercial properties in Jaipur, Noida, and DMIC corridors.',
    images: [absoluteUrl('/opengraph-image')],
  },
};

export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const sansFontVariable = locale === 'hi' ? notoSansDevanagari.variable : outfit.variable;

  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head suppressHydrationWarning>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://*.supabase.co" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['Organization', 'RealEstateAgent'],
              '@id': 'https://www.sviinfrasolutions.com/#organization',
              name: 'SVI Infra Solutions Pvt. Ltd.',
              description:
                'Premium residential and commercial real estate developer with 15+ years of experience in Jaipur, Noida, and DMIC/DFC corridors.',
              url: 'https://www.sviinfrasolutions.com/',
              logo: 'https://www.sviinfrasolutions.com/logo.png',
              image: 'https://www.sviinfrasolutions.com/logo.png',
              telephone: '+91-73000-07643',
              email: 'info@sviinfrasolutions.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Block E-220, 2nd Floor, Sector 63',
                addressLocality: 'Noida',
                addressRegion: 'Uttar Pradesh',
                postalCode: '201309',
                addressCountry: 'IN',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 28.624047,
                longitude: 77.387221,
              },
              hasMap: 'https://maps.app.goo.gl/9GKzv3BuNVRKxUsb7',
              foundingDate: '2009',
              priceRange: '$$$',
              areaServed: ['Jaipur', 'Noida', 'Phulera', 'Rajasthan', 'Uttar Pradesh'],
              sameAs: [
                'https://facebook.com/sviinfra',
                'https://twitter.com/sviinfra',
                'https://instagram.com/sviinfra',
                'https://linkedin.com/company/sviinfra',
              ],
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Real Estate Services',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: { '@type': 'Service', name: 'Residential Properties' },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: { '@type': 'Service', name: 'Commercial Properties' },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: { '@type': 'Service', name: 'Property Management' },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: { '@type': 'Service', name: 'Real Estate Consultancy' },
                  },
                ],
              },
              knowsAbout: [
                'Residential Real Estate',
                'Commercial Real Estate',
                'Property Investment',
                'Real Estate Development',
                'DMIC Corridor Properties',
                'Phulera Smart City',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': 'https://www.sviinfrasolutions.com/#website',
              url: 'https://www.sviinfrasolutions.com',
              name: 'SVI Infra Solutions',
              description:
                'Premium residential and commercial real estate developer in Jaipur, Noida, and Phulera Smart City',
              publisher: {
                '@id': 'https://www.sviinfrasolutions.com/#organization',
              },
              speakable: {
                '@type': 'SpeakableSpecification',
                xpath: ['/html/head/title', "/html/head/meta[@name='description']/@content"],
              },
            }),
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Preconnect to critical origins to reduce connection latency */}
        <link rel="preconnect" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="preconnect" href="https://api.qrserver.com" />
        <link rel="dns-prefetch" href="https://api.qrserver.com" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
      </head>
      <body className={`${sansFontVariable} ${playfair.variable}`} suppressHydrationWarning>
        <ThemeScript />
        <QueryProvider>{children}</QueryProvider>
        <WebVitals />
        <Analytics />
        <SpeedInsights />
        <PwaRegister />
        <PwaPushPrompt />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
