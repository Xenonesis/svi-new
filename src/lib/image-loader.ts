/**
 * Custom Image Loader for next/image
 *
 * For local images, uses full-size WebP by default — this is the safest approach
 * since every image has a `.webp` variant. Responsive variants (320w, 640w, 1024w)
 * are used only for widths we can guarantee exist (≤1024).
 *
 * Images smaller than 1920px (like 1024px hero images) don't have a 1920w variant,
 * so requesting `-1920w.webp` would 404. This loader avoids that by never requesting
 * responsive variants above 1024w — it falls back to the full-size `.webp` instead.
 */

interface ImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

const SAFE_RESPONSIVE_SIZES = [320, 640, 1024];

const RESPONSIVE_LOCAL_DIRS = [
  '/images/',
  './images/',
  '/Shivani Vatika/',
  './Shivani Vatika/',
  '/Shivani Vatika 11/',
  './Shivani Vatika 11/',
  '/Shayam angan/',
  './Shayam angan/',
];

export default function supabaseImageLoader({ src, width }: ImageLoaderParams): string {
  // Supabase Storage URLs
  if (src.includes('supabase.co/storage')) {
    try {
      const url = new URL(src);
      url.searchParams.set('width', String(width));
      return url.toString();
    } catch {
      return src;
    }
  }

  // External URLs (Unsplash, external CDNs, etc.)
  if (src.startsWith('http://') || src.startsWith('https://')) {
    try {
      const url = new URL(src);
      url.searchParams.set('w', String(width));
      return url.toString();
    } catch {
      return `${src}?w=${width}`;
    }
  }

  // Local images (normalize by decoding first in case partially or fully encoded)
  let cleanSrc = src;
  try {
    cleanSrc = decodeURI(src);
  } catch {
    // Keep original if malformed URI component
  }

  // Check if this local image lives in one of the directories with pre-generated responsive variants
  const isResponsiveDir =
    RESPONSIVE_LOCAL_DIRS.some((dir) => cleanSrc.startsWith(dir)) &&
    !cleanSrc.includes('/images/landmarks/');
  if (isResponsiveDir) {
    const basePath = cleanSrc.replace(/\.(png|jpg|jpeg|webp|avif)$/i, '');

    // Optimized responsive breakpoints:
    // - width ≤ 384px (compact mobile): serve 320w (~18 KB)
    // - width ≤ 800px (standard mobile & 2x DPR mobile): serve 640w (~59 KB)
    // - width ≤ 1200px (tablet & desktop): serve 1024w (~120 KB)
    // - width > 1200px (ultra-wide/retina desktop): serve full-size WebP
    if (width <= 384) {
      return encodeURI(`${basePath}-320w.webp`);
    }
    if (width <= 800) {
      return encodeURI(`${basePath}-640w.webp`);
    }
    if (width <= 1200) {
      return encodeURI(`${basePath}-1024w.webp`);
    }
    return encodeURI(`${basePath}.webp?w=${width}`);
  }
  // Other local images (e.g. /logo.png, /signature.png, etc.)
  // Always encodeURI so spaces never break HTML srcset parsing
  return encodeURI(`${cleanSrc}?w=${width}`);
}
