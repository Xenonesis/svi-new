'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AnimatedSection, {
  StaggerContainer,
  StaggerItem,
} from '@/src/components/common/AnimatedSection';

const PROJECTS = [
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
  {
    title: 'Shree Shyam Residency',
    loc: 'Jaipur',
    type: '3BHK/4BHK',
    img: '/images/hero1.png',
  },
];

export default function ProjectsSection() {
  return (
    <section
      className="bg-white py-16 md:py-24 dark:bg-gray-900"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' }}
      role="region"
      aria-label="Featured projects portfolio"
    >
      <div className="container mx-auto px-4">
        <div className="mb-16 flex items-end justify-between border-b border-gray-200 pb-8 dark:border-gray-700">
          <AnimatedSection type="fadeLeft">
            <h4 className="mb-4 text-[10px] font-semibold tracking-[0.2em] text-gray-400 uppercase dark:text-gray-500">
              Portfolio
            </h4>
            <h2 className="text-brand-navy font-serif text-3xl md:text-5xl dark:text-gray-100">
              Featured Projects
            </h2>
          </AnimatedSection>
          <AnimatedSection type="fadeRight">
            <Link
              href="/projects/completed"
              className="text-brand-navy group hidden items-center gap-2 text-[11px] font-semibold tracking-wider uppercase md:inline-flex dark:text-gray-200"
            >
              <span className="group-hover:text-brand-gold transition-colors">View Portfolio</span>
              <ArrowRight
                size={14}
                className="text-brand-gold transition-transform group-hover:translate-x-1"
              />
            </Link>
          </AnimatedSection>
        </div>

        <StaggerContainer className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {PROJECTS.map((project, idx) => (
            <StaggerItem key={idx}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group block overflow-hidden border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="bg-brand-navy img-zoom-container relative h-72 overflow-hidden">
                  <div className="from-brand-navy/60 absolute inset-0 z-10 bg-gradient-to-t via-transparent to-transparent transition-opacity group-hover:opacity-70" />
                  <Image
                    src={project.img}
                    alt={`${project.title} - ${project.type} in ${project.loc} by SVI Infra Solutions`}
                    fill
                    quality={85}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                  />
                  <div className="text-brand-navy absolute top-4 right-4 z-20 bg-white px-3 py-1 text-[10px] font-semibold tracking-wider uppercase shadow-sm">
                    Completed
                  </div>
                </div>
                <div className="bg-gray-50 p-8 transition-colors dark:bg-gray-800">
                  <p className="mb-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                    {project.loc} · <span className="text-brand-gold">{project.type}</span>
                  </p>
                  <h3 className="text-brand-navy group-hover:text-brand-gold mb-4 font-serif text-2xl transition-colors duration-200 dark:text-gray-100">
                    {project.title}
                  </h3>
                  <Link
                    href="/projects/completed"
                    className="text-brand-navy group-hover:text-brand-gold inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase transition-colors dark:text-gray-200"
                  >
                    Explore Details
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="mt-12 border-t border-gray-200 pt-6 text-center md:hidden dark:border-gray-700">
          <Link
            href="/projects/completed"
            className="text-brand-navy group inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase dark:text-gray-200"
          >
            <span className="group-hover:text-brand-gold transition-colors">View All Projects</span>
            <ArrowRight
              size={14}
              className="text-brand-gold transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
