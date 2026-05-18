import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import ClientProviders from '@/src/components/ClientProviders';
import { Analytics } from '@vercel/analytics/next';

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

export const viewport: Viewport = {
  themeColor: '#1a2744',
};

const THEME_SCRIPT = `(function(){try{var t=document.documentElement,e=localStorage.getItem('svi-theme-v1');if(e==='dark'||e==='light')t.classList.add(e);else if(window.matchMedia('(prefers-color-scheme:dark)').matches)t.classList.add('dark');else t.classList.add('light')}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
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
        <link rel="preload" as="image" href="/images/hero1.png" />
        <link rel="preload" as="image" href="/images/hero2.png" />
        <link rel="preload" as="image" href="/images/hero3.png" />
      </head>
      <body className={`${inter.variable} ${playfair.variable}`}>
        <ClientProviders>
          {children}
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
