'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageToggle from '@/src/components/ui/LanguageToggle';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';

interface MobileDrawerHeaderProps {
  theme: 'dark' | 'light' | 'system';
  mounted: boolean;
  onToggleTheme: () => void;
  onClose: () => void;
}

export function MobileDrawerHeader({
  theme,
  mounted,
  onToggleTheme,
  onClose,
}: MobileDrawerHeaderProps) {
  const t = useTranslations('nav');
  return (
    <div className="absolute top-5 right-5 left-5 flex items-center justify-end">
      <div className="flex items-center gap-2.5">
        <LanguageToggle />
        <ThemeToggle theme={theme} mounted={mounted} onToggle={onToggleTheme} variant="mobile" />
        <button
          onClick={onClose}
          className="border-gray-150 text-brand-navy rounded-full border bg-gray-50/70 p-2 transition-all duration-300 hover:bg-gray-100 dark:border-white/15 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20"
          aria-label={t('closeMenu')}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
