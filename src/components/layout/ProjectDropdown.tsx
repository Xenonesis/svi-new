'use client';

import { ChevronDown, Building2, CheckSquare } from 'lucide-react';
import Link from 'next/link';

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
  return (
    <div
      className="group relative cursor-pointer py-1"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <span
        className={`flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase transition-colors duration-200 xl:text-[11px] ${
          currentPath.includes('/projects')
            ? 'text-brand-gold'
            : isHomeTransparent
              ? 'hover:text-brand-gold text-white/95'
              : 'text-brand-navy hover:text-brand-gold dark:text-gray-200'
        }`}
      >
        Projects{' '}
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
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
          <Link
            href="/projects/current"
            className="group/item flex items-start gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
          >
            <div className="bg-brand-gold/10 text-brand-gold group-hover/item:bg-brand-navy dark:group-hover/item:bg-brand-gold dark:group-hover/item:text-brand-navy flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors group-hover/item:text-white">
              <Building2 size={15} />
            </div>
            <div>
              <div className="text-brand-navy group-hover/item:text-brand-gold text-[11px] font-semibold tracking-widest uppercase transition-colors dark:text-gray-100">
                Current Projects
              </div>
              <div className="mt-0.5 text-[9.5px] leading-relaxed text-gray-500 dark:text-gray-300">
                Ongoing developments & infrastructure mappings.
              </div>
            </div>
          </Link>
          <Link
            href="/projects/completed"
            className="group/item flex items-start gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
          >
            <div className="bg-brand-gold/10 text-brand-gold group-hover/item:bg-brand-navy dark:group-hover/item:bg-brand-gold dark:group-hover/item:text-brand-navy flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors group-hover/item:text-white">
              <CheckSquare size={15} />
            </div>
            <div>
              <div className="text-brand-navy group-hover/item:text-brand-gold text-[11px] font-semibold tracking-widest uppercase transition-colors dark:text-gray-100">
                Completed Projects
              </div>
              <div className="mt-0.5 text-[9.5px] leading-relaxed text-gray-500 dark:text-gray-300">
                Landmark properties successfully delivered.
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
