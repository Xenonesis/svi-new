'use client';

import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useRef, useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import StatsCounter from '@/src/components/common/StatsCounter';
import AnimatedSection, {
  StaggerContainer,
  StaggerItem,
} from '@/src/components/common/AnimatedSection';

const GRADIENT_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
  backgroundSize: '40px 40px',
};

const COMPLETED_PROJECTS = [
  {
    title: 'Shyam Aangan',
    loc: 'Basri Khurd, Jaipur',
    type: 'Integrated Township',
    img: '/images/project1.png',
  },
  {
    title: 'Shivani Vatika',
    loc: 'Manpura Machedi',
    type: 'Premier Residential',
    img: '/images/project2.png',
  },
  { title: 'Shree Shyam Residency', loc: 'Jaipur', type: '3BHK/4BHK', img: '/images/hero1.png' },
];

const HERO_IMAGES = [
  {
    src: '/images/hero1.png',
    alt: 'SVI Infra luxury residential property in Jaipur with modern architecture',
  },
  {
    src: '/images/hero2.png',
    alt: 'Premium commercial real estate development in Noida by SVI Infra',
  },
  { src: '/images/hero3.png', alt: 'Elegant apartment complex in Phulera Smart City Rajasthan' },
];

const HOME_FEATURES = [
  {
    icon: <Building2 size={32} />,
    title: 'Expert Agents',
    desc: 'Our experienced professionals guide you through every step of property selection and acquisition.',
  },
  {
    icon: <Shield size={32} />,
    title: 'Trusted Service',
    desc: '20+ years of core management expertise ensuring complete transparency and peace of mind.',
  },
  {
    icon: <TrendingUp size={32} />,
    title: 'Market Expertise',
    desc: 'Deep insights into high-growth corridors like DMIC ensuring the best ROI for investors.',
  },
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
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [_isPending, startTransition] = useTransition();
  const magnetic = useMagnetic(0.35);

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

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
    <div className="page-transition flex w-full flex-col overflow-x-hidden">
      <section
        ref={heroRef}
        className="relative flex min-h-[80vh] items-center justify-center overflow-hidden py-20 md:min-h-[900px] lg:py-32"
        role="region"
        aria-label="Hero section"
      >
        <motion.div
          className="bg-brand-navy absolute inset-0 z-0"
          style={{ y: backgroundY, scale: heroScale }}
        >
          {HERO_IMAGES.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentHeroIndex ? 'z-0 opacity-100' : '-z-10 opacity-0'
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority={idx === 0}
                quality={85}
                className="object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/50 to-black/80" />
          <div
            className="pointer-events-none absolute top-0 left-0 z-20 h-full w-full opacity-20"
            style={GRADIENT_STYLE}
          />
        </motion.div>

        <motion.button
          onClick={prevHeroSlide}
          whileHover={{ scale: 1.15, backgroundColor: 'rgba(201,168,76,0.2)' }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-1/2 left-4 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors md:left-8"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </motion.button>
        <motion.button
          onClick={nextHeroSlide}
          whileHover={{ scale: 1.15, backgroundColor: 'rgba(201,168,76,0.2)' }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-1/2 right-4 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors md:right-8"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </motion.button>

        <div
          className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-3"
          role="tablist"
          aria-label="Hero slide navigation"
        >
          {HERO_IMAGES.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentHeroIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              aria-selected={idx === currentHeroIndex}
              role="tab"
              animate={{
                width: idx === currentHeroIndex ? 28 : 10,
                backgroundColor: idx === currentHeroIndex ? '#c9a84c' : 'rgba(255,255,255,0.5)',
              }}
              transition={{ duration: 0.3 }}
              className="h-2.5 rounded-full"
            />
          ))}
        </div>

        <motion.div
          className="z-30 container mx-auto flex flex-col items-center px-14 text-center drop-shadow-2xl sm:px-8 md:px-4"
          style={{ opacity: heroOpacity }}
        >
          <span className="bg-brand-gold/20 text-brand-gold border-brand-gold/30 animate-hero-1 mb-6 inline-block rounded-sm border px-4 py-1.5 text-[10px] font-bold tracking-[0.3em] uppercase backdrop-blur-sm">
            Legacy of Excellence
          </span>

          <h1 className="animate-hero-2 mb-8 font-serif text-4xl leading-[1.1] text-white sm:text-5xl md:text-7xl">
            Where Dreams Take
            <br />
            <span
              className="text-gradient-gold animate-bg-pan inline-block italic"
              style={{
                backgroundSize: '200% 200%',
                backgroundImage:
                  'linear-gradient(135deg, #c9a84c, #f0d080, #b08f36, #dec070, #c9a84c)',
              }}
            >
              Address
            </span>
          </h1>

          <p className="animate-hero-3 mb-10 max-w-2xl px-2 text-center text-sm leading-relaxed text-white/90 md:text-xl">
            Specializing in premium residential flats and strategic plot investments across Jaipur
            and Noida.
          </p>

          <div className="animate-hero-4 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <motion.div ref={magnetic.ref} style={{ x: magnetic.x, y: magnetic.y }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/projects/current"
                  className="shimmer bg-brand-gold text-brand-navy glow-gold inline-block px-8 py-4 text-xs font-bold tracking-widest uppercase shadow-xl transition-shadow"
                >
                  View Our Projects
                </Link>
              </motion.div>
            </motion.div>

            <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Link href="/registration" className="group flex items-center gap-3 text-white">
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30"
                  whileHover={{ borderColor: '#c9a84c', rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-lg">→</span>
                </motion.div>
                <span className="hover-underline-gold text-[10px] font-bold tracking-widest uppercase">
                  Invest with us
                </span>
              </Link>
            </motion.div>
          </div>

          <div className="animate-hero-5 absolute bottom-16 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
            <span className="text-[9px] tracking-[0.3em] text-white/40 uppercase">Scroll</span>
            <motion.div
              className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent"
              animate={{ scaleY: [1, 0.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      <section
        className="bg-white py-16 md:py-32 dark:bg-gray-900"
        role="region"
        aria-label="About SVI Infra Solutions"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <AnimatedSection type="fadeLeft" className="lg:w-1/2">
              <h4 className="mb-6 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
                Welcome to SVI Infra
              </h4>
              <h2 className="text-brand-navy mb-8 font-serif text-4xl leading-tight md:text-5xl dark:text-gray-100">
                Building Trust, <span className="text-gradient-gold">Delivering Excellence</span>
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                With over a decade of experience in the real estate sector, SVI Infra Solutions Pvt.
                Ltd. has established itself as a beacon of trust, quality, and innovation. Based in
                Noida, we specialize in delivering dream homes and lucrative investment
                opportunities across expanding regions.
              </p>
              <StaggerContainer className="mb-10 space-y-4">
                {HOME_CHECKLIST.map((item, i) => (
                  <StaggerItem key={i}>
                    <div className="text-brand-navy group flex items-center gap-4 font-serif text-lg dark:text-gray-200">
                      <motion.div
                        className="border-brand-gold text-brand-gold flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
                        whileHover={{
                          scale: 1.2,
                          rotate: 360,
                          backgroundColor: 'rgba(201,168,76,0.15)',
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </motion.div>
                      <span className="hover-underline-gold cursor-default">{item}</span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              <Link
                href="/about"
                className="text-brand-navy group inline-flex items-center gap-3 text-xs font-bold tracking-widest uppercase dark:text-gray-200"
              >
                <span className="hover-underline-gold group-hover:text-brand-gold pb-1 transition-colors">
                  Read Our Full Story
                </span>
                <motion.span whileHover={{ x: 6 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <ArrowRight size={16} className="text-brand-gold" />
                </motion.span>
              </Link>
            </AnimatedSection>

            <AnimatedSection type="fadeRight" className="relative lg:w-1/2">
              <motion.div
                className="border-brand-gold/20 absolute inset-0 translate-x-6 translate-y-6 border-2"
                animate={{ x: [24, 20, 24], y: [24, 28, 24] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="img-zoom-container relative shadow-2xl">
                <Image
                  src="/images/house1.png"
                  alt="Modern luxury home exterior showcasing SVI Infra architectural design quality"
                  loading="lazy"
                  width={800}
                  height={500}
                  className="h-[500px] w-full object-cover"
                  quality={85}
                />
              </div>
              <motion.div
                className="bg-brand-gold text-brand-navy absolute -bottom-6 -left-2 z-10 p-5 shadow-2xl sm:-left-6"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                animate={{ y: [0, -6, 0] }}
              >
                <div className="font-serif text-4xl leading-none font-bold">15+</div>
                <div className="mt-1 text-[10px] font-bold tracking-widest uppercase">
                  Years of Trust
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section
        className="bg-brand-navy border-brand-gold border-opacity-30 relative overflow-hidden border-y"
        role="region"
        aria-label="Company statistics"
      >
        <div className="pointer-events-none absolute inset-0 opacity-5" style={GRADIENT_STYLE} />
        <StatsCounter />
      </section>

      <section
        className="bg-gray-50 py-16 md:py-24 dark:bg-gray-800"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 600px' }}
        role="region"
        aria-label="Why invest with us"
      >
        <div className="container mx-auto px-4">
          <AnimatedSection type="fadeUp" className="mx-auto mb-20 max-w-3xl text-center">
            <h4 className="mb-6 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
              Why Invest With Us
            </h4>
            <h2 className="text-brand-navy mb-8 font-serif text-3xl md:text-5xl dark:text-gray-100">
              Excellence in Every Step
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              We focus on prime locations with high appreciation potential, notably the Phulera
              Smart City, Jaipur, and DMIC/DFC corridors. Backed by government approvals and strong
              partnerships.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {HOME_FEATURES.map((feature, idx) => (
              <StaggerItem key={idx}>
                <motion.div
                  whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="hover:border-brand-gold group relative h-full overflow-hidden border border-gray-200 bg-white p-8 transition-colors md:p-12 dark:border-gray-700 dark:bg-gray-900"
                >
                  <motion.div
                    className="bg-brand-gold/5 absolute right-0 bottom-0 h-24 w-24 rounded-tl-full"
                    whileHover={{ scale: 3, opacity: 0.15 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className="border-brand-gold text-brand-gold mb-8 flex h-16 w-16 shrink-0 items-center justify-center border bg-gray-50 dark:bg-gray-800"
                    whileHover={{
                      rotate: 15,
                      scale: 1.1,
                      borderColor: '#c9a84c',
                      backgroundColor: 'rgba(201,168,76,0.1)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-200">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section
        className="bg-white py-16 md:py-24 dark:bg-gray-900"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' }}
        role="region"
        aria-label="Featured projects portfolio"
      >
        <div className="container mx-auto px-4">
          <div className="mb-16 flex items-end justify-between border-b border-gray-200 pb-8 dark:border-gray-700">
            <AnimatedSection type="fadeLeft">
              <h4 className="mb-6 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
                Portfolio
              </h4>
              <h2 className="text-brand-navy font-serif text-3xl md:text-5xl dark:text-gray-100">
                Featured Projects
              </h2>
            </AnimatedSection>
            <AnimatedSection type="fadeRight">
              <Link
                href="/projects/completed"
                className="text-brand-navy group hidden items-center gap-3 text-xs font-bold tracking-widest uppercase md:inline-flex dark:text-gray-200"
              >
                <span className="hover-underline-gold group-hover:text-brand-gold pb-1 transition-colors">
                  View Portfolio
                </span>
                <motion.span whileHover={{ x: 6 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <ArrowRight size={16} className="text-brand-gold" />
                </motion.span>
              </Link>
            </AnimatedSection>
          </div>

          <StaggerContainer className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {COMPLETED_PROJECTS.map((project, idx) => (
              <StaggerItem key={idx}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="group block overflow-hidden border border-gray-200 bg-white transition-shadow duration-500 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="bg-brand-navy img-zoom-container relative h-72 overflow-hidden">
                    <div className="from-brand-navy/60 absolute inset-0 z-10 bg-gradient-to-t via-transparent to-transparent transition-opacity group-hover:opacity-70" />
                    <Image
                      src={project.img}
                      alt={`${project.title} - ${project.type} in ${project.loc} by SVI Infra Solutions`}
                      fill
                      quality={85}
                      className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                    />
                    <motion.div
                      className="text-brand-navy absolute top-4 right-4 z-20 bg-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase shadow-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      Completed
                    </motion.div>
                  </div>
                  <div className="bg-gray-50 p-8 transition-colors dark:bg-gray-800">
                    <p className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                      {project.loc} • <span className="text-brand-gold">{project.type}</span>
                    </p>
                    <h3 className="text-brand-navy group-hover:text-brand-gold mb-6 font-serif text-2xl transition-colors duration-300 dark:text-gray-100">
                      {project.title}
                    </h3>
                    <Link
                      href="/projects/completed"
                      className="text-brand-navy group-hover:text-brand-gold inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors dark:text-gray-200"
                    >
                      Explore Details{' '}
                      <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="border-brand-gold/50 flex h-6 w-4 justify-center rounded-full border-2 p-1"
                      >
                        <div className="bg-brand-gold h-1 w-1 rounded-full" />
                      </motion.div>
                    </Link>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="mt-16 border-t border-gray-200 pt-8 text-center md:hidden dark:border-gray-700">
            <Link
              href="/projects/completed"
              className="text-brand-navy group inline-flex items-center gap-3 text-xs font-bold tracking-widest uppercase dark:text-gray-200"
            >
              <span className="border-brand-navy border-b pb-1 dark:border-gray-200">
                View All Projects
              </span>
              <ArrowRight size={16} className="text-brand-gold" />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="bg-brand-navy relative overflow-hidden py-24"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
        role="region"
        aria-label="Call to action"
      >
        <div
          className="pointer-events-none absolute top-0 right-0 h-full w-full opacity-10"
          style={GRADIENT_STYLE}
        />
        <motion.div
          className="bg-brand-gold/10 absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="bg-brand-gold/10 absolute -bottom-32 -left-32 h-80 w-80 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <AnimatedSection
          type="scale"
          className="relative z-10 container mx-auto border border-white/10 px-4 py-10 text-center"
        >
          <h2 className="mb-8 font-serif text-3xl text-white md:text-5xl">
            Ready to Find Your Dream Home?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-gray-300">
            Join thousands of happy families and investors. Our experts are ready to assist you in
            finding the perfect property match.
          </p>
          <div className="flex flex-col items-center justify-center gap-8 sm:flex-row">
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/registration"
                className="shimmer bg-brand-gold text-brand-navy inline-block px-8 py-4 text-xs font-bold tracking-widest uppercase shadow-xl transition-colors hover:bg-white"
              >
                Register Now
              </Link>
            </motion.div>
            <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Link href="/contact" className="group flex items-center gap-3 text-white">
                <motion.div
                  className="relative flex h-12 w-12 items-center justify-center border border-white/30"
                  whileHover={{ borderColor: '#c9a84c' }}
                >
                  <span className="text-lg">→</span>
                  <div className="absolute top-0 left-0 h-2 w-2 -translate-x-1 -translate-y-1 border-t border-l border-white/30" />
                  <div className="absolute right-0 bottom-0 h-2 w-2 translate-x-1 translate-y-1 border-r border-b border-white/30" />
                </motion.div>
                <span className="hover-underline-gold text-[10px] font-bold tracking-widest uppercase">
                  Contact Us
                </span>
              </Link>
            </motion.div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
