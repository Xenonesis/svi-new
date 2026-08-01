'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/src/i18n/navigation';
import { Globe } from 'lucide-react';
import { useTransition } from 'react';

export default function LanguageToggle({ isHomeTransparent }: { isHomeTransparent?: boolean }) {
  const locale = useLocale();
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
      className={`3xl:text-sm flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 xl:px-3.5 xl:py-2 xl:text-[12.5px] 2xl:text-[13.5px] ${
        isHomeTransparent
          ? 'border-white/30 bg-black/40 text-white backdrop-blur-sm hover:border-amber-400 hover:text-amber-400'
          : 'border-slate-200/80 bg-slate-100/80 text-slate-800 hover:border-amber-400 hover:text-amber-500 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:border-amber-400 dark:hover:text-amber-400'
      }`}
      aria-label={locale === 'en' ? 'Hindi' : 'English'}
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{locale === 'en' ? 'HI' : 'EN'}</span>
    </button>
  );
}
