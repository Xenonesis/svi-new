'use client';

import { memo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ProjectDropdown } from './ProjectDropdown';
import LanguageToggle from '@/src/components/ui/LanguageToggle';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';
import { NAV_LINKS } from './navLinks';

interface DesktopNavProps {
  currentPath: string;
  isHomeTransparent: boolean;
  lotteryVisible: boolean;
  projectsOpen: boolean;
  mounted: boolean;
  theme: 'dark' | 'light' | 'system';
  onProjectsMouseEnter: () => void;
  onProjectsMouseLeave: () => void;
  onProjectsClick: () => void;
  onToggleTheme: () => void;
}

function NavLink({
  href,
  children,
  isActive,
  isHomeTransparent,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  isHomeTransparent: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative py-1 text-[clamp(9px,0.75vw,13px)] font-semibold tracking-wide uppercase transition-colors duration-200 xl:tracking-widest ${
        isActive
          ? 'text-brand-gold'
          : isHomeTransparent
            ? 'hover:text-brand-gold text-white/95'
            : 'text-brand-navy hover:text-brand-gold dark:text-gray-200'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      <span
        className={`bg-brand-gold absolute -bottom-0.5 left-1/2 h-[1.5px] -translate-x-1/2 transition-all duration-300 ease-out ${
          isActive ? 'w-full' : 'w-0 group-hover:w-full'
        }`}
      />
    </Link>
  );
}

const DesktopNav = memo(function DesktopNav({
  currentPath,
  isHomeTransparent,
  lotteryVisible,
  projectsOpen,
  mounted,
  theme,
  onProjectsMouseEnter,
  onProjectsMouseLeave,
  onProjectsClick,
  onToggleTheme,
}: DesktopNavProps) {
  const t = useTranslations('nav');
  return (
    <nav className="hidden items-center xl:flex xl:gap-2 2xl:gap-5">
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.nameKey}
          href={link.path}
          isActive={currentPath === link.path}
          isHomeTransparent={isHomeTransparent}
        >
          {t(link.nameKey)}
        </NavLink>
      ))}

      {/* Projects Dropdown */}
      <ProjectDropdown
        isOpen={projectsOpen}
        currentPath={currentPath}
        isHomeTransparent={isHomeTransparent}
        onMouseEnter={onProjectsMouseEnter}
        onMouseLeave={onProjectsMouseLeave}
        onClick={onProjectsClick}
      />

      <NavLink
        href="/payment"
        isActive={currentPath === '/payment'}
        isHomeTransparent={isHomeTransparent}
      >
        {t('payment')}
      </NavLink>

      <NavLink
        href="/contact"
        isActive={currentPath === '/contact'}
        isHomeTransparent={isHomeTransparent}
      >
        {t('contact')}
      </NavLink>

      {/* Lucky Draw Button */}
      {lotteryVisible && (
        <Link
          href="/lottery"
          className={`border-brand-gold/30 hover:bg-brand-gold/10 hover:border-brand-gold rounded-full border px-2 py-1.5 text-[clamp(9px,0.75vw,13px)] font-semibold tracking-wide uppercase transition-colors duration-200 xl:px-4 xl:tracking-widest ${
            currentPath === '/lottery'
              ? 'text-brand-gold border-brand-gold bg-brand-gold/5'
              : 'text-brand-gold/80 hover:text-brand-gold'
          }`}
          aria-label={t('luckyDraw')}
        >
          {t('luckyDraw')}
        </Link>
      )}

      {/* Action Buttons */}
      <div className="flex items-center border-l border-gray-200 lg:gap-2 lg:pl-3 xl:gap-4 xl:pl-6 dark:border-zinc-800">
        <Link
          href="/login"
          className={`group/login relative py-1 text-[clamp(9px,0.75vw,13px)] font-semibold tracking-wide uppercase transition-all duration-200 xl:tracking-widest ${
            isHomeTransparent
              ? 'hover:text-brand-gold text-white/95'
              : 'text-brand-navy hover:text-brand-gold dark:text-gray-200'
          }`}
        >
          {t('clientLogin')}
          <span className="bg-brand-gold absolute bottom-0 left-0 h-[1.5px] w-0 transition-all duration-300 group-hover/login:w-full" />
        </Link>
        <Link
          href="/registration"
          className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy relative overflow-hidden rounded-full px-3 py-1.5 text-[clamp(9px,0.75vw,13px)] font-semibold tracking-wide text-white uppercase transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 xl:px-5 xl:tracking-widest"
        >
          {t('register')}
        </Link>
      </div>

      {/* Language Toggle */}
      <LanguageToggle />

      {/* Theme Toggle */}
      <ThemeToggle
        theme={theme}
        mounted={mounted}
        onToggle={onToggleTheme}
        variant="desktop"
        isHomeTransparent={isHomeTransparent}
      />
    </nav>
  );
});

export { DesktopNav };
