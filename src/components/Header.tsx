"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: [1], rootMargin: '-20px 0px 0px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProjectsOpen(false);
  }, [pathname]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMouseEnter = useCallback(() => setIsProjectsOpen(true), []);
  const handleMouseLeave = useCallback(() => setIsProjectsOpen(false), []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/97 dark:bg-gray-900/97 backdrop-blur-xl shadow-lg py-4 border-b border-gray-100 dark:border-gray-800' : 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-md py-5'
      }`}
    >
      <div ref={sentinelRef} className="absolute top-0 left-0 w-px h-px pointer-events-none" aria-hidden="true" />
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
<Link href="/" className="flex items-center gap-3 z-50 transition-transform duration-300 hover:scale-105">
  <img src="/logo.png" alt="SVI Infra Solutions Logo" className="h-10 sm:h-14 w-auto object-contain" />
</Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`relative text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-brand-gold hover:-translate-y-0.5 group ${
                  pathname === link.path ? 'text-brand-gold' : 'text-brand-navy dark:text-gray-200'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-gold transition-all duration-300 ${
                  pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}

            <div
              className="relative group cursor-pointer py-2"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span
                className={`flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-brand-gold hover:-translate-y-0.5 ${
                  pathname.includes('/projects') ? 'text-brand-gold' : 'text-brand-navy dark:text-gray-200'
                }`}
              >
                Projects <ChevronDown size={16} />
              </span>

              <AnimatePresence>
                {isProjectsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg rounded-sm overflow-hidden border border-gray-100 dark:border-gray-700"
                  >
                    <Link
                      href="/projects/current"
                      className="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 hover:text-brand-gold dark:hover:text-brand-gold transition-colors"
                    >
                      Current Projects
                    </Link>
                    <Link
                      href="/projects/completed"
                      className="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 hover:text-brand-gold dark:hover:text-brand-gold transition-colors"
                    >
                      Completed Projects
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/payment"
              className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-brand-gold hover:-translate-y-0.5 ${
                pathname === '/payment' ? 'text-brand-gold' : 'text-brand-navy dark:text-gray-200'
              }`}
            >
              Payment
            </Link>

            <Link
              href="/contact"
              className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-brand-gold hover:-translate-y-0.5 ${
                pathname === '/contact' ? 'text-brand-gold' : 'text-brand-navy dark:text-gray-200'
              }`}
            >
              Contact
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[10px] font-bold uppercase tracking-wider text-brand-navy dark:text-gray-200 hover:text-brand-gold transition-colors"
              >
                Client Login
              </Link>
              <Link
                href="/registration"
                className="px-5 py-2 text-[10px] font-bold uppercase tracking-wider border border-brand-navy dark:border-gray-200 hover:bg-brand-navy dark:hover:bg-gray-200 dark:text-gray-200 hover:text-white dark:hover:text-brand-navy transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Register Now
              </Link>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 text-brand-navy dark:text-gray-200 hover:text-brand-gold transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>

          <div className="flex md:hidden items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 z-50 text-brand-navy dark:text-gray-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button
              className="z-50 text-brand-navy dark:text-gray-200 p-2"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 top-0 bg-white dark:bg-gray-900 z-40 md:hidden overflow-y-auto pt-24 pb-8 px-6"
          >
            <motion.div
              className="flex flex-col gap-6"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              initial="hidden"
              animate="visible"
            >
              {NAV_LINKS.map((link) => (
                <motion.div
                  key={link.name}
                  variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.path}
                    className="text-2xl font-serif text-brand-navy dark:text-gray-100 hover:text-brand-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <div className="flex flex-col gap-4">
                <span className="text-2xl font-serif text-brand-navy dark:text-gray-100">Projects</span>
                <div className="flex flex-col gap-3 pl-4 border-l-2 border-brand-gold/30">
                  <Link
                    href="/projects/current"
                    className="text-lg text-gray-600 dark:text-gray-400 hover:text-brand-gold"
                  >
                    Current Projects
                  </Link>
                  <Link
                    href="/projects/completed"
                    className="text-lg text-gray-600 dark:text-gray-400 hover:text-brand-gold"
                  >
                    Completed Projects
                  </Link>
                </div>
              </div>

              <Link
                href="/payment"
                className="text-2xl font-serif text-brand-navy dark:text-gray-100"
              >
                Payment
              </Link>

              <Link
                href="/contact"
                className="text-2xl font-serif text-brand-navy dark:text-gray-100"
              >
                Contact Us
              </Link>

              <div className="mt-8 flex flex-col gap-4">
                <Link
                  href="/login"
                  className="inline-block w-full text-center border-2 border-brand-navy dark:border-brand-gold text-brand-navy dark:text-brand-gold text-lg font-semibold px-6 py-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Client Login
                </Link>
                <Link
                  href="/registration"
                  className="inline-block w-full text-center bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy text-lg font-semibold px-6 py-4 rounded-md"
                >
                  Register Now
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
