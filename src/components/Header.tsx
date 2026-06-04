'use client';

import Link from 'next/link';
import { useHeaderNavigation } from '@/src/components/layout/useHeaderNavigation';
import { DesktopNav } from '@/src/components/layout/DesktopNav';
import { MobileNav } from '@/src/components/layout/MobileNav';

export default function Header() {
  const h = useHeaderNavigation();

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          h.isScrolled
            ? 'dark:border-zinc-850/50 border-b border-white/20 bg-white/75 py-3 shadow-lg shadow-zinc-950/5 backdrop-blur-xl dark:bg-zinc-950/75'
            : h.pathname === '/'
              ? 'border-b border-transparent bg-transparent py-4.5'
              : 'border-gray-150/40 dark:border-zinc-850/30 border-b bg-white/75 py-4.5 backdrop-blur-md dark:bg-zinc-950/75'
        }`}
      >
        <div
          ref={h.sentinelRef}
          className="pointer-events-none absolute top-0 left-0 h-px w-px"
          aria-hidden="true"
        />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="z-50 flex items-center gap-3 transition-transform duration-300 hover:scale-102"
            >
              <img
                src="/logo.png"
                alt="SVI Infra Solutions Logo"
                className={`h-8.5 w-auto max-w-[130px] object-contain transition-all duration-300 min-[380px]:h-10 min-[380px]:max-w-[170px] sm:h-12 sm:max-w-none md:h-14 ${
                  h.isHomeTransparent ? 'brightness-0 invert' : 'dark:brightness-0 dark:invert'
                }`}
              />
            </Link>

            {/* Desktop Navigation */}
            <DesktopNav
              currentPath={h.pathname}
              isHomeTransparent={h.isHomeTransparent}
              lotteryVisible={h.lotteryVisible}
              projectsOpen={h.isProjectsOpen}
              mounted={h.mounted}
              theme={h.theme}
              onProjectsMouseEnter={h.handleMouseEnter}
              onProjectsMouseLeave={h.handleMouseLeave}
              onProjectsClick={h.toggleProjects}
              onToggleTheme={h.toggleTheme}
            />

            {/* Mobile Navigation */}
            <MobileNav
              isOpen={h.isMobileMenuOpen}
              isProjectsOpen={h.isMobileProjectsOpen}
              currentPath={h.pathname}
              lotteryVisible={h.lotteryVisible}
              mounted={h.mounted}
              theme={h.theme}
              onClose={h.closeMobileMenu}
              onToggle={h.toggleMobileMenu}
              onToggleProjects={h.toggleMobileProjects}
              onToggleTheme={h.toggleTheme}
            />
          </div>
        </div>
      </header>
    </>
  );
}
