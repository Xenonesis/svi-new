"use client";

import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'motion/react';
import { useRef, useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { Building2, Shield, TrendingUp, CheckCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import StatsCounter from '@/src/components/common/StatsCounter';
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/src/components/common/AnimatedSection';

const GRADIENT_STYLE = { backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' };

const COMPLETED_PROJECTS = [
  { title: 'Shree Shyam Residency', loc: 'Jaipur', type: '3BHK/4BHK' },
  { title: 'Shivani City', loc: 'Manpura Machedi', type: 'Premier Residential' },
  { title: 'Shyam Aangan', loc: 'Basri Khurd, Jaipur', type: 'Integrated Township' },
];

const HERO_IMAGES = [
  { src: "/images/hero1.png", alt: "SVI Infra luxury residential property in Jaipur with modern architecture" },
  { src: "/images/hero2.png", alt: "Premium commercial real estate development in Noida by SVI Infra" },
  { src: "/images/hero3.png", alt: "Elegant apartment complex in Phulera Smart City Rajasthan" }
];

const HOME_FEATURES = [
  { icon: <Building2 size={32} />, title: "Expert Agents", desc: "Our experienced professionals guide you through every step of property selection and acquisition." },
  { icon: <Shield size={32} />, title: "Trusted Service", desc: "20+ years of core management expertise ensuring complete transparency and peace of mind." },
  { icon: <TrendingUp size={32} />, title: "Market Expertise", desc: "Deep insights into high-growth corridors like DMIC ensuring the best ROI for investors." }
];

const HOME_CHECKLIST = [
  '15+ Years of Industry Experience',
  '15 Successfully Completed Projects',
  'Favorable Locations like Phulera Smart City & Jaipur',
];

function useMagnetic(strength = 0.4) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 20 });
  const y = useSpring(0, { stiffness: 200, damping: 20 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * strength);
      y.set((e.clientY - cy) * strength);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [x, y, strength]);

  return { ref, x, y };
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPending, startTransition] = useTransition();
  const magnetic = useMagnetic(0.35);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const nextHeroSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  }, []);

  const prevHeroSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentHeroIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || prefersReducedMotion) return;
    const timer = setInterval(() => {
      startTransition(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, prefersReducedMotion]);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevHeroSlide();
      } else if (e.key === 'ArrowRight') {
        nextHeroSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextHeroSlide, prevHeroSlide]);

  return (
    <div className="flex flex-col w-full page-transition">
      <section ref={heroRef} className="relative min-h-[80vh] md:min-h-[900px] flex items-center justify-center overflow-hidden py-20 lg:py-32" role="region" aria-label="Hero section">
        <motion.div className="absolute inset-0 z-0" style={{ y: backgroundY, scale: heroScale }}>
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 via-brand-navy/60 to-brand-navy/80 z-10" />
          <div className="absolute top-0 left-0 w-full h-full opacity-20 z-20 pointer-events-none" style={GRADIENT_STYLE} />
          <AnimatePresence mode="wait">
            <motion.img
              key={currentHeroIndex}
              src={HERO_IMAGES[currentHeroIndex].src}
              alt={HERO_IMAGES[currentHeroIndex].alt}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full object-cover absolute inset-0"
              width={1920}
              height={1080}
            />
          </AnimatePresence>
        </motion.div>

        <motion.button
          onClick={prevHeroSlide}
          whileHover={{ scale: 1.15, backgroundColor: 'rgba(201,168,76,0.2)' }}
          whileTap={{ scale: 0.9 }}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/20 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </motion.button>
        <motion.button
          onClick={nextHeroSlide}
          whileHover={{ scale: 1.15, backgroundColor: 'rgba(201,168,76,0.2)' }}
          whileTap={{ scale: 0.9 }}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/20 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </motion.button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3" role="tablist" aria-label="Hero slide navigation">
          {HERO_IMAGES.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => { setIsAutoPlaying(false); setCurrentHeroIndex(idx); }}
              aria-label={`Go to slide ${idx + 1}`}
              aria-selected={idx === currentHeroIndex}
              role="tab"
              animate={{ width: idx === currentHeroIndex ? 28 : 10, backgroundColor: idx === currentHeroIndex ? '#c9a84c' : 'rgba(255,255,255,0.5)' }}
              transition={{ duration: 0.3 }}
              className="h-2.5 rounded-full"
            />
          ))}
        </div>

        <motion.div className="z-10 container mx-auto px-4 text-center flex flex-col items-center" style={{ opacity: heroOpacity }}>
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 bg-brand-gold/20 text-brand-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-6 rounded-sm border border-brand-gold/30 backdrop-blur-sm"
          >
            Legacy of Excellence
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-white text-5xl md:text-7xl font-serif leading-[1.1] mb-8"
          >
            Where Dreams Take<br />
            <motion.span
              className="italic text-gradient-gold"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 200%', backgroundImage: 'linear-gradient(135deg, #c9a84c, #f0d080, #b08f36, #dec070, #c9a84c)' }}
            >
              Address
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-gray-300 text-lg md:text-xl max-w-2xl text-center leading-relaxed mb-10"
          >
            Specializing in premium residential flats and strategic plot investments across Jaipur and Noida.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <motion.div ref={magnetic.ref} style={{ x: magnetic.x, y: magnetic.y }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/projects/current"
                  className="shimmer bg-brand-gold text-brand-navy px-8 py-4 font-bold uppercase text-xs tracking-widest shadow-xl inline-block glow-gold transition-shadow"
                >
                  View Our Projects
                </Link>
              </motion.div>
            </motion.div>

            <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Link href="/registration" className="text-white flex items-center gap-3 group">
                <motion.div
                  className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center"
                  whileHover={{ borderColor: '#c9a84c', rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-lg">→</span>
                </motion.div>
                <span className="text-[10px] font-bold uppercase tracking-widest hover-underline-gold">Invest with us</span>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
          >
            <span className="text-white/40 text-[9px] uppercase tracking-[0.3em]">Scroll</span>
            <motion.div
              className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"
              animate={{ scaleY: [1, 0.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      <section className="py-24 md:py-32 bg-white dark:bg-gray-900" role="region" aria-label="About SVI Infra Solutions">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <AnimatedSection type="fadeLeft" className="lg:w-1/2">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">Welcome to SVI Infra</h4>
              <h2 className="text-4xl md:text-5xl font-serif text-brand-navy dark:text-gray-100 mb-8 leading-tight">
                Building Trust,{' '}
                <span className="text-gradient-gold">Delivering Excellence</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
                With over a decade of experience in the real estate sector, SVI Infra Solutions Pvt. Ltd. has established itself as a beacon of trust, quality, and innovation. Based in Noida, we specialize in delivering dream homes and lucrative investment opportunities across expanding regions.
              </p>
              <StaggerContainer className="space-y-4 mb-10">
                {HOME_CHECKLIST.map((item, i) => (
                  <StaggerItem key={i}>
                    <div className="flex items-center gap-4 text-brand-navy dark:text-gray-200 font-serif text-lg group">
                      <motion.div
                        className="w-8 h-8 flex items-center justify-center border border-brand-gold rounded-full text-brand-gold shrink-0"
                        whileHover={{ scale: 1.2, rotate: 360, backgroundColor: 'rgba(201,168,76,0.15)' }}
                        transition={{ duration: 0.4 }}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </motion.div>
                      <span className="hover-underline-gold cursor-default">{item}</span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              <Link href="/about" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 group">
                <span className="hover-underline-gold pb-1 group-hover:text-brand-gold transition-colors">Read Our Full Story</span>
                <motion.span whileHover={{ x: 6 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <ArrowRight size={16} className="text-brand-gold" />
                </motion.span>
              </Link>
            </AnimatedSection>

            <AnimatedSection type="fadeRight" className="lg:w-1/2 relative">
              <motion.div
                className="absolute inset-0 border-2 border-brand-gold/20 translate-x-6 translate-y-6"
                animate={{ x: [24, 20, 24], y: [24, 28, 24] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="img-zoom-container relative z-10 shadow-2xl">
                <img
                  src="/images/house1.png"
                  alt="Modern luxury home exterior showcasing SVI Infra architectural design quality"
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={500}
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <motion.div
                className="absolute -bottom-6 -left-6 bg-brand-gold text-brand-navy p-5 shadow-2xl z-20"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                animate={{ y: [0, -6, 0] }}
              >
                <div className="text-4xl font-serif font-bold leading-none">15+</div>
                <div className="text-[10px] uppercase tracking-widest font-bold mt-1">Years of Trust</div>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="bg-brand-navy border-y border-brand-gold border-opacity-30 relative overflow-hidden" role="region" aria-label="Company statistics">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={GRADIENT_STYLE} />
        <StatsCounter />
      </section>

      <section className="py-24 bg-gray-50 dark:bg-gray-800" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 600px' }} role="region" aria-label="Why invest with us">
        <div className="container mx-auto px-4">
          <AnimatedSection type="fadeUp" className="text-center max-w-3xl mx-auto mb-20">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">Why Invest With Us</h4>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-navy dark:text-gray-100 mb-8">Excellence in Every Step</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              We focus on prime locations with high appreciation potential, notably the Phulera Smart City, Jaipur, and DMIC/DFC corridors. Backed by government approvals and strong partnerships.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOME_FEATURES.map((feature, idx) => (
              <StaggerItem key={idx}>
                <motion.div
                  whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white dark:bg-gray-900 p-12 border border-gray-200 dark:border-gray-700 hover:border-brand-gold transition-colors group h-full relative overflow-hidden"
                >
                  <motion.div
                    className="absolute bottom-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-tl-full"
                    whileHover={{ scale: 3, opacity: 0.15 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className="w-16 h-16 border border-brand-gold text-brand-gold flex items-center justify-center mb-8 shrink-0 bg-gray-50 dark:bg-gray-800"
                    whileHover={{ rotate: 15, scale: 1.1, borderColor: '#c9a84c', backgroundColor: 'rgba(201,168,76,0.1)' }}
                    transition={{ duration: 0.3 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-2xl font-serif text-brand-navy dark:text-gray-200 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-gray-900" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' }} role="region" aria-label="Featured projects portfolio">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-16 border-b border-gray-200 dark:border-gray-700 pb-8">
            <AnimatedSection type="fadeLeft">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">Portfolio</h4>
              <h2 className="text-3xl md:text-5xl font-serif text-brand-navy dark:text-gray-100">Featured Projects</h2>
            </AnimatedSection>
            <AnimatedSection type="fadeRight">
              <Link href="/projects/completed" className="hidden md:inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 group">
                <span className="hover-underline-gold pb-1 group-hover:text-brand-gold transition-colors">View Portfolio</span>
                <motion.span whileHover={{ x: 6 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <ArrowRight size={16} className="text-brand-gold" />
                </motion.span>
              </Link>
            </AnimatedSection>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {COMPLETED_PROJECTS.map((project, idx) => (
              <StaggerItem key={idx}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="group border border-gray-200 dark:border-gray-700 block overflow-hidden bg-white dark:bg-gray-800 hover:shadow-2xl transition-shadow duration-500"
                >
                  <div className="relative h-72 overflow-hidden bg-brand-navy img-zoom-container">
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent z-10 group-hover:opacity-70 transition-opacity" />
                    <img
                      src={idx === 0 ? "/images/project1.png" : idx === 1 ? "/images/project2.png" : "/images/house1.png"}
                      alt={`${project.title} - ${project.type} in ${project.loc} by SVI Infra Solutions`}
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={400}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <motion.div
                      className="absolute top-4 right-4 z-20 bg-white text-brand-navy text-[10px] font-bold uppercase tracking-widest px-3 py-1 shadow-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      Completed
                    </motion.div>
                  </div>
                  <div className="p-8 bg-gray-50 dark:bg-gray-800 transition-colors">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-3">
                      {project.loc} • <span className="text-brand-gold">{project.type}</span>
                    </p>
                    <h3 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-6 group-hover:text-brand-gold transition-colors duration-300">
                      {project.title}
                    </h3>
                    <Link href="/projects/completed" className="text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 text-brand-navy dark:text-gray-200 group-hover:text-brand-gold transition-colors">
                      Explore Details{' '}
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight size={14} />
                      </motion.span>
                    </Link>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="mt-16 text-center md:hidden border-t border-gray-200 dark:border-gray-700 pt-8">
            <Link href="/projects/completed" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 group">
              <span className="border-b border-brand-navy dark:border-gray-200 pb-1">View All Projects</span>
              <ArrowRight size={16} className="text-brand-gold" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-brand-navy relative overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }} role="region" aria-label="Call to action">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={GRADIENT_STYLE} />
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <AnimatedSection type="scale" className="container mx-auto px-4 text-center relative z-10 py-10 border border-white/10">
          <h2 className="text-3xl md:text-5xl font-serif text-white mb-8">Ready to Find Your Dream Home?</h2>
          <p className="text-gray-300 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of happy families and investors. Our experts are ready to assist you in finding the perfect property match.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/registration"
                className="shimmer bg-brand-gold text-brand-navy px-8 py-4 font-bold uppercase text-xs tracking-widest shadow-xl hover:bg-white transition-colors inline-block"
              >
                Register Now
              </Link>
            </motion.div>
            <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Link href="/contact" className="text-white flex items-center gap-3 group">
                <motion.div
                  className="w-12 h-12 border border-white/30 flex items-center justify-center relative"
                  whileHover={{ borderColor: '#c9a84c' }}
                >
                  <span className="text-lg">→</span>
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30 -translate-x-1 -translate-y-1" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30 translate-x-1 translate-y-1" />
                </motion.div>
                <span className="text-[10px] font-bold uppercase tracking-widest hover-underline-gold">Contact Us</span>
              </Link>
            </motion.div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
