import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { absoluteUrl, buildAlternates } from '@/src/lib/seo';
import LotteryClientSection from '@/src/components/lottery/LotteryClientSection';
import LotteryFAQ from '@/src/components/faq/ProjectsFAQ';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'pages.lottery' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/lottery', locale),
    openGraph: {
      title: `${t('title')} | SVI Infra Solutions`,
      description: t('description'),
      type: 'website',
      locale: locale === 'hi' ? 'hi_IN' : 'en_IN',
      images: [{ url: absoluteUrl('/images/hero1.png'), width: 1200, height: 630 }],
    },
  };
}

export default async function LotteryPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.lottery' });

  return (
    <div className="bg-brand-bg min-h-screen pt-20 pb-16 dark:bg-gray-900">
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-20 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <p className="mb-4 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
            {t('portalBadge')}
          </p>
          <h1 className="text-brand-navy mb-6 font-serif text-3xl sm:text-4xl md:text-6xl dark:text-gray-100">
            {t.rich('megaGiveaway', {
              gold: (chunks) => <span className="text-brand-gold">{chunks}</span>,
            })}
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg dark:text-gray-400">
            {t('description')}
          </p>
        </div>
      </section>

      <LotteryClientSection />
      <LotteryFAQ />
    </div>
  );
}
