'use client';

import { Phone, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PHONE_HREF } from '@/src/lib/constants';

export function MobileNavFooter() {
  const tc = useTranslations('common');
  return (
    <>
      <p className="text-brand-gold text-[10px] font-bold tracking-widest uppercase">
        {tc('siteName')}
      </p>
      <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
        {tc('tagline')?.includes('Premium') ? tc('tagline') : (tc('subBrand') ?? '')}
      </p>
      <div className="mt-3.5 flex flex-col gap-2">
        <a
          href={PHONE_HREF}
          className="hover:text-brand-gold flex items-center gap-2 text-xs font-medium text-gray-600 transition-colors dark:text-gray-300"
        >
          <Phone size={13} className="text-brand-gold" />
          +91-73000-07643
        </a>
        <a
          href="mailto:info@sviinfrasolutions.com"
          className="hover:text-brand-gold flex items-center gap-2 text-xs font-medium text-gray-600 transition-colors dark:text-gray-300"
        >
          <Mail size={13} className="text-brand-gold" />
          info@sviinfrasolutions.com
        </a>
      </div>
    </>
  );
}
