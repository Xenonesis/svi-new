// @ts-check
/* global process */

// Serwist works fine with Turbopack during build — suppress the nag warning.
process.env.SERWIST_SUPPRESS_TURBOPACK_WARNING = '1';

import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';
import withSerwistInit from '@serwist/next';

// Dev-only allowance so impeccable live mode can load.
const __impeccableLiveDev = process.env.NODE_ENV === 'development' ? ' http://localhost:8400' : '';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  register: false,
  disable: process.env.NODE_ENV === 'development',
});

const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      'motion',
      '@tiptap/react',
      '@tiptap/starter-kit',
    ],
  },
  // Keep compiled pages in memory longer during dev (no production impact)
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules/**', '**/.next/**', '**/.git/**'],
      };
    }
    return config;
  },
  // Log build warnings for large chunks
  logging: {
    fetches: { fullUrl: true },
  },
  // Fix Turbopack root detection when multiple lockfiles exist
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    const headersList = [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-scripts.com https://www.googletagmanager.com https://js.hcaptcha.com${__impeccableLiveDev}; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://hcaptcha.com https://*.hcaptcha.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.supabase.co https://maps.googleapis.com https://maps.gstatic.com https://images.unsplash.com https://*.openstreetmap.org https://api.qrserver.com; media-src 'self' https://*.supabase.co; connect-src 'self' https://*.sentry.io https://*.supabase.co wss://*.supabase.co https://api.groq.com https://api.resend.com https://hcaptcha.com https://*.hcaptcha.com https://*.openstreetmap.org; frame-src 'self' https://newassets.hcaptcha.com https://js.hcaptcha.com https://www.google.com https://*.google.com; frame-ancestors 'none';`,
          },
        ],
      },
    ];

    if (process.env.NODE_ENV === 'production') {
      headersList.push(
        {
          source: '/_next/static/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          source: '/images/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=86400, must-revalidate',
            },
          ],
        },
        {
          source: '/favicon.ico',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=86400, must-revalidate',
            },
          ],
        }
      );
    }

    return headersList;
  },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Supabase Storage for project/user images
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 768, 1024, 1200, 1920],
    qualities: [75, 80, 85, 90, 95, 100],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default withSentryConfig(withNextIntl(withBundleAnalyzer(withSerwist(nextConfig))), {
  org: 'svi-infra-solutions',
  project: 'javascript-nextjs',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  silent: !process.env.CI,
});
