'use client';

import { ChevronDown, Building2, CheckSquare } from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';

interface MobileProjectsAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function MobileProjectsAccordion({
  isOpen,
  onToggle,
  onClose,
}: MobileProjectsAccordionProps) {
  const t = useTranslations('nav');
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onToggle}
        className="text-brand-navy group flex w-full items-center justify-between py-2.5 text-left text-[clamp(15px,4vw,18px)] font-semibold tracking-wide dark:text-gray-100"
      >
        <span>{t('projects')}</span>
        <ChevronDown
          size={18}
          className={`text-brand-gold transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? 'mt-1 grid-rows-[1fr] opacity-100'
            : 'pointer-events-none grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="border-brand-gold/30 flex min-h-0 flex-col gap-2.5 border-l-2 pl-3.5">
          <Link
            href="/projects/current"
            onClick={onClose}
            className="hover:text-brand-gold flex items-center gap-2 py-2 text-[13.5px] font-medium text-gray-600 transition-colors min-[380px]:text-[14.5px] dark:text-gray-400"
          >
            <Building2 size={15} className="text-brand-gold/70" />
            {t('currentProjects')}
          </Link>
          <Link
            href="/projects/completed"
            onClick={onClose}
            className="hover:text-brand-gold flex items-center gap-2 py-2 text-[13.5px] font-medium text-gray-600 transition-colors min-[380px]:text-[14.5px] dark:text-gray-400"
          >
            <CheckSquare size={15} className="text-brand-gold/70" />
            {t('completedProjects')}
          </Link>
        </div>
      </div>
    </div>
  );
}
