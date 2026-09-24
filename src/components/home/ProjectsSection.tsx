'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Check, FileDown, Sparkles } from 'lucide-react';
import AnimatedSection, { StaggerContainer } from '@/src/components/ui/AnimatedSection';
import WhatsAppBrochureModal from '@/src/components/common/WhatsAppBrochureModal';
import ProjectCard from './ProjectCard';
import ProjectFilterTabs from './ProjectFilterTabs';

const ALL_PROJECTS = [
  {
    key: 'shyamAangan',
    img: '/images/project1.png',
    category: 'plots',
    startingPrice: '₹ 15 Lakhs*',
  },
  {
    key: 'shivaniVatika',
    img: '/Shivani Vatika/shivani vatika6 frontgate.webp',
    category: 'townships',
    startingPrice: '₹ 22 Lakhs*',
  },
  {
    key: 'shreeShyamResidency',
    img: '/images/hero1.png',
    category: 'commercial',
    startingPrice: '₹ 35 Lakhs*',
  },
] as const;

export default function ProjectsSection() {
  const t = useTranslations('portfolio');
  const tp = useTranslations('pages.projects');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [brochureModalOpen, setBrochureModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState('Shivani Vatika-11th');

  const handleOpenBrochure = (projectName: string) => {
    setSelectedProject(projectName);
    setBrochureModalOpen(true);
  };
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

          <ProjectFilterTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
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
                  <span>Verified Project</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenBrochure(title)}
                  className="absolute right-4 bottom-4 z-20 flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-slate-950/85 px-3 py-1.5 text-[11px] font-bold text-amber-400 shadow-md backdrop-blur-md transition-all hover:border-amber-400 hover:bg-amber-500 hover:text-slate-950 md:right-6 md:bottom-6"
                >
                  <FileDown size={13} />
                  <span>Get Brochure</span>
                </button>
              </div>
            );
          })}
        </StaggerContainer>

        <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Check size={14} className="text-emerald-500" />
            <span>100% Verified Plots & Clear Registry Documentation</span>
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

        {/* High-Intent Real Estate Lead Hook Banner */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 p-5 sm:flex-row sm:p-6 dark:from-amber-500/15 dark:via-slate-950 dark:to-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                Want the latest layout map & verified price list?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Download the official PDF & receive instantaneous WhatsApp payment breakdown
                directly from SVI sales team.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenBrochure('Shivani Vatika-11th')}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all hover:bg-amber-400"
          >
            <FileDown size={15} />
            <span>Instant WhatsApp Brochure</span>
          </button>
        </div>
      </div>

      <WhatsAppBrochureModal
        isOpen={brochureModalOpen}
        onClose={() => setBrochureModalOpen(false)}
        projectName={selectedProject}
      />
    </section>
  );
}
