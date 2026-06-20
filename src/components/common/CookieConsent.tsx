'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

const CONSENT_KEY = 'svi-cookie-consent-v1';

export default function CookieConsent() {
  const t = useTranslations('cookieConsent');
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const hasConsent = localStorage.getItem(CONSENT_KEY);
    if (!hasConsent) {
      timerRef.current = setTimeout(() => setIsVisible(true), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleAccept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setIsVisible(false);
  }, []);

  const handleDecline = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setIsVisible(false);
  }, []);

  return (
    <div
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row">
        <div className="flex flex-1 items-start gap-3">
          <button
            onClick={handleDecline}
            className="mt-1 shrink-0 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
            aria-label={t('dismiss')}
          >
            <X size={16} />
          </button>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{t('message')}</p>
            <Link
              href="/privacy-policy"
              className="text-brand-gold mt-1 inline-block text-xs hover:underline"
            >
              {t('learnMore')}
            </Link>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={handleDecline}
            className="hover:text-brand-navy px-4 py-2 text-xs font-bold tracking-widest text-gray-500 uppercase transition-colors dark:text-gray-400 dark:hover:text-gray-200"
          >
            {t('decline')}
          </button>
          <button
            onClick={handleAccept}
            className="bg-brand-gold text-brand-navy hover:bg-brand-navy hover:text-brand-gold border-brand-gold border px-6 py-2 text-xs font-bold tracking-widest uppercase transition-colors"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
