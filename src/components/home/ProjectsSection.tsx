'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Filter, ShieldCheck, Check } from 'lucide-react';
import AnimatedSection, { StaggerContainer } from '@/src/components/ui/AnimatedSection';
import ProjectCard from './ProjectCard';

const ALL_PROJECTS = [
  {
    key: 'shyamAangan',
    img: '/images/project1.png',
    category: 'plots',
    rera: 'RAJ/P/2024/1102',
    startingPrice: '₹ 15 Lakhs*',
  },
  {
    key: 'shivaniVatika',
    img: '/images/project2.png',
    category: 'townships',
    rera: 'RAJ/P/2024/1105',
    startingPrice: '₹ 22 Lakhs*',
  },
  {
    key: 'shreeShyamResidency',
    img: '/images/hero1.png',
    category: 'commercial',
    rera: 'RAJ/P/2024/1109',
    startingPrice: '₹ 35 Lakhs*',
  },
] as const;

export default function ProjectsSection() {
  const t = useTranslations('portfolio');
  const tp = useTranslations('pages.projects');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredProjects = ALL_PROJECTS.filter(
    (p) => activeCategory === 'all' || p.category === activeCategory
  );

  return (
    <section
      className="dark:border-brand-gold/20 dark:bg-brand-dark-bg border-b border-transparent bg-white py-16 md:py-24"
      role="region"
      aria-label="Featured projects portfolio"
    >
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-6 border-b border-gray-200 pb-6 sm:mb-12 sm:pb-8 md:flex-row md:items-end md:justify-between dark:border-gray-700">
          <AnimatedSection type="fadeLeft">
            <h4 className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-gray-400 uppercase dark:text-gray-500">
              {t('sectionTitle')}
            </h4>
            <h2 className="text-brand-navy font-serif text-3xl font-bold md:text-5xl dark:text-gray-100">
              {t('heading')}
            </h2>
          </AnimatedSection>

          {/* Interactive Category Filter Tabs */}
          <AnimatedSection type="fadeRight">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Projects' },
                { id: 'plots', label: 'JDA Approved Plots' },
                { id: 'townships', label: 'Gated Townships' },
                { id: 'commercial', label: 'Commercial Hubs' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                    activeCategory === tab.id
                      ? 'bg-brand-gold border-brand-gold text-brand-navy scale-105 shadow-md'
                      : 'hover:border-brand-gold/50 border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </AnimatedSection>
        </div>

        <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {filteredProjects.map((project) => {
            const title = tp(`data.${project.key}.title`);
            const loc = tp(`data.${project.key}.location`);
            const type = tp(`data.${project.key}.type`);
            return (
              <div key={project.key} className="relative">
                <ProjectCard
                  title={title}
                  location={loc}
                  type={type}
                  img={project.img}
                  completedLabel={t('completed')}
                  exploreLabel={t('exploreDetails')}
                />
                <div className="bg-brand-navy/90 text-brand-gold border-brand-gold/30 absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold backdrop-blur-md">
                  <ShieldCheck size={12} />
                  <span>RERA: {project.rera}</span>
                </div>
              </div>
            );
          })}
        </StaggerContainer>

        <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Check size={14} className="text-emerald-500" />
            <span>100% JDA Patta & Clear Marketable Title Deeds</span>
          </div>
          <Link
            href="/projects/completed"
            className="text-brand-navy group inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase dark:text-gray-200"
          >
            <span className="group-hover:text-brand-gold transition-colors">{t('viewAll')}</span>
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
