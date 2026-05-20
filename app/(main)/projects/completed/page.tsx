'use client';

import { Suspense, lazy, useCallback, useState, useEffect, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  Download,
  ArrowRight,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Share2,
} from 'lucide-react';
import HoverZoomImage from '@/src/components/common/HoverZoomImage';

const GRADIENT_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
  backgroundSize: '40px 40px',
};

const completedProjectsData = [
  {
    id: 'shree-shyam-residency',
    title: 'Shree Shyam Residency',
    location: 'Jaipur (near Hope Farm Junction)',
    lat: 26.9124,
    lng: 75.7873,
    type: '3BHK/4BHK (Ready-to-move)',
    description:
      'A premium residential complex offering spacious 3BHK and 4BHK apartments with modern amenities, designed for those who appreciate luxury and comfort.',
    fullDescription:
      "Shree Shyam Residency is a hallmark of luxury living strategically positioned near Jaipur's Hope Farm Junction. Boasting meticulously designed 3BHK and 4BHK apartments, this ready-to-move complex offers an unparalleled lifestyle. Residents enjoy premium amenities including a state-of-the-art clubhouse, landscaped gardens, 24/7 security, and seamless connectivity to major city hubs. Every detail reflects our commitment to superior craftsmanship and architectural excellence.",
    status: 'Completed',
    img: '/images/hero1.png',
    gallery: ['/images/hero1.png', '/images/hero2.png', '/images/hero3.png'],
    pdf: true,
  },
  {
    id: 'shivani-city',
    title: 'Shivani City',
    location: 'Manpura Machedi',
    lat: 27.05,
    lng: 75.8,
    type: 'Premier Residential Development',
    description:
      'An elegantly planned residential development that completely sold out due to its unmatched quality, strategic location, and lifestyle offerings.',
    fullDescription:
      'Shivani City at Manpura Machedi stands as a premier residential development offering intricately planned plots and bespoke home designs. Selling out completely shortly after its launch, it proves high market demand and customer trust. The project integrates green parks, expansive walkways, and robust infrastructure, creating a wholesome environment tailored for modern families.',
    status: 'Sold Out',
    img: '/images/project2.png',
    gallery: ['/images/project2.png', '/images/house1.png'],
    pdf: true,
  },
  {
    id: 'shivani-residency',
    title: 'Shivani Residency',
    location: 'Dobadi near Sambhar & Fulera, Jaipur district',
    lat: 26.9,
    lng: 75.18,
    type: 'Residential',
    description:
      'Nestled in a peaceful environment near Sambhar Lake, offering competitive pricing and a serene lifestyle away from the city hustle.',
    fullDescription:
      'Shivani Residency lies in a uniquely peaceful environment in Dobadi, nestled close to the historic Sambhar Lake and Fulera in the Jaipur district. Designed as an escape from city congestion, this residential haven provides spacious plots, lush surroundings, and top-tier infrastructure at incredibly competitive prices, catering specifically to families desiring a balanced and tranquil lifestyle.',
    status: 'Completed',
    img: '/images/project1.png',
    gallery: ['/images/project1.png', '/images/hero3.png'],
    pdf: true,
  },
];

// Structured Data for RealEstateListing
const realEstateListingsSchema = {
  '@context': 'https://schema.org',
  '@graph': completedProjectsData.map((project) => ({
    '@type': 'RealEstateListing',
    name: project.title,
    description: project.fullDescription || project.description,
    listingType: 'SoldOut',
    address: {
      '@type': 'PostalAddress',
      addressLocality: project.location.split('(')[0].trim(),
      addressRegion: 'Rajasthan',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: project.lat,
      longitude: project.lng,
    },
    offers: {
      '@type': 'Offer',
      availability:
        project.status === 'Sold Out' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      priceStatus: 'https://schema.org/InquirePrice',
    },
    image: `https://sviiinfrasolutions.com${project.img}`,
    url: `https://sviiinfrasolutions.com/projects/completed#${project.id}`,
  })),
};

const CompletedProjectsMap = lazy(() =>
  import('@/src/components/CompletedProjectsMap').then((m) => ({ default: m.default }))
);

export default function CompletedProjects() {
  const [selectedProject, setSelectedProject] = useState<(typeof completedProjectsData)[0] | null>(
    null
  );
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [highlightedProject, setHighlightedProject] = useState<string | null>(null);

  const openModal = useCallback((project: (typeof completedProjectsData)[0]) => {
    setSelectedProject(project);
    setCurrentGalleryIndex(0);
    setDirection(0);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  }, []);

  const scrollToProject = useCallback((project: { id: string }) => {
    const el = document.getElementById(`project-${project.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedProject(project.id);
      setTimeout(() => setHighlightedProject(null), 2000);
    }
  }, []);

  const nextImage = useCallback(
    (e?: MouseEvent) => {
      if (e && 'stopPropagation' in e) e.stopPropagation();
      if (selectedProject && selectedProject.gallery) {
        setDirection(1);
        setCurrentGalleryIndex((prev) => (prev + 1) % selectedProject.gallery.length);
      }
    },
    [selectedProject]
  );

  const prevImage = useCallback(
    (e?: MouseEvent) => {
      if (e && 'stopPropagation' in e) e.stopPropagation();
      if (selectedProject && selectedProject.gallery) {
        setDirection(-1);
        setCurrentGalleryIndex(
          (prev) => (prev - 1 + selectedProject.gallery.length) % selectedProject.gallery.length
        );
      }
    },
    [selectedProject]
  );

  const [currentUrl, setCurrentUrl] = useState('');
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16 dark:bg-[#0C0C0C]">
      {/* RealEstateListing Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateListingsSchema) }}
      />

      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-20 dark:border-gray-700 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 font-serif text-3xl leading-tight sm:text-4xl md:text-6xl dark:text-gray-100">
            Completed Projects
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Explore our portfolio of successfully delivered projects. Each property is a testament
            to our commitment to excellence, timely delivery, and unmatched quality.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 lg:px-8">
        <div className="mb-10">
          <div className="text-brand-navy mb-6 flex items-center gap-2 dark:text-gray-100">
            <MapPin size={24} className="text-brand-gold" />
            <h2 className="font-serif text-2xl">Project Locations</h2>
          </div>
          <Suspense
            fallback={
              <div className="flex h-[500px] items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="border-brand-gold h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
              </div>
            }
          >
            <CompletedProjectsMap
              projects={completedProjectsData}
              onProjectClick={scrollToProject}
            />
          </Suspense>
        </div>
      </section>

      <section className="pt-8 pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {completedProjectsData.map((project, idx) => (
              <motion.div
                key={idx}
                id={`project-${project.id}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px', amount: 0.05 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
                className={`group overflow-hidden border bg-white dark:bg-gray-800 ${highlightedProject === project.id ? 'border-brand-gold dark:shadow-brand-gold/20 scale-[1.02] shadow-2xl' : 'dark:hover:shadow-brand-gold/20 hover:border-brand-gold border-gray-200 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl dark:border-gray-700'} flex h-full flex-col transition-all duration-400`}
              >
                <div
                  className="relative flex h-64 cursor-pointer items-center justify-center overflow-hidden bg-gray-100"
                  onClick={() => openModal(project)}
                >
                  <div className="bg-brand-navy/10 pointer-events-none absolute inset-0 z-10 transition-opacity duration-500 group-hover:opacity-0"></div>
                  <HoverZoomImage src={project.img} alt={project.title} />
                  <div className="text-brand-navy pointer-events-none absolute top-4 right-4 z-20 bg-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                    {project.status}
                  </div>
                </div>

                <div
                  className="z-20 flex flex-grow cursor-pointer flex-col bg-white p-8 dark:bg-gray-800"
                  onClick={() => openModal(project)}
                >
                  <div className="mb-4 flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      {project.location}
                    </span>
                    <span className="text-brand-gold mt-1 text-xs font-bold tracking-widest uppercase">
                      {project.type}
                    </span>
                  </div>

                  <h3 className="text-brand-navy group-hover:text-brand-gold mb-4 font-serif text-2xl transition-colors dark:text-gray-100">
                    {project.title}
                  </h3>

                  <p className="mb-8 flex-grow text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {project.description}
                  </p>

                  <button className="text-brand-gold mb-6 inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-all group-hover:gap-3">
                    View Details <ArrowRight size={14} />
                  </button>

                  {project.pdf ? (
                    <div
                      className="mt-auto flex items-center justify-between border-t border-gray-100 bg-white pt-6 dark:border-gray-700 dark:bg-gray-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex cursor-default flex-col">
                        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Status
                        </span>
                        <span className="text-brand-gold mt-1 text-xs font-bold tracking-widest uppercase">
                          {project.status}
                        </span>
                      </div>
                      <button className="border-brand-gold text-brand-navy hover:text-brand-gold flex cursor-pointer items-center gap-2 border-b pb-1 text-xs font-bold tracking-widest uppercase transition-colors dark:text-gray-200">
                        <Download size={14} />
                        Download PDF
                      </button>
                    </div>
                  ) : (
                    <div className="mt-auto border-t border-gray-100 bg-white pt-6 dark:border-gray-700 dark:bg-gray-800">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Status
                        </span>
                        <span className="text-brand-gold mt-1 text-xs font-bold tracking-widest uppercase">
                          {project.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20 text-center">
        <div className="bg-brand-navy relative mx-auto max-w-4xl overflow-hidden p-16 text-center shadow-2xl">
          <div
            className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10"
            style={GRADIENT_STYLE}
          ></div>
          <div className="relative z-10">
            <h2 className="mb-6 font-serif text-4xl text-white">
              Interested in our Upcoming Projects?
            </h2>
            <p className="mb-10 text-lg text-gray-300">
              Register your interest today to get early access and exclusive offers.
            </p>
            <Link
              href="/registration"
              className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light inline-block px-8 py-4 text-xs font-bold tracking-widest uppercase shadow-xl transition-colors"
            >
              Register interest
            </Link>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedProject ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-brand-navy/90 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 1 }}
              className="relative my-8 flex w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center border border-gray-200 bg-white/50 backdrop-blur transition-colors hover:bg-white"
                aria-label="Close modal"
              >
                <X size={20} className="text-brand-navy" />
              </button>

              <div className="group relative flex min-h-[300px] items-center justify-center overflow-hidden bg-gray-100 md:min-h-auto md:w-1/2">
                {selectedProject.gallery && selectedProject.gallery.length > 0 ? (
                  <>
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                      <motion.img
                        key={currentGalleryIndex}
                        src={selectedProject.gallery[currentGalleryIndex]}
                        alt={`${selectedProject.title} gallery ${currentGalleryIndex + 1}`}
                        className="absolute inset-0 h-full w-full cursor-grab object-cover active:cursor-grabbing"
                        custom={direction}
                        initial={{ opacity: 0, x: direction > 0 ? 200 : -200, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: direction > 0 ? -200 : 200, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 1 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                          if (offset.x < -50 || velocity.x < -500) nextImage();
                          else if (offset.x > 50 || velocity.x > 500) prevImage();
                        }}
                      />
                    </AnimatePresence>

                    {selectedProject.gallery.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="hover:text-brand-gold absolute top-1/2 left-4 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="hover:text-brand-gold absolute top-1/2 right-4 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white"
                          aria-label="Next image"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}

                    <div className="absolute right-0 bottom-4 left-0 z-20 flex justify-center gap-2">
                      {selectedProject.gallery.map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full transition-colors ${i === currentGalleryIndex ? 'bg-brand-gold' : 'border border-white/50 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <img
                    src={selectedProject.img}
                    alt={selectedProject.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div className="text-brand-navy pointer-events-none absolute top-4 left-4 z-20 bg-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                  {selectedProject.status}
                </div>
              </div>

              <div className="max-h-[80vh] overflow-y-auto p-8 md:w-1/2 md:p-12">
                <div className="mb-6 flex flex-col">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    <MapPin size={12} className="text-brand-gold" />
                    <span>{selectedProject.location}</span>
                  </div>
                  <span className="text-brand-gold text-xs font-bold tracking-widest uppercase">
                    {selectedProject.type}
                  </span>
                </div>

                <h3 className="text-brand-navy mb-6 font-serif text-3xl">
                  {selectedProject.title}
                </h3>

                <div className="prose prose-sm mb-8 leading-relaxed text-gray-600">
                  <p>{selectedProject.fullDescription || selectedProject.description}</p>
                </div>

                {selectedProject.pdf ? (
                  <button className="bg-brand-navy hover:bg-brand-gold hover:text-brand-navy flex w-full items-center justify-center gap-2 py-4 text-xs font-bold tracking-widest text-white uppercase transition-colors">
                    <Download size={16} />
                    Download Brochure (PDF)
                  </button>
                ) : null}

                <div className="mt-8 mt-auto border-t border-gray-100 pt-8">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      <Share2 size={12} /> Share Project
                    </span>
                    <div className="flex items-center gap-3">
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-[#1877F2] hover:text-white"
                        aria-label="Share on Facebook"
                      >
                        <Facebook size={14} />
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(`Check out ${selectedProject.title} by SVI Infra Solutions!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-[#1DA1F2] hover:text-white"
                        aria-label="Share on Twitter"
                      >
                        <Twitter size={14} />
                      </a>
                      <a
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(selectedProject.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-[#0A66C2] hover:text-white"
                        aria-label="Share on LinkedIn"
                      >
                        <Linkedin size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
