'use client';

import { useHeaderNavigation } from '@/src/components/layout/useHeaderNavigation';
import { DesktopNav } from '@/src/components/layout/DesktopNav';
import { MobileNav } from '@/src/components/layout/MobileNav';

export default function Header() {
  const h = useHeaderNavigation();

  return (
    <>
      <header
        suppressHydrationWarning
        className={`fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          h.isScrolled
            ? 'top-2 left-1/2 w-[calc(100%-1rem)] -translate-x-1/2 rounded-full border border-gray-200/50 bg-white/80 px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:top-4 sm:w-[calc(100%-2rem)] md:py-2.5 xl:w-auto xl:px-6 dark:border-white/10 dark:bg-zinc-950/80'
            : h.pathname === '/'
              ? 'top-0 right-0 left-0 rounded-none border-b border-transparent bg-transparent px-4 py-3 md:py-4 xl:px-8'
              : 'top-0 right-0 left-0 rounded-none border-b border-gray-200/40 bg-white/75 px-4 py-2.5 backdrop-blur-md md:py-3 xl:px-8 dark:border-zinc-800/30 dark:bg-zinc-950/75'
        }`}
      >
        <div
          ref={h.sentinelRef}
          className="pointer-events-none absolute top-0 left-0 h-px w-px"
          aria-hidden="true"
        />
        <div
          className={`mx-auto flex items-center justify-end ${h.isScrolled ? 'w-full' : 'container'}`}
        >
          {/* Desktop Navigation */}
          <DesktopNav
            currentPath={h.pathname}
            isHomeTransparent={h.isHomeTransparent && !h.isScrolled}
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
      </header>
    </>
  );
}
