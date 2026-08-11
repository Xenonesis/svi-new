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
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#121929]/90 text-white shadow-md transition-all duration-300 hover:bg-white/15 active:scale-95 dark:border-white/15 dark:bg-[#121929]/95"
        onClick={onToggle}
        aria-label={isOpen ? t('closeMenu') : t('openMenu')}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <Menu size={20} strokeWidth={2.2} />
      </button>
    </div>
  );
}
