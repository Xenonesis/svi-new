"use client";

import { Suspense, lazy, useCallback, useEffect, useState, type MouseEvent, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, MapPin, X, ChevronLeft, ChevronRight, Facebook, Twitter, Linkedin, Share2, Construction } from 'lucide-react';
import HoverZoomImage from '@/src/components/common/HoverZoomImage';

const GRADIENT_STYLE = { backgroundImage: 'repeating-linear-gradient(45deg, #1a2744 0, #1a2744 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' };

const currentProjectsData = [
  {
    id: 'shivani-vatika',
    title: 'Shivani Vatika',
    location: 'Nayla',
    lat: 26.8500,
    lng: 76.0000,
    type: 'Modern Living',
    description: 'A modern living community in the serene landscapes of Nayla, offering well-designed residential spaces in a rapidly developing area.',
    fullDescription: 'Located in the serene landscapes of Nayla, Shivani Vatika is redefining modern community living. Offering uniquely crafted residential spaces equipped with essential urban facilities, this project reflects SVI Infra Solutions\' commitment to quality, timely delivery, and producing environments that foster active and peaceful lifestyles. With excellent connectivity and promising growth potential, Shivani Vatika is an ideal choice for families seeking a balanced lifestyle.',
    status: 'Under Development',
    img: '/images/project2.png',
    gallery: [
      '/images/project2.png',
      '/images/hero1.png',
    ]
  },
  {
    id: 'shyam-aangan',
    title: 'Shyam Aangan',
    location: 'Basri Khurd near Jaipur',
    lat: 26.6500,
    lng: 75.8500,
    type: 'Integrated Township',
    description: 'JDA-approved integrated township on NH-12 (Tonk Road), perfectly positioned near the upcoming Inner Ring Road, IT corridors, and SEZs. Offers affordable pricing and flexible plans.',
    fullDescription: 'Shyam Aangan is a sprawling, JDA-approved integrated township situated strategically on NH-12 (Tonk Road). It provides unparalleled connectivity to the upcoming Inner Ring Road, key IT corridors, and Special Economic Zones (SEZs). Designed to cater to diverse residential needs, the project blends affordable pricing with world-class facilities, paving the way for substantial future appreciation and a thriving community atmosphere.',
    status: 'Under Development',
    img: '/images/project1.png',
    gallery: [
      '/images/project1.png'
    ]
  }
];

const CompletedProjectsMap = lazy(() => import('@/src/components/CompletedProjectsMap').then(m => ({ default: m.default })));

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<typeof currentProjectsData[0] | null>(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [highlightedProject, setHighlightedProject] = useState<string | null>(null);

  useEffect(() => {
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const openModal = useCallback((project: typeof currentProjectsData[0]) => {
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

  const nextImage = useCallback((e?: MouseEvent | Event) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    if (selectedProject && selectedProject.gallery) {
      setDirection(1);
      setCurrentGalleryIndex((prev) => (prev + 1) % selectedProject.gallery.length);
    }
  }, [selectedProject]);

  const prevImage = useCallback((e?: MouseEvent | Event) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    if (selectedProject && selectedProject.gallery) {
      setDirection(-1);
      setCurrentGalleryIndex((prev) => (prev - 1 + selectedProject.gallery.length) % selectedProject.gallery.length);
    }
  }, [selectedProject]);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="pt-24 pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <section className="bg-brand-bg dark:bg-gray-800 py-20 text-center border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-brand-navy dark:text-gray-100 leading-tight mb-6"
          >
            Current Projects
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-px bg-brand-gold mx-auto mb-6"
          ></motion.div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Discover our ongoing developments. We are currently working on exciting new residential and commercial projects in prime locations, offering unparalleled amenities and lifestyle options.
          </p>
        </div>
      </section>

      {currentProjectsData.length > 0 ? (
        <section className="container mx-auto px-4 lg:px-8 py-12">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6 text-brand-navy dark:text-brand-gold">
              <MapPin size={24} />
              <h2 className="text-2xl font-serif">Project Locations</h2>
            </div>
            <Suspense fallback={<div className="h-[500px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>}>
              <CompletedProjectsMap projects={currentProjectsData as any} onProjectClick={scrollToProject} />
            </Suspense>
          </motion.div>
        </section>
      ) : null}

      <section className={`pb-24 ${currentProjectsData.length > 0 ? 'pt-8' : 'pt-24'}`}>
        <div className="container mx-auto px-4 lg:px-8">

          {currentProjectsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {currentProjectsData.map((project, idx) => (
                <motion.div
                  key={idx}
                  id={`project-${project.id}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                  className={`bg-white dark:bg-gray-800 group overflow-hidden border ${highlightedProject === project.id ? 'border-brand-gold shadow-2xl scale-[1.02] dark:shadow-brand-gold/20' : 'border-gray-200 dark:border-gray-700 hover:shadow-2xl dark:hover:shadow-brand-gold/20 hover:border-brand-gold hover:-translate-y-2 hover:scale-[1.02]'} flex flex-col h-full transition-all duration-400`}
                >
                  <div className="relative h-64 overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer" onClick={() => openModal(project)}>
                    <div className="absolute inset-0 bg-brand-navy/10 z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-500"></div>
                    <HoverZoomImage src={project.img} alt={project.title} />
                    <div className="absolute top-4 right-4 z-20 text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white text-brand-navy shadow-sm pointer-events-none">
                      {project.status}
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow z-20 bg-white dark:bg-gray-800 cursor-pointer" onClick={() => openModal(project)}>
                    <div className="flex flex-col mb-4">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{project.location}</span>
                      <span className="text-xs font-bold text-brand-gold uppercase tracking-widest mt-1">{project.type}</span>
                    </div>

                    <h3 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4 group-hover:text-brand-gold transition-colors">{project.title}</h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8 flex-grow">
                      {project.description}
                    </p>

                    <button className="text-xs font-bold uppercase tracking-widest text-brand-gold inline-flex items-center gap-2 mb-6 group-hover:gap-3 transition-all">
                      View Details <ArrowRight size={14} />
                    </button>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between mt-auto bg-white dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col cursor-default">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Status</span>
                        <span className="text-xs font-bold text-brand-gold uppercase tracking-widest mt-1">{project.status}</span>
                      </div>
                      <Link href="/registration" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b border-brand-gold pb-1 text-brand-navy dark:text-gray-200 hover:text-brand-gold transition-colors cursor-pointer">
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
              className="bg-white dark:bg-gray-800 p-16 max-w-2xl mx-auto shadow-sm border border-gray-200 dark:border-gray-700 text-center"
            >
              <div className="w-20 h-20 border border-brand-gold text-brand-navy dark:text-brand-gold flex items-center justify-center mx-auto mb-8 relative">
                <Construction size={32} />
                <div className="absolute inset-0 bg-brand-navy scale-0 group-hover:scale-100 transition-transform -z-10 origin-bottom-right opacity-5"></div>
              </div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-4">Under Development</h4>
              <h2 className="text-3xl font-serif text-brand-navy dark:text-gray-100 mb-6">Coming Soon</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 leading-relaxed">
                We are currently working on exciting new residential and commercial projects in prime locations. Check back soon for detailed layouts, pricing, and availability.
              </p>
              <Link href="/registration" className="bg-brand-navy dark:bg-gray-700 hover:bg-brand-gold text-brand-gold hover:text-brand-navy font-bold uppercase text-xs tracking-widest px-8 py-4 transition-colors flex items-center justify-center gap-2 border border-brand-navy dark:border-gray-600 inline-flex w-full sm:w-auto mx-auto">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/90 backdrop-blur-sm overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 1 }}
              className="bg-white w-full max-w-5xl my-8 relative overflow-hidden shadow-2xl flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/50 backdrop-blur border border-gray-200 flex items-center justify-center hover:bg-white transition-colors"
                aria-label="Close modal"
              >
                <X size={20} className="text-brand-navy" />
              </button>

              <div className="md:w-1/2 relative bg-gray-100 min-h-[300px] md:min-h-auto flex items-center justify-center group overflow-hidden">
                {selectedProject.gallery && selectedProject.gallery.length > 0 ? (
                  <>
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                      <motion.img
                        key={currentGalleryIndex}
                        src={selectedProject.gallery[currentGalleryIndex]}
                        alt={`${selectedProject.title} gallery ${currentGalleryIndex + 1}`}
                        className="w-full h-full object-cover absolute inset-0 cursor-grab active:cursor-grabbing"
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
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white hover:text-brand-gold hover:scale-105 transition-all shadow-lg z-30"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white hover:text-brand-gold hover:scale-105 transition-all shadow-lg z-30"
                          aria-label="Next image"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}

                    {selectedProject.gallery.length > 1 && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                        {selectedProject.gallery.map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${i === currentGalleryIndex ? 'bg-brand-gold' : 'bg-white/50 border border-white/50'}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <img
                    src={selectedProject.img + '&fm=webp'}
                    alt={selectedProject.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover absolute inset-0"
                  />
                )}
                <div className="absolute top-4 left-4 z-20 text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white text-brand-navy shadow-sm pointer-events-none">
                  {selectedProject.status}
                </div>
              </div>

              <div className="md:w-1/2 p-8 md:p-12 max-h-[80vh] overflow-y-auto">
                <div className="flex flex-col mb-6">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">
                    <MapPin size={12} className="text-brand-gold" />
                    <span>{selectedProject.location}</span>
                  </div>
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">{selectedProject.type}</span>
                </div>

                <h3 className="text-3xl font-serif text-brand-navy mb-6">{selectedProject.title}</h3>

                <div className="prose prose-sm text-gray-600 mb-8 leading-relaxed">
                  <p>{selectedProject.fullDescription || selectedProject.description}</p>
                </div>

                <Link href="/registration" onClick={closeModal} className="flex items-center justify-center gap-2 w-full py-4 bg-brand-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-navy transition-colors">
                  <ArrowRight size={16} />
                  Get Notified First
                </Link>

                <div className="mt-8 pt-8 border-t border-gray-100 mt-auto">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest flex items-center gap-2">
                       <Share2 size={12} /> Share Project
                    </span>
                    <div className="flex items-center gap-3">
                      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#1877F2] hover:text-white transition-colors" aria-label="Share on Facebook">
                        <Facebook size={14} />
                      </a>
                      <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(`Check out ${selectedProject.title} by SVI Infra Solutions!`)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#1DA1F2] hover:text-white transition-colors" aria-label="Share on Twitter">
                        <Twitter size={14} />
                      </a>
                      <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(selectedProject.title)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#0A66C2] hover:text-white transition-colors" aria-label="Share on LinkedIn">
                        <Linkedin size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
