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
      className={`flex items-center gap-2 border-l pl-3 xl:gap-3 xl:pl-4 2xl:gap-4 2xl:pl-6 ${isHomeTransparent ? 'border-white/30' : 'border-gray-200 dark:border-gray-200'}`}
    >
      <Link
        href="/login"
        className={`group/login relative py-1 font-semibold whitespace-nowrap uppercase transition-all duration-200 ${
          isHi
            ? '3xl:text-base text-[13px] tracking-wide xl:text-[14.5px] 2xl:text-[15.5px]'
            : '3xl:text-sm text-[11px] tracking-wide xl:text-[12.5px] xl:tracking-wider 2xl:text-[13.5px] 2xl:tracking-widest'
        } ${
          isHomeTransparent
            ? 'hover:text-brand-gold text-white/95'
            : 'text-brand-navy hover:text-brand-gold dark:text-brand-navy dark:hover:text-brand-gold'
        }`}
      >
        {t('clientLogin')}
        <span className="bg-brand-gold absolute bottom-0 left-0 h-[1.5px] w-0 transition-all duration-300 group-hover/login:w-full" />
      </Link>
      <Link
        href="/registration"
        className={`relative flex items-center justify-center overflow-hidden rounded-full px-3 py-1.5 text-center font-semibold whitespace-nowrap uppercase transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 xl:px-4 xl:py-2 ${
          isHomeTransparent
            ? 'bg-brand-gold text-brand-navy hover:bg-brand-gold-light shadow-md'
            : 'bg-brand-navy dark:bg-brand-navy text-white dark:text-white'
        } ${
          isHi
            ? '3xl:text-base text-[13px] tracking-wide xl:text-[14.5px] 2xl:text-[15.5px]'
            : '3xl:text-sm text-[11px] tracking-wide xl:text-[12.5px] xl:tracking-wider 2xl:text-[13.5px] 2xl:tracking-widest'
        }`}
      >
        {t('register')}
      </Link>
    </div>
  );
}
