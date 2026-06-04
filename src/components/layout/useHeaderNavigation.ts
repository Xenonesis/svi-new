'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/src/components/ThemeProvider';
import { useLotteryVisibility } from '@/src/lib/hooks/useLotteryVisibility';

export function useHeaderNavigation() {
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

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleMouseEnter = useCallback(() => setIsProjectsOpen(true), []);
  const handleMouseLeave = useCallback(() => setIsProjectsOpen(false), []);
  const toggleProjects = useCallback(() => setIsProjectsOpen((prev) => !prev), []);

  const toggleMobileProjects = useCallback(() => {
    setIsMobileProjectsOpen((prev) => !prev);
  }, []);

  return {
    // State
    isScrolled,
    isMobileMenuOpen,
    isProjectsOpen,
    isMobileProjectsOpen,
    mounted,
    pathname,
    theme,
    lotteryVisible,
    isHomeTransparent,
    sentinelRef,

    // Actions
    setTheme,
    toggleTheme,
    toggleMobileMenu,
    closeMobileMenu,
    handleMouseEnter,
    handleMouseLeave,
    toggleProjects,
    toggleMobileProjects,
    setIsMobileMenuOpen,
    setIsMobileProjectsOpen,
  };
}
