'use client';

import { useHeaderNavigation } from '@/src/components/layout/useHeaderNavigation';
import Image from 'next/image';
import { Link } from '@/src/i18n/navigation';
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
            ? 'top-2 left-1/2 w-[calc(100%-1rem)] -translate-x-1/2 rounded-full border border-gray-200/80 bg-white/90 px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur-2xl sm:top-4 sm:w-[calc(100%-2rem)] md:py-2.5 xl:w-auto xl:px-6 dark:border-gray-200/80 dark:bg-white/90'
            : h.pathname === '/'
              ? 'top-0 right-0 left-0 rounded-none border-b border-transparent bg-transparent px-4 py-3 md:py-4 xl:px-8'
              : 'top-0 right-0 left-0 rounded-none border-b border-gray-200/50 bg-white/90 px-4 py-2.5 backdrop-blur-md md:py-3 xl:px-8 dark:border-gray-200/50 dark:bg-white/90'
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${h.isScrolled ? 'w-full' : 'container'}`}
        >
          <Link
            href="/"
            className={`group relative inline-flex items-center gap-2 transition-all duration-300 outline-none hover:scale-[1.02] active:scale-[0.98] ${
              h.isHomeTransparent
                ? 'rounded-xl bg-white px-2.5 py-1 shadow-sm'
                : h.isMobileMenuOpen
                  ? 'max-xl:pointer-events-none max-xl:opacity-0'
                  : ''
            }`}
            aria-label="SVI Infra Solutions Pvt. Ltd."
          >
            <Image
              src="/logo.png"
              alt="SVI Infra Solutions Pvt. Ltd."
              width={282}
              height={83}
              quality={100}
              priority
              className="h-8 w-auto object-contain transition-all duration-300 xl:h-9"
            />
          </Link>
          <div className="flex items-center justify-end">
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
        </div>
      </header>
    </>
  );
}
