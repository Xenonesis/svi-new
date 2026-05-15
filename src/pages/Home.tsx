import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, TrendingUp, CheckCircle, ArrowRight, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import StatsCounter from '../components/common/StatsCounter';

const GRADIENT_STYLE = { backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' };

const COMPLETED_PROJECTS = [
  { title: 'Shree Shyam Residency', loc: 'Jaipur', type: '3BHK/4BHK' },
  { title: 'Shivani City', loc: 'Manpura Machedi', type: 'Premier Residential' },
  { title: 'Shyam Aangan', loc: 'Basri Khurd, Jaipur', type: 'Integrated Township' },
];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1600607687931-cecebd802404?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
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

const FAQ_DATA = [
  {
    question: "What makes SVI Infra Solutions different from other real estate developers?",
    answer: "SVI Infra focuses on strategic locations, government-approved projects, and timely delivery. We ensure clear titles, transparent documentation, and a customer-centric approach that prioritizes long-term appreciation for our investors."
  },
  {
    question: "Are all your projects government approved?",
    answer: "Yes, all our projects undergo rigorous legal and technical due diligence and have the necessary approvals from local development authorities. We believe in 100% transparency."
  },
  {
    question: "Do you provide assistance with home loans?",
    answer: "Absolutely! We have tied up with several leading banks and financial institutions to facilitate smooth and hassle-free home loan processing for our customers."
  },
  {
    question: "Which regions do you primarily operate in?",
    answer: "We are based in Noida, but we strategically operate across expanding regions with high appreciation potential, such as the Phulera Smart City, Jaipur, and the DMIC/DFC corridors in Rajasthan."
  },
  {
    question: "How can I book a property or schedule a site visit?",
    answer: "You can easily schedule a site visit or book a property by filling out the Registration form on our website, or by contacting our sales team directly via phone or email."
  }
];

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  const toggleFaq = useCallback((index: number) => {
    setActiveFaqIndex((prev) => (prev === index ? null : index));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextHeroSlide = () => {
    setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  };

  const prevHeroSlide = () => {
    setCurrentHeroIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  };

  return (
    <div className="flex flex-col w-full">
      <section ref={heroRef} className="relative min-h-[80vh] md:min-h-[900px] flex items-center justify-center overflow-hidden py-20 lg:py-32">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: backgroundY }}
        >
          <div className="absolute inset-0 bg-brand-navy/70 z-10"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-30 z-20 pointer-events-none" style={GRADIENT_STYLE}></div>
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentHeroIndex}
              src={HERO_IMAGES[currentHeroIndex]}
              alt="Luxury Real Estate" 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="w-full h-full object-cover absolute inset-0"
            />
          </AnimatePresence>
        </motion.div>

        <button 
          onClick={prevHeroSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 transition-all hover:scale-110"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextHeroSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 transition-all hover:scale-110"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentHeroIndex ? 'bg-brand-gold scale-125' : 'bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>

        <div className="z-10 container mx-auto px-4 text-center flex flex-col items-center">
          <span className="inline-block px-3 py-1 bg-brand-gold/20 text-brand-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-6 rounded-sm">Legacy of Excellence</span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white text-5xl md:text-7xl font-serif leading-[1.1] mb-8"
          >
            Where Dreams Take<br/>
            <span className="italic text-brand-gold">Address</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-300 text-lg md:text-xl max-w-2xl text-center leading-relaxed mb-10"
          >
            Specializing in premium residential flats and strategic plot investments across Jaipur and Noida.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              to="/projects/current"
              className="bg-brand-gold text-brand-navy px-8 py-4 font-bold uppercase text-xs tracking-widest shadow-xl transition-transform hover:scale-105"
            >
              View Our Projects
            </Link>
            <Link
              to="/registration"
              className="text-white flex items-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover:border-brand-gold transition-colors">
                <span className="text-lg">→</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Invest with us</span>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">Welcome to SVI Infra</h4>
              <h2 className="text-4xl md:text-5xl font-serif text-brand-navy dark:text-gray-100 mb-8 leading-tight">
                Building Trust, Delivering Excellence
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
                With over a decade of experience in the real estate sector, SVI Infra Solutions Pvt. Ltd. has established itself as a beacon of trust, quality, and innovation. Based in Noida, we specialize in delivering dream homes and lucrative investment opportunities across expanding regions.
              </p>
              <ul className="space-y-4 mb-10">
                {HOME_CHECKLIST.map((item, i) => (
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    key={i}
                    className="flex items-center gap-4 text-brand-navy dark:text-gray-200 font-serif text-lg"
                  >
                    <div className="w-8 h-8 flex items-center justify-center border border-brand-gold rounded-full text-brand-gold shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <Link to="/about" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 group">
                <span className="border-b border-brand-navy dark:border-gray-200 pb-1 group-hover:text-brand-gold group-hover:border-brand-gold transition-colors">Read Our Full Story</span>
                <ArrowRight size={16} className="text-brand-gold group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-brand-navy/5 translate-x-6 translate-y-6"></div>
              <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80&fm=webp"
                alt="Modern House exterior"
                loading="lazy"
                decoding="async"
                className="relative z-10 shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-navy border-y border-brand-gold border-opacity-30">
        <StatsCounter />
      </section>

      <section className="py-24 bg-brand-bg dark:bg-gray-800" style={{ contentVisibility: 'auto' }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">Why Invest With Us</h4>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-navy dark:text-gray-100 mb-8">Excellence in Every Step</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              We focus on prime locations with high appreciation potential, notably the Phulera Smart City, Jaipur, and DMIC/DFC corridors. Backed by government approvals and strong partnerships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOME_FEATURES.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white dark:bg-gray-900 p-12 border border-gray-200 dark:border-gray-700 hover:border-brand-gold transition-colors group"
              >
                <div className="w-16 h-16 border border-brand-gold text-brand-gold flex items-center justify-center mb-8 shrink-0 relative bg-brand-bg/50 dark:bg-gray-800/50">
                  {feature.icon}
                  <div className="absolute inset-0 bg-brand-gold scale-0 group-hover:scale-100 transition-transform -z-10 origin-bottom-right opacity-10"></div>
                </div>
                <h3 className="text-2xl font-serif text-brand-navy dark:text-gray-200 mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-gray-900" style={{ contentVisibility: 'auto' }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-16 border-b border-gray-200 dark:border-gray-700 pb-8">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">Portfolio</h4>
              <h2 className="text-3xl md:text-5xl font-serif text-brand-navy dark:text-gray-100">Featured Projects</h2>
            </div>
            <Link to="/projects/completed" className="hidden md:inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 group">
              <span className="border-b border-brand-navy dark:border-gray-200 pb-1 group-hover:text-brand-gold transition-colors">View Portfolio</span>
              <ArrowRight size={16} className="text-brand-gold group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {COMPLETED_PROJECTS.map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
                className="group border border-gray-200 dark:border-gray-700 block overflow-hidden bg-white dark:bg-gray-800 hover:-translate-y-2 hover:shadow-2xl transition-all duration-400"
              >
                <div className="relative h-72 overflow-hidden bg-brand-navy">
                  <div className="absolute inset-0 bg-brand-navy/10 group-hover:bg-transparent transition-colors z-10"></div>
                  <img
                    src={`https://images.unsplash.com/photo-160060768${8969 + idx}-cc921dd82801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp`}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute top-4 right-4 z-20 bg-white text-brand-navy text-[10px] font-bold uppercase tracking-widest px-3 py-1 shadow-sm">
                    Completed
                  </div>
                </div>
                <div className="p-8 bg-brand-bg dark:bg-gray-800 transition-colors">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-3">{project.loc} • <span className="text-brand-gold">{project.type}</span></p>
                  <h3 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-6 group-hover:text-brand-gold transition-colors">{project.title}</h3>
                  <Link to="/projects/completed" className="text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 text-brand-navy dark:text-gray-200 group-hover:text-brand-gold transition-colors">
                    Explore Details <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center md:hidden border-t border-gray-200 dark:border-gray-700 pt-8">
            <Link to="/projects/completed" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 group">
              <span className="border-b border-brand-navy dark:border-gray-200 pb-1">View All Projects</span>
              <ArrowRight size={16} className="text-brand-gold" />
            </Link>
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 bg-brand-bg dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">Got Questions?</h4>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-navy dark:text-gray-100 mb-6">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">Find answers to common questions about our projects and services.</p>
          </div>

          <div className="space-y-4">
            {FAQ_DATA.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-serif text-xl text-brand-navy dark:text-gray-100 pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: activeFaqIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 text-brand-gold"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {activeFaqIndex === index ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 pt-2 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700/50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-gray-600 dark:text-gray-400 mb-6">Still have questions?</p>
            <Link to="/contact" className="inline-flex bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy px-8 py-4 font-bold uppercase text-xs tracking-widest transition-colors hover:bg-brand-gold hover:text-brand-navy border border-brand-navy dark:border-brand-gold shadow-md hover:shadow-xl">
              Contact Our Team
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-brand-navy relative overflow-hidden" style={{ contentVisibility: 'auto' }}>
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={GRADIENT_STYLE}></div>

        <div className="container mx-auto px-4 text-center relative z-10 py-10 border border-white/20">
          <h2 className="text-3xl md:text-5xl font-serif text-white mb-8">Ready to Find Your Dream Home?</h2>
          <p className="text-gray-300 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of happy families and investors. Our experts are ready to assist you in finding the perfect property match.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link
              to="/registration"
              className="bg-brand-gold text-brand-navy px-8 py-4 font-bold uppercase text-xs tracking-widest shadow-xl transition-colors hover:bg-white"
            >
              Register Now
            </Link>
            <Link
              to="/contact"
              className="text-white flex items-center gap-3 group"
            >
              <div className="w-12 h-12 border border-white/30 flex items-center justify-center group-hover:border-brand-gold transition-colors relative">
                <span className="text-lg">→</span>
                <div className="absolute top-0 left-0 w-2 h-2 box-border border-t border-l border-white/30 -translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 box-border border-b border-r border-white/30 translate-x-1 translate-y-1"></div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Contact Us</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
