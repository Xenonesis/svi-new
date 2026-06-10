'use client';

import Link from 'next/link';
import { ProjectDropdown } from './ProjectDropdown';
import LanguageToggle from '@/src/components/LanguageToggle';
import { ThemeToggle } from './ThemeToggle';

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

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Calculators', path: '/calculators' },
  { name: 'Careers', path: '/careers' },
  { name: 'Blog', path: '/blog' },
];

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
      className={`group relative py-1 text-[11px] font-semibold tracking-widest uppercase transition-colors duration-200 ${
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

export function DesktopNav({
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
  return (
    <nav className="hidden items-center gap-8 lg:flex">
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.name}
          href={link.path}
          isActive={currentPath === link.path}
          isHomeTransparent={isHomeTransparent}
        >
          {link.name}
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
        Payment
      </NavLink>

      <NavLink
        href="/contact"
        isActive={currentPath === '/contact'}
        isHomeTransparent={isHomeTransparent}
      >
        Contact
      </NavLink>

      {/* Lucky Draw Button */}
      {lotteryVisible && (
        <Link
          href="/lottery"
          className={`border-brand-gold/30 hover:bg-brand-gold/10 hover:border-brand-gold rounded-full border px-3 py-1 text-[11px] font-semibold tracking-widest uppercase transition-colors duration-200 ${
            currentPath === '/lottery'
              ? 'text-brand-gold border-brand-gold bg-brand-gold/5'
              : 'text-brand-gold/80 hover:text-brand-gold'
          }`}
          aria-label="Lucky Draw"
        >
          Lucky Draw
        </Link>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4 border-l border-gray-200 pl-6 dark:border-zinc-800">
        <Link
          href="/login"
          className={`group/login relative py-1 text-[11px] font-semibold tracking-widest uppercase transition-all duration-200 ${
            isHomeTransparent
              ? 'hover:text-brand-gold text-white/95'
              : 'text-brand-navy hover:text-brand-gold dark:text-gray-200'
          }`}
        >
          Client Login
          <span className="bg-brand-gold absolute bottom-0 left-0 h-[1.5px] w-0 transition-all duration-300 group-hover/login:w-full" />
        </Link>
        <Link
          href="/registration"
          className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy relative overflow-hidden rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-widest text-white uppercase transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
        >
          Register
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
}
