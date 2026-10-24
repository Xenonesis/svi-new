'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/src/components/ThemeProvider';
import { useLotteryVisibility } from '@/src/lib/hooks/useLotteryVisibility';

export function useHeaderNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileProjectsOpen, setIsMobileProjectsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { visible: lotteryVisible } = useLotteryVisibility();
  const isHomeTransparent = pathname === '/' && !isScrolled;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          // Hysteresis threshold: scroll down > 24px activates, scroll up < 8px deactivates
          setIsScrolled((prev) => {
            if (!prev && y > 24) return true;
            if (prev && y < 8) return false;
            return prev;
          });
          ticking = false;
        });
      }
    };

    // Check initial scroll position
    setIsScrolled(window.scrollY > 24);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProjectsOpen(false);
    setIsMoreOpen(false);
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

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleMouseEnter = useCallback(() => setIsProjectsOpen(true), []);
  const handleMouseLeave = useCallback(() => setIsProjectsOpen(false), []);
  const toggleProjects = useCallback(() => setIsProjectsOpen((prev) => !prev), []);

  const handleMoreMouseEnter = useCallback(() => setIsMoreOpen(true), []);
  const handleMoreMouseLeave = useCallback(() => setIsMoreOpen(false), []);
  const toggleMore = useCallback(() => setIsMoreOpen((prev) => !prev), []);

  const toggleMobileProjects = useCallback(() => {
    setIsMobileProjectsOpen((prev) => !prev);
  }, []);

  return {
    // State
    isScrolled,
    isMobileMenuOpen,
    isProjectsOpen,
    isMoreOpen,
    isMobileProjectsOpen,
    mounted,
    pathname,
    theme,
    lotteryVisible,
    isHomeTransparent,

    // Actions
    setTheme,
    toggleTheme,
    toggleMobileMenu,
    closeMobileMenu,
    handleMouseEnter,
    handleMouseLeave,
    toggleProjects,
    handleMoreMouseEnter,
    handleMoreMouseLeave,
    toggleMore,
    toggleMobileProjects,
    setIsMobileMenuOpen,
    setIsMobileProjectsOpen,
  };
}
