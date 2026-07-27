'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ThemeToggleProps {
  theme: 'dark' | 'light' | 'system';
  mounted: boolean;
  onToggle: () => void;
  variant?: 'desktop' | 'mobile';
  isHomeTransparent?: boolean;
}

export function ThemeToggle({
  theme,
  mounted,
  onToggle,
  variant = 'desktop',
  isHomeTransparent,
}: ThemeToggleProps) {
  const t = useTranslations('common');
  const desktopBase =
    'text-brand-navy hover:border-brand-gold hover:text-brand-gold dark:hover:text-brand-gold border-gray-200/60 bg-gray-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-gray-200';
  const desktopTransparent =
    'hover:border-brand-gold hover:text-brand-gold border-white/20 bg-white/10 text-white/90';
  const mobileBase =
    'border-gray-150 text-brand-navy bg-gray-50/70 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-gray-200';

  const variantClass =
    variant === 'desktop' ? (isHomeTransparent ? desktopTransparent : desktopBase) : mobileBase;

  const getThemeLabel = () => {
    if (!mounted) return 'Toggle Theme';
    if (theme === 'dark') return 'Dark Mode (Click for System)';
    if (theme === 'light') return 'Light Mode (Click for Dark)';
    return 'System Mode (Click for Light)';
  };

  return (
    <button
      onClick={onToggle}
      className={`group relative flex items-center justify-center rounded-full border p-2 transition-all duration-300 hover:shadow-sm ${variantClass}`}
      title={getThemeLabel()}
      aria-label={
        mounted
          ? theme === 'dark'
            ? t('switchToSystem')
            : theme === 'light'
              ? t('switchToDark')
              : t('switchToLight')
          : t('toggleTheme')
      }
    >
      {mounted ? (
        theme === 'dark' ? (
          <Sun
            size={variant === 'desktop' ? 16 : 15}
            className="text-amber-400 transition-transform duration-500 hover:rotate-90"
          />
        ) : theme === 'light' ? (
          <Moon
            size={variant === 'desktop' ? 16 : 15}
            className="text-slate-700 transition-transform duration-500 hover:-rotate-12 dark:text-slate-200"
          />
        ) : (
          <Monitor
            size={variant === 'desktop' ? 16 : 15}
            className="text-brand-gold transition-transform duration-500 hover:scale-110"
          />
        )
      ) : (
        <Moon size={variant === 'desktop' ? 16 : 15} />
      )}
    </button>
  );
}
