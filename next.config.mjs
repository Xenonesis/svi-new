// @ts-check
/* global process */

import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

// Debug JSON.parse errors globally in Next.js dev server
const originalParse = JSON.parse;
global.JSON.parse = function(text, reviver) {
  try {
    return originalParse(text, reviver);
  } catch (err) {
    if (typeof text === 'string' && (text.length === 1219 || text.length === 1734 || err.message.includes('Unexpected non-whitespace character'))) {
      console.error('--- JSON PARSE ERROR DETECTED ---');
      console.error('Error message:', err.message);
      console.error('String length:', text.length);
      console.error('First 100 chars:', text.substring(0, 100));
      console.error('Last 100 chars:', text.substring(text.length - 100));
      console.error('Stack trace:', new Error().stack);
      console.error('---------------------------------');
    }
    throw err;
  }
};


const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  typescript: { ignoreBuildErrors: false },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', 'motion', '@tiptap/react', '@tiptap/starter-kit'],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/.git/**',
        ],
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
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-scripts.com https://www.googletagmanager.com https://js.hcaptcha.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://hcaptcha.com https://*.hcaptcha.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.supabase.co https://maps.googleapis.com https://maps.gstatic.com https://images.unsplash.com https://www.google-analytics.com https://*.openstreetmap.org https://api.qrserver.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com https://api.resend.com https://www.google-analytics.com https://hcaptcha.com https://*.hcaptcha.com https://*.openstreetmap.org https://api.qrserver.com; frame-src 'self' https://newassets.hcaptcha.com https://js.hcaptcha.com; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
  images: {
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
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [320, 420, 768, 1024, 1200, 1920],
    qualities: [75, 85, 90, 95, 100],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default withSentryConfig(
  withNextIntl(withBundleAnalyzer(nextConfig)),
  {
    org: "svi-infra-solutions",
    project: "javascript-nextjs",
    authToken: process.env.SENTRY_AUTH_TOKEN,
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
    silent: !process.env.CI,
  }
);
