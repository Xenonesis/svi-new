'use client';

import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

export function FooterNewsletter() {
  const t = useTranslations('footer');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 3000);
      }
    },
    [email]
  );

  return (
    <form
      onSubmit={handleNewsletterSubmit}
      className="relative flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:w-auto"
      aria-label="Newsletter subscription"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        {t('enterEmail')}
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('enterEmail')}
        aria-label={t('enterEmail')}
        className="text-brand-navy focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors focus:outline-none sm:w-56 md:w-64 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        required
      />
      <button
        type="submit"
        className="bg-brand-gold text-brand-navy hover:bg-brand-navy hover:text-brand-gold border-brand-gold relative flex w-full items-center justify-center gap-2 overflow-hidden border px-6 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] sm:w-auto"
      >
        {subscribed ? (
          <span>{t('done')}</span>
        ) : (
          <span className="flex items-center gap-2">
            <Send size={14} /> {t('subscribe')}
          </span>
        )}
      </button>
    </form>
  );
}

export default FooterNewsletter;
