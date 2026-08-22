import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ThankYouCard from './ThankYouCard';

const GRADIENT_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(45deg, #111827 0, #111827 1px, transparent 0, transparent 50%)',
  backgroundSize: '40px 40px',
};

export default async function ThankYou({
  searchParams,
  params,
}: {
  searchParams: Promise<{ registered?: string; queued?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, t] = await Promise.all([params, getTranslations('pages.thankYou')]);

  setRequestLocale(locale);

  const { registered, queued } = await searchParams;

  // Only show thank-you if user actually submitted the registration form
  if (!registered) {
    redirect('/registration?needRegistration=1');
  }

  return (
    <div className="bg-brand-bg relative flex min-h-screen items-center justify-center py-20 pt-24 dark:bg-gray-900">
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-5"
        style={GRADIENT_STYLE}
      ></div>
      <div className="relative z-10 container mx-auto px-4 text-center">
        <ThankYouCard registered={!!registered} queued={!!queued} />
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.thankYou');

  return {
    title: t('title'),
    description: t('description'),
  };
}
