'use client';

import { Suspense, lazy, useCallback, useState, useEffect, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Construction,
} from 'lucide-react';
import { FacebookIcon, TwitterIcon, LinkedinIcon } from '@/src/components/common/social-icons';
import HoverZoomImage from '@/src/components/common/HoverZoomImage';
import dynamic from 'next/dynamic';

const ProjectsFAQ = dynamic(() => import('@/src/components/common/ProjectsFAQ'), { ssr: false });

// const GRADIENT_STYLE = {
//   backgroundImage:
//     'repeating-linear-gradient(45deg, #1a2744 0, #1a2744 1px, transparent 0, transparent 50%)',
//   backgroundSize: '40px 40px',
// };

const currentProjectsData = [
  {
    id: 'shivani-vatika',
    title: 'Shivani Vatika',
    location: 'Nayla',
    lat: 26.85,
    lng: 76.0,
    type: 'Modern Living',
    description:
      'A modern living community in the serene landscapes of Nayla, offering well-designed residential spaces in a rapidly developing area.',
    fullDescription:
      "Located in the serene landscapes of Nayla, Shivani Vatika is redefining modern community living. Offering uniquely crafted residential spaces equipped with essential urban facilities, this project reflects SVI Infra Solutions' commitment to quality, timely delivery, and producing environments that foster active and peaceful lifestyles. With excellent connectivity and promising growth potential, Shivani Vatika is an ideal choice for families seeking a balanced lifestyle.",
    status: 'Under Development',
    img: '/images/project2.png',
    gallery: ['/images/project2.png', '/images/hero1.png'],
  },
  {
    id: 'shyam-aangan',
    title: 'Shyam Aangan',
    location: 'Basri Khurd near Jaipur',
    lat: 26.65,
    lng: 75.85,
    type: 'Integrated Township',
    description:
      'JDA-approved integrated township on NH-12 (Tonk Road), perfectly positioned near the upcoming Inner Ring Road, IT corridors, and SEZs. Offers affordable pricing and flexible plans.',
    fullDescription:
      'Shyam Aangan is a sprawling, JDA-approved integrated township situated strategically on NH-12 (Tonk Road). It provides unparalleled connectivity to the upcoming Inner Ring Road, key IT corridors, and Special Economic Zones (SEZs). Designed to cater to diverse residential needs, the project blends affordable pricing with world-class facilities, paving the way for substantial future appreciation and a thriving community atmosphere.',
    status: 'Under Development',
    img: '/images/project1.png',
    gallery: ['/images/project1.png'],
  },
];

const CompletedProjectsMap = lazy(() =>
  import('@/src/components/CompletedProjectsMap').then((m) => ({ default: m.default }))
);

export default function Projects() {
  const [projects, setProjects] = useState(currentProjectsData);
  const [selectedProject, setSelectedProject] = useState<(typeof currentProjectsData)[0] | null>(
    null
  );
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [highlightedProject, setHighlightedProject] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch('/api/project-images');
        if (!res.ok) throw new Error('Failed to fetch project images');
        const data = (await res.json()) as Record<string, string[]>;

        setProjects((prevProjects) =>
          prevProjects.map((project) => {
            const dynamicImages = data[project.id];
            if (dynamicImages && dynamicImages.length > 0) {
              return {
                ...project,
                img: dynamicImages[0],
                gallery: dynamicImages,
              };
            }
            return project;
          })
        );
      } catch (err) {
        console.error('Error loading project images dynamically:', err);
      }
    }

    fetchImages();
  }, []);

  // Structured Data for RealEstateListing
  const realEstateListingsSchema = {
    '@context': 'https://schema.org',
    '@graph': projects.map((project) => ({
      '@type': 'RealEstateListing',
      name: project.title,
      description: project.fullDescription || project.description,
      listingType: 'ForSale',
      address: {
        '@type': 'PostalAddress',
        addressLocality: project.location,
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
        availability: 'https://schema.org/PreOrderAction',
        priceStatus: 'https://schema.org/InquirePrice',
      },
      image: `https://sviiinfrasolutions.com${project.img}`,
      url: `https://sviiinfrasolutions.com/projects/current#${project.id}`,
    })),
  };

  const openModal = useCallback((project: (typeof currentProjectsData)[0]) => {
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
            Current Projects
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Discover our ongoing developments. We are currently working on exciting new residential
            and commercial projects in prime locations, offering unparalleled amenities and
            lifestyle options.
          </p>
        </div>
      </section>

      {projects.length > 0 ? (
        <section className="container mx-auto px-4 py-12 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="text-brand-navy dark:text-brand-gold mb-6 flex items-center gap-2">
              <MapPin size={24} />
              <h2 className="font-serif text-2xl">Project Locations</h2>
            </div>
            <Suspense
              fallback={
                <div className="relative flex h-[500px] animate-pulse flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-white/5 dark:bg-gray-900/60">
                  <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
                    {/* Fake map grid pattern */}
                    <div className="h-full w-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
                  </div>
                  {/* Fake map search and control tools */}
                  <div className="bg-gray-250 absolute top-4 left-4 h-10 w-48 rounded-lg shadow-md dark:bg-white/5" />
                  <div className="bg-gray-250 absolute top-4 right-4 h-10 w-10 rounded-lg shadow-md dark:bg-white/5" />
                  <div className="absolute right-4 bottom-8 space-y-2">
                    <div className="bg-gray-250 h-10 w-10 rounded-lg shadow-md dark:bg-white/5" />
                    <div className="bg-gray-250 h-10 w-10 rounded-lg shadow-md dark:bg-white/5" />
                  </div>
                  {/* Map Center Pin Pulsing */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-brand-gold/15 border-brand-gold/30 flex h-12 w-12 items-center justify-center rounded-full border">
                      <div className="bg-brand-gold h-4 w-4 rounded-full" />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                      Initializing project locations map...
                    </span>
                  </div>
                </div>
              }
            >
              <CompletedProjectsMap projects={projects} onProjectClick={scrollToProject} />
            </Suspense>
          </motion.div>
        </section>
      ) : null}

      <section className={`pb-24 ${projects.length > 0 ? 'pt-8' : 'pt-24'}`}>
        <div className="container mx-auto px-4 lg:px-8">
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              {projects.map((project, idx) => (
                <motion.div
                  key={idx}
                  id={`project-${project.id}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
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
                      <Link
                        href="/registration"
                        className="border-brand-gold text-brand-navy hover:text-brand-gold flex cursor-pointer items-center gap-2 border-b pb-1 text-xs font-bold tracking-widest uppercase transition-colors dark:text-gray-200"
                      >
                        Get Notified <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-2xl border border-gray-200 bg-white p-16 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="border-brand-gold text-brand-navy dark:text-brand-gold relative mx-auto mb-8 flex h-20 w-20 items-center justify-center border">
                <Construction size={32} />
                <div className="bg-brand-navy absolute inset-0 -z-10 origin-bottom-right scale-0 opacity-5 transition-transform group-hover:scale-100"></div>
              </div>
              <h4 className="mb-4 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
                Under Development
              </h4>
              <h2 className="text-brand-navy mb-6 font-serif text-3xl dark:text-gray-100">
                Coming Soon
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                We are currently working on exciting new residential and commercial projects in
                prime locations. Check back soon for detailed layouts, pricing, and availability.
              </p>
              <Link
                href="/registration"
                className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy border-brand-navy mx-auto flex inline-flex w-full items-center justify-center gap-2 border px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors sm:w-auto dark:border-gray-600 dark:bg-gray-700"
              >
                Get Notified First
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedProject && (
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
              className="relative my-8 flex w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl md:h-[600px] md:max-h-[85vh] md:flex-row dark:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center border border-gray-200 bg-white/50 backdrop-blur transition-colors hover:bg-white dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
                aria-label="Close modal"
              >
                <X size={20} className="text-brand-navy dark:text-gray-100" />
              </button>

              <div className="group relative flex min-h-[300px] items-center justify-center overflow-hidden bg-gray-100 md:h-full md:min-h-0 md:w-1/2">
                {selectedProject.gallery && selectedProject.gallery.length > 0 ? (
                  <>
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                      <motion.div
                        key={currentGalleryIndex}
                        className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
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
                      >
                        <HoverZoomImage
                          src={selectedProject.gallery[currentGalleryIndex]}
                          alt={`${selectedProject.title} gallery ${currentGalleryIndex + 1}`}
                        />
                      </motion.div>
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

                    {selectedProject.gallery.length > 1 && (
                      <div className="absolute right-0 bottom-4 left-0 z-20 flex justify-center gap-2">
                        {selectedProject.gallery.map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full transition-colors ${i === currentGalleryIndex ? 'bg-brand-gold' : 'border border-white/50 bg-white/50'}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <HoverZoomImage src={selectedProject.img} alt={selectedProject.title} />
                )}
                <div className="text-brand-navy pointer-events-none absolute top-4 left-4 z-20 bg-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                  {selectedProject.status}
                </div>
              </div>

              <div className="p-8 md:h-full md:w-1/2 md:overflow-y-auto md:p-12">
                <div className="mb-6 flex flex-col">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    <MapPin size={12} className="text-brand-gold" />
                    <span>{selectedProject.location}</span>
                  </div>
                  <span className="text-brand-gold text-xs font-bold tracking-widest uppercase">
                    {selectedProject.type}
                  </span>
                </div>

                <h3 className="text-brand-navy mb-6 font-serif text-3xl dark:text-gray-100">
                  {selectedProject.title}
                </h3>

                <div className="prose prose-sm mb-8 leading-relaxed text-gray-600 dark:text-gray-300">
                  <p>{selectedProject.fullDescription || selectedProject.description}</p>
                </div>

                <Link
                  href="/registration"
                  onClick={closeModal}
                  className="bg-brand-navy hover:bg-brand-gold hover:text-brand-navy flex w-full items-center justify-center gap-2 py-4 text-xs font-bold tracking-widest text-white uppercase transition-colors"
                >
                  <ArrowRight size={16} />
                  Get Notified First
                </Link>

                <div className="mt-8 mt-auto border-t border-gray-100 pt-8 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      <Share2 size={12} /> Share Project
                    </span>
                    <div className="flex items-center gap-3">
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-[#1877F2] hover:text-white dark:bg-gray-700 dark:text-gray-300"
                        aria-label="Share on Facebook"
                      >
                        <FacebookIcon size={14} />
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(`Check out ${selectedProject.title} by SVI Infra Solutions!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-[#1DA1F2] hover:text-white dark:bg-gray-700 dark:text-gray-300"
                        aria-label="Share on Twitter"
                      >
                        <TwitterIcon size={14} />
                      </a>
                      <a
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(selectedProject.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-[#0A66C2] hover:text-white dark:bg-gray-700 dark:text-gray-300"
                        aria-label="Share on LinkedIn"
                      >
                        <LinkedinIcon size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ProjectsFAQ />
    </div>
  );
}
