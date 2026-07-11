'use client';

import Link from 'next/link';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  isHomeTransparent: boolean;
}

export function NavLink({ href, children, isActive, isHomeTransparent }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`group 3xl:text-sm relative py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase transition-colors duration-200 xl:text-[12.5px] xl:tracking-wider 2xl:text-[13.5px] 2xl:tracking-widest ${
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
