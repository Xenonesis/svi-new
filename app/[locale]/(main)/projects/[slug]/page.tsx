import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, CheckCircle, Info } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { SITE_URL } from '@/src/lib/seo';
import AnalyticsTracker from '@/src/components/ui/AnalyticsTracker';
import { EmiCalculator } from '@/src/components/properties/EmiCalculator';
import { BreadcrumbSchema, RealEstateListingSchema } from '@/src/components/common/Schema';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Mock data (in a real app, fetch from Supabase)
const PROJECTS_DB: Record<string, any> = {
  'shyam-aangan': {
    title: 'Shyam Aangan',
    location: 'Basri Khurd, Jaipur',
    status: 'Ready to Move',
    type: 'Integrated Township',
    heroImage: '/images/project1.png',
    gallery: ['/images/project1.png', '/images/hero1.png'],
    amenities: [
      'Clubhouse',
      'Swimming Pool',
      '24/7 Security',
      'Parks & Gardens',
      'Temple',
      'Commercial Center',
    ],
    description:
      'Shyam Aangan offers a premium integrated township experience in the heart of Jaipur. Designed for modern families, it features world-class amenities and 100% Vastu compliant plots.',
  },
  'shivani-vatika': {
    title: 'Shivani Vatika',
    location: 'Manpura Machedi',
    status: 'Under Construction',
    type: 'Premier Residential',
    heroImage: '/images/project2.png',
    gallery: ['/images/project2.png', '/images/hero2.png'],
    amenities: ['Gated Community', 'Kids Play Area', 'Gymnasium', 'Rainwater Harvesting'],
    description:
      'Shivani Vatika brings premier residential living to Manpura Machedi. Surrounded by lush greenery, it provides a serene escape from the city bustle while maintaining excellent connectivity.',
  },
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
  const t = await getTranslations({ locale, namespace: 'common' });
  const project = PROJECTS_DB[slug];

  if (!project) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 pb-20 dark:bg-gray-900">
      <BreadcrumbSchema
        items={[
          { name: 'Home', item: '/' },
          { name: 'Projects', item: '/projects/current' },
          { name: project.title, item: `/projects/${slug}` },
        ]}
      />
      <RealEstateListingSchema
        name={project.title}
        description={project.description}
        image={project.heroImage}
        location={project.location}
        status={project.status}
      />
      <AnalyticsTracker event="project_view" data={{ slug }} />

      {/* Project Hero */}
      <section className="relative h-[60vh] min-h-[500px] w-full pt-20">
        <Image src={project.heroImage} alt={project.title} fill className="object-cover" priority />
        <div className="from-brand-navy via-brand-navy/60 absolute inset-0 bg-gradient-to-t to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="container mx-auto">
            <div className="bg-brand-gold text-brand-navy mb-4 inline-flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-wider uppercase">
              <Info size={14} />
              {project.status}
            </div>
            <h1 className="mb-4 font-serif text-4xl text-white md:text-6xl">{project.title}</h1>
            <div className="flex items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-brand-gold" />
                <span className="text-lg">{project.location}</span>
              </div>
              <div className="h-6 w-px bg-white/30" />
              <div className="text-lg">{project.type}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Layout */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col gap-12 lg:flex-row">
          {/* Main Content */}
          <div className="w-full lg:w-2/3">
            <section className="mb-16">
              <h2 className="text-brand-navy mb-6 font-serif text-3xl dark:text-white">
                About the Project
              </h2>
              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            </section>

            <section className="mb-16">
              <h2 className="text-brand-navy mb-6 font-serif text-3xl dark:text-white">
                Amenities
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {project.amenities.map((amenity: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800"
                  >
                    <CheckCircle className="text-brand-gold h-5 w-5" />
                    <span className="font-medium text-gray-700 dark:text-gray-200">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-16">
              <h2 className="text-brand-navy mb-6 font-serif text-3xl dark:text-white">Gallery</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {project.gallery.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-video overflow-hidden rounded-lg shadow-md"
                  >
                    <Image
                      src={img}
                      alt={`${project.title} gallery ${idx + 1}`}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Inquiry */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-brand-navy mb-2 font-serif text-2xl dark:text-white">
                Interested in {project.title}?
              </h3>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                Fill out the form below and our property experts will get back to you.
              </p>

              <form className="space-y-4">
                <div>
                  <input
                    required
                    type="text"
                    placeholder="Your Name"
                    className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <input
                    required
                    type="tel"
                    placeholder="Phone Number"
                    className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light w-full rounded-md py-4 font-bold tracking-wider uppercase transition-colors"
                >
                  Request Information
                </button>
              </form>
            </div>

            {/* EMI Calculator */}
            <div className="mt-8">
              <EmiCalculator />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
