'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sparkles, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface SV13GallerySectionProps {
  isHindi?: boolean;
}

interface GalleryItem {
  src: string;
  title: string;
  category: 'ALL' | 'TOWNSHIP' | 'PLOTS' | 'ATTRACTIONS' | 'AMENITIES';
  tag: string;
}

export function SV13GallerySection({ isHindi = false }: SV13GallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState<
    'ALL' | 'TOWNSHIP' | 'PLOTS' | 'ATTRACTIONS' | 'AMENITIES'
  >('ALL');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  const galleryItems: GalleryItem[] = [
    {
      src: '/Shivani Vatika 11/gate.webp',
      title: isHindi ? 'भव्य मुख्य प्रवेश द्वार (30 फीट)' : 'Grand 30 Ft Main Entrance Gate',
      category: 'TOWNSHIP',
      tag: 'Main Entrance',
    },
    {
      src: '/Shivani Vatika 11/plot.webp',
      title: isHindi ? 'समतल एवं सीमांकित आवासीय भूखंड' : 'Demarcated Residential Plotted Layout',
      category: 'PLOTS',
      tag: 'Plotted Layout',
    },
    {
      src: '/Shivani Vatika/shivani vatika6 frontgate.webp',
      title: isHindi ? 'गेटेड सोसाइटी सुरक्षा बाउंड्री' : 'Secure Gated Perimeter & Boundary',
      category: 'TOWNSHIP',
      tag: 'Security & Access',
    },
    {
      src: '/Shivani Vatika 11/middle3.webp',
      title: isHindi ? 'सांभर झील फ्लेमिंगो व वेटलैंड' : 'Sambhar Lake Wetland & Flamingos',
      category: 'ATTRACTIONS',
      tag: 'Natural Lake',
    },
    {
      src: '/Shivani Vatika 11/middle5.webp',
      title: isHindi ? 'शाकंभरी माता मंदिर पावन तीर्थ' : 'Shakambhari Mata Shoreline Temple',
      category: 'ATTRACTIONS',
      tag: 'Sacred Pilgrimage',
    },
    {
      src: '/Shivani Vatika 11/middle2.webp',
      title: isHindi
        ? 'हेरिटेज साल्ट ट्रेन व रेल म्यूजियम'
        : 'Historic Colonial Salt Rail Experience',
      category: 'ATTRACTIONS',
      tag: 'Heritage Tourism',
    },
    {
      src: '/Shivani Vatika/shivani vatika4.webp',
      title: isHindi ? '30 फीट चौड़ी आंतरिक सड़कें' : '30 Ft Wide Planned Arterial Roads',
      category: 'AMENITIES',
      tag: 'Wide Roads',
    },
    {
      src: '/Shivani Vatika/shivani vatika5.webp',
      title: isHindi ? 'हरियाली युक्त लैंडस्केप पार्क' : 'Lush Landscaped Green Community Park',
      category: 'AMENITIES',
      tag: 'Park & Greenery',
    },
  ];

  const filteredItems = galleryItems.filter(
    (item) => activeCategory === 'ALL' || item.category === activeCategory
  );

  const handleOpenLightbox = (idx: number) => {
    setSelectedImageIndex(idx);
    setLightboxZoom(1);
  };

  const handleCloseLightbox = () => {
    setSelectedImageIndex(null);
    setLightboxZoom(1);
  };

  const handlePrev = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => (prev! > 0 ? prev! - 1 : filteredItems.length - 1));
    setLightboxZoom(1);
  };

  const handleNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => (prev! < filteredItems.length - 1 ? prev! + 1 : 0));
    setLightboxZoom(1);
  };

  return (
    <section
      id="gallery"
      className="scroll-mt-20 bg-white py-20 text-slate-900 dark:bg-slate-950 dark:text-white"
    >
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            {isHindi ? 'प्रोजेक्ट गैलरी' : 'Project Gallery & Visuals'}
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            {isHindi ? 'टाउनशिप एवं परिवेश की झलकियां' : 'Visual Showcase of Shivani Vatika 13th'}
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg dark:text-slate-300">
            {isHindi
              ? 'प्रोजेक्ट के वास्तविक साइट दृश्य, 30 फीट चौड़ी सड़कें, गेटेड प्रवेश और नजदीकी ऐतिहासिक दर्शनीय स्थल।'
              : 'Browse high-resolution photographs of actual township ground works, wide road infrastructure, and regional landmarks.'}
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'ALL' as const, label: isHindi ? 'सभी (All)' : 'All Visuals' },
            { id: 'TOWNSHIP' as const, label: isHindi ? 'टाउनशिप दृश्य' : 'Township & Gate' },
            { id: 'PLOTS' as const, label: isHindi ? 'प्लॉट साइट' : 'Plotted Ground' },
            { id: 'AMENITIES' as const, label: isHindi ? 'सड़कें व पार्क' : 'Roads & Parks' },
            { id: 'ATTRACTIONS' as const, label: isHindi ? 'सांभर हेरिटेज' : 'Sambhar Heritage' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-5 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleOpenLightbox(idx)}
              className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl dark:border-white/10 dark:bg-slate-900"
            >
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Tag and Zoom Icon */}
              <div className="absolute top-3 left-3 z-10">
                <span className="rounded-full bg-slate-950/70 px-2.5 py-1 text-[10px] font-bold tracking-wider text-amber-300 uppercase backdrop-blur-md">
                  {item.tag}
                </span>
              </div>

              <div className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 text-white opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
                <Maximize2 className="h-4 w-4" />
              </div>

              {/* Bottom Caption */}
              <div className="absolute right-3 bottom-3 left-3 z-10 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-xs font-bold text-white drop-shadow-sm">{item.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Fullscreen Lightbox Modal */}
        {selectedImageIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
            {/* Top Toolbar */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
              <button
                onClick={() => setLightboxZoom((prev) => Math.min(prev + 0.3, 2.5))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Zoom In"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                onClick={() => setLightboxZoom((prev) => Math.max(prev - 0.3, 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Zoom Out"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <button
                onClick={handleCloseLightbox}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-slate-950 transition-colors hover:bg-amber-300"
                aria-label="Close Lightbox"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Previous Button */}
            <button
              onClick={handlePrev}
              className="absolute top-1/2 left-4 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Active Image with Zoom */}
            <div className="relative flex max-h-[80vh] max-w-5xl items-center justify-center overflow-hidden">
              <div
                style={{
                  transform: `scale(${lightboxZoom})`,
                  transition: 'transform 0.2s ease-out',
                }}
                className="relative aspect-[16/10] w-[90vw] max-w-4xl"
              >
                <Image
                  src={filteredItems[selectedImageIndex].src}
                  alt={filteredItems[selectedImageIndex].title}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Navigation Next Button */}
            <button
              onClick={handleNext}
              className="absolute top-1/2 right-4 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Bottom Caption */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-slate-900/80 px-6 py-2.5 text-center backdrop-blur-md">
              <p className="text-sm font-bold text-white">
                {filteredItems[selectedImageIndex].title}
              </p>
              <p className="text-xs text-slate-400">
                {selectedImageIndex + 1} of {filteredItems.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
