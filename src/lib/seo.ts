import type { Metadata } from 'next';

export const SITE_URL = 'https://www.sviinfrasolutions.com';
export const SITE_NAME = 'SVI Infra Solutions';
export const COMPANY_NAME = 'SVI Infra Solutions Pvt. Ltd.';
export const DEFAULT_OG_IMAGE = '/opengraph-image';

export function absoluteUrl(path = '/') {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Canonical serving URL for a path + locale.
 * English (default locale) is served at the root path (next-intl
 * `localePrefix: 'as-needed'`), Hindi at `/hi/<path>`. `/en/<path>` is a 307
 * redirect and must never be emitted as a canonical or hreflang target.
 */
export function localizedUrl(path: string, locale = 'en') {
  const cleanPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return locale === 'hi' ? absoluteUrl(`/hi${cleanPath}`) : absoluteUrl(cleanPath || '/');
}

/**
 * Self-referencing canonical + full hreflang set for a path/locale.
 * Every indexable page must emit its own alternates; otherwise it inherits
 * the root layout's `canonical: '/'` and tells Google to index the homepage.
 */
export function buildAlternates(path: string, locale = 'en') {
  const enUrl = localizedUrl(path, 'en');
  const hiUrl = localizedUrl(path, 'hi');
  return {
    canonical: locale === 'hi' ? hiUrl : enUrl,
    languages: {
      'en-IN': enUrl,
      'hi-IN': hiUrl,
      'x-default': enUrl,
    },
  };
}

type SeoOptions = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  locale?: string;
};

export function createMetadata({
  title,
  description,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  type = 'website',
  locale = 'en',
}: SeoOptions): Metadata {
  const url = localizedUrl(path, locale);
  const imageUrl = absoluteUrl(image);
  return {
    // Plain string: the root layout's `%s | SVI Infra Solutions` template
    // appends the brand once. Callers must NOT include the brand in `title`.
    title,
    description,
    alternates: buildAlternates(path, locale),
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
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
      type,
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: locale === 'hi' ? 'hi_IN' : 'en_IN',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
