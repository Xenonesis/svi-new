import { notFound, redirect } from 'next/navigation';
import { MapPin, CheckCircle, Info, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SITE_URL, SITE_NAME, buildAlternates, localizedUrl } from '@/src/lib/seo';
import { AREAS_DATA } from '@/src/data/areas';
import { PROJECTS_DB } from '@/src/data/projects';
import { BreadcrumbSchema, PlaceAndAreaSchema } from '@/src/components/common/Schema';
import { EmiCalculator } from '@/src/components/properties/EmiCalculator';
import AreaInquiryForm from '@/src/components/properties/AreaInquiryForm';
import SiteVisitPill from '@/src/components/common/SiteVisitPill';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Hardcoded details of projects to display in the area page
const PROJECT_SUMMARIES: Record<
  string,
  { title: string; type: string; img: string; status: string }
> = {
  'shivani-vatika-11th': {
    title: 'Shivani Vatika 11th',
    type: 'Premier Residential Plots',
    img: '/Shivani Vatika 11/gate.webp',
    status: 'Ongoing',
  },
  'shyam-aangan': {
    title: 'Shyam Aangan',
    type: 'Integrated Township',
    img: '/images/project1.png',
    status: 'Under Development',
  },
  'shivani-vatika': {
    title: 'Shivani Vatika',
    type: 'Premier Residential',
    img: '/Shivani Vatika/shivani vatika6 frontgate.webp',
    status: 'Under Development',
  },
  'shivani-residency': {
    title: 'Shivani Residency',
    type: 'Residential plots',
    img: '/images/project1.png',
    status: 'Completed',
  },
};
interface CommercialHubConfig {
  href: string;
  badge: {
    en: string;
    hi: string;
  };
  headline: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  ctaText: {
    en: string;
    hi: string;
  };
}

const COMMERCIAL_HUBS: Record<string, CommercialHubConfig> = {
  'khatu-shyam-highway': {
    href: '/plots-for-sale-near-khatu-shyam-ji',
    badge: {
      en: 'Commercial & Residential Plots Corridor',
      hi: 'कमर्शियल एवं आवासीय प्लॉट्स कॉरिडोर',
    },
    headline: {
      en: 'Looking to buy plots on this corridor? Explore Commercial Plots for Sale Near Khatu Shyam Ji →',
      hi: 'क्या आप इस कॉरिडोर में आवासीय प्लॉट खरीदना चाहते हैं? खाटू श्याम जी के पास उपलब्ध प्लॉट्स देखें →',
    },
    description: {
      en: 'Section 90-A conversion approved plots with immediate highway connectivity, RIICO industrial proximity, clear registry title, and free cab site visits.',
      hi: 'रीको औद्योगिक क्षेत्र व रेणवाल स्टेशन के पास 100% स्पष्ट रजिस्ट्री, गेटेड टाउनशिप और 90-ए स्वीकृत सुनियोजित आवासीय व कमर्शियल प्लॉट्स।',
    },
    ctaText: {
      en: 'Explore Commercial Plots →',
      hi: 'उपलब्ध प्लॉट्स देखें →',
    },
  },
  'phulera-smart-city': {
    href: '/plots-for-sale-in-phulera',
    badge: {
      en: 'DMIC Corridor Investment Hub',
      hi: 'DMIC कॉरिडोर निवेश हब',
    },
    headline: {
      en: 'Explore Available Residential & Commercial Plots for Sale in Phulera Smart City →',
      hi: 'फुलेरा स्मार्ट सिटी में उपलब्ध आवासीय एवं कमर्शियल प्लॉट्स देखें →',
    },
    description: {
      en: 'High-growth plotted investment along the Delhi-Mumbai Industrial Corridor (DMIC) & Western DFC rail junction with projected 15-20% annual ROI.',
      hi: 'दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर (DMIC) और वेस्टर्न DFC रेलवे जंक्शन पर 15-20% संभावित वार्षिक रिटर्न वाले स्पष्ट रजिस्ट्री प्लॉट्स।',
    },
    ctaText: {
      en: 'Explore Phulera Plots →',
      hi: 'फुलेरा प्लॉट्स देखें →',
    },
  },
};

interface AreaInformationalMeta {
  title: { en: string; hi: string };
  description: { en: string; hi: string };
}

const AREA_INFORMATIONAL_META: Record<string, AreaInformationalMeta> = {
  'khatu-shyam-highway': {
    title: {
      en: 'Jaipur to Khatu Shyam Ji Highway (Harsholi) Corridor & Area Guide',
      hi: 'जयपुर से खाटू श्याम जी हाईवे (हरसोली) - कॉरिडोर व क्षेत्र गाइड',
    },
    description: {
      en: 'Comprehensive informational guide to the Jaipur to Khatu Shyam Ji Highway corridor at Harsholi. Explore RIICO industrial connectivity, Renwal rail transit, and regional infrastructure.',
      hi: 'जयपुर से खाटू श्याम जी हाईवे (हरसोली) कॉरिडोर की संपूर्ण सूचनात्मक गाइड: रीको औद्योगिक क्षेत्र, रेणवाल रेलवे कनेक्टिविटी और क्षेत्रीय विकास की पूरी जानकारी।',
    },
  },
  'phulera-smart-city': {
    title: {
      en: 'Phulera Smart City - DMIC Corridor & Regional Infrastructure Guide',
      hi: 'फुलेरा स्मार्ट सिटी - DMIC कॉरिडोर व क्षेत्रीय इंफ्रास्ट्रक्चर गाइड',
    },
    description: {
      en: 'Complete regional profile of Phulera Smart City along the Delhi-Mumbai Industrial Corridor (DMIC). Detailed insights on the Western DFC rail hub and regional development.',
      hi: 'दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर (DMIC) के तहत फुलेरा स्मार्ट सिटी की संपूर्ण क्षेत्रीय प्रोफाइल। वेस्टर्न DFC रेल जंक्शन और क्षेत्रीय विकास की विस्तृत जानकारी।',
    },
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const area = AREAS_DATA[slug];
  if (!area) return { title: 'Area Not Found' };

  const path = `/areas/${slug}`;
  const isHindi = locale === 'hi';
  const infoMeta = AREA_INFORMATIONAL_META[slug];
  const title = infoMeta
    ? isHindi
      ? infoMeta.title.hi
      : infoMeta.title.en
    : isHindi && area.metaTitleHi
      ? area.metaTitleHi
      : area.metaTitle;
  const description = infoMeta
    ? isHindi
      ? infoMeta.description.hi
      : infoMeta.description.en
    : isHindi && area.metaDescriptionHi
      ? area.metaDescriptionHi
      : area.metaDescription;
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
  setRequestLocale(locale);
  const isHindi = locale === 'hi';
  const area = AREAS_DATA[slug];
  if (slug === 'tonk-road-jaipur') {
    redirect(isHindi ? '/hi/areas/nayla-jaipur' : '/areas/nayla-jaipur');
  }

  if (!area) {
    notFound();
  }
  const commercialHub = COMMERCIAL_HUBS[slug];

  const t = await getTranslations({ locale, namespace: 'common' });
  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 pb-20 dark:bg-gray-900">
      <BreadcrumbSchema
        items={[
          { name: 'Home', item: '/' },
          { name: isHindi ? 'क्षेत्र' : 'Areas', item: '/areas' },
          { name: area.name, item: `/areas/${slug}` },
        ]}
      />

      <PlaceAndAreaSchema
        name={area.name}
        description={area.description}
        url={localizedUrl(`/areas/${slug}`, locale)}
        latitude={area.geo?.latitude}
        longitude={area.geo?.longitude}
        addressLocality={area.geo?.addressLocality || area.name}
        postalCode={area.geo?.postalCode}
        addressRegion={area.geo?.addressRegion || 'Rajasthan'}
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
        {/* Commercial Gateway Callout Banner (Eliminates Keyword Cannibalization) */}
        {commercialHub && (
          <div className="mb-10">
            <Link
              href={commercialHub.href}
              className="group border-brand-gold/40 from-brand-navy to-brand-navy hover:border-brand-gold focus:ring-brand-gold relative block overflow-hidden rounded-2xl border-2 bg-gradient-to-r via-[#0c1a30] p-6 text-white shadow-xl transition-all duration-300 hover:scale-[1.005] hover:shadow-2xl focus:ring-2 focus:ring-offset-2 focus:outline-none md:p-8"
            >
              {/* Subtle gold ambient glow */}
              <div
                className="bg-brand-gold/15 pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />

              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl space-y-2.5">
                  <div className="border-brand-gold/40 bg-brand-gold/15 text-brand-gold inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{isHindi ? commercialHub.badge.hi : commercialHub.badge.en}</span>
                  </div>

                  <h2 className="text-xl font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-amber-200 md:text-2xl">
                    {isHindi ? commercialHub.headline.hi : commercialHub.headline.en}
                  </h2>

                  <p className="text-xs leading-relaxed text-gray-300 md:text-sm">
                    {isHindi ? commercialHub.description.hi : commercialHub.description.en}
                  </p>
                </div>

                <div className="via-brand-gold text-brand-navy group-hover:shadow-brand-gold/30 inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                  <span>{isHindi ? commercialHub.ctaText.hi : commercialHub.ctaText.en}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>
        )}
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
            {commercialHub && (
              <div className="border-brand-gold/40 from-brand-navy mb-6 rounded-xl border bg-gradient-to-br to-[#0f213e] p-5 text-white shadow-md">
                <div className="text-brand-gold mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
                  <Building2 size={13} />
                  <span>{isHindi ? 'कमर्शियल हब' : 'Commercial Plots Hub'}</span>
                </div>
                <p className="mb-3 text-sm font-medium text-white/90">
                  {isHindi ? commercialHub.headline.hi : commercialHub.headline.en}
                </p>
                <Link
                  href={commercialHub.href}
                  className="bg-brand-gold text-brand-navy inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold shadow transition-all hover:bg-amber-300"
                >
                  <span>{isHindi ? 'उपलब्ध प्लॉट्स देखें' : 'View Available Plots'}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
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

      {/* Floating Free Cab Site Visit Sticky Action */}
      <SiteVisitPill areaName={area.name} defaultPickup="Jaipur City / Railway Station / Airport" />
    </div>
  );
}
