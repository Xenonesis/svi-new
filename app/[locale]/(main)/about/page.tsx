import type { Metadata } from 'next';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import MissionValuesCards from './MissionValuesCards';
import ServicesList from './ServicesList';

const AboutFAQ = dynamic(() => import('@/src/components/faq/AboutFAQ'));

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.about' });
  return {
    title: t('title'),
    description:
      'Building legacies since 2009. SVI Infra Solutions is a premium real estate developer with 15+ projects and 5000+ happy clients across Jaipur, Noida, and Phulera Smart City.',
  };
}

export default async function About({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.about');

  return (
    <div className="min-h-screen bg-white pt-20 pb-20 dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-brand-bg border-b border-gray-200 py-16 text-center md:py-24 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 px-2 font-serif text-3xl sm:text-4xl md:text-6xl dark:text-gray-100">
            {t('title')}
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto h-px w-16"></div>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white py-16 md:py-24 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h4 className="mb-6 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
              {t('subtitle')}
            </h4>
            <h2 className="text-brand-navy mb-8 font-serif text-3xl dark:text-gray-100">
              {t('heading')}
            </h2>
            <div className="space-y-6 text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-300">
              <p>{t('para1')}</p>
              <p>{t('para2')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values (client leaf for motion animations) */}
      <MissionValuesCards />

      {/* Services */}
      <section className="bg-white py-16 md:py-24 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
            <div className="w-full md:w-1/2">
              <Image
                src="/images/house1.png"
                alt="SVI Infra residential property showcasing quality construction and modern design"
                width={800}
                height={600}
                className="w-full border shadow-2xl dark:border-gray-700 dark:shadow-none"
                quality={85}
              />
            </div>
            <div className="w-full md:w-1/2">
              <h4 className="mb-6 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
                {t('expertise')}
              </h4>
              <h2 className="text-brand-navy mb-8 font-serif text-3xl sm:mb-10 sm:text-4xl dark:text-gray-100">
                {t('services')}
              </h2>
              <ServicesList />
            </div>
          </div>
        </div>
      </section>

      <AboutFAQ />
    </div>
  );
}
