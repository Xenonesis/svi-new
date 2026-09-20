import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SITE_NAME, buildAlternates, localizedUrl } from '@/src/lib/seo';
import { AREAS_DATA, type AreaInfo } from '@/src/data/areas';
import { BreadcrumbSchema } from '@/src/components/common/Schema';
import { AreasHero } from '@/src/components/areas/AreasHero';
import { AreaCard } from '@/src/components/areas/AreaCard';
import { AreasWhyInvest } from '@/src/components/areas/AreasWhyInvest';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHindi = locale === 'hi';

  const title = isHindi
    ? 'प्रमुख निवेश कॉरिडोर एवं विकास क्षेत्र | SVI Infra Solutions'
    : 'Prime Real Estate Corridors & Growth Areas in Jaipur | SVI Infra Solutions';
  const description = isHindi
    ? 'जयपुर एवं दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर (DMIC) के प्रमुख निवेश क्षेत्रों का अन्वेषण करें। जयपुर से खाटू श्याम जी हाईवे, नायला एवं फुलेरा स्मार्ट सिटी में रणनीतिक आवासीय प्लॉट्स।'
    : 'Explore strategic real estate growth corridors across Jaipur and the Delhi-Mumbai Industrial Corridor (DMIC). Discover high-ROI plotted townships in Jaipur to Khatu Shyam Ji Highway, Nayla, and Phulera Smart City.';

  const path = '/areas';

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
          url: '/images/project1.png',
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
      images: ['/images/project1.png'],
    },
  };
}

export default async function AreasIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';

  const areasList = Object.values(AREAS_DATA).filter((a) => a.slug !== 'tonk-road-jaipur');

  return (
    <main className="flex min-h-screen w-full flex-col bg-[#fbf9f4] pb-24 dark:bg-[#080d1a]">
      <BreadcrumbSchema
        items={[
          { name: isHindi ? 'होम' : 'Home', item: '/' },
          { name: isHindi ? 'विकास क्षेत्र' : 'Areas', item: '/areas' },
        ]}
      />

      {/* Hero Header */}
      <AreasHero isHindi={isHindi} />

      {/* Corridors Grid */}
      <section className="container mx-auto mt-12 px-4 sm:mt-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end dark:border-slate-800">
          <div>
            <span className="text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              {isHindi ? 'क्षेत्रवार अवलोकन' : 'Regional Overview'}
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
              {isHindi ? 'प्रमुख विकास कॉरिडोर' : 'Featured Growth Hubs'}
            </h2>
          </div>
          <p className="max-w-md text-xs text-slate-600 sm:text-sm dark:text-slate-400">
            {isHindi
              ? 'प्रत्येक कॉरिडोर का गहन विश्लेषण, कनेक्टिविटी और हमारे संबंधित प्रोजेक्ट्स देखें।'
              : 'Select a growth corridor below to explore its connectivity, neighborhood advantages, and active SVI developments.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {areasList.map((area: AreaInfo) => (
            <AreaCard key={area.slug} area={area} isHindi={isHindi} />
          ))}
        </div>
      </section>

      {/* Why Invest in SVI Corridors Section */}
      <AreasWhyInvest isHindi={isHindi} />
    </main>
  );
}
