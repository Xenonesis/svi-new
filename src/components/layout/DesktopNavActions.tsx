'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface DesktopNavActionsProps {
  isHomeTransparent: boolean;
}

export function DesktopNavActions({ isHomeTransparent }: DesktopNavActionsProps) {
  const t = useTranslations('nav');
  return (
    <div className="flex items-center gap-2 border-l border-gray-200 pl-3 xl:gap-3 xl:pl-4 2xl:gap-4 2xl:pl-6 dark:border-zinc-800">
      <Link
        href="/login"
        className={`group/login 3xl:text-sm relative py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase transition-all duration-200 xl:text-[12.5px] xl:tracking-wider 2xl:text-[13.5px] 2xl:tracking-widest ${
          isHomeTransparent
            ? 'hover:text-brand-gold text-white/95'
            : 'text-brand-navy hover:text-brand-gold dark:text-gray-200'
        }`}
      >
        {t('clientLogin')}
        <span className="bg-brand-gold absolute bottom-0 left-0 h-[1.5px] w-0 transition-all duration-300 group-hover/login:w-full" />
      </Link>
      <Link
        href="/registration"
        className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy 3xl:text-sm relative flex items-center justify-center overflow-hidden rounded-full px-3 py-1.5 text-center text-[11px] font-semibold tracking-wide whitespace-nowrap text-white uppercase transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 xl:px-4 xl:py-2 xl:text-[12.5px] xl:tracking-wider 2xl:text-[13.5px] 2xl:tracking-widest"
      >
        {t('register')}
      </Link>
    </div>
  );
}
