'use client';

import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/src/i18n/navigation';
import { Globe } from 'lucide-react';
import { useTransition } from 'react';

export default function LanguageToggle({ isHomeTransparent }: { isHomeTransparent?: boolean }) {
  const locale = useLocale();
  const t = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'hi' : 'en';
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className={`flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors xl:gap-1.5 xl:px-3 xl:py-2 xl:text-sm ${
        isHomeTransparent
          ? 'text-white/90 hover:bg-white/10'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
      aria-label={t('switchLanguage')}
    >
      <Globe className="h-4 w-4" />
      <span>{locale === 'en' ? 'हिन्दी' : 'English'}</span>
    </button>
  );
}
