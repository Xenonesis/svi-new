import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, CheckCircle, Info, ArrowLeft, Phone, Mail, CalendarRange } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { SITE_URL } from '@/src/lib/seo';
import AnalyticsTracker from '@/src/components/ui/AnalyticsTracker';
import { BreadcrumbSchema, RealEstateListingSchema } from '@/src/components/common/Schema';
import GalleryCarousel from '@/src/components/projects/GalleryCarousel';
import NewsSection from '@/src/components/projects/NewsSection';
import ExpandableDescription from '@/src/components/ui/ExpandableDescription';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Mock data (in a real app, fetch from Supabase)
const PROJECTS_DB: Record<string, any> = {
  'shivani-vatika-11th': {
    title: 'Shivani Vatika 11th',
    location: 'Near Khatu Shyam Ji',
    status: 'Ongoing',
    type: 'Premier Residential Plots',
    heroImage: '/images/shivani-vatika-11th.png',
    gallery: [
      '/images/shivani-vatika-11th.png',
      '/images/shivani-vatika-11th-gallery-1.png',
      '/images/shivani-vatika-11th-gallery-2.png',
      '/images/shivani-vatika-11th-gallery-3.png',
      '/images/shivani-vatika-11th-gallery-4.webp',
      '/images/shivani-vatika-11th-gallery-5.jpeg',
    ],
    amenities: [
      'Park',
      'Guard Room',
      'Electricity',
      'Water Supply',
      'Boundary',
      'Road',
      'Care-Taker',
    ],
    totalPlots: '198',
    startingSize: '100-150 Sq. Yds.',
    availableSizes: ['100-150 Sq. Yds.', '150-200 Sq. Yds.', 'Above 200 Sq. Yds.'],
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d1620.527332206488!2d75.422285!3d27.130247!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjfCsDA3JzUxLjIiTiA3NcKwMjUnMTkuMCJF!5e1!3m2!1sen!2sus!4v1784202961766!5m2!1sen!2sus',
    news: ['/images/news-1.png', '/images/news-2.png', '/images/news-3.png', '/images/news-4.png'],
    description:
      'Shivani Vatika 11th – A Promising Residential Society Near Khatu Shyam Ji. Shivani Vatika 11th is a well-planned residential project spread over 11.5 bigha (approx. 30,480 sq. yds.), developed on land acquired from Jaipur Development Authority – Pratap Nagar Cooperative Housing Society, ensuring complete transparency and trust for buyers. The township offers 198 residential plots ranging from 50 sq. yds. to 200 sq. yds., giving families the flexibility to choose according to their needs. Designed with modern infrastructure and essential facilities.',
  },
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
    totalPlots: '250+',
    startingSize: '150 Sq. Yds.',
    availableSizes: ['150-200 Sq. Yds.', 'Above 200 Sq. Yds.'],
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113645.72763327663!2d75.75055239726563!3d26.8503923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4adf4c57e281%3A0xce1c63a0cf22e09!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    news: [],
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
    totalPlots: '100+',
    startingSize: '100 Sq. Yds.',
    availableSizes: ['100-150 Sq. Yds.'],
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113645.72763327663!2d75.75055239726563!3d26.8503923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4adf4c57e281%3A0xce1c63a0cf22e09!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    news: [],
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
    <div className="flex min-h-screen w-full flex-col bg-[#fdfbf7] pb-20 dark:bg-gray-900">
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

      <div className="container mx-auto max-w-7xl px-4 pt-28 pb-8">
        <Link
          href={`/${locale}/projects/current`}
          className="text-brand-navy hover:text-brand-gold mb-8 inline-flex items-center gap-2 font-semibold transition-colors dark:text-gray-300"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Gallery */}
          <div className="w-full">
            <GalleryCarousel gallery={project.gallery} status={project.status} />
          </div>

          {/* Right Column - Details */}
          <div className="flex w-full flex-col">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
              <MapPin size={16} className="text-brand-gold" />
              <span>
                {project.location} • {project.type}
              </span>
            </div>

            <h1 className="text-brand-navy mb-6 font-serif text-4xl leading-tight md:text-5xl lg:text-6xl dark:text-white">
              {project.title}
            </h1>

            <div className="mb-10">
              <ExpandableDescription text={project.description} />
            </div>

            {/* Stats Row */}
            {(project.totalPlots || project.startingSize) && (
              <div className="mb-10 grid grid-cols-2 gap-6">
                {project.totalPlots && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <span className="text-brand-navy mb-2 text-4xl font-bold dark:text-white">
                      {project.totalPlots}
                    </span>
                    <span className="text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Total Plots
                    </span>
                  </div>
                )}
                {project.startingSize && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <span className="text-brand-navy mb-2 text-3xl font-bold dark:text-white">
                      {project.startingSize}
                    </span>
                    <span className="text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Starting Size
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Amenities */}
            {project.amenities && project.amenities.length > 0 && (
              <div className="mb-10">
                <h3 className="text-brand-navy mb-6 font-serif text-2xl dark:text-white">
                  Amenities
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {project.amenities.map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 shrink-0 text-green-600" />
                      <span className="text-lg font-semibold text-gray-800 dark:text-gray-300">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Sizes */}
            {project.availableSizes && project.availableSizes.length > 0 && (
              <div className="mb-12">
                <h3 className="text-brand-navy mb-6 font-serif text-2xl dark:text-white">
                  Available Sizes
                </h3>
                <div className="flex flex-wrap gap-4">
                  {project.availableSizes.map((size: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-brand-gold/10 text-brand-navy dark:bg-brand-gold/20 dark:text-brand-gold border-brand-gold/20 rounded-full border px-6 py-2 text-sm font-bold"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto flex flex-col gap-4">
              <Link
                href={`/${locale}/contact?project=${slug}`}
                className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex w-full items-center justify-center gap-3 rounded-xl py-5 text-xl font-bold shadow-lg transition-all hover:-translate-y-1"
              >
                <CalendarRange size={24} />
                Schedule a Site Visit
              </Link>
              <div className="flex gap-4">
                <a
                  href="tel:+919999999999"
                  className="bg-brand-navy hover:bg-brand-navy/90 dark:text-brand-navy flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold text-white shadow-md transition-all hover:-translate-y-1 dark:bg-white dark:hover:bg-gray-100"
                >
                  <Phone size={20} />
                  Call Now
                </a>
                <a
                  href="mailto:info@sviinfra.com"
                  className="text-brand-navy flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white py-4 text-lg font-bold shadow-md transition-all hover:-translate-y-1 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <Mail size={20} />
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Map */}
      {project.mapEmbedUrl && (
        <section className="mt-24 w-full">
          <div className="container mx-auto mb-10 px-4 text-center">
            <h2 className="text-brand-navy mb-4 font-serif text-4xl md:text-5xl dark:text-white">
              Location
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Explore the project location on the map
            </p>
          </div>
          <div className="relative h-[500px] w-full shadow-inner md:h-[600px]">
            <iframe
              src={project.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full contrast-[110%] grayscale-[20%]"
            ></iframe>
          </div>
        </section>
      )}

      {/* News Section */}
      {project.news && project.news.length > 0 && (
        <div className="container mx-auto max-w-7xl px-4">
          <NewsSection news={project.news} />
        </div>
      )}
    </div>
  );
}
