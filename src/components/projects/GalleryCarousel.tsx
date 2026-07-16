'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type GalleryCarouselProps = {
  gallery: string[];
  status?: string;
};

export default function GalleryCarousel({ gallery, status }: GalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!gallery || gallery.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm dark:bg-gray-800">
        <Image
          src={gallery[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority
        />

        {status && (
          <div className="absolute top-4 left-4 rounded-full bg-green-500 px-4 py-1 text-sm font-semibold tracking-wide text-white shadow-md">
            {status}
          </div>
        )}

        {gallery.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="text-brand-navy absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-transform hover:scale-110 hover:bg-white dark:bg-black/60 dark:text-white dark:hover:bg-black/80"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="text-brand-navy absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-transform hover:scale-110 hover:bg-white dark:bg-black/60 dark:text-white dark:hover:bg-black/80"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
          {gallery.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl transition-all ${
                currentIndex === idx
                  ? 'ring-brand-gold ring-2 ring-offset-2 dark:ring-offset-gray-900'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
