'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import { defaultAnnouncementConfig, type AnnouncementConfig } from '@/src/config/announcement';
import { supabase } from '@/src/lib/supabase/client';

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

    // Try fetching dynamic settings from portal_settings in Supabase
    let isMounted = true;
    const loadDynamicSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('portal_settings')
          .select('value')
          .eq('key', 'announcement_bar')
          .single();

        if (!error && data?.value && isMounted) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          setConfig({
            ...defaultAnnouncementConfig,
            ...parsed,
          });
          if (parsed.enabled !== false) {
            setIsVisible(true);
          }
          return;
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

  const ActionLink = () => {
    const linkContent = (
      <span className="inline-flex items-center gap-1.5 font-bold tracking-wider text-slate-950 uppercase underline decoration-slate-950/40 underline-offset-4 transition-all duration-200 group-hover:text-black group-hover:decoration-slate-950 group-hover:underline-offset-2">
        <span>{config.actionText}</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    );

    if (config.isExternal) {
      return (
        <a
          href={config.actionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center"
        >
          {linkContent}
        </a>
      );
    }

    return (
      <Link href={config.actionUrl} className="group inline-flex items-center">
        {linkContent}
      </Link>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Announcement"
          className="relative z-50 w-full overflow-hidden bg-gradient-to-r from-[#4ade80] via-[#22c55e] to-[#a3e635] text-slate-950 shadow-[0_4px_20px_rgba(34,197,94,0.25)] dark:from-[#34d399] dark:via-[#10b981] dark:to-[#84cc16]"
        >
          {/* Subtle luminous highlight line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-white/40" />

          <div className="relative mx-auto flex min-h-[38px] max-w-7xl items-center justify-between px-3 py-1.5 sm:px-6">
            {/* Pulsing indicator dot / Star badge */}
            <div className="flex flex-1 items-center justify-center gap-2 overflow-hidden text-center text-[11px] sm:text-xs md:gap-3 md:text-[13px]">
              <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/10 px-2 py-0.5 font-black tracking-widest text-slate-950 uppercase shadow-xs ring-1 ring-black/10 backdrop-blur-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-950 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-950" />
                </span>
                <Sparkles className="h-3 w-3 fill-slate-950 text-slate-950" />
                <span className="text-[10px] font-bold">{config.badgeText}</span>
              </div>

              {/* Text content & Action Link */}
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 font-semibold tracking-wide text-slate-950">
                <span className="max-w-[260px] truncate font-mono text-[11px] tracking-tight uppercase sm:max-w-none sm:font-sans sm:text-xs sm:tracking-normal md:text-[13px]">
                  {config.text}
                </span>
                <span className="hidden text-slate-950/40 sm:inline">—</span>
                <ActionLink />
              </div>
            </div>

            {/* Dismiss button */}
            {config.dismissible && (
              <button
                type="button"
                onClick={handleDismiss}
                className="ml-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-950/70 transition-colors hover:bg-black/10 hover:text-slate-950 focus:ring-2 focus:ring-slate-950/40 focus:outline-none"
                aria-label="Dismiss announcement"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-black/10" />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
