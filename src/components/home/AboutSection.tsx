'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import AnimatedSection, {
  StaggerContainer,
  StaggerItem,
} from '@/src/components/common/AnimatedSection';

const CHECKLIST = [
  '15+ Years of Industry Experience',
  '15 Successfully Completed Projects',
  'Favorable Locations like Phulera Smart City & Jaipur',
];

export default function AboutSection() {
  return (
    <section
      className="bg-white py-16 md:py-32 dark:bg-gray-900"
      role="region"
      aria-label="About SVI Infra Solutions"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <AnimatedSection type="fadeLeft" className="w-full lg:w-1/2">
            <h4 className="mb-4 text-[10px] font-semibold tracking-[0.2em] text-gray-400 uppercase dark:text-gray-500">
              Welcome to SVI Infra
            </h4>
            <h2 className="text-brand-navy mb-8 font-serif text-4xl leading-tight md:text-5xl dark:text-gray-100">
              Building Trust, <span className="text-gradient-gold">Delivering Excellence</span>
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              With over a decade of experience in the real estate sector, SVI Infra Solutions Pvt.
              Ltd. has established itself as a beacon of trust, quality, and innovation. Based in
              Noida, we specialize in delivering dream homes and lucrative investment opportunities
              across expanding regions.
            </p>
            <StaggerContainer className="mb-10 space-y-4">
              {CHECKLIST.map((item, i) => (
                <StaggerItem key={i}>
                  <div className="text-brand-navy group flex items-center gap-3 font-serif text-lg dark:text-gray-200">
                    <CheckCircle className="text-brand-gold h-4 w-4 shrink-0" />
                    <span>{item}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <Link
              href="/about"
              className="text-brand-navy group inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase dark:text-gray-200"
            >
              <span className="group-hover:text-brand-gold transition-colors">
                Read Our Full Story
              </span>
              <ArrowRight
                size={14}
                className="text-brand-gold transition-transform group-hover:translate-x-1"
              />
            </Link>
          </AnimatedSection>

          <AnimatedSection type="fadeRight" className="relative w-full lg:w-1/2">
            <div className="border-brand-gold/15 absolute inset-0 translate-x-5 translate-y-5 border" />
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
              className="bg-brand-gold text-brand-navy absolute -bottom-5 -left-2 z-10 p-5 shadow-xl sm:-left-5"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="font-serif text-4xl leading-none font-bold">15+</div>
              <div className="mt-1 text-[10px] font-semibold tracking-wider uppercase">
                Years of Trust
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
