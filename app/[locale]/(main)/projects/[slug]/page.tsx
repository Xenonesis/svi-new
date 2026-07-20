import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { SITE_URL } from '@/src/lib/seo';
import AnalyticsTracker from '@/src/components/ui/AnalyticsTracker';
import { BreadcrumbSchema, RealEstateListingSchema } from '@/src/components/common/Schema';
import GalleryCarousel from '@/src/components/projects/GalleryCarousel';
import NewsSection from '@/src/components/projects/NewsSection';
import ExpandableDescription from '@/src/components/ui/ExpandableDescription';

import { PROJECTS_DB } from '@/src/data/projects';
import ProjectHeader from '@/src/components/projects/ProjectHeader';
import ProjectStats from '@/src/components/projects/ProjectStats';
import ProjectAmenities from '@/src/components/projects/ProjectAmenities';
import ProjectSizes from '@/src/components/projects/ProjectSizes';
import ProjectActions from '@/src/components/projects/ProjectActions';
import ProjectLocationMap from '@/src/components/projects/ProjectLocationMap';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS_DB[slug];
  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.title} - SVI Infra Solutions`,
    description: project.description,
    openGraph: {
      title: `${project.title} | SVI Infra Solutions`,
      description: project.description.slice(0, 160),
      images: [{ url: `${SITE_URL}${project.heroImage}`, width: 1200, height: 630 }],
      type: 'website',
      locale: 'en_IN',
      siteName: 'SVI Infra Solutions',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} - SVI Infra Solutions`,
      description: project.description.slice(0, 160),
      images: [`${SITE_URL}${project.heroImage}`],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const project = PROJECTS_DB[slug];

  if (!project) {
    notFound();
  }

  const isHindi = locale === 'hi';
  const title = isHindi && project.titleHi ? project.titleHi : project.title;
  const description =
    isHindi && project.descriptionHi ? project.descriptionHi : project.description;
  const location = isHindi && project.locationHi ? project.locationHi : project.location;
  const type = isHindi && project.typeHi ? project.typeHi : project.type;
  const amenities = isHindi && project.amenitiesHi ? project.amenitiesHi : project.amenities;
  const startingSize =
    isHindi && project.startingSizeHi ? project.startingSizeHi : project.startingSize;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#fdfbf7] pb-20 dark:bg-gray-900">
      <BreadcrumbSchema
        items={[
          { name: 'Home', item: '/' },
          { name: 'Projects', item: '/projects/current' },
          { name: title, item: `/projects/${slug}` },
        ]}
      />
      <RealEstateListingSchema
        name={title}
        description={description}
        image={project.heroImage}
        location={location}
        status={project.status}
      />
      <AnalyticsTracker event="project_view" data={{ slug }} />

      <div className="container mx-auto max-w-7xl px-4 pt-28 pb-8">
        <Link
          href={`/${locale}/projects/current`}
          className="text-brand-navy hover:text-brand-gold mb-8 inline-flex items-center gap-2 font-semibold transition-colors dark:text-gray-300"
        >
          <ArrowLeft size={20} />
          {isHindi ? 'प्रोजेक्ट्स पर वापस जाएँ' : 'Back to Projects'}
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Gallery */}
          <div className="w-full">
            <GalleryCarousel gallery={project.gallery} status={project.status} />
          </div>

          {/* Right Column - Details */}
          <div className="flex w-full flex-col">
            <ProjectHeader title={title} location={location} type={type} />

            <div className="mb-10">
              <ExpandableDescription text={description} />
            </div>

            <ProjectStats
              totalPlots={project.totalPlots}
              startingSize={startingSize}
              isHindi={isHindi}
            />

            <ProjectAmenities amenities={amenities} isHindi={isHindi} />

            <ProjectSizes sizes={project.availableSizes || []} isHindi={isHindi} />

            <ProjectActions
              locale={locale}
              slug={slug}
              isHindi={isHindi}
              brochureUrl={project.brochureUrl}
            />
          </div>
        </div>
      </div>

      <ProjectLocationMap mapEmbedUrl={project.mapEmbedUrl} isHindi={isHindi} />

      {/* News Section */}
      <div className="container mx-auto max-w-7xl px-4">
        <NewsSection />
      </div>
    </div>
  );
}
