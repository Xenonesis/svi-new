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
    'border-slate-200/80 bg-slate-100/80 text-slate-800 hover:border-amber-400 hover:text-amber-500 dark:border-white/15 dark:bg-white/10 dark:text-amber-400 dark:hover:bg-white/20';
  const desktopTransparent =
    'hover:border-amber-400 hover:text-amber-400 border-white/30 bg-black/40 text-white backdrop-blur-sm';
  const mobileBase =
    'border-slate-200/80 bg-slate-100/80 text-slate-800 dark:border-white/15 dark:bg-white/10 dark:text-amber-400';

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
            className="text-slate-700 transition-transform duration-500 hover:-rotate-12 dark:text-amber-400"
          />
        ) : (
          <Monitor
            size={variant === 'desktop' ? 16 : 15}
            className="text-amber-400 transition-transform duration-500 hover:scale-110"
          />
        )
      ) : (
        <Moon size={variant === 'desktop' ? 16 : 15} />
      )}
    </button>
  );
}
