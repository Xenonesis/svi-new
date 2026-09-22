'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X } from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import { defaultAnnouncementConfig, type AnnouncementConfig } from '@/src/config/announcement';

const STORAGE_DISMISS_KEY = 'svi_announcement_dismissed_v1';

export default function AnnouncementBar() {
  const [config, setConfig] = useState<AnnouncementConfig>(defaultAnnouncementConfig);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage dismissal
    try {
      const dismissed = sessionStorage.getItem(STORAGE_DISMISS_KEY);
      if (dismissed === 'true') {
        return;
      }
    } catch {
      // ignore storage access errors
    }

    // Try fetching dynamic settings from /api/announcement endpoint
    let isMounted = true;
    const loadDynamicSettings = async () => {
      try {
        const res = await fetch('/api/announcement');
        if (res.ok) {
          const json = await res.json();
          if (json?.value && isMounted) {
            const parsed = typeof json.value === 'string' ? JSON.parse(json.value) : json.value;
            setConfig({
              ...defaultAnnouncementConfig,
              ...parsed,
            });
            if (parsed.enabled !== false) {
              setIsVisible(true);
            }
            return;
          }
        }
      } catch {
        // Fallback to default config silently
      }

      if (isMounted && defaultAnnouncementConfig.enabled) {
        setIsVisible(true);
      }
    };

    loadDynamicSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(STORAGE_DISMISS_KEY, 'true');
    } catch {
      // ignore
    }
  };

  if (!isVisible || !config.enabled) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Announcement"
          className="relative z-50 w-full overflow-hidden border-b border-[#d4af37]/25 bg-[#070b14]/95 text-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-md"
        >
          {/* Subtle luminous gold line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />

          <div className="relative mx-auto flex min-h-[38px] max-w-7xl items-center justify-between px-3 py-1.5 sm:px-6">
            {/* Pulsing indicator dot / Star badge */}
            <div className="flex flex-1 items-center justify-center gap-2 overflow-hidden text-center text-[11px] sm:text-xs md:gap-3 md:text-[13px]">
              {config.badgeText && (
                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#d4af37]/35 bg-[#d4af37]/15 px-2.5 py-0.5 font-bold tracking-wider text-[#f5d77f] uppercase shadow-xs ring-1 ring-[#d4af37]/20 backdrop-blur-xs">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4af37] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                  </span>
                  <span className="text-[10px] font-bold">{config.badgeText}</span>
                </div>
              )}

              {/* Text content & Action Link */}
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 font-medium tracking-wide text-slate-200">
                <span className="max-w-[260px] truncate font-mono text-[11px] tracking-tight text-slate-200 uppercase sm:max-w-none sm:font-sans sm:text-xs sm:tracking-normal md:text-[13px]">
                  {config.text}
                </span>
                <span className="hidden text-[#d4af37]/50 sm:inline">—</span>
                {config.isExternal ? (
                  <a
                    href={config.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 font-bold tracking-wider text-[#f5d77f] uppercase underline decoration-[#d4af37]/40 underline-offset-4 transition-all duration-200 hover:text-white hover:decoration-[#d4af37] hover:underline-offset-2"
                  >
                    <span>{config.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                ) : (
                  <Link
                    href={config.actionUrl}
                    className="group inline-flex items-center gap-1.5 font-bold tracking-wider text-[#f5d77f] uppercase underline decoration-[#d4af37]/40 underline-offset-4 transition-all duration-200 hover:text-white hover:decoration-[#d4af37] hover:underline-offset-2"
                  >
                    <span>{config.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
            </div>

            {/* Dismiss button */}
            {config.dismissible && (
              <button
                type="button"
                onClick={handleDismiss}
                className="ml-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-[#d4af37]/40 focus:outline-none"
                aria-label="Dismiss announcement"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent" />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
