'use client';

import { Inter, Playfair_Display } from 'next/font/google';
// import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import AdminHeader from '@/src/components/admin/AdminHeader';
import AdminSidebar from '@/src/components/admin/AdminSidebar';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('svi-theme-v1');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored === 'dark' || (stored !== 'light' && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.classList.toggle('light', !next);
    localStorage.setItem('svi-theme-v1', next ? 'dark' : 'light');
  };

  return (
    <div
      className={`${inter.variable} ${playfair.variable} flex min-h-screen w-full bg-gray-50 font-sans text-gray-900 dark:bg-[#0a0a0f] dark:text-white`}
      style={{ visibility: mounted ? 'visible' : 'hidden' }}
    >
      <AdminSidebar />
      <div className="relative flex h-screen w-full flex-1 flex-col overflow-x-hidden">
        <AdminHeader isDark={isDark} toggleTheme={toggleTheme} />

        <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
