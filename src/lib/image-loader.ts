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

/**
 * Returns a Supabase Storage URL with width + quality transformation params.
 * Falls back gracefully for non-Supabase URLs.
 */
export default function supabaseImageLoader({ src, width, quality }: ImageLoaderParams): string {
  // For local/public images, include width for responsive image support
  if (src.startsWith('/') || src.startsWith('./')) {
    return `${src}?w=${width}`;
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
