'use client';

import { memo } from 'react';
import { Link } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';
import { NAV_LINKS } from './navLinks';
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
    transitionDelay: isOpen ? `${index * 45}ms` : '0ms',
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
  return (
    <>
      {/* Hamburger Button */}
      <HamburgerButton isOpen={isOpen} onToggle={onToggle} />

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-zinc-950/45 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Drawer */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 z-50 flex h-screen w-full max-w-sm flex-col border-l border-white/10 bg-white/95 px-5 pt-28 pb-8 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out min-[380px]:w-[80%] min-[380px]:px-6 xl:hidden dark:border-zinc-900/60 dark:bg-zinc-950/96 ${
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
          <div className="flex flex-col gap-3.5 min-[380px]:gap-4.5">
            {NAV_LINKS.map((link, index) => (
              <div
                key={link.nameKey}
                className="transition-all duration-300 ease-out"
                style={getStaggerStyle(isOpen, index)}
              >
                <MobileNavLink href={link.path} isActive={currentPath === link.path}>
                  {t(link.nameKey)}
                </MobileNavLink>
              </div>
            ))}

            {/* Projects Accordion */}
            <div
              className="flex flex-col gap-2 transition-all duration-300 ease-out"
              style={getStaggerStyle(isOpen, NAV_LINKS.length)}
            >
              <MobileProjectsAccordion
                isOpen={isProjectsOpen}
                onToggle={onToggleProjects}
                onClose={onClose}
              />
            </div>

            {/* Payment */}
            <div
              className="transition-all duration-300 ease-out"
              style={getStaggerStyle(isOpen, NAV_LINKS.length + 1)}
            >
              <MobileNavLink href="/payment" isActive={currentPath === '/payment'}>
                {t('payment')}
              </MobileNavLink>
            </div>

            {/* Contact */}
            <div
              className="transition-all duration-300 ease-out"
              style={getStaggerStyle(isOpen, NAV_LINKS.length + 2)}
            >
              <MobileNavLink href="/contact" isActive={currentPath === '/contact'}>
                {t('contactUs')}
              </MobileNavLink>
            </div>

            {/* Lucky Draw */}
            {lotteryVisible && (
              <div
                className="transition-all duration-300 ease-out"
                style={getStaggerStyle(isOpen, NAV_LINKS.length + 3)}
              >
                <Link
                  href="/lottery"
                  onClick={onClose}
                  className={`block py-2.5 text-[clamp(15px,4vw,18px)] font-semibold tracking-wide transition-colors ${
                    currentPath === '/lottery'
                      ? 'text-brand-gold'
                      : 'text-brand-gold/80 hover:text-brand-gold'
                  }`}
                >
                  {t('luckyDraw')}
                </Link>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div
            className="mt-6 flex flex-col gap-2.5 transition-all duration-300 ease-out min-[380px]:gap-3"
            style={getStaggerStyle(isOpen, NAV_LINKS.length + 4)}
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
