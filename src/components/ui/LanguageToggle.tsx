'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/src/i18n/navigation';
import { Globe, Loader2 } from 'lucide-react';
import { useTransition, useEffect, useRef } from 'react';

export default function LanguageToggle({ isHomeTransparent }: { isHomeTransparent?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  // next-intl pathname: already stripped of the locale prefix.
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const savedYRef = useRef<number | null>(null);

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'hi' : 'en';
    const currentY = typeof window !== 'undefined' ? window.scrollY : 0;
    savedYRef.current = currentY;

    if (typeof window !== 'undefined') {
      // 1. Lock body minHeight to prevent page height collapse during React DOM swap
      const currentHeight = document.documentElement.scrollHeight;
      document.body.style.minHeight = `${currentHeight}px`;

      // 2. Disable browser auto scroll restoration
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }

      // 3. Save scroll position in sessionStorage as fallback
      try {
        sessionStorage.setItem('svi_lang_scroll_y', String(currentY));
      } catch {
        // sessionStorage unavailable
      }
    }

    // 4. Keep the NEXT_LOCALE cookie in sync so locale detection on
    //    unprefixed (English) routes matches the user's last choice.
    if (typeof document !== 'undefined') {
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }

    // 5. Navigate to the same page in the other locale. With
    //    `localePrefix: 'as-needed'` this swaps between `/path` (en) and
    //    `/hi/path` — both are real, indexable URLs.
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  // Restore scroll position and unlock minHeight after locale updates
  useEffect(() => {
    let targetY = savedYRef.current;
    if (targetY === null && typeof window !== 'undefined') {
      try {
        const val = sessionStorage.getItem('svi_lang_scroll_y');
        if (val !== null) targetY = parseInt(val, 10);
      } catch {
        // sessionStorage unavailable
      }
    }

    if (targetY !== null && !isNaN(targetY) && targetY > 0) {
      const y = targetY;
      const restore = () => {
        window.scrollTo(0, y);
      };

      restore();
      const raf1 = requestAnimationFrame(restore);
      const raf2 = requestAnimationFrame(() => requestAnimationFrame(restore));

      const timer = setTimeout(() => {
        restore();
        if (typeof document !== 'undefined') {
          document.body.style.minHeight = '';
        }
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'auto';
        }
        try {
          sessionStorage.removeItem('svi_lang_scroll_y');
        } catch {
          // sessionStorage unavailable
        }
        savedYRef.current = null;
      }, 300);

      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        clearTimeout(timer);
      };
    } else {
      if (typeof document !== 'undefined') {
        document.body.style.minHeight = '';
      }
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
