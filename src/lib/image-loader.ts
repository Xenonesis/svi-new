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

export default function supabaseImageLoader({ src, width }: ImageLoaderParams): string {
  // Local images in /images/ directory have pre-generated WebP responsive variants
  if (src.startsWith('/images/') || src.startsWith('./images/')) {
    const basePath = src.replace(/\.(png|jpg|jpeg|webp|avif)$/i, '');

    // For hero background images, serve full-size high-resolution WebP directly
    if (src.includes('hero')) {
      return `${basePath}.webp?w=${width}`;
    }

    // Only use responsive variants for sizes we know always exist (≤1024w)
    const match = SAFE_RESPONSIVE_SIZES.find((s) => s >= width);
    if (match) return `${basePath}-${match}w.webp`;

    // For larger requests (1200w, 1920w), use full-size WebP to avoid 404s
    return `${basePath}.webp?w=${width}`;
  }

  // Supabase Storage URLs
  if (src.includes('supabase.co/storage')) {
    const url = new URL(src);
    url.searchParams.set('width', String(width));
    return url.toString();
  }

  // External URLs (Unsplash, external CDNs, etc.)
  try {
    const url = new URL(src);
    url.searchParams.set('w', String(width));
    return url.toString();
  } catch {
    return `${src}?w=${width}`;
  }
}
