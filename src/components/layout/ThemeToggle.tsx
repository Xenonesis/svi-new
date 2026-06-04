'use client';

import { Moon, Sun, Monitor } from 'lucide-react';

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
  const desktopBase =
    'text-brand-navy hover:border-brand-gold hover:text-brand-gold dark:hover:text-brand-gold border-gray-200/60 bg-gray-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-gray-200';
  const desktopTransparent =
    'hover:border-brand-gold hover:text-brand-gold border-white/20 bg-white/10 text-white/90';
  const mobileBase =
    'border-gray-150 text-brand-navy bg-gray-50/70 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-gray-200';

  const variantClass =
    variant === 'desktop' ? (isHomeTransparent ? desktopTransparent : desktopBase) : mobileBase;

  return (
    <button
      onClick={onToggle}
      className={`flex items-center justify-center rounded-full border p-2 transition-all duration-300 hover:shadow-sm ${variantClass}`}
      aria-label={
        mounted
          ? theme === 'dark'
            ? 'Switch to system mode'
            : theme === 'light'
              ? 'Switch to dark mode'
              : 'Switch to light mode'
          : 'Toggle theme'
      }
    >
      {mounted ? (
        theme === 'dark' ? (
          <Sun
            size={variant === 'desktop' ? 16 : 15}
            className="transition-transform duration-500 hover:rotate-45"
          />
        ) : theme === 'light' ? (
          <Moon
            size={variant === 'desktop' ? 16 : 15}
            className="transition-transform duration-500 hover:-rotate-12"
          />
        ) : (
          <Monitor
            size={variant === 'desktop' ? 16 : 15}
            className="transition-transform duration-500 hover:scale-105"
          />
        )
      ) : (
        <Moon size={variant === 'desktop' ? 16 : 15} />
      )}
    </button>
  );
}
