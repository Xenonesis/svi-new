import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { buildAlternates } from '@/src/lib/seo';
import ExclusiveOffersClient from './ExclusiveOffersClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.exclusiveOffers' });
  return {
    title: t('title'),
    description: `${t('description')} ${t('subtitle')}`,
    alternates: buildAlternates('/exclusive-offers', locale),
  };
}

export default async function ExclusiveOffersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ExclusiveOffersClient />;
}
