'use client';

import { Link } from '@/src/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';

interface DesktopNavActionsProps {
  isHomeTransparent: boolean;
}

export function DesktopNavActions({ isHomeTransparent }: DesktopNavActionsProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const isHi = locale === 'hi';

  return (
    <div
      className={`flex items-center gap-2 border-l pl-3 xl:gap-3 xl:pl-4 2xl:gap-3.5 2xl:pl-5 ${
        isHomeTransparent ? 'border-white/25' : 'border-slate-200 dark:border-white/15'
      }`}
    >
      <Link
        href="/login"
        className={`group/login relative py-1 font-semibold whitespace-nowrap uppercase transition-all duration-200 ${
          isHi
            ? 'text-[12.5px] tracking-wide 2xl:text-[14px]'
            : 'text-[10.5px] tracking-wider 2xl:text-[12px] 2xl:tracking-widest'
        } ${
          isHomeTransparent
            ? 'text-white/90 hover:text-amber-400'
            : 'text-slate-800 hover:text-amber-500 dark:text-slate-100 dark:hover:text-amber-400'
        }`}
      >
        {t('clientLogin')}
        <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-amber-400 transition-all duration-300 group-hover/login:w-full" />
      </Link>

      <Link
        href="/registration"
        className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-amber-400 px-4 py-2 font-extrabold whitespace-nowrap text-slate-950 uppercase shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-amber-500/25 active:translate-y-0 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300 ${
          isHi
            ? 'text-[12.5px] tracking-wide 2xl:text-[14px]'
            : 'text-[10.5px] tracking-wider 2xl:text-[12px] 2xl:tracking-widest'
        }`}
      >
        {t('register')}
      </Link>
    </div>
  );
}
