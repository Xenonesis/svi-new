'use client';

import { Link } from '@/src/i18n/navigation';
import { useLocale } from 'next-intl';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  isHomeTransparent: boolean;
}

export function NavLink({ href, children, isActive, isHomeTransparent }: NavLinkProps) {
  const locale = useLocale();
  const isHi = locale === 'hi';

  return (
    <Link
      href={href}
      className={`group relative py-1.5 font-medium whitespace-nowrap transition-colors duration-200 xl:py-2 ${
        isHi
          ? 'text-[13.5px] tracking-normal xl:text-[14px] 2xl:text-[15px]'
          : 'text-[12px] tracking-normal xl:text-[13px] 2xl:text-[14px]'
      } ${
        isActive
          ? 'text-amber-400'
          : isHomeTransparent
            ? 'text-white/95 hover:text-amber-400'
            : 'text-slate-800 hover:text-amber-500 dark:text-slate-100 dark:hover:text-amber-400'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      <span
        className={`absolute bottom-0 left-1/2 h-[1.5px] -translate-x-1/2 bg-amber-400 transition-all duration-300 ease-out ${
          isActive ? 'w-full' : 'w-0 group-hover:w-full'
        }`}
      />
    </Link>
  );
}
