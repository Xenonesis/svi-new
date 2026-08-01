'use client';

import { ChevronDown, Calculator, Briefcase, FileText, CreditCard } from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';

interface MoreDropdownProps {
  isOpen: boolean;
  currentPath: string;
  isHomeTransparent: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

const MORE_ITEMS = [
  {
    path: '/calculators',
    nameKey: 'calculators',
    descKey: 'calculatorsDesc',
    icon: Calculator,
  },
  {
    path: '/careers',
    nameKey: 'careers',
    descKey: 'careersDesc',
    icon: Briefcase,
  },
  {
    path: '/blog',
    nameKey: 'blog',
    descKey: 'blogDesc',
    icon: FileText,
  },
  {
    path: '/payment',
    nameKey: 'payment',
    descKey: 'paymentDesc',
    icon: CreditCard,
  },
] as const;

export function MoreDropdown({
  isOpen,
  currentPath,
  isHomeTransparent,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: MoreDropdownProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const isHi = locale === 'hi';
  const isMoreActive = MORE_ITEMS.some((item) => currentPath.startsWith(item.path));

  return (
    <div
      className="group relative cursor-pointer py-1"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <span
        className={`flex items-center gap-1 font-semibold whitespace-nowrap uppercase transition-colors duration-200 ${
          isHi
            ? '3xl:text-base text-[13px] tracking-wide xl:text-[14.5px] 2xl:text-[15.5px]'
            : '3xl:text-sm text-[11px] tracking-wide xl:text-[12.5px] xl:tracking-wider 2xl:text-[13.5px] 2xl:tracking-widest'
        } ${
          isMoreActive
            ? 'text-amber-400'
            : isHomeTransparent
              ? 'text-white/95 hover:text-amber-400'
              : 'text-slate-800 hover:text-amber-500 dark:text-slate-100 dark:hover:text-amber-400'
        }`}
      >
        {t('more')}{' '}
        <ChevronDown
          size={14}
          className="transition-transform duration-300 group-hover:rotate-180"
        />
      </span>

      <div
        className={`absolute top-full left-1/2 w-80 -translate-x-1/2 pt-2 transition-all duration-300 ${
          isOpen
            ? 'pointer-events-auto visible translate-y-0 opacity-100'
            : 'pointer-events-none invisible translate-y-2 opacity-0'
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95">
          {MORE_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group/item flex items-start gap-3 rounded-xl p-2.5 transition-all duration-200 ${
                  isActive ? 'bg-amber-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-500 transition-colors group-hover/item:bg-slate-900 group-hover/item:text-white dark:group-hover/item:bg-amber-400 dark:group-hover/item:text-slate-950">
                  <Icon size={15} />
                </div>
                <div>
                  <div
                    className={`font-semibold text-slate-900 uppercase transition-colors group-hover/item:text-amber-500 dark:text-slate-100 ${
                      isHi ? 'text-[13.5px] tracking-wide' : 'text-[11px] tracking-widest'
                    }`}
                  >
                    {t(item.nameKey)}
                  </div>
                  <div
                    className={`mt-0.5 leading-relaxed text-gray-500 dark:text-gray-400 ${
                      isHi ? 'text-[12px]' : 'text-[9.5px]'
                    }`}
                  >
                    {t(item.descKey)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
