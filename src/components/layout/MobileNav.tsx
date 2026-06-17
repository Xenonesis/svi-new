'use client';

import { ChevronDown, Building2, CheckSquare, Phone, Mail, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageToggle from '@/src/components/ui/LanguageToggle';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';
import { NAV_LINKS } from './navLinks';
import { PHONE_HREF } from '@/src/lib/constants';

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

function MobileLink({
  href,
  children,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block py-2.5 text-[16px] font-semibold tracking-wide transition-colors min-[380px]:text-[17px] ${
        isActive
          ? 'text-brand-gold'
          : 'text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold dark:text-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}

export function MobileNav({
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
  return (
    <>
      {/* Hamburger Button */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          className="bg-brand-navy flex items-center justify-center rounded-full p-2 text-white shadow-sm transition-colors dark:bg-zinc-900 dark:text-gray-200"
          onClick={onToggle}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-zinc-950/45 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Drawer */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 z-50 flex h-screen w-full max-w-sm flex-col border-l border-white/10 bg-white/95 px-5 pt-28 pb-8 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out min-[380px]:w-[80%] min-[380px]:px-6 lg:hidden dark:border-zinc-900/60 dark:bg-zinc-950/96 ${
          isOpen ? 'pointer-events-auto translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Drawer Header */}
        <div className="absolute top-5 right-5 left-5 flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SVI Infra Solutions Logo"
              width={282}
              height={83}
              priority
              quality={100}
              className="h-[26px] w-auto object-contain dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            />
          </Link>
          <div className="flex items-center gap-2.5">
            <LanguageToggle />
            <ThemeToggle
              theme={theme}
              mounted={mounted}
              onToggle={onToggleTheme}
              variant="mobile"
            />
            <button
              onClick={onClose}
              className="border-gray-150 text-brand-navy dark:hover:bg-zinc-850 rounded-full border bg-gray-50/70 p-2 transition-all duration-300 hover:bg-gray-100 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-gray-200"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex flex-grow flex-col gap-5.5 overflow-y-auto py-4 pr-1">
          {/* Main Links */}
          <div className="flex flex-col gap-3.5 min-[380px]:gap-4.5">
            {NAV_LINKS.map((link, index) => (
              <div
                key={link.name}
                className="transition-all duration-300 ease-out"
                style={getStaggerStyle(isOpen, index)}
              >
                <MobileLink href={link.path} isActive={currentPath === link.path}>
                  {link.name}
                </MobileLink>
              </div>
            ))}

            {/* Projects Accordion */}
            <div
              className="flex flex-col gap-2 transition-all duration-300 ease-out"
              style={getStaggerStyle(isOpen, NAV_LINKS.length)}
            >
              <button
                onClick={onToggleProjects}
                className="text-brand-navy group flex w-full items-center justify-between py-2.5 text-left text-[16px] font-semibold tracking-wide min-[380px]:text-[17px] dark:text-gray-100"
              >
                <span>Projects</span>
                <ChevronDown
                  size={18}
                  className={`text-brand-gold transition-transform duration-300 ${
                    isProjectsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                  isProjectsOpen
                    ? 'mt-1 grid-rows-[1fr] opacity-100'
                    : 'pointer-events-none grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="border-brand-gold/30 flex min-h-0 flex-col gap-2.5 border-l-2 pl-3.5">
                  <Link
                    href="/projects/current"
                    onClick={onClose}
                    className="hover:text-brand-gold flex items-center gap-2 py-2 text-[13.5px] font-medium text-gray-600 transition-colors min-[380px]:text-[14.5px] dark:text-gray-400"
                  >
                    <Building2 size={15} className="text-brand-gold/70" />
                    Current Projects
                  </Link>
                  <Link
                    href="/projects/completed"
                    onClick={onClose}
                    className="hover:text-brand-gold flex items-center gap-2 py-2 text-[13.5px] font-medium text-gray-600 transition-colors min-[380px]:text-[14.5px] dark:text-gray-400"
                  >
                    <CheckSquare size={15} className="text-brand-gold/70" />
                    Completed Projects
                  </Link>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div
              className="transition-all duration-300 ease-out"
              style={getStaggerStyle(isOpen, NAV_LINKS.length + 1)}
            >
              <MobileLink href="/payment" isActive={currentPath === '/payment'}>
                Payment
              </MobileLink>
            </div>

            {/* Contact */}
            <div
              className="transition-all duration-300 ease-out"
              style={getStaggerStyle(isOpen, NAV_LINKS.length + 2)}
            >
              <MobileLink href="/contact" isActive={currentPath === '/contact'}>
                Contact Us
              </MobileLink>
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
                  className={`block py-2.5 text-[16px] font-semibold tracking-wide transition-colors min-[380px]:text-[17px] ${
                    currentPath === '/lottery'
                      ? 'text-brand-gold'
                      : 'text-brand-gold/80 hover:text-brand-gold'
                  }`}
                >
                  Lucky Draw
                </Link>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div
            className="mt-6 flex flex-col gap-2.5 transition-all duration-300 ease-out min-[380px]:gap-3"
            style={getStaggerStyle(isOpen, NAV_LINKS.length + 4)}
          >
            <Link
              href="/login"
              onClick={onClose}
              className="border-brand-navy dark:border-brand-gold/45 text-brand-navy dark:text-brand-gold block w-full rounded-full border py-2 text-center text-xs font-semibold tracking-widest uppercase transition-colors hover:bg-gray-50 min-[380px]:py-2.5 min-[380px]:text-sm dark:hover:bg-zinc-900"
            >
              Client Login
            </Link>
            <Link
              href="/registration"
              onClick={onClose}
              className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy block w-full rounded-full py-2 text-center text-xs font-semibold tracking-widest text-white uppercase min-[380px]:py-2.5 min-[380px]:text-sm"
            >
              Register Now
            </Link>
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
            <p className="text-brand-gold text-[10px] font-bold tracking-widest uppercase">
              SVI Infra Solutions
            </p>
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
              Premium Property Developers
            </p>
            <div className="mt-3.5 flex flex-col gap-2">
              <a
                href={PHONE_HREF}
                className="hover:text-brand-gold flex items-center gap-2 text-xs font-medium text-gray-600 transition-colors dark:text-gray-300"
              >
                <Phone size={13} className="text-brand-gold" />
                +91-73000-07643
              </a>
              <a
                href="mailto:info@sviinfrasolutions.com"
                className="hover:text-brand-gold flex items-center gap-2 text-xs font-medium text-gray-600 transition-colors dark:text-gray-300"
              >
                <Mail size={13} className="text-brand-gold" />
                info@sviinfrasolutions.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
