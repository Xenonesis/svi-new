'use client';

import { Link } from '@/src/i18n/navigation';
import NextLink from 'next/link';

interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}

export function MobileNavLink({ href, children, isActive }: MobileNavLinkProps) {
  const isUnlocalized = href.startsWith('/employee') || href.startsWith('/admin');
  const LinkComp = isUnlocalized ? NextLink : Link;

  return (
    <LinkComp
      href={href}
      prefetch={isUnlocalized ? false : undefined}
      className={`block py-2.5 text-[clamp(15px,4vw,18px)] font-semibold tracking-wide transition-colors ${
        isActive
          ? 'text-brand-gold'
          : 'text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold dark:text-gray-100'
      }`}
    >
      {children}
    </LinkComp>
  );
}
