'use client';

import { ChevronDown, Menu, Moon, Sun, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

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
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const sentinelRef = useRef<HTMLDivElement>(null);

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

  const toggleTheme = useCallback(() => {
    setTheme((prev: 'dark' | 'light') => (prev === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMouseEnter = useCallback(() => setIsProjectsOpen(true), []);
  const handleMouseLeave = useCallback(() => setIsProjectsOpen(false), []);

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'border-b border-gray-100 bg-white/97 py-4 shadow-lg backdrop-blur-xl dark:border-gray-800 dark:bg-[#0C0C0C]/97'
            : 'bg-white/70 py-5 backdrop-blur-md dark:bg-[#0C0C0C]/70'
        }`}
      >
        <div
          ref={sentinelRef}
          className="pointer-events-none absolute top-0 left-0 h-px w-px"
          aria-hidden="true"
        />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="z-50 flex items-center gap-3 transition-transform duration-300 hover:scale-105"
            >
              <img
                src="/logo.png"
                alt="SVI Infra Solutions Logo"
                className="h-10 w-auto object-contain sm:h-14"
              />
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`hover:text-brand-gold-text group relative text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:-translate-y-0.5 ${
                    pathname === link.path
                      ? 'text-brand-gold-text'
                      : 'text-brand-navy dark:text-gray-200'
                  }`}
                  aria-current={pathname === link.path ? 'page' : undefined}
                >
                  {link.name}
                  <span
                    className={`bg-brand-gold absolute -bottom-1 left-0 h-0.5 transition-all duration-300 ${
                      pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              ))}

              <div
                className="group relative cursor-pointer py-2 pb-4"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span
                  className={`hover:text-brand-gold-text flex items-center gap-1 text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:-translate-y-0.5 ${
                    pathname.includes('/projects')
                      ? 'text-brand-gold-text'
                      : 'text-brand-navy dark:text-gray-200'
                  }`}
                >
                  Projects <ChevronDown size={16} />
                </span>

                <div
                  className={`absolute top-full left-0 w-48 overflow-hidden rounded-sm border border-gray-100 bg-white/95 shadow-lg backdrop-blur-md transition-all duration-200 dark:border-gray-700 dark:bg-gray-800/95 ${
                    isProjectsOpen
                      ? 'pointer-events-auto translate-y-0 pt-2 opacity-100'
                      : 'pointer-events-none translate-y-2 pt-0 opacity-0'
                  }`}
                >
                  <Link
                    href="/projects/current"
                    className="text-brand-navy hover:text-brand-gold-text dark:hover:text-brand-gold block px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors hover:bg-gray-50/50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                  >
                    Current Projects
                  </Link>
                  <Link
                    href="/projects/completed"
                    className="text-brand-navy hover:text-brand-gold-text dark:hover:text-brand-gold block px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors hover:bg-gray-50/50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                  >
                    Completed Projects
                  </Link>
                </div>
              </div>

              <Link
                href="/payment"
                className={`hover:text-brand-gold-text text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:-translate-y-0.5 ${
                  pathname === '/payment'
                    ? 'text-brand-gold-text'
                    : 'text-brand-navy dark:text-gray-200'
                }`}
              >
                Payment
              </Link>

              <Link
                href="/contact"
                className={`hover:text-brand-gold-text text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:-translate-y-0.5 ${
                  pathname === '/contact'
                    ? 'text-brand-gold-text'
                    : 'text-brand-navy dark:text-gray-200'
                }`}
              >
                Contact
              </Link>

              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-brand-navy hover:text-brand-gold text-[10px] font-bold tracking-wider uppercase transition-colors dark:text-gray-200"
                >
                  Client Login
                </Link>
                <Link
                  href="/registration"
                  className="border-brand-navy hover:bg-brand-navy dark:hover:text-brand-navy border px-5 py-2 text-[10px] font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 hover:text-white hover:shadow-lg dark:border-gray-200 dark:text-gray-200 dark:hover:bg-gray-200"
                >
                  Register Now
                </Link>
              </div>

              <button
                onClick={toggleTheme}
                className="text-brand-navy hover:text-brand-gold-text p-2 transition-colors dark:text-gray-200"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </nav>

            <div className="flex items-center gap-4 md:hidden">
              <button
                onClick={toggleTheme}
                className="text-brand-navy hover:text-brand-gold-text z-50 p-2 transition-colors dark:text-gray-200"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
              </button>
              <button
                className="text-brand-navy hover:text-brand-gold-text z-50 p-2 transition-colors dark:text-gray-200"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`fixed inset-0 top-0 z-40 overflow-y-auto bg-white px-6 pt-24 pb-8 transition-all duration-300 ease-in-out md:hidden dark:bg-[#0C0C0C] ${
          isMobileMenuOpen
            ? 'pointer-events-auto translate-x-0 opacity-100'
            : 'pointer-events-none translate-x-full opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="flex flex-col gap-6">
          {NAV_LINKS.map((link) => (
            <div key={link.name}>
              <Link
                href={link.path}
                className="text-brand-navy hover:text-brand-gold block font-serif text-2xl transition-colors dark:text-gray-100"
              >
                {link.name}
              </Link>
            </div>
          ))}

          <div className="flex flex-col gap-4">
            <span className="text-brand-navy font-serif text-2xl dark:text-gray-100">Projects</span>
            <div className="border-brand-gold/30 flex flex-col gap-3 border-l-2 pl-4">
              <Link
                href="/projects/current"
                className="hover:text-brand-gold block text-lg text-gray-600 dark:text-gray-400"
              >
                Current Projects
              </Link>
              <Link
                href="/projects/completed"
                className="hover:text-brand-gold block text-lg text-gray-600 dark:text-gray-400"
              >
                Completed Projects
              </Link>
            </div>
          </div>

          <Link
            href="/payment"
            className="text-brand-navy block font-serif text-2xl dark:text-gray-100"
          >
            Payment
          </Link>

          <Link
            href="/contact"
            className="text-brand-navy block font-serif text-2xl dark:text-gray-100"
          >
            Contact Us
          </Link>

          <div className="mt-8 flex flex-col gap-4">
            <Link
              href="/login"
              className="border-brand-navy dark:border-brand-gold text-brand-navy dark:text-brand-gold block inline-block w-full rounded-md border-2 px-6 py-4 text-center text-lg font-semibold transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Client Login
            </Link>
            <Link
              href="/registration"
              className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy block inline-block w-full rounded-md px-6 py-4 text-center text-lg font-semibold text-white"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
