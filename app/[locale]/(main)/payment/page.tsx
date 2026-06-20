import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import PaymentForm from './PaymentForm';

const PaymentFAQ = dynamic(() => import('@/src/components/faq/ProjectsFAQ'));

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.payment' });
  return {
    title: t('title'),
    description:
      'Secure online payment portal for SVI Infra Solutions. Pay for your property registration, booking amount, or installment online.',
  };
}

export default async function Payment({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.payment');
  return (
    <div className="bg-brand-bg min-h-screen pt-20 pb-20 dark:bg-gray-900">
      {/* Hero — static content */}
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-20 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 font-serif text-3xl leading-tight sm:text-4xl md:text-6xl dark:text-gray-100">
            {t('title')}
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="animate-hero-subtitle mx-auto max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Form — client leaf */}
      <section className="container mx-auto px-4 py-16">
        <PaymentForm />
      </section>

      <PaymentFAQ />
    </div>
  );
}
