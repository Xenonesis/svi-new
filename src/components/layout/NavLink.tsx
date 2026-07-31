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
      className={`group relative py-1 font-semibold whitespace-nowrap uppercase transition-colors duration-200 ${
        isHi
          ? '3xl:text-base text-[13px] tracking-wide xl:text-[14.5px] 2xl:text-[15.5px]'
          : '3xl:text-sm text-[11px] tracking-wide xl:text-[12.5px] xl:tracking-wider 2xl:text-[13.5px] 2xl:tracking-widest'
      } ${
        isActive
          ? 'text-brand-gold'
          : isHomeTransparent
            ? 'hover:text-brand-gold text-white/95'
            : 'text-brand-navy hover:text-brand-gold dark:text-gray-200'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      <span
        className={`bg-brand-gold absolute -bottom-0.5 left-1/2 h-[1.5px] -translate-x-1/2 transition-all duration-300 ease-out ${
          isActive ? 'w-full' : 'w-0 group-hover:w-full'
        }`}
      />
    </Link>
  );
}
