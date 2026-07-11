'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AnimatedSection, { StaggerContainer } from '@/src/components/ui/AnimatedSection';
import ProjectCard from './ProjectCard';

const PROJECT_KEYS = [
  { key: 'shyamAangan', img: '/images/project1.png' },
  { key: 'shivaniVatika', img: '/images/project2.png' },
  { key: 'shreeShyamResidency', img: '/images/hero1.png' },
] as const;

export default function ProjectsSection() {
  const t = useTranslations('portfolio');
  const tp = useTranslations('pages.projects');

  return (
    <section
      className="dark:border-brand-gold/20 dark:bg-brand-dark-bg border-b border-transparent bg-white py-16 md:py-24"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' }}
      role="region"
      aria-label="Featured projects portfolio"
    >
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-4 border-b border-gray-200 pb-6 sm:mb-16 sm:pb-8 md:flex-row md:items-end md:justify-between dark:border-gray-700">
          <AnimatedSection type="fadeLeft">
            <h4 className="mb-4 text-[10px] font-semibold tracking-[0.2em] text-gray-400 uppercase dark:text-gray-500">
              {t('sectionTitle')}
            </h4>
            <h2 className="text-brand-navy font-serif text-3xl md:text-5xl dark:text-gray-100">
              {t('heading')}
            </h2>
          </AnimatedSection>
          <AnimatedSection type="fadeRight">
            <Link
              href="/projects/completed"
              className="text-brand-navy group hidden items-center gap-2 text-[11px] font-semibold tracking-wider uppercase md:inline-flex dark:text-gray-200"
            >
              <span className="group-hover:text-brand-gold transition-colors">{t('viewAll')}</span>
              <ArrowRight
                size={14}
                className="text-brand-gold transition-transform group-hover:translate-x-1"
              />
            </Link>
          </AnimatedSection>
        </div>

        <StaggerContainer className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {PROJECT_KEYS.map((project) => {
            const title = tp(`data.${project.key}.title`);
            const loc = tp(`data.${project.key}.location`);
            const type = tp(`data.${project.key}.type`);
            return (
              <ProjectCard
                key={project.key}
                title={title}
                location={loc}
                type={type}
                img={project.img}
                completedLabel={t('completed')}
                exploreLabel={t('exploreDetails')}
              />
            );
          })}
        </StaggerContainer>

        <div className="mt-12 border-t border-gray-200 pt-6 text-center md:hidden dark:border-gray-700">
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
