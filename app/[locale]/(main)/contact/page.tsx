import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { createMetadata } from '@/src/lib/seo';
import ContactMapWrapper from '@/src/components/contact/ContactMapWrapper';
import { ContactSchema } from '@/src/components/contact/ContactSchema';
import { ContactHero } from '@/src/components/contact/ContactHero';
import { ContactInfoSection } from '@/src/components/contact/ContactInfoSection';

const ContactFAQ = dynamic(() => import('@/src/components/faq/ContactFAQ'), {
  loading: () => (
    <div className="py-16 text-center">
      <div className="mx-auto h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  ),
});

const ContactForm = dynamic(() => import('@/src/components/contact/ContactForm'), {
  loading: () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto mb-6 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  ),
});

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isHindi = locale === 'hi';
  const title = isHindi
    ? 'संपर्क करें - ऑफिस का पता, फोन नंबर और पूछताछ'
    : 'Contact Us - Office Address, Phone & Inquiries';
  const description = isHindi
    ? 'SVI Infra Solutions से संपर्क करें। जयपुर, नोएडा और फुलेरा में प्लॉट्स और टाउनशिप की जानकारी और साइट विजिट बुक करने के लिए हमसे बात करें।'
    : 'Contact SVI Infra Solutions for inquiries about our premium residential and commercial properties in Jaipur, Noida, and Phulera. Schedule a site visit today.';
  return createMetadata({
    title,
    description,
    path: '/contact',
    locale,
  });
}

export default async function Contact(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.contact' });

  return (
    <div className="bg-[#FDFBF7] dark:bg-gray-900">
      <ContactSchema />

      <ContactHero
        badge="Get In Touch"
        title={t('title')}
        subtitle="Our team of real estate specialists is ready to guide you through every step of your property journey."
      />

      {/* ── Main content ─────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:gap-10">
            <ContactInfoSection />

            {/* ── Right: Form + Map ── */}
            <div className="flex flex-1 flex-col gap-6 md:gap-8">
              <ContactForm />
              <Suspense
                fallback={
                  <div className="flex h-[400px] w-full animate-pulse items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                    <span className="text-xs text-gray-400">Loading map…</span>
                  </div>
                }
              >
                <ContactMapWrapper />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <ContactFAQ />
    </div>
  );
}
