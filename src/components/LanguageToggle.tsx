'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/src/i18n/navigation';
import { Globe } from 'lucide-react';
import { useTransition } from 'react';

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'hi' : 'en';
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      aria-label="Switch language"
    >
      <Globe className="h-4 w-4" />
      <span>{locale === 'en' ? 'हिन्दी' : 'English'}</span>
    </button>
  );
}
