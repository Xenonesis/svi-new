import { notFound } from 'next/navigation';
import { MapPin, CheckCircle, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SITE_URL, SITE_NAME, buildAlternates, localizedUrl } from '@/src/lib/seo';
import { AREAS_DATA } from '@/src/data/areas';
import { PROJECTS_DB } from '@/src/data/projects';
import { BreadcrumbSchema } from '@/src/components/common/Schema';
import { EmiCalculator } from '@/src/components/properties/EmiCalculator';
import AreaInquiryForm from '@/src/components/properties/AreaInquiryForm';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Hardcoded details of projects to display in the area page
const PROJECT_SUMMARIES: Record<
  string,
  { title: string; type: string; img: string; status: string }
> = {
  'shyam-aangan': {
    title: 'Shyam Aangan',
    type: 'Integrated Township',
    img: '/images/project1.png',
    status: 'Under Development',
  },
  'shivani-vatika': {
    title: 'Shivani Vatika',
    type: 'Premier Residential',
    img: '/images/project2.png',
    status: 'Under Development',
  },
  'shivani-residency': {
    title: 'Shivani Residency',
    type: 'Residential plots',
    img: '/images/project1.png',
    status: 'Completed',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const area = AREAS_DATA[slug];
  if (!area) return { title: 'Area Not Found' };

  const path = `/areas/${slug}`;
  const isHindi = locale === 'hi';
  const title = isHindi && area.metaTitleHi ? area.metaTitleHi : area.metaTitle;
  const description =
    isHindi && area.metaDescriptionHi ? area.metaDescriptionHi : area.metaDescription;

  return {
    title,
    description,
    alternates: buildAlternates(path, locale),
    openGraph: {
      title,
      description,
      url: localizedUrl(path, locale),
      type: 'website',
      siteName: SITE_NAME,
      locale: isHindi ? 'hi_IN' : 'en_IN',
      images: [
        {
          url: `${SITE_URL}/images/project1.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/images/project1.png`],
    },
  };
}

export default async function AreaDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const area = AREAS_DATA[slug];

  if (!area) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 pb-20 dark:bg-gray-900">
      <BreadcrumbSchema
        items={[
          { name: 'Home', item: '/' },
          { name: 'Areas', item: '/projects/current' },
          { name: area.name, item: `/areas/${slug}` },
        ]}
      />

      {/* Area Hero Section */}
      <section className="relative h-[45vh] min-h-[350px] w-full pt-20">
        <Image src="/images/project1.png" alt={area.name} fill className="object-cover" priority />
        <div className="from-brand-navy via-brand-navy/60 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
          <div className="container mx-auto">
            <div className="bg-brand-gold text-brand-navy mb-3 inline-flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-wider uppercase">
              <MapPin size={12} />
              Featured Location
            </div>
            <h1 className="mb-2 font-serif text-3xl text-white md:text-5xl">{area.title}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
              {area.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-12 lg:flex-row">
          {/* Main Area Description */}
          <div className="w-full lg:w-2/3">
            <section className="mb-12">
              <h2 className="text-brand-navy mb-6 font-serif text-2xl dark:text-white">
                Neighborhood Overview
              </h2>
              <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                {area.content}
              </p>
            </section>

            {/* Highlights */}
            <section className="mb-12">
              <h2 className="text-brand-navy mb-6 font-serif text-2xl dark:text-white">
                Key Area Highlights
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {area.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="dark:bg-gray-850 flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800"
                  >
                    <CheckCircle className="text-brand-gold mt-1 h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Associated Projects */}
            <section className="mb-12">
              <h2 className="text-brand-navy mb-6 font-serif text-2xl dark:text-white">
                Our Projects in {area.name}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {area.projects.map((projId) => {
                  const project = PROJECT_SUMMARIES[projId];
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
                          Explore Details <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-1/3">
            <div className="dark:border-gray-850 sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:bg-gray-900">
              <h3 className="text-brand-navy mb-2 font-serif text-xl dark:text-white">
                Register for {area.name}
              </h3>
              <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                Contact our local real estate experts for site visits, bookings, and layouts.
              </p>

              <AreaInquiryForm areaName={area.name} />
            </div>

            <div className="mt-8">
              <EmiCalculator />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
