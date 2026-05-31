'use client';

import {
  ChevronDown,
  Menu,
  Moon,
  Sun,
  X,
  Building2,
  CheckSquare,
  Phone,
  Mail,
  Monitor,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useLotteryVisibility } from '@/src/lib/hooks/useLotteryVisibility';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Careers', path: '/careers' },
  { name: 'Blog', path: '/blog' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isMobileProjectsOpen, setIsMobileProjectsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { visible: lotteryVisible } = useLotteryVisibility();
  const isHomeTransparent = pathname === '/' && !isScrolled;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => setIsScrolled(!entry.isIntersecting), {
      threshold: [1],
      rootMargin: '-20px 0px 0px 0px',
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProjectsOpen(false);
    setIsMobileProjectsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setIsMobileProjectsOpen(false);
    }
  }, [isMobileMenuOpen]);

  const toggleTheme = useCallback(() => {
    setTheme((prev: 'dark' | 'light' | 'system') => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, [setTheme]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMouseEnter = useCallback(() => setIsProjectsOpen(true), []);
  const handleMouseLeave = useCallback(() => setIsProjectsOpen(false), []);

  // Helper for mobile menu staggered animation style
  const getStaggerStyle = (index: number) => ({
    transitionDelay: isMobileMenuOpen ? `${index * 45}ms` : '0ms',
    transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(1.2rem)',
    opacity: isMobileMenuOpen ? 1 : 0,
  });

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'dark:border-zinc-850/50 border-b border-white/20 bg-white/75 py-3 shadow-lg shadow-zinc-950/5 backdrop-blur-xl dark:bg-zinc-950/75'
            : pathname === '/'
              ? 'border-b border-transparent bg-transparent py-4.5'
              : 'border-gray-150/40 dark:border-zinc-850/30 border-b bg-white/75 py-4.5 backdrop-blur-md dark:bg-zinc-950/75'
        }`}
      >
        <div
          ref={sentinelRef}
          className="pointer-events-none absolute top-0 left-0 h-px w-px"
          aria-hidden="true"
        />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Dynamic, responsive logo height to ensure fit on screens down to 320px */}
            <Link
              href="/"
              className="z-50 flex items-center gap-3 transition-transform duration-300 hover:scale-102"
            >
              <img
                src="/logo.png"
                alt="SVI Infra Solutions Logo"
                className={`h-8.5 w-auto max-w-[130px] object-contain transition-all duration-300 min-[380px]:h-10 min-[380px]:max-w-[170px] sm:h-12 sm:max-w-none md:h-14 ${
                  isHomeTransparent ? 'brightness-0 invert' : 'dark:brightness-0 dark:invert'
                }`}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`group relative py-1 text-[11px] font-bold tracking-wider uppercase transition-colors duration-200 ${
                      isActive
                        ? 'text-brand-gold'
                        : isHomeTransparent
                          ? 'hover:text-brand-gold text-white/95'
                          : 'text-brand-navy hover:text-brand-gold dark:text-gray-200'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.name}
                    <span
                      className={`bg-brand-gold absolute -bottom-0.5 left-1/2 h-[2px] -translate-x-1/2 transition-all duration-300 ease-out ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                );
              })}

              {/* Projects Dropdown Menu */}
              <div
                className="group relative cursor-pointer py-1"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => setIsProjectsOpen((prev) => !prev)}
              >
                <span
                  className={`flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase transition-colors duration-200 ${
                    pathname.includes('/projects')
                      ? 'text-brand-gold'
                      : isHomeTransparent
                        ? 'hover:text-brand-gold text-white/95'
                        : 'text-brand-navy hover:text-brand-gold dark:text-gray-200'
                  }`}
                >
                  Projects{' '}
                  <ChevronDown
                    size={14}
                    className="transition-transform duration-300 group-hover:rotate-180"
                  />
                </span>

                <div
                  className={`absolute top-full left-1/2 w-80 -translate-x-1/2 pt-2 transition-all duration-300 ${
                    isProjectsOpen
                      ? 'pointer-events-auto visible translate-y-0 opacity-100'
                      : 'pointer-events-none invisible translate-y-2 opacity-0'
                  }`}
                >
                  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
                    <Link
                      href="/projects/current"
                      className="group/item flex items-start gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    >
                      <div className="bg-brand-gold/10 text-brand-gold group-hover/item:bg-brand-navy dark:group-hover/item:bg-brand-gold dark:group-hover/item:text-brand-navy flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors group-hover/item:text-white">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div className="text-brand-navy group-hover/item:text-brand-gold text-xs font-bold tracking-wider uppercase transition-colors dark:text-gray-100">
                          Current Projects
                        </div>
                        <div className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-300">
                          Ongoing developments & infrastructure mappings.
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/projects/completed"
                      className="group/item flex items-start gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    >
                      <div className="bg-brand-gold/10 text-brand-gold group-hover/item:bg-brand-navy dark:group-hover/item:bg-brand-gold dark:group-hover/item:text-brand-navy flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors group-hover/item:text-white">
                        <CheckSquare size={18} />
                      </div>
                      <div>
                        <div className="text-brand-navy group-hover/item:text-brand-gold text-xs font-bold tracking-wider uppercase transition-colors dark:text-gray-100">
                          Completed Projects
                        </div>
                        <div className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-300">
                          Landmark properties successfully delivered.
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="/payment"
                className={`group relative py-1 text-[11px] font-bold tracking-wider uppercase transition-colors duration-200 ${
                  pathname === '/payment'
                    ? 'text-brand-gold'
                    : isHomeTransparent
                      ? 'hover:text-brand-gold text-white/95'
                      : 'text-brand-navy hover:text-brand-gold dark:text-gray-200'
                }`}
              >
                Payment
                <span
                  className={`bg-brand-gold absolute -bottom-0.5 left-1/2 h-[2px] -translate-x-1/2 transition-all duration-300 ease-out ${
                    pathname === '/payment' ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>

              <Link
                href="/contact"
                className={`group relative py-1 text-[11px] font-bold tracking-wider uppercase transition-colors duration-200 ${
                  pathname === '/contact'
                    ? 'text-brand-gold'
                    : isHomeTransparent
                      ? 'hover:text-brand-gold text-white/95'
                      : 'text-brand-navy hover:text-brand-gold dark:text-gray-200'
                }`}
              >
                Contact
                <span
                  className={`bg-brand-gold absolute -bottom-0.5 left-1/2 h-[2px] -translate-x-1/2 transition-all duration-300 ease-out ${
                    pathname === '/contact' ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>

              {/* Lucky Draw Button */}
              {lotteryVisible && (
                <Link
                  href="/lottery"
                  className={`border-brand-gold/30 hover:bg-brand-gold/10 hover:border-brand-gold rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider uppercase transition-colors duration-200 ${
                    pathname === '/lottery'
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
                  className={`group/login relative py-1 text-[11px] font-bold tracking-wider uppercase transition-all duration-200 ${
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
                  className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy shadow-brand-navy/10 dark:hover:shadow-brand-gold/10 relative overflow-hidden rounded-full px-5 py-2 text-[11px] font-bold tracking-wider text-white uppercase shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-105 active:translate-y-0"
                >
                  Register
                </Link>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-center rounded-full border p-2 transition-all duration-300 hover:shadow-sm ${
                  isHomeTransparent
                    ? 'hover:border-brand-gold hover:text-brand-gold border-white/20 bg-white/10 text-white/90'
                    : 'text-brand-navy hover:border-brand-gold hover:text-brand-gold dark:hover:text-brand-gold border-gray-200/60 bg-gray-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-gray-200'
                }`}
                aria-label={
                  mounted
                    ? theme === 'dark'
                      ? 'Switch to system mode'
                      : theme === 'light'
                        ? 'Switch to dark mode'
                        : 'Switch to light mode'
                    : 'Toggle theme'
                }
              >
                {mounted ? (
                  theme === 'dark' ? (
                    <Sun size={16} className="transition-transform duration-500 hover:rotate-45" />
                  ) : theme === 'light' ? (
                    <Moon
                      size={16}
                      className="transition-transform duration-500 hover:-rotate-12"
                    />
                  ) : (
                    <Monitor
                      size={16}
                      className="transition-transform duration-500 hover:scale-105"
                    />
                  )
                ) : (
                  <Moon size={16} />
                )}
              </button>
            </nav>

            {/* Mobile Actions/Hamburger - Extremely clean to avoid crowding on 320px viewports */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                className="bg-brand-navy flex items-center justify-center rounded-full p-2 text-white shadow-sm transition-colors dark:bg-zinc-900 dark:text-gray-200"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-zinc-950/45 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Side Drawer - Adaptable width and padding to guarantee perfect fit on all screens */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 z-50 flex h-screen w-full max-w-sm flex-col border-l border-white/10 bg-white/95 px-5 pt-28 pb-8 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out min-[380px]:w-[80%] min-[380px]:px-6 md:hidden dark:border-zinc-900/60 dark:bg-zinc-950/96 ${
          isMobileMenuOpen
            ? 'pointer-events-auto translate-x-0'
            : 'pointer-events-none translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Drawer Header with Logo, Theme Toggle & Close Button */}
        <div className="absolute top-5 right-5 left-5 flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2"
          >
            <img
              src="/logo.png"
              alt="SVI Infra Solutions Logo"
              className="h-8.5 w-auto object-contain dark:brightness-0 dark:invert"
            />
          </Link>
          <div className="flex items-center gap-2.5">
            {/* Relocated Theme Toggle to free up space in main mobile header */}
            <button
              onClick={toggleTheme}
              className="border-gray-150 text-brand-navy flex items-center justify-center rounded-full border bg-gray-50/70 p-2 transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-gray-200"
              aria-label={
                mounted
                  ? theme === 'dark'
                    ? 'Switch to system mode'
                    : theme === 'light'
                      ? 'Switch to dark mode'
                      : 'Switch to light mode'
                  : 'Toggle theme'
              }
            >
              {mounted ? (
                theme === 'dark' ? (
                  <Sun size={15} />
                ) : theme === 'light' ? (
                  <Moon size={15} />
                ) : (
                  <Monitor size={15} />
                )
              ) : (
                <Moon size={15} />
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="border-gray-150 text-brand-navy dark:hover:bg-zinc-850 rounded-full border bg-gray-50/70 p-2 transition-all duration-300 hover:bg-gray-100 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-gray-200"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex flex-grow flex-col gap-5.5 overflow-y-auto py-4 pr-1">
          {/* Main Links */}
          <div className="flex flex-col gap-3.5 min-[380px]:gap-4.5">
            {NAV_LINKS.map((link, index) => (
              <div
                key={link.name}
                className="transition-all duration-300 ease-out"
                style={getStaggerStyle(index)}
              >
                <Link
                  href={link.path}
                  className={`block py-0.5 text-[17px] font-bold transition-colors min-[380px]:text-lg ${
                    pathname === link.path
                      ? 'text-brand-gold'
                      : 'text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold dark:text-gray-100'
                  }`}
                >
                  {link.name}
                </Link>
              </div>
            ))}

            {/* Accordion for Projects */}
            <div
              className="flex flex-col gap-2 transition-all duration-300 ease-out"
              style={getStaggerStyle(NAV_LINKS.length)}
            >
              <button
                onClick={() => setIsMobileProjectsOpen(!isMobileProjectsOpen)}
                className="text-brand-navy group flex w-full items-center justify-between py-0.5 text-left text-[17px] font-bold min-[380px]:text-lg dark:text-gray-100"
              >
                <span>Projects</span>
                <ChevronDown
                  size={18}
                  className={`text-brand-gold transition-transform duration-300 ${
                    isMobileProjectsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                  isMobileProjectsOpen
                    ? 'mt-1 grid-rows-[1fr] opacity-100'
                    : 'pointer-events-none grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="border-brand-gold/30 flex min-h-0 flex-col gap-2.5 border-l-2 pl-3.5">
                  <Link
                    href="/projects/current"
                    className="hover:text-brand-gold flex items-center gap-2 py-1 text-[14px] font-semibold text-gray-600 transition-colors min-[380px]:text-[15px] dark:text-gray-400"
                  >
                    <Building2 size={15} className="text-brand-gold/70" />
                    Current Projects
                  </Link>
                  <Link
                    href="/projects/completed"
                    className="hover:text-brand-gold flex items-center gap-2 py-1 text-[14px] font-semibold text-gray-600 transition-colors min-[380px]:text-[15px] dark:text-gray-400"
                  >
                    <CheckSquare size={15} className="text-brand-gold/70" />
                    Completed Projects
                  </Link>
                </div>
              </div>
            </div>

            {/* Remaining Links */}
            <div
              className="transition-all duration-300 ease-out"
              style={getStaggerStyle(NAV_LINKS.length + 1)}
            >
              <Link
                href="/payment"
                className={`block py-0.5 text-[17px] font-bold transition-colors min-[380px]:text-lg ${
                  pathname === '/payment'
                    ? 'text-brand-gold'
                    : 'text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold dark:text-gray-100'
                }`}
              >
                Payment
              </Link>
            </div>

            <div
              className="transition-all duration-300 ease-out"
              style={getStaggerStyle(NAV_LINKS.length + 2)}
            >
              <Link
                href="/contact"
                className={`block py-0.5 text-[17px] font-bold transition-colors min-[380px]:text-lg ${
                  pathname === '/contact'
                    ? 'text-brand-gold'
                    : 'text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold dark:text-gray-100'
                }`}
              >
                Contact Us
              </Link>
            </div>

            {/* Lucky Draw mobile link */}
            {lotteryVisible && (
              <div
                className="transition-all duration-300 ease-out"
                style={getStaggerStyle(NAV_LINKS.length + 3)}
              >
                <Link
                  href="/lottery"
                  className={`block py-0.5 text-[17px] font-bold transition-colors min-[380px]:text-lg ${
                    pathname === '/lottery'
                      ? 'text-brand-gold'
                      : 'text-brand-gold/80 hover:text-brand-gold'
                  }`}
                >
                  Lucky Draw
                </Link>
              </div>
            )}
          </div>

          {/* Action CTAs in mobile menu */}
          <div
            className="mt-6 flex flex-col gap-2.5 transition-all duration-300 ease-out min-[380px]:gap-3"
            style={getStaggerStyle(NAV_LINKS.length + 4)}
          >
            <Link
              href="/login"
              className="border-brand-navy dark:border-brand-gold/45 text-brand-navy dark:text-brand-gold block w-full rounded-full border py-2.5 text-center text-xs font-bold tracking-wider uppercase transition-colors hover:bg-gray-50 min-[380px]:py-3 min-[380px]:text-sm dark:hover:bg-zinc-900"
            >
              Client Login
            </Link>
            <Link
              href="/registration"
              className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy shadow-brand-navy/10 block w-full rounded-full py-2.5 text-center text-xs font-bold tracking-wider text-white uppercase shadow-md min-[380px]:py-3 min-[380px]:text-sm"
            >
              Register Now
            </Link>
          </div>

          {/* Drawer Support / Branding Footer */}
          <div
            className="mt-auto flex flex-col border-t border-gray-100 pt-5 transition-all duration-500 ease-out dark:border-zinc-900/60"
            style={{
              transitionDelay: isMobileMenuOpen ? '320ms' : '0ms',
              opacity: isMobileMenuOpen ? 1 : 0,
              transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(0.8rem)',
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
                href="tel:+917300007643"
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
