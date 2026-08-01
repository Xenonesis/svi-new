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
            ? 'top-2.5 left-1/2 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 rounded-full border border-slate-200/80 bg-white/95 px-6 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:top-3.5 sm:w-auto xl:px-8 xl:py-3.5 dark:border-white/15 dark:bg-slate-950/95 dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
            : h.pathname === '/'
              ? 'top-0 right-0 left-0 rounded-none border-b border-transparent bg-gradient-to-b from-slate-950/85 via-slate-950/45 to-transparent px-4 py-3 md:py-4 xl:px-8'
              : 'top-0 right-0 left-0 rounded-none border-b border-slate-200/60 bg-white/95 px-4 py-2.5 backdrop-blur-md md:py-3 xl:px-8 dark:border-white/10 dark:bg-slate-950/95'
        }`}
      >
        <div
          className={`mx-auto flex items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            h.isScrolled
              ? 'w-full justify-center gap-3 xl:gap-5'
              : 'container justify-between gap-4 xl:gap-8'
          }`}
        >
          {/* Show logo ONLY when not scrolled */}
          {!h.isScrolled && (
            <Link
              href="/"
              className={`group relative inline-flex shrink-0 items-center gap-2 transition-all duration-300 outline-none hover:scale-[1.02] active:scale-[0.98] ${
                h.isHomeTransparent
                  ? 'rounded-2xl border border-white/20 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-md'
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
          )}

          <div className="flex items-center justify-center">
            {/* Desktop Navigation */}
            <div className="hidden xl:block">
              <DesktopNav
                currentPath={h.pathname}
                isHomeTransparent={h.isHomeTransparent && !h.isScrolled}
                lotteryVisible={h.lotteryVisible}
                projectsOpen={h.isProjectsOpen}
                moreOpen={h.isMoreOpen}
                mounted={h.mounted}
                theme={h.theme}
                onProjectsMouseEnter={h.handleMouseEnter}
                onProjectsMouseLeave={h.handleMouseLeave}
                onProjectsClick={h.toggleProjects}
                onMoreMouseEnter={h.handleMoreMouseEnter}
                onMoreMouseLeave={h.handleMoreMouseLeave}
                onMoreClick={h.toggleMore}
                onToggleTheme={h.toggleTheme}
              />
            </div>

            {/* Mobile Navigation */}
            <div className="xl:hidden">
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
        </div>
      </header>
    </>
  );
}
