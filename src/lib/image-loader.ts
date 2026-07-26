/**
 * Supabase Image Loader for next/image
 *
 * Usage in next.config.mjs (optional — enable only when using Supabase Storage images):
 *   images: {
 *     loader: 'custom',
 *     loaderFile: './src/lib/image-loader.ts',
 *   }
 *
 * Or use per-image with the `loader` prop on <Image />.
 *
 * Note: Supabase Storage supports basic image transformations via URL params.
 * See: https://supabase.com/docs/guides/storage/serving/image-transformations
 */

interface ImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

// Generated responsive sizes from optimize-images.mjs
const RESPONSIVE_SIZES = [320, 640, 1024, 1920];

/**
 * Returns image URL optimized for the requested width.
 * For local images, uses pre-generated WebP responsive variants.
 * Falls back to full-size WebP for widths without a matching responsive file.
 */
export default function supabaseImageLoader({ src, width, quality }: ImageLoaderParams): string {
  // For local/public images, use pre-generated WebP responsive variants
  if (src.startsWith('/') || src.startsWith('./')) {
    const basePath = src.replace(/\.(png|jpg|jpeg)$/i, '');
    // Find the closest responsive size that's >= requested width
    const closest =
      RESPONSIVE_SIZES.find((s) => s >= width) ?? RESPONSIVE_SIZES[RESPONSIVE_SIZES.length - 1];
    return `${basePath}-${closest}w.webp`;
  }

  // For Supabase Storage URLs, append transformation params
  if (src.includes('supabase.co/storage')) {
    const url = new URL(src);
    url.searchParams.set('width', String(width));
    if (quality) url.searchParams.set('quality', String(quality));
    return url.toString();
  }

  // Default: return src unchanged (CDN or external)
  return src;
}
