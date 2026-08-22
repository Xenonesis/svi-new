import type { Metadata } from 'next';
import Link from 'next/link';

import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createMetadata } from '@/src/lib/seo';
import { ALL_FAQS } from '@/src/data/faq/general';
import { ALL_FAQS_HI } from '@/src/data/faq/hi';

// Static: FAQ content rarely changes — generate at build time
export const dynamic = 'force-static';

import FAQSection from '@/src/components/faq/FAQSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHindi = locale === 'hi';
  const title = isHindi
    ? 'अक्सर पूछे जाने वाले सवाल (FAQ) - प्लॉट्स और निवेश'
    : 'Frequently Asked Questions - Plots & Investment FAQ';
  const description = isHindi
    ? 'प्रॉपर्टी निवेश, पेमेंट प्लान्स, रजिस्ट्री दस्तावेज़ और लोन प्रक्रियाओं से जुड़े सभी आम सवालों के जवाब जानें।'
    : 'Find answers to frequently asked questions about property investment, payment plans, clear documentation, and more at SVI Infra Solutions.';
  return createMetadata({
    title,
    description,
    path: '/faq',
    locale,
  });
}

export default async function FAQPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.faq');

  const faqs = locale === 'hi' ? ALL_FAQS_HI : ALL_FAQS;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
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
          <FAQSection items={faqs} variant="none" hideCTA={false} defaultActiveIndex={-1} />
        </div>
      </section>
    </div>
  );
}
