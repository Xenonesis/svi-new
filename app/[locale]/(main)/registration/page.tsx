import { setRequestLocale, getTranslations } from 'next-intl/server';
import RegistrationForm from '@/src/components/registration/RegistrationForm';
import RegistrationFAQ from '@/src/components/faq/RegistrationFAQ';

export default async function Registration(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ needRegistration?: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const [t, searchParams] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.registration' }),
    props.searchParams,
  ]);
  const needRegistration = searchParams.needRegistration;

  return (
    <div className="bg-brand-bg min-h-screen pt-20 pb-24 dark:bg-gray-900">
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-20 dark:border-gray-700 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 font-serif text-3xl leading-tight sm:text-4xl md:text-6xl dark:text-gray-100">
            {t('title')}
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="animate-hero-subtitle mx-auto max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg dark:text-gray-400">
            {t('subtitle')}
          </p>

          {needRegistration && (
            <div className="mx-auto mt-6 max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
              {t('needRegistrationError')}
            </div>
          )}
        </div>
      </section>
      <RegistrationForm />
      <RegistrationFAQ />
    </div>
  );
}
