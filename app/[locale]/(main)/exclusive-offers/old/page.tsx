import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { buildAlternates } from '@/src/lib/seo';
import OldExclusiveOffersClient from '@/app/[locale]/(main)/old-exclusive-offers/OldExclusiveOffersClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.oldExclusiveOffers' });
  return {
    title: `${t('title')} (Archive) - SVI Infra`,
    description: `${t('description')} ${t('subtitle')}`,
    alternates: buildAlternates('/exclusive-offers/old', locale),
  };
}

export default async function ExclusiveOffersOldPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <OldExclusiveOffersClient />;
}
