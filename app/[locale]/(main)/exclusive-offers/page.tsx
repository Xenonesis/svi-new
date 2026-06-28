import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import ExclusiveOffersClient from './ExclusiveOffersClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.exclusiveOffers' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ExclusiveOffersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ExclusiveOffersClient />;
}
