'use client';

import { memo } from 'react';
import { Link } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';
import { NAV_LINKS, SECONDARY_NAV_LINKS } from './navLinks';
import { HamburgerButton } from './HamburgerButton';
import { MobileDrawerHeader } from './MobileDrawerHeader';
import { MobileNavLink } from './MobileNavLink';
import { MobileProjectsAccordion } from './MobileProjectsAccordion';
import { MobileNavActions } from './MobileNavActions';
import { MobileNavFooter } from './MobileNavFooter';

interface MobileNavProps {
  isOpen: boolean;
  isProjectsOpen: boolean;
  currentPath: string;
  lotteryVisible: boolean;
  mounted: boolean;
  theme: 'dark' | 'light' | 'system';
  onClose: () => void;
  onToggle: () => void;
  onToggleProjects: () => void;
  onToggleTheme: () => void;
}

function getStaggerStyle(isOpen: boolean, index: number) {
  return {
    transitionDelay: isOpen ? `${index * 40}ms` : '0ms',
    transform: isOpen ? 'translateX(0)' : 'translateX(1.2rem)',
    opacity: isOpen ? 1 : 0,
  };
}

const MobileNav = memo(function MobileNav({
  isOpen,
  isProjectsOpen,
  currentPath,
  lotteryVisible,
  mounted,
  theme,
  onClose,
  onToggle,
  onToggleProjects,
  onToggleTheme,
}: MobileNavProps) {
  const t = useTranslations('nav');

  const homeLink = NAV_LINKS.find((l) => l.path === '/');
  const aboutLink = NAV_LINKS.find((l) => l.path === '/about');
  const offersLink = NAV_LINKS.find((l) => l.path === '/exclusive-offers');

  let staggerCounter = 0;

  return (
    <>
      {/* Hamburger Button */}
      <HamburgerButton isOpen={isOpen} onToggle={onToggle} />

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Drawer */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 z-50 flex h-dvh w-full max-w-sm flex-col border-l border-white/10 bg-white/95 px-5 pt-[max(6rem,calc(env(safe-area-inset-top,0px)+4rem))] pb-[max(2rem,env(safe-area-inset-bottom,0px))] shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out min-[380px]:w-[85%] min-[380px]:px-6 xl:hidden dark:border-white/10 dark:bg-[#0b0c10]/95 ${
          isOpen ? 'pointer-events-auto translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t('mobileNavLabel')}
      >
        {/* Drawer Header */}
        <MobileDrawerHeader
          theme={theme}
          mounted={mounted}
          onToggleTheme={onToggleTheme}
          onClose={onClose}
        />

        {/* Scrollable Content */}
        <div className="flex flex-grow flex-col gap-5.5 overflow-y-auto py-4 pr-1">
          {/* Main Links */}
          <div className="flex flex-col gap-3 min-[380px]:gap-4">
            {/* Home */}
            {homeLink && (
              <div
                className="transition-all duration-300 ease-out"
                style={getStaggerStyle(isOpen, staggerCounter++)}
              >
                <MobileNavLink href={homeLink.path} isActive={currentPath === homeLink.path}>
                  {t(homeLink.nameKey)}
                </MobileNavLink>
              </div>
            )}

            {/* Projects Accordion */}
            <div
              className="flex flex-col gap-2 transition-all duration-300 ease-out"
              style={getStaggerStyle(isOpen, staggerCounter++)}
            >
              <MobileProjectsAccordion
                isOpen={isProjectsOpen}
                onToggle={onToggleProjects}
                onClose={onClose}
              />
            </div>

            {/* About Us */}
            {aboutLink && (
              <div
                className="transition-all duration-300 ease-out"
                style={getStaggerStyle(isOpen, staggerCounter++)}
              >
                <MobileNavLink href={aboutLink.path} isActive={currentPath === aboutLink.path}>
                  {t(aboutLink.nameKey)}
                </MobileNavLink>
              </div>
            )}

            {/* Exclusive Offers */}
            {offersLink && (
              <div
                className="transition-all duration-300 ease-out"
                style={getStaggerStyle(isOpen, staggerCounter++)}
              >
                <MobileNavLink href={offersLink.path} isActive={currentPath === offersLink.path}>
                  {t(offersLink.nameKey)}
                </MobileNavLink>
              </div>
            )}

            {/* Secondary Links (Calculators, Careers, Blog, Payment) */}
            {SECONDARY_NAV_LINKS.map((link) => (
              <div
                key={link.nameKey}
                className="transition-all duration-300 ease-out"
                style={getStaggerStyle(isOpen, staggerCounter++)}
              >
                <MobileNavLink href={link.path} isActive={currentPath === link.path}>
                  {t(link.nameKey)}
                </MobileNavLink>
              </div>
            ))}

            {/* Contact */}
            <div
              className="transition-all duration-300 ease-out"
              style={getStaggerStyle(isOpen, staggerCounter++)}
            >
              <MobileNavLink href="/contact" isActive={currentPath === '/contact'}>
                {t('contactUs')}
              </MobileNavLink>
            </div>

            {/* Lucky Draw */}
            {lotteryVisible && (
              <div
                className="transition-all duration-300 ease-out"
                style={getStaggerStyle(isOpen, staggerCounter++)}
              >
                <Link
                  href="/lottery"
                  onClick={onClose}
                  className={`flex items-center gap-2 py-2.5 text-[clamp(15px,4vw,18px)] font-semibold tracking-wide transition-colors ${
                    currentPath === '/lottery'
                      ? 'font-bold text-amber-400'
                      : 'text-amber-400/90 hover:text-amber-300'
                  }`}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                  </span>
                  {t('luckyDraw')}
                </Link>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div
            className="mt-6 flex flex-col gap-2.5 transition-all duration-300 ease-out min-[380px]:gap-3"
            style={getStaggerStyle(isOpen, staggerCounter++)}
          >
            <MobileNavActions onClose={onClose} />
          </div>

          {/* Footer */}
          <div
            className="mt-auto flex flex-col border-t border-gray-100 pt-5 transition-all duration-500 ease-out dark:border-zinc-900/60"
            style={{
              transitionDelay: isOpen ? '320ms' : '0ms',
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translateY(0)' : 'translateY(0.8rem)',
            }}
          >
            <MobileNavFooter />
          </div>
        </div>
      </div>
    </>
  );
});

export { MobileNav };
