'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  CalendarDays,
  User,
  Moon,
  Sun,
  Shield,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '@/src/components/ThemeProvider';

const navTabs = [
  {
    name: 'Dashboard',
    href: '/employee/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Punch Terminal',
    href: '/employee/attendance',
    icon: Clock,
  },
  {
    name: 'Work Tracker',
    href: '/employee/work',
    icon: CheckSquare,
  },
  {
    name: 'Attendance & Leaves',
    href: '/employee/attendance/history',
    icon: CalendarDays,
  },
  {
    name: 'Profile & Settings',
    href: '/employee/profile',
    icon: User,
  },
];

export default function EmployeeHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<{
    full_name?: string;
    department?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name, department, email')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
      }
    }
    loadProfile();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md transition-colors sm:px-6 lg:px-8 dark:border-slate-800/80 dark:bg-slate-950/90">
      {/* Brand & Sub-Brand */}
      <Link href="/employee/dashboard" className="flex shrink-0 items-center gap-3">
        <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-slate-900 p-1.5 shadow-sm dark:bg-slate-800">
          <Image
            src="/logo.png"
            alt="SVI Logo"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              SVI Workspace
            </span>
            <span className="hidden rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 sm:inline-block dark:bg-blue-400/10 dark:text-blue-400">
              Staff
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {profile?.department || 'Operations & Field Sales'}
          </span>
        </div>
      </Link>

      {/* Desktop Navigation Tabs (Hidden on mobile) */}
      <nav className="hidden items-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1 md:flex dark:border-slate-800 dark:bg-slate-900/60">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/employee/dashboard' && pathname?.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all',
                isActive
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              <Icon
                className={clsx(
                  'h-3.5 w-3.5',
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                )}
              />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* User Profile Pill (Desktop) */}
        {profile?.full_name && (
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs lg:flex dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {profile.full_name.charAt(0)}
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {profile.full_name}
            </span>
          </div>
        )}

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>

        {/* Mobile Profile Link */}
        <Link
          href="/employee/profile"
          aria-label="Staff Profile"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 md:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <User className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
