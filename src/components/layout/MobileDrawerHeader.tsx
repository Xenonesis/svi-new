'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/src/i18n/navigation';
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
    <div className="absolute top-5 right-5 left-5 flex items-center justify-between gap-2">
      <Link
        href="/"
        onClick={onClose}
        className="inline-flex items-center rounded-xl transition-all duration-300 outline-none dark:bg-white dark:px-2.5 dark:py-1 dark:shadow-sm"
        aria-label="SVI Infra Solutions Pvt. Ltd."
      >
        <Image
          src="/logo.png"
          alt="SVI Infra Solutions Pvt. Ltd."
          width={282}
          height={83}
          quality={100}
          priority
          className="h-7 w-auto object-contain sm:h-8"
        />
      </Link>

      <div className="flex items-center gap-1.5 min-[380px]:gap-2">
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
