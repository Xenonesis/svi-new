'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/src/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/src/stores/authStore';
import { UserNavDropdown } from '@/src/components/layout/UserNavDropdown';

interface DesktopNavActionsProps {
  isHomeTransparent: boolean;
}

export function DesktopNavActions({ isHomeTransparent }: DesktopNavActionsProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const isHi = locale === 'hi';

  const [mounted, setMounted] = useState(false);
  const userId = useAuthStore((s) => s.userId);
  const loading = useAuthStore((s) => s.loading);
  const initializeAuth = useAuthStore((s) => s.initialize);

  useEffect(() => {
    setMounted(true);
    initializeAuth();
  }, [initializeAuth]);

  if (mounted && !loading && userId) {
    return <UserNavDropdown isHomeTransparent={isHomeTransparent} />;
  }

  return (
    <div
      className={`flex items-center gap-3 border-l pl-4 xl:gap-4 xl:pl-5 2xl:gap-5 2xl:pl-6 ${
        isHomeTransparent ? 'border-white/25' : 'border-slate-200 dark:border-white/15'
      }`}
    >
      <Link
        href="/login"
        className={`group/login relative py-1.5 font-medium whitespace-nowrap transition-all duration-200 xl:py-2 ${
          isHi
            ? 'text-[13px] tracking-normal 2xl:text-[14px]'
            : 'text-[12px] tracking-normal 2xl:text-[13px]'
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
        className={`btn-lux-primary relative inline-flex items-center justify-center overflow-hidden rounded-full bg-amber-400 px-4 py-1.5 font-semibold whitespace-nowrap text-slate-950 shadow-sm transition-all duration-300 hover:bg-amber-300 active:scale-[0.98] xl:px-5 xl:py-2 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300 ${
          isHi
            ? 'text-[13px] tracking-normal 2xl:text-[14px]'
            : 'text-[12px] tracking-normal 2xl:text-[13px]'
        }`}
      >
        {t('register')}
      </Link>
    </div>
  );
}
