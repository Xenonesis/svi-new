'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/src/i18n/navigation';
import { Globe, Loader2 } from 'lucide-react';
import { useTransition, useEffect, useRef } from 'react';

export default function LanguageToggle({ isHomeTransparent }: { isHomeTransparent?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pendingScrollY = useRef<number | null>(null);

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'hi' : 'en';
    const currentY = typeof window !== 'undefined' ? window.scrollY : 0;
    pendingScrollY.current = currentY;

    // Save scroll position in sessionStorage as a fallback across route mounts
    try {
      sessionStorage.setItem('svi_lang_scroll_y', String(currentY));
    } catch {
      // sessionStorage unavailable (private mode)
    }

    // Disable default browser scroll restoration temporarily
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 1. Instantly update cookie so client and server remain synchronized
    if (typeof document !== 'undefined') {
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }

    // 2. Preserve search query parameters and hash fragments
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const targetPath = `${pathname}${search}${hash}`;

    // 3. Perform seamless client transition with scroll: false
    startTransition(() => {
      router.replace(targetPath, { locale: nextLocale, scroll: false });
    });
  };

  // Restore exact scroll position after transition completes or locale changes
  useEffect(() => {
    let savedY: number | null = pendingScrollY.current;
    if (savedY === null) {
      try {
        const val = sessionStorage.getItem('svi_lang_scroll_y');
        if (val !== null) {
          savedY = parseInt(val, 10);
        }
      } catch {
        // sessionStorage unavailable
      }
    }

    if (savedY !== null && !isNaN(savedY) && savedY > 0) {
      const targetY = savedY;
      const restore = () => {
        window.scrollTo(0, targetY);
      };

      restore();
      const raf1 = requestAnimationFrame(restore);
      const raf2 = requestAnimationFrame(() => requestAnimationFrame(restore));
      const timer = setTimeout(() => {
        restore();
        try {
          sessionStorage.removeItem('svi_lang_scroll_y');
        } catch {
          // sessionStorage unavailable
        }
        pendingScrollY.current = null;
        if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'auto';
        }
      }, 150);

      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        clearTimeout(timer);
      };
    }
  }, [locale]);

  return (
    <button
      type="button"
      onClick={toggleLocale}
      disabled={isPending}
      className={`3xl:text-sm flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 xl:px-3.5 xl:py-2 xl:text-[12.5px] 2xl:text-[13.5px] ${
        isPending ? 'opacity-80' : ''
      } ${
        isHomeTransparent
          ? 'border-white/30 bg-black/40 text-white backdrop-blur-sm hover:border-amber-400 hover:text-amber-400'
          : 'border-slate-200/80 bg-slate-100/80 text-slate-800 hover:border-amber-400 hover:text-amber-500 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:border-amber-400 dark:hover:text-amber-400'
      }`}
      aria-label={locale === 'en' ? 'Switch to Hindi' : 'Switch to English'}
      title={locale === 'en' ? 'Switch to Hindi' : 'Switch to English'}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
      ) : (
        <Globe className="h-3.5 w-3.5" />
      )}
      <span>{locale === 'en' ? 'HI' : 'EN'}</span>
    </button>
  );
}
