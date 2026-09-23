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
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-white/15 text-white shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-white/25 active:scale-95"
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
