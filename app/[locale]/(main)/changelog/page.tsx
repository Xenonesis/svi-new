import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { absoluteUrl, buildAlternates, localizedUrl } from '@/src/lib/seo';
import { fetchChangelog } from '@/src/lib/changelog';
import ChangelogTimeline from '@/src/components/changelog/ChangelogTimeline';

// Re-validate every 10 minutes — same as the underlying helper.
export const revalidate = 600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.changelog' });
  const path = '/changelog';
  const title = t('title');
  const description =
    'Every release, every fix, every improvement — straight from the SVI Infra Solutions GitHub repository.';

  return {
    title,
    description,
    alternates: buildAlternates(path, locale),
    openGraph: {
      type: 'website',
      url: localizedUrl(path, locale),
      title: `${title} | SVI Infra Solutions`,
      description,
      siteName: 'SVI Infra Solutions',
      locale: locale === 'hi' ? 'hi_IN' : 'en_IN',
      images: [
        {
          url: absoluteUrl('/opengraph-image'),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | SVI Infra Solutions`,
      description,
      images: [absoluteUrl('/opengraph-image')],
    },
  };
}

export default async function ChangelogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.changelog');

  // Fetch on the server with Next.js data cache + 10-min revalidation
  const initial = await fetchChangelog({ perPage: 30 });

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('title'),
    description:
      'Auto-generated changelog of all releases from the SVI Infra Solutions GitHub repository.',
    url: localizedUrl('/changelog', locale),
    inLanguage: locale,
    publisher: {
      '@type': 'Organization',
      name: 'SVI Infra Solutions',
      url: absoluteUrl('/'),
    },
  };

  return (
    <div className="dark:bg-brand-dark-bg min-h-screen bg-gray-50 pt-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero */}
      <section className="bg-brand-navy relative overflow-hidden py-16 text-white md:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
        </div>
        <div
          className="pointer-events-none absolute -top-32 -right-20 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.6) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.5) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 container mx-auto px-4 text-center md:px-8">
          <div className="border-brand-gold/30 bg-brand-gold/5 text-brand-gold mb-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.25em] uppercase">
            <span className="bg-brand-gold h-1.5 w-1.5 rounded-full" />
            {t('eyebrow')}
          </div>
          <h1 className="mb-4 font-serif text-4xl leading-tight md:text-6xl">{t('heading')}</h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-300 md:text-lg">
            {t('subtitle')}
          </p>
          <div className="mx-auto mt-6 flex items-center justify-center gap-3">
            <span className="to-brand-gold/70 h-px w-10 bg-gradient-to-r from-transparent" />
            <span className="bg-brand-gold h-1.5 w-1.5 rotate-45" />
            <span className="to-brand-gold/70 h-px w-10 bg-gradient-to-l from-transparent" />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-5xl px-4 md:px-8">
          <p className="text-brand-navy/70 mb-10 max-w-3xl text-sm leading-relaxed md:text-base dark:text-gray-300">
            {t('intro')}
          </p>
          <ChangelogTimeline initial={initial} />
        </div>
      </section>
    </div>
  );
}
