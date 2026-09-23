'use client';

import { memo } from 'react';
import { Link } from '@/src/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ProjectDropdown } from './ProjectDropdown';
import { MoreDropdown } from './MoreDropdown';
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
  moreOpen: boolean;
  mounted: boolean;
  theme: 'dark' | 'light' | 'system';
  onProjectsMouseEnter: () => void;
  onProjectsMouseLeave: () => void;
  onProjectsClick: () => void;
  onMoreMouseEnter: () => void;
  onMoreMouseLeave: () => void;
  onMoreClick: () => void;
  onToggleTheme: () => void;
}

const DesktopNav = memo(function DesktopNav({
  currentPath,
  isHomeTransparent,
  lotteryVisible,
  projectsOpen,
  moreOpen,
  mounted,
  theme,
  onProjectsMouseEnter,
  onProjectsMouseLeave,
  onProjectsClick,
  onMoreMouseEnter,
  onMoreMouseLeave,
  onMoreClick,
  onToggleTheme,
}: DesktopNavProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const isHi = locale === 'hi';

  const homeLink = NAV_LINKS.find((l) => l.path === '/');
  const aboutLink = NAV_LINKS.find((l) => l.path === '/about');
  const offersLink = NAV_LINKS.find((l) => l.path === '/exclusive-offers');

  return (
    <nav className="flex items-center gap-2 xl:gap-3 2xl:gap-3.5">
      {homeLink && (
        <NavLink
          href={homeLink.path}
          isActive={currentPath === homeLink.path}
          isHomeTransparent={isHomeTransparent}
        >
          {t(homeLink.nameKey)}
        </NavLink>
      )}

      {/* Projects Dropdown */}
      <ProjectDropdown
        isOpen={projectsOpen}
        currentPath={currentPath}
        isHomeTransparent={isHomeTransparent}
        onMouseEnter={onProjectsMouseEnter}
        onMouseLeave={onProjectsMouseLeave}
        onClick={onProjectsClick}
      />

      {/* About Us */}
      {aboutLink && (
        <NavLink
          href={aboutLink.path}
          isActive={currentPath === aboutLink.path}
          isHomeTransparent={isHomeTransparent}
        >
          {t(aboutLink.nameKey)}
        </NavLink>
      )}

      {/* Exclusive Offers */}
      {offersLink && (
        <NavLink
          href={offersLink.path}
          isActive={currentPath === offersLink.path}
          isHomeTransparent={isHomeTransparent}
        >
          {t(offersLink.nameKey)}
        </NavLink>
      )}

      {/* More Dropdown (Calculators, Careers, Blog, Payment) */}
      <MoreDropdown
        isOpen={moreOpen}
        currentPath={currentPath}
        isHomeTransparent={isHomeTransparent}
        onMouseEnter={onMoreMouseEnter}
        onMouseLeave={onMoreMouseLeave}
        onClick={onMoreClick}
      />

      {/* Contact */}
      <NavLink
        href="/contact"
        isActive={currentPath === '/contact'}
        isHomeTransparent={isHomeTransparent}
      >
        {t('contact')}
      </NavLink>

      {lotteryVisible && (
        <Link
          href="/lottery"
          className={`relative inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 font-semibold whitespace-nowrap transition-all duration-300 hover:border-amber-400 hover:bg-amber-400/20 xl:px-3 xl:py-1 ${
            isHi ? 'text-[12px] tracking-normal' : 'text-[11px] tracking-normal'
          } ${
            currentPath === '/lottery'
              ? 'border-amber-400 bg-amber-400/20 text-amber-300'
              : 'text-amber-400/90 hover:text-amber-300'
          }`}
          aria-label={t('luckyDraw')}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400"></span>
          </span>
          {t('luckyDraw')}
        </Link>
      )}

      {/* Action Buttons */}
      <DesktopNavActions isHomeTransparent={isHomeTransparent} />

      {/* Language Toggle */}
      <LanguageToggle isHomeTransparent={isHomeTransparent} />

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
