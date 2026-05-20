import './globals.css';

import { COMPANY_NAME, SITE_NAME, SITE_URL, absoluteUrl } from '@/src/lib/seo';
import { Inter, Playfair_Display } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: 'SVI Infra Solutions - Premium Real Estate Developer | Jaipur & Noida',
    template: '%s | SVI Infra Solutions',
  },
  description:
    'SVI Infra Solutions Pvt. Ltd. - Premium residential and commercial real estate developer with 15+ years of experience. Specializing in Jaipur, Noida, Phulera Smart City, and DMIC/DFC corridors.',
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
    icon: '/logo.png',
    apple: '/logo.png',
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
  themeColor: '#1a2744',
};

// Inline theme script — runs before React hydrates to avoid flash
const THEME_SCRIPT = `(function(){try{var t=document.documentElement,e=localStorage.getItem('svi-theme-v1');if(e==='dark'||e==='light')t.classList.add(e);else if(window.matchMedia('(prefers-color-scheme:dark)').matches)t.classList.add('dark');else t.classList.add('light')}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['Organization', 'RealEstateAgent'],
              '@id': 'https://sviiinfrasolutions.com/#organization',
              name: 'SVI Infra Solutions Pvt. Ltd.',
              description:
                'Premium residential and commercial real estate developer with 15+ years of experience in Jaipur, Noida, and DMIC/DFC corridors.',
              url: 'https://sviiinfrasolutions.com/',
              logo: 'https://sviiinfrasolutions.com/logo.png',
              image: 'https://sviiinfrasolutions.com/logo.png',
              telephone: '+91-73000-07643',
              email: 'info@sviinfrasolutions.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'A-61 Sector 65',
                addressLocality: 'Noida',
                addressRegion: 'Uttar Pradesh',
                postalCode: '201309',
                addressCountry: 'IN',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 28.6112,
                longitude: 77.382,
              },
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
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '5000',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': 'https://sviiinfrasolutions.com/#website',
              url: 'https://sviiinfrasolutions.com',
              name: 'SVI Infra Solutions',
              description:
                'Premium residential and commercial real estate developer in Jaipur, Noida, and Phulera Smart City',
              publisher: {
                '@id': 'https://sviiinfrasolutions.com/#organization',
              },
            }),
          }}
        />
        <link rel="preload" as="image" href="/images/hero1.png" />
        <link rel="preload" as="image" href="/images/hero2.png" />
        <link rel="preload" as="image" href="/images/hero3.png" />
        <link rel="manifest" href="/manifest.json" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${inter.variable} ${playfair.variable}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
