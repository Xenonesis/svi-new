import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Send } from 'lucide-react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import FreelancePerks from './FreelancePerks';
import OnsiteRoles from './OnsiteRoles';

const CareersFAQ = dynamic(() => import('@/src/components/common/AboutFAQ'));

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.careers' });
  return {
    title: t('title'),
    description:
      'Join SVI Infra Solutions — freelance and onsite career opportunities in real estate sales, business development, and team leadership.',
  };
}

export default async function Careers({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.careers');
  return (
    <div className="bg-white pt-20 pb-16 dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-24 dark:border-gray-700 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 px-2 font-serif text-3xl sm:text-4xl md:text-6xl dark:text-gray-100">
            {t('title')}
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto h-px w-16"></div>
        </div>
      </section>

      {/* Freelance Section (client leaf for motion animations) */}
      <FreelancePerks />

      {/* Onsite Opportunities */}
      <section className="bg-white py-24 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h4 className="mb-6 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-400">
              Sales & Promotion
            </h4>
            <h2 className="text-brand-navy mb-8 font-serif text-4xl dark:text-gray-100">
              Onsite Opportunities
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              <p>
                We are expanding our Sales & Promotion team. Join us onsite and take your career to
                the next level with competitive salaries, great growth opportunities, and an
                inspiring work environment.
              </p>
            </div>
          </div>

          {/* Client leaf for motion animations */}
          <OnsiteRoles />

          <div className="text-center">
            <Link
              href="/contact"
              className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy hover:bg-brand-gold inline-flex items-center gap-2 px-8 py-4 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:text-white dark:hover:bg-white"
            >
              Apply For Onsite Role <Send size={16} />
            </Link>
          </div>
        </div>
      </section>

      <CareersFAQ />
    </div>
  );
}
