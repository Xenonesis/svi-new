'use client';

import { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageIcon, AlertCircle, RotateCw } from 'lucide-react';
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
  const [renderSkeleton, setRenderSkeleton] = useState(true);

  // Reset loading & error state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setRenderSkeleton(true);
  }, [src]);

  // Cleanly unmount skeleton after fade-out transition to stop keyframe animations
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        setRenderSkeleton(false);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // Find blur data URL from manifest if available (robust to encoded & unencoded paths)
  const manifestMap = blurManifest as Record<string, string>;
  let decodedSrc = src;
  try {
    decodedSrc = decodeURI(src);
  } catch {
    // fallback to raw src
  }
  const encodedSrc = encodeURI(decodedSrc);
  const blurUrl =
    manifestMap[src] ||
    manifestMap[decodedSrc] ||
    manifestMap[encodedSrc] ||
    manifestMap[`/public${decodedSrc}`] ||
    manifestMap[`/public${encodedSrc}`] ||
    manifestMap[decodedSrc.replace(/^\//, '')] ||
    DEFAULT_BLUR_DATA_URL;
  return (
    <div
      className={`hover-zoom-container relative h-full w-full overflow-hidden bg-[#0c121e] ${className}`}
    >
      {/* Premium Shimmer Skeleton Loader */}
      {!hasError && showSkeleton && renderSkeleton && (
        <div
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden bg-[#0c121e] transition-all duration-500 ease-out ${
            isLoaded ? 'pointer-events-none invisible opacity-0' : 'visible opacity-100'
          }`}
          aria-hidden={isLoaded}
        >
          {/* Sweeping Shimmer Beam */}
          <div className="animate-image-shimmer via-brand-gold/[0.12] pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          {/* Micro Grid / Pattern Accent */}
          <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />

          {/* Central Luxury Dual-Ring Loader */}
          <div className="relative z-10 flex flex-col items-center gap-3 px-4 text-center">
            <div className="relative flex items-center justify-center">
              {/* Outer Golden Spinning Arc */}
              <div className="border-brand-gold/20 border-t-brand-gold border-r-brand-gold/60 h-12 w-12 animate-spin rounded-full border-2 sm:h-14 sm:w-14" />

              {/* Inner Glassmorphic Badge */}
              <div className="bg-brand-navy/90 border-brand-gold/30 absolute flex h-9 w-9 items-center justify-center rounded-full border shadow-lg shadow-black/60 backdrop-blur-md sm:h-10 sm:w-10">
                <ImageIcon className="text-brand-gold h-4 w-4 animate-pulse drop-shadow-[0_0_8px_rgba(212,175,55,0.5)] sm:h-5 sm:w-5" />
              </div>
            </div>

            {/* Subtle Brand Loading Status Indicator */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-brand-gold/85 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase drop-shadow-sm sm:text-[11px]">
                Loading preview
                <span className="inline-flex gap-1">
                  <span
                    className="bg-brand-gold/90 inline-block h-1 w-1 animate-ping rounded-full"
                    style={{ animationDuration: '1.4s' }}
                  />
                  <span
                    className="bg-brand-gold/70 inline-block h-1 w-1 animate-ping rounded-full"
                    style={{ animationDuration: '1.4s', animationDelay: '0.2s' }}
                  />
                  <span
                    className="bg-brand-gold/50 inline-block h-1 w-1 animate-ping rounded-full"
                    style={{ animationDuration: '1.4s', animationDelay: '0.4s' }}
                  />
                </span>
              </span>
            </div>
          </div>

          {/* Bottom Gold Progress Accent Line */}
          <div className="absolute right-0 bottom-0 left-0 h-[2px] overflow-hidden bg-white/5">
            <div className="animate-image-progress via-brand-gold h-full w-full -translate-x-full bg-gradient-to-r from-transparent to-transparent" />
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#0c121e] p-6 text-center text-slate-400">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-inner">
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-slate-200">Unable to load image</p>
          <p className="mt-1 line-clamp-1 max-w-xs text-[11px] text-slate-500">{alt}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHasError(false);
              setIsLoaded(false);
            }}
            className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold hover:border-brand-gold/50 hover:bg-brand-gold/20 mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
          >
            <RotateCw className="h-3 w-3" />
            Retry
          </button>
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
