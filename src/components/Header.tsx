import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from './ThemeProvider';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Careers', path: '/careers' },
  { name: 'FAQ', path: '/faq' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const location = useLocation();
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
  }, [location]);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md py-4' : 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-md py-5'
      }`}
    >
      <div ref={sentinelRef} className="absolute top-0 left-0 w-px h-px pointer-events-none" aria-hidden="true" />
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
<Link to="/" className="flex items-center gap-3 z-50 transition-transform duration-300 hover:scale-105">
  <img src="/logo.png" alt="SVI Infra Solutions Logo" className="h-10 sm:h-12 w-auto object-contain" />
  <div className="hidden sm:flex flex-col">
    <span className="font-bold tracking-tight leading-none text-brand-navy dark:text-gray-100">SVI INFRA SOLUTIONS</span>
    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mt-1">Pvt. Ltd. — Since 2009</span>
  </div>
</Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-brand-gold hover:-translate-y-0.5 ${
                  location.pathname === link.path ? 'text-brand-gold' : 'text-brand-navy dark:text-gray-200'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div
              className="relative group cursor-pointer py-2"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span
                className={`flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-brand-gold hover:-translate-y-0.5 ${
                  location.pathname.includes('/projects') ? 'text-brand-gold' : 'text-brand-navy dark:text-gray-200'
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
                      to="/projects/current"
                      className="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 hover:text-brand-gold dark:hover:text-brand-gold transition-colors"
                    >
                      Current Projects
                    </Link>
                    <Link
                      to="/projects/completed"
                      className="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 hover:text-brand-gold dark:hover:text-brand-gold transition-colors"
                    >
                      Completed Projects
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/contact"
              className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-brand-gold hover:-translate-y-0.5 ${
                location.pathname === '/contact' ? 'text-brand-gold' : 'text-brand-navy dark:text-gray-200'
              }`}
            >
              Contact
            </Link>

            <Link
              to="/registration"
              className="px-5 py-2 text-[10px] font-bold uppercase tracking-wider border border-brand-navy dark:border-gray-200 hover:bg-brand-navy dark:hover:bg-gray-200 dark:text-gray-200 hover:text-white dark:hover:text-brand-navy transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Register Now
            </Link>

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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 top-0 bg-white dark:bg-gray-900 z-40 md:hidden overflow-y-auto pt-24 pb-8 px-6"
          >
            <div className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-2xl font-serif text-brand-navy dark:text-gray-100"
                >
                  {link.name}
                </Link>
              ))}

              <div className="flex flex-col gap-4">
                <span className="text-2xl font-serif text-brand-navy dark:text-gray-100">Projects</span>
                <div className="flex flex-col gap-3 pl-4 border-l-2 border-brand-gold/30">
                  <Link
                    to="/projects/current"
                    className="text-lg text-gray-600 dark:text-gray-400 hover:text-brand-gold"
                  >
                    Current Projects
                  </Link>
                  <Link
                    to="/projects/completed"
                    className="text-lg text-gray-600 dark:text-gray-400 hover:text-brand-gold"
                  >
                    Completed Projects
                  </Link>
                </div>
              </div>

              <Link
                to="/contact"
                className="text-2xl font-serif text-brand-navy dark:text-gray-100"
              >
                Contact Us
              </Link>

              <div className="mt-8">
                <Link
                  to="/registration"
                  className="inline-block w-full text-center bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy text-lg font-semibold px-6 py-4 rounded-md"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
