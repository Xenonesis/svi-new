import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ALL_FAQS } from '@/src/data/faq/general';

const FAQSection = dynamic(() => import('@/src/components/faq/FAQSection'));

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.faq' });
  return {
    title: t('title'),
    description: 'Frequently asked questions about SVI Infra Solutions properties and services.',
  };
}

export default async function FAQPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.faq');

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ALL_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-20 dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Hero */}
      <section className="bg-brand-navy relative py-20 text-center">
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="mb-4 font-serif text-4xl text-white md:text-6xl">{t('heading')}</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-300">
            <Link href="/" className="text-brand-gold hover:underline">
              SVI Infra Solutions
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <FAQSection items={ALL_FAQS} variant="none" hideCTA={false} defaultActiveIndex={-1} />
        </div>
      </section>
    </div>
  );
}
