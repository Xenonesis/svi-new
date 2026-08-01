'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface HamburgerButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function HamburgerButton({ isOpen, onToggle }: HamburgerButtonProps) {
  const t = useTranslations('nav');
  return (
    <div className="flex items-center gap-3 xl:hidden">
      <button
        className="bg-brand-navy hover:bg-brand-navy-light dark:bg-brand-navy flex items-center justify-center rounded-full p-2 text-white shadow-sm transition-colors dark:text-white"
        onClick={onToggle}
        aria-label={isOpen ? t('closeMenu') : t('openMenu')}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <Menu size={20} />
      </button>
    </div>
  );
}
