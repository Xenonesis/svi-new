'use client';

import { Link } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';

interface MobileNavActionsProps {
  onClose: () => void;
}

export function MobileNavActions({ onClose }: MobileNavActionsProps) {
  const t = useTranslations('nav');
  return (
    <>
      <Link
        href="/login"
        onClick={onClose}
        className="border-brand-navy dark:border-brand-gold/45 text-brand-navy dark:text-brand-gold block w-full rounded-full border py-2.5 text-center text-[clamp(12px,3.5vw,14px)] font-semibold tracking-widest uppercase transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900"
      >
        {t('clientLogin')}
      </Link>
      <Link
        href="/registration"
        onClick={onClose}
        className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy block w-full rounded-full py-2.5 text-center text-[clamp(12px,3.5vw,14px)] font-semibold tracking-widest text-white uppercase"
      >
        {t('registerNow')}
      </Link>
    </>
  );
}
