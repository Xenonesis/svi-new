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
      className={`3xl:text-sm flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors xl:gap-1.5 xl:px-3 xl:py-2 xl:text-[12.5px] 2xl:text-[13.5px] ${
        isHomeTransparent
          ? 'hover:text-brand-gold hover:border-brand-gold border border-white/30 bg-black/30 text-white backdrop-blur-sm'
          : 'border border-transparent text-gray-800 hover:bg-gray-200/70 dark:text-gray-800 dark:hover:bg-gray-200/70'
      }`}
      aria-label={locale === 'en' ? 'Hindi' : 'English'}
    >
      <Globe className="h-4 w-4" />
      <span>{locale === 'en' ? 'HI' : 'EN'}</span>
    </button>
  );
}
