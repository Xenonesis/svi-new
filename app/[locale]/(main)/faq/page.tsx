import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ALL_FAQS } from '@/src/data/faq/general';

const FAQSection = dynamic(() => import('@/src/components/common/FAQSection'));

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Find answers to common questions about SVI Infra Solutions projects, services, and real estate investments.',
};

export default function FAQ() {
  return (
    <div className="bg-brand-bg min-h-screen pt-20 pb-16 dark:bg-[#0C0C0C]">
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-20 dark:border-gray-700 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 font-serif text-3xl sm:text-4xl md:text-6xl dark:text-gray-100">
            Frequently Asked Questions
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Find answers to common questions about our projects and services.
          </p>
        </div>
      </section>
      <FAQSection
        items={ALL_FAQS}
        variant="none"
        maxWidth="max-w-3xl"
        hideCTA={true}
        defaultActiveIndex={0}
      />
      <section className="pb-16">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-6 text-gray-600 dark:text-gray-400">Still have questions?</p>
          <Link
            href="/contact"
            className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy hover:bg-brand-gold hover:text-brand-navy border-brand-navy dark:border-brand-gold inline-flex border px-8 py-4 text-xs font-bold tracking-widest text-white uppercase shadow-md transition-colors hover:shadow-xl"
          >
            Contact Our Team
          </Link>
        </div>
      </section>
    </div>
  );
}
