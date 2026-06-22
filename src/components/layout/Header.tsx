'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useHeaderNavigation } from '@/src/components/layout/useHeaderNavigation';
import { DesktopNav } from '@/src/components/layout/DesktopNav';
import { MobileNav } from '@/src/components/layout/MobileNav';

export default function Header() {
  const h = useHeaderNavigation();

  return (
    <>
      {/* Vercel trigger update */}
      <header
        className={`fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          h.isScrolled
            ? 'dark:border-zinc-850/60 top-2 left-1/2 w-[calc(100%-1rem)] -translate-x-1/2 rounded-full border border-white/40 bg-white/80 px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:top-4 sm:w-[calc(100%-2rem)] md:py-2.5 xl:w-auto dark:bg-zinc-950/80'
            : h.pathname === '/'
              ? 'top-0 right-0 left-0 rounded-none border-b border-transparent bg-transparent px-4 py-3 md:py-4 xl:px-8'
              : 'border-gray-150/40 dark:border-zinc-850/30 top-0 right-0 left-0 rounded-none border-b bg-white/75 px-4 py-2.5 backdrop-blur-md md:py-3 xl:px-8 dark:bg-zinc-950/75'
        }`}
      >
        <div
          ref={h.sentinelRef}
          className="pointer-events-none absolute top-0 left-0 h-px w-px"
          aria-hidden="true"
        />
        <div
          className={`mx-auto flex items-center justify-between ${h.isScrolled ? 'w-full' : 'container'}`}
        >
          {/* Logo */}
          <Link
            href="/"
            className={`z-50 flex items-center gap-3 transition-transform duration-300 hover:scale-102 ${h.isScrolled ? 'mr-4' : ''}`}
          >
            <Image
              src="/logo.png"
              alt="SVI Infra Solutions Logo"
              width={282}
              height={83}
              priority
              quality={100}
              className={`w-auto max-w-[130px] object-contain transition-all duration-500 min-[380px]:max-w-[170px] sm:max-w-none dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] ${
                h.isScrolled
                  ? 'h-[20px] min-[380px]:h-[22px] sm:h-[24px] md:h-[26px]'
                  : 'h-[26px] min-[380px]:h-[28px] sm:h-[32px] md:h-[36px]'
              } ${h.isHomeTransparent && !h.isScrolled ? 'brightness-0 invert' : ''}`}
            />
          </Link>

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
