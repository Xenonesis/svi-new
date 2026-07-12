'use client';

import { Link } from '@/src/i18n/navigation';

interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}

export function MobileNavLink({ href, children, isActive }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className={`block py-2.5 text-[clamp(15px,4vw,18px)] font-semibold tracking-wide transition-colors ${
        isActive
          ? 'text-brand-gold'
          : 'text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold dark:text-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}
