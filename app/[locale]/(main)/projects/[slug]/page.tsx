import { notFound } from 'next/navigation';
import { Link } from '@/src/i18n/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, buildAlternates, localizedUrl } from '@/src/lib/seo';
import AnalyticsTracker from '@/src/components/ui/AnalyticsTracker';
import { BreadcrumbSchema, RealEstateListingSchema } from '@/src/components/common/Schema';
import { AREAS_DATA } from '@/src/data/areas';
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
  const { locale, slug } = await params;
  const project = PROJECTS_DB[slug];
  if (!project) return { title: 'Project Not Found' };

  const isHindi = locale === 'hi';
  const title = isHindi && project.titleHi ? project.titleHi : project.title;
  const description = (
    isHindi && project.descriptionHi ? project.descriptionHi : project.description
  ).slice(0, 160);
  const path = `/projects/${slug}`;

  return {
    title,
    description,
    alternates: buildAlternates(path, locale),
    openGraph: {
      title,
      description,
      url: localizedUrl(path, locale),
      images: [{ url: `${SITE_URL}${project.heroImage}`, width: 1200, height: 630 }],
      type: 'website',
      locale: isHindi ? 'hi_IN' : 'en_IN',
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
          href={`/projects/current`}
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

      {/* Area cross-link: helps crawlers discover the orphaned /areas/* pages */}
      {(() => {
        const area = Object.values(AREAS_DATA).find((a) => a.projects.includes(slug));
        if (!area) return null;
        return (
          <div className="container mx-auto max-w-7xl px-4 pt-10">
            <Link
              href={`/areas/${area.slug}`}
              className="border-brand-gold/40 bg-brand-gold/5 hover:bg-brand-gold/10 group flex items-center justify-between rounded-lg border p-6 transition-colors"
            >
              <div>
                <p className="text-brand-gold mb-1 text-[10px] font-bold tracking-[0.2em] uppercase">
                  {isHindi ? 'लोकेशन गाइड' : 'Location Guide'}
                </p>
                <p className="text-brand-navy font-serif text-xl dark:text-gray-100">
                  {area.title}
                </p>
              </div>
              <ArrowRight
                size={20}
                className="text-brand-gold shrink-0 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        );
      })()}

      <ProjectLocationMap mapEmbedUrl={project.mapEmbedUrl} isHindi={isHindi} />

      {/* News Section */}
      <div className="container mx-auto max-w-7xl px-4">
        <NewsSection />
      </div>
    </div>
  );
}
