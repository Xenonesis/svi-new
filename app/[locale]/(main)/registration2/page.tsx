import { setRequestLocale, getTranslations } from 'next-intl/server';
import RegistrationWizardV2 from '@/src/components/registration-v2/RegistrationWizardV2';
import RegistrationFAQ from '@/src/components/faq/RegistrationFAQ';

export default async function Registration2Page(props: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ needRegistration?: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const searchParams = props.searchParams ? await props.searchParams : {};
  const t = await getTranslations({ locale, namespace: 'pages.registration' });

  return (
    <div className="bg-brand-bg min-h-screen pt-6 pb-24 dark:bg-slate-950">
      {searchParams.needRegistration && (
        <div className="container mx-auto px-4 pt-4">
          <div
            role="alert"
            className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
          >
            {t('needRegistrationError')}
          </div>
        </div>
      )}

      <RegistrationWizardV2 />

      <div className="border-t border-slate-200/80 dark:border-slate-800">
        <RegistrationFAQ />
      </div>
    </div>
  );
}
