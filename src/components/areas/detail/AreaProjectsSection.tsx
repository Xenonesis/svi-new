import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import { PROJECTS_DB } from '@/src/data/projects';
import { PROJECT_SUMMARIES, type ProjectSummaryItem } from './areaDetailData';

export interface AreaProjectsSectionProps {
  areaName: string;
  projectIds: string[];
  isHindi?: boolean;
  title?: string;
  projectSummaries?: Record<string, ProjectSummaryItem>;
}

export function AreaProjectsSection({
  areaName,
  projectIds,
  isHindi = false,
  title,
  projectSummaries = PROJECT_SUMMARIES,
}: AreaProjectsSectionProps) {
  const heading =
    title || (isHindi ? `${areaName} में हमारी परियोजनाएं` : `Our Projects in ${areaName}`);
  const exploreDetailsText = isHindi ? 'विवरण देखें' : 'Explore Details';

  return (
    <section className="mb-12">
      <h2 className="text-brand-navy mb-6 font-serif text-2xl dark:text-white">{heading}</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {projectIds.map((projId) => {
          const project = projectSummaries[projId];
          if (!project) return null;
          return (
            <div
              key={projId}
              className="group overflow-hidden border border-gray-200 bg-white shadow-md dark:border-gray-800 dark:bg-gray-800"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                <Image
                  src={project.img}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="text-brand-navy absolute top-3 right-3 z-10 bg-white px-2 py-0.5 text-[10px] font-bold uppercase shadow-sm dark:bg-gray-800 dark:text-gray-100">
                  {project.status}
                </div>
              </div>
              <div className="p-5">
                <span className="text-brand-gold text-[10px] font-bold tracking-wider uppercase">
                  {project.type}
                </span>
                <h3 className="text-brand-navy mt-1 mb-3 font-serif text-lg dark:text-white">
                  {project.title}
                </h3>
                <Link
                  href={PROJECTS_DB[projId] ? `/projects/${projId}` : '/projects/current'}
                  className="text-brand-navy hover:text-brand-gold inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase dark:text-gray-200"
                >
                  <span>{exploreDetailsText}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AreaProjectsSection;
