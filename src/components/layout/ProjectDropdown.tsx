'use client';

import { ChevronDown, Building2, CheckSquare } from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';

interface ProjectDropdownProps {
  isOpen: boolean;
  currentPath: string;
  isHomeTransparent: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

export function ProjectDropdown({
  isOpen,
  currentPath,
  isHomeTransparent,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: ProjectDropdownProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const isHi = locale === 'hi';
  return (
    <div
      className="group relative cursor-pointer py-1.5 xl:py-2"
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
          currentPath.includes('/projects')
            ? 'text-amber-400'
            : isHomeTransparent
              ? 'text-white/95 hover:text-amber-400'
              : 'text-slate-800 hover:text-amber-500 dark:text-slate-100 dark:hover:text-amber-400'
        }`}
      >
        {t('projects')}{' '}
        <ChevronDown
          size={14}
          className="transition-transform duration-300 group-hover:rotate-180"
        />
      </span>

      <div
        className={`absolute top-full left-1/2 w-72 -translate-x-1/2 pt-2 transition-all duration-300 ${
          isOpen
            ? 'pointer-events-auto visible translate-y-0 opacity-100'
            : 'pointer-events-none invisible translate-y-2 opacity-0'
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95">
          <Link
            href="/projects/current"
            className="group/item flex items-start gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/10"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-500 transition-colors group-hover/item:bg-slate-900 group-hover/item:text-white dark:group-hover/item:bg-amber-400 dark:group-hover/item:text-slate-950">
              <Building2 size={15} />
            </div>
            <div>
              <div
                className={`font-semibold text-slate-900 uppercase transition-colors group-hover/item:text-amber-500 dark:text-slate-100 ${isHi ? 'text-[13.5px] tracking-wide' : 'text-[11px] tracking-widest'}`}
              >
                {t('currentProjects')}
              </div>
              <div
                className={`mt-0.5 leading-relaxed text-gray-500 dark:text-gray-400 ${isHi ? 'text-[12px]' : 'text-[9.5px]'}`}
              >
                {t('currentProjectsDesc')}
              </div>
            </div>
          </Link>
          <Link
            href="/projects/completed"
            className="group/item flex items-start gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/10"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-500 transition-colors group-hover/item:bg-slate-900 group-hover/item:text-white dark:group-hover/item:bg-amber-400 dark:group-hover/item:text-slate-950">
              <CheckSquare size={15} />
            </div>
            <div>
              <div
                className={`font-semibold text-slate-900 uppercase transition-colors group-hover/item:text-amber-500 dark:text-slate-100 ${isHi ? 'text-[13.5px] tracking-wide' : 'text-[11px] tracking-widest'}`}
              >
                {t('completedProjects')}
              </div>
              <div
                className={`mt-0.5 leading-relaxed text-gray-500 dark:text-gray-400 ${isHi ? 'text-[12px]' : 'text-[9.5px]'}`}
              >
                {t('completedProjectsDesc')}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
