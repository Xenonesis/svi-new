import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const TermsFAQ = dynamic(() => import('@/src/components/faq/ProjectsFAQ'));

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.terms' });
  return {
    title: t('title'),
    description:
      'SVI Infra Solutions terms and conditions — rules and guidelines for using our website and services.',
  };
}

export default async function TermsConditions({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.terms');
  const tc = await getTranslations('common');

  const sections = [
    { title: t('s1Title'), content: t('s1Content') },
    { title: t('s2Title'), content: t('s2Content'), list: t('s2List') },
    { title: t('s3Title'), content: t('s3Content'), list: t('s3List') },
    { title: t('s4Title'), content: t('s4Content'), list: t('s4List') },
    { title: t('s5Title'), content: t('s5Content') },
    { title: t('s6Title'), content: t('s6Content'), list: t('s6List') },
    { title: t('s7Title'), content: t('s7Content') },
    { title: t('s8Title'), content: t('s8Content') },
    { title: t('s9Title'), content: t('s9Content') },
    { title: t('s10Title'), content: t('s10Content') },
  ];

  return (
    <div className="bg-brand-bg min-h-screen pt-24 pb-20 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl px-4">
        <Link
          href="/"
          className="text-brand-navy hover:text-brand-gold mb-12 inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors dark:text-gray-200"
        >
          <ArrowLeft size={16} />
          {t('backToHome')}
        </Link>

        <h1 className="text-brand-navy mb-4 font-serif text-4xl md:text-5xl dark:text-gray-100">
          {t('heading')}
        </h1>
        <p className="mb-12 text-sm text-gray-500 dark:text-gray-400">{t('lastUpdated')}</p>

        <div className="space-y-8 rounded-lg border border-gray-200 bg-white p-8 leading-relaxed text-gray-600 shadow-sm md:p-12 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          {sections.map((section, idx) => (
            <section key={idx}>
              <h2 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-100">
                {section.title}
              </h2>
              <p className={section.list ? 'mb-4' : ''}>{section.content}</p>
              {section.list && (
                <ul className="ml-4 list-inside list-disc space-y-1">
                  {section.list.split(', ').map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
              {idx === sections.length - 1 && (
                <div className="bg-brand-bg mt-4 rounded-lg p-4 dark:bg-gray-900">
                  <p className="text-brand-navy font-semibold dark:text-gray-200">
                    SVI Infra Solutions Pvt. Ltd.
                  </p>
                  <p>A-61 Sector 65, Noida, Uttar Pradesh 201309</p>
                  <p>{tc('emailLabel')}: info@sviinfrasolutions.com</p>
                  <p>{tc('phoneLabel')}: +91 73000 07643</p>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
      <TermsFAQ />
    </div>
  );
}
