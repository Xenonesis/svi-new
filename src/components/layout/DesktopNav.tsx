'use client';

import { memo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ProjectDropdown } from './ProjectDropdown';
import LanguageToggle from '@/src/components/ui/LanguageToggle';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';
import { NAV_LINKS } from './navLinks';
import { NavLink } from './NavLink';
import { DesktopNavActions } from './DesktopNavActions';

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
    <nav className="3xl:gap-6 hidden items-center gap-2 xl:flex xl:gap-3 2xl:gap-4">
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
          className={`border-brand-gold/30 hover:bg-brand-gold/10 hover:border-brand-gold 3xl:text-sm rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase transition-colors duration-200 xl:px-4 xl:py-2 xl:text-[12.5px] xl:tracking-wider 2xl:text-[13.5px] 2xl:tracking-widest ${
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
      <DesktopNavActions isHomeTransparent={isHomeTransparent} />

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
