import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import PropertyCalculator from '@/src/components/common/PropertyCalculator';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.calculators' });
  return {
    title: t('title'),
    description:
      'Plan your property investment with SVI Infra Solutions — calculate home loan EMIs and track your ROI.',
  };
}

export default async function CalculatorsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.calculators');

  return (
    <div className="bg-brand-bg min-h-screen pt-28 pb-20 dark:bg-gray-900">
      {/* Hero */}
      <section className="border-b border-gray-200 pb-12 text-center dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 font-serif text-3xl sm:text-4xl md:text-5xl dark:text-gray-100">
            {t('heading')}
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg dark:text-gray-400">
            Plan your dream home with our interactive EMI and ROI calculator — real-time results, no
            page reloads.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="container mx-auto px-4 pt-12">
        <PropertyCalculator />
      </section>

      {/* Info */}
      <section className="container mx-auto mt-16 max-w-3xl px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-brand-navy font-serif text-xl font-bold dark:text-gray-100">
            Why Invest in Phulera Smart City & DMIC Corridor?
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-3">
              <span className="bg-brand-gold mt-1 h-2 w-2 shrink-0 rounded-full" />
              <span>
                <strong className="text-brand-navy dark:text-gray-200">Rapid Appreciation:</strong>{' '}
                Property values in DMIC/DFC corridors have shown 12–18% annual growth over the past
                5 years.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-brand-gold mt-1 h-2 w-2 shrink-0 rounded-full" />
              <span>
                <strong className="text-brand-navy dark:text-gray-200">Government Push:</strong>{' '}
                Phulera Smart City is a flagship development with world-class infrastructure and
                connectivity.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-brand-gold mt-1 h-2 w-2 shrink-0 rounded-full" />
              <span>
                <strong className="text-brand-navy dark:text-gray-200">NRI Investment Hub:</strong>{' '}
                High rental yields and strong capital appreciation make it ideal for NRI investors.
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
