import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { localizedUrl } from '@/src/lib/seo';
import { AREAS_DATA } from '@/src/data/areas';
import { BreadcrumbSchema, PlaceAndAreaSchema } from '@/src/components/common/Schema';
import SiteVisitPill from '@/src/components/common/SiteVisitPill';
import {
  AreaHeroBanner,
  AreaGatewayCallout,
  AreaOverviewSection,
  AreaHighlightsGrid,
  AreaProjectsSection,
  AreaSidebarCard,
  COMMERCIAL_HUBS,
  buildAreaMetadata,
  getAreaBreadcrumbs,
  getAreaPlaceSchemaProps,
} from '@/src/components/areas/detail';

type Props = { params: Promise<{ locale: string; slug: string }> };

export const revalidate = 86400;

export async function generateStaticParams() {
  return ['en', 'hi'].flatMap((locale) =>
    Object.keys(AREAS_DATA).map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return buildAreaMetadata(slug, locale);
}

export default async function AreaDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';
  const area = AREAS_DATA[slug];

  if (slug === 'tonk-road-jaipur') {
    redirect(isHindi ? '/hi/areas/nayla-jaipur' : '/areas/nayla-jaipur');
  }
  if (!area) notFound();

  const commercialHub = COMMERCIAL_HUBS[slug];
  const url = localizedUrl(`/areas/${slug}`, locale);

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 pb-20 dark:bg-gray-900">
      <BreadcrumbSchema items={getAreaBreadcrumbs(area.name, slug, isHindi)} />
      <PlaceAndAreaSchema {...getAreaPlaceSchemaProps(area, url)} />

      <AreaHeroBanner area={area} isHindi={isHindi} />

      <div className="container mx-auto px-4 py-12">
        <AreaGatewayCallout commercialHub={commercialHub} isHindi={isHindi} />

        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="w-full lg:w-2/3">
            <AreaOverviewSection content={area.content} isHindi={isHindi} />
            <AreaHighlightsGrid highlights={area.highlights} isHindi={isHindi} />
            <AreaProjectsSection
              areaName={area.name}
              projectIds={area.projects}
              isHindi={isHindi}
            />
          </div>

          <AreaSidebarCard areaName={area.name} commercialHub={commercialHub} isHindi={isHindi} />
        </div>
      </div>

      <SiteVisitPill areaName={area.name} defaultPickup="Jaipur City / Railway Station / Airport" />
    </div>
  );
}
