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
  preload: false,
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '700'],
  variable: '--font-hindi',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default:
      'SVI Infra Solutions - Leading Real Estate Developer in Jaipur | Premium Residential Plots & Townships',
    template: '%s | SVI Infra Solutions',
  },
  description:
    'Leading real estate developer with 17+ years of expertise delivering premier gated townships, residential plots, and investment land across Jaipur, Khatu Shyam Highway, Nayla, and Phulera DMIC corridor.',
  keywords: [
    'SVI',
    'SVI Infra',
    'SVI Infra Solutions',
    'svi',
    'svi infra',
    'svi jaipur',
    'Plots in Jaipur',
    'Jaipur Plots',
    'Residential Plots Jaipur',
    'Residential Land in Jaipur',
    'Plots for Sale in Jaipur',
    'Plots in Jaipur Under 20 Lakhs',
    'Plots in Jaipur Below 10 Lakhs',
    'Plots in Jaipur Under 15 Lakhs',
    'Buy Plot in Jaipur',
    'Gated Community Plots Jaipur',
    'Freehold Plots in Jaipur',
    'Plots Near Khatu Shyam Ji',
    'Plots Near Khatu Shyam Ji Temple',
    'Plots on Jaipur Khatu Shyam Ji Highway',
    'Plots on Ringas Road Jaipur',
    'Plots Near Renwal Railway Station',
    'Plots in Phulera Smart City',
    'Plots Near DMIC Phulera',
    'Shivani Vatika 11th',
    'Shivani Vatika Jaipur',
    'Gated Township Jaipur',
    'JDA Approved Plots Jaipur',
    'Section 90A Plots Jaipur',
    '90A Approved Plots Jaipur',
    '7500 per sq yard plots Jaipur',
    'Plots near Ring Road Jaipur',
    'Plots in Sikar Road Jaipur',
    'Plots in Jagatpura Jaipur',
    'Plots in Ajmer Road Jaipur',
    'Real Estate Jaipur',
    'Property in Jaipur',
    'Real Estate Developer Jaipur',
    'Townships in Jaipur',
    '100 gaj plot in jaipur',
    '111 gaj plot in jaipur',
    '150 gaj plots near renwal',
    '200 gaj plots jaipur',
    '80% bank loan plots in jaipur',
    'sbi approved plot loan jaipur',
    'plots near jobner jaipur',
    'jobner renwal road plots',
    'patta registry plots in jaipur',
    'dakhil kharij plots jaipur',
    '100 गज प्लॉट जयपुर',
    'जयपुर में 100 गज का प्लॉट',
    'पट्टा रजिस्ट्री प्लॉट जयपुर',
    'एसवीआई',
    'एसवीआई इन्फ्रा',
    'जयपुर में प्लॉट',
    'जयपुर में सस्ते प्लॉट',
    'खाटू श्याम हाईवे प्लॉट',
    'रजिस्ट्री दाखिल खारिज प्लॉट जयपुर',
    'जेडीए अप्रूव्ड प्लॉट जयपुर',
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicons/favicon_48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'SVI Infra Solutions - Premium Real Estate Developer',
    description:
      'Trusted real estate developer with 17+ years of experience. Premium residential and commercial properties in Jaipur, Noida, and DMIC corridors.',
    siteName: SITE_NAME,
    locale: 'en_IN',
    images: [
      {
        url: absoluteUrl('/og-image.jpg'),
        secureUrl: absoluteUrl('/og-image.jpg'),
        width: 1200,
        height: 630,
        alt: 'SVI Infra Solutions - Premium Real Estate Developer',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SVI Infra Solutions - Premium Real Estate Developer',
    description:
      'Trusted real estate developer with 17+ years of experience. Premium residential and commercial properties in Jaipur, Noida, and DMIC corridors.',
    images: [absoluteUrl('/og-image.jpg')],
  },
  verification: {
    google: 'google4cbc4b1a492a2b45',
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
        <meta name="google-site-verification" content="google4cbc4b1a492a2b45" />
        {/* OpenGraph & Social Image Fallback */}
        <link rel="image_src" href="https://www.sviinfrasolutions.com/og-image.jpg" />
        {/* Favicons and Touch Icons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon_16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon_32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicons/favicon_48x48.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['Organization', 'RealEstateAgent'],
              '@id': 'https://www.sviinfrasolutions.com/#organization',
              name: 'SVI Infra Solutions Pvt. Ltd.',
              description:
                'Premium residential and commercial real estate developer with 17+ years of experience in Jaipur, Noida, and DMIC/DFC corridors.',
              url: 'https://www.sviinfrasolutions.com/',
              logo: 'https://www.sviinfrasolutions.com/logo-app-badge.png',
              image: 'https://www.sviinfrasolutions.com/logo-app-badge.png',
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
              areaServed: [
                'Jaipur',
                'Jaipur District',
                'Kishangarh Renwal',
                'Khatu Shyam Ji Highway',
                'Jobner',
                'Phulera',
                'Nayla',
                'Noida',
                'Rajasthan',
                'Uttar Pradesh',
              ],
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
                'Plots in Jaipur',
                'Residential Plots in Jaipur',
                'Plots in Jaipur Under 20 Lakhs',
                'Plots in Jaipur Below 10 Lakhs',
                'Residential Real Estate Jaipur',
                'Commercial Real Estate',
                'Property Investment in Jaipur',
                'Real Estate Development',
                'DMIC Corridor Properties',
                'Phulera Smart City',
                'Shivani Vatika 11th',
                'Khatu Shyam Ji Highway Plots',
                'Plots Near Renwal Railway Station',
                'Section 90-A Approved Plots',
                'JDA Approved Plots Jaipur',
                'Bank Loan Plots in Jaipur',
                'Dakhil Kharij Land Mutation',
                'Gated Township Development',
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
        {/* DNS prefetch for secondary origins */}
        <link rel="dns-prefetch" href="https://api.qrserver.com" />
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `if('serviceWorker' in navigator&&(location.hostname==='localhost'||location.hostname==='127.0.0.1'||location.hostname.endsWith('.local'))){navigator.serviceWorker.getRegistrations().then(function(r){for(var i=0;i<r.length;i++)r[i].unregister();});if('caches' in window){caches.keys().then(function(k){for(var i=0;i<k.length;i++)caches.delete(k[i]);});}}`,
            }}
          />
        )}
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
