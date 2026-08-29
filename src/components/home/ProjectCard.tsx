'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StaggerItem } from '@/src/components/ui/AnimatedSection';

interface ProjectCardProps {
  title: string;
  location: string;
  type: string;
  img: string;
  completedLabel: string;
  exploreLabel: string;
}

export default function ProjectCard({
  title,
  location,
  type,
  img,
  completedLabel,
  exploreLabel,
}: ProjectCardProps) {
  return (
    <StaggerItem>
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="group block touch-manipulation overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="bg-brand-navy img-zoom-container relative h-52 overflow-hidden sm:h-64 md:h-72">
          <div className="from-brand-navy/60 absolute inset-0 z-10 bg-gradient-to-t via-transparent to-transparent transition-opacity group-hover:opacity-70" />
          <Image
            src={img}
            alt={`${title} - ${type} in ${location} by SVI Infra Solutions`}
            fill
            quality={85}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
          <div className="text-brand-navy absolute top-4 right-4 z-20 bg-white px-3 py-1 text-[10px] font-semibold tracking-wider uppercase shadow-sm">
            {completedLabel}
          </div>
        </div>
        <div className="bg-gray-50 p-5 transition-colors sm:p-8 dark:bg-gray-800">
          <p className="mb-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            {location} · <span className="text-brand-gold font-bold">{type}</span>
          </p>
          <h3 className="text-brand-navy group-hover:text-brand-gold mb-4 font-serif text-2xl transition-colors duration-200 dark:text-gray-100">
            {title}
          </h3>
          <Link
            href="/projects/completed"
            className="text-brand-navy group-hover:text-brand-gold touch-target inline-flex items-center gap-2 py-1 text-xs font-semibold tracking-wider uppercase transition-colors dark:text-gray-200"
          >
            {exploreLabel}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </StaggerItem>
  );
}
