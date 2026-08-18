'use client';

import { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageIcon, AlertCircle } from 'lucide-react';
import blurManifest from '@/src/data/blur-data-urls.json';

interface HoverZoomImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  showSkeleton?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

// Built-in shimmer SVG blur placeholder for seamless initial paint
const shimmerSvg = (w = 700, h = 475) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1e293b" offset="20%" />
      <stop stop-color="#334155" offset="50%" />
      <stop stop-color="#1e293b" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1e293b" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.5s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

const DEFAULT_BLUR_DATA_URL = `data:image/svg+xml;base64,${toBase64(shimmerSvg())}`;

const HoverZoomImage = memo(function HoverZoomImage({
  src,
  alt,
  className = '',
  imageClassName = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  showSkeleton = true,
  onLoad,
  onError,
}: HoverZoomImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset loading & error state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // Find blur data URL from manifest if available
  const manifestMap = blurManifest as Record<string, string>;
  const blurUrl =
    manifestMap[src] ||
    manifestMap[`/public${src}`] ||
    manifestMap[src.replace(/^\//, '')] ||
    DEFAULT_BLUR_DATA_URL;

  return (
    <div
      className={`hover-zoom-container relative h-full w-full overflow-hidden bg-slate-900 ${className}`}
    >
      {/* Premium Shimmer Skeleton Loader */}
      {!isLoaded && !hasError && showSkeleton && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 text-slate-400">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="bg-brand-navy/60 border-brand-gold/20 flex h-10 w-10 items-center justify-center rounded-full border shadow-inner">
              <ImageIcon className="text-brand-gold/60 h-5 w-5 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 p-6 text-center text-slate-400">
          <AlertCircle className="mb-2 h-8 w-8 text-amber-500/70" />
          <p className="text-xs font-semibold text-slate-300">Unable to load image</p>
          <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{alt}</p>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          quality={quality}
          sizes={sizes}
          placeholder="blur"
          blurDataURL={blurUrl}
          onLoad={() => {
            setIsLoaded(true);
            if (onLoad) onLoad();
          }}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
            if (onError) onError();
          }}
          className={`hover-zoom-img object-cover transition-all duration-700 ease-out ${
            isLoaded ? 'blur-0 scale-100 opacity-100' : 'scale-[1.03] opacity-0 blur-sm'
          } ${imageClassName}`}
          style={{
            transition: isLoaded
              ? 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease-out, filter 0.5s ease-out'
              : undefined,
          }}
        />
      )}
    </div>
  );
});

export default HoverZoomImage;
