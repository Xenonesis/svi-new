'use client';

import { useHeaderNavigation } from '@/src/components/layout/useHeaderNavigation';
import Image from 'next/image';
import { Link } from '@/src/i18n/navigation';
import { DesktopNav } from '@/src/components/layout/DesktopNav';
import { MobileNav } from '@/src/components/layout/MobileNav';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const h = useHeaderNavigation();

  return (
    <>
      <motion.header
        suppressHydrationWarning
        layout
        transition={{ layout: { type: 'spring', bounce: 0, duration: 0.5 } }}
        className={`fixed z-50 ${
          h.isScrolled
            ? 'top-0 right-0 left-0 rounded-none border-b border-white/10 bg-[#090d16]/90 px-4 py-3 backdrop-blur-xl max-xl:w-full xl:top-3 xl:left-1/2 xl:w-max xl:max-w-[96vw] xl:-translate-x-1/2 xl:rounded-full xl:border xl:border-slate-200/80 xl:bg-white/95 xl:px-8 xl:py-2.5 xl:shadow-[0_10px_35px_rgba(0,0,0,0.15)] dark:xl:border-white/15 dark:xl:bg-slate-950/95 dark:xl:shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
            : h.pathname === '/'
              ? 'top-0 right-0 left-0 rounded-none border-b border-transparent bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent px-4 py-3 md:py-4 xl:px-8'
              : 'top-0 right-0 left-0 rounded-none border-b border-slate-200/60 bg-white/95 px-4 py-2.5 backdrop-blur-md md:py-3 xl:px-8 dark:border-white/10 dark:bg-slate-950/95'
        }`}
      >
        <motion.div
          layout
          transition={{ layout: { type: 'spring', bounce: 0, duration: 0.5 } }}
          className={`mx-auto flex items-center justify-between ${
            h.isScrolled
              ? 'w-full gap-3 xl:justify-center xl:gap-5'
              : 'container justify-between gap-4 xl:gap-8'
          }`}
        >
          {/* Mobile Logo Capsule Pill (Always visible on mobile) */}
          <Link
            href="/"
            className={`group relative inline-flex shrink-0 items-center rounded-[22px] bg-white px-4 py-2 shadow-md transition-all duration-300 outline-none hover:scale-[1.02] active:scale-[0.98] xl:hidden ${
              h.isMobileMenuOpen ? 'pointer-events-none opacity-0' : ''
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
              className="h-7 w-auto object-contain transition-all duration-300 sm:h-8"
            />
          </Link>

          {/* Desktop Logo (ONLY when not scrolled) */}
          <AnimatePresence mode="popLayout">
            {!h.isScrolled && (
              <motion.div
                layout
                initial={{ opacity: 0, width: 0, scale: 0.8 }}
                animate={{ opacity: 1, width: 'auto', scale: 1 }}
                exit={{ opacity: 0, width: 0, scale: 0.8 }}
                className="overflow-hidden"
              >
                <Link
                  href="/"
                  className={`group relative hidden shrink-0 items-center gap-2 transition-all duration-300 outline-none hover:scale-[1.02] active:scale-[0.98] xl:inline-flex ${
                    h.isHomeTransparent
                      ? 'rounded-2xl border border-white/20 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-md'
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
                    className="h-9 w-auto object-contain transition-all duration-300"
                  />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

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
        </motion.div>
      </motion.header>
    </>
  );
}
