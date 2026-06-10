import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { MessageSquareWarning } from 'lucide-react';
import GrievanceForm from './GrievanceForm';

const GrievanceFAQ = dynamic(() => import('@/src/components/common/ContactFAQ'));

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.grievance' });
  return {
    title: t('title'),
    description:
      'Submit a grievance or support request to SVI Infra Solutions. We are committed to resolving your issues promptly.',
  };
}

export default async function Grievance({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="bg-brand-bg min-h-screen pt-20 pb-20 dark:bg-gray-900">
      {/* Hero — static content */}
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-20 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="bg-brand-navy text-brand-gold dark:border-brand-gold/30 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full shadow-md dark:border">
            <MessageSquareWarning size={32} />
          </div>
          <h1 className="text-brand-navy animate-hero-h1 mb-6 font-serif text-3xl leading-tight sm:text-4xl md:text-6xl dark:text-gray-100">
            Raise a Grievance
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="animate-hero-subtitle mx-auto max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg dark:text-gray-400">
            We are committed to resolving your issues promptly. Please provide details of your
            grievance or support request below.
          </p>
        </div>
      </section>

      {/* Form — client leaf */}
      <section className="container mx-auto px-4 py-16">
        <GrievanceForm />
      </section>

      <GrievanceFAQ />
    </div>
  );
}
