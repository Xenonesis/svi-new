'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import {
  Banknote,
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
    name: 'Salary & Payslips',
    href: '/employee/payroll',
    icon: Banknote,
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
    role?: string;
  } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name, department, email, role')
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

  // Hide header on login page
  if (pathname === '/employee/login') {
    return null;
  }

  return (
    <>
      {profile?.role === 'admin' && (
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-700 backdrop-blur-md dark:border-amber-400/20 dark:bg-amber-950/40 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            <span className="font-semibold">Admin Mode: Viewing Staff Workspace</span>
          </div>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-500/30 dark:bg-amber-400/20 dark:text-amber-200 dark:hover:bg-amber-400/30"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Switch to Admin Console</span>
            <span>&rarr;</span>
          </Link>
        </div>
      )}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md transition-colors sm:px-6 lg:px-8 dark:border-slate-800/80 dark:bg-slate-950/90">
        {/* Brand & Sub-Brand */}
        <Link href="/employee/dashboard" className="group flex shrink-0 items-center gap-3">
          {/* Official SVI Logo Capsule Pill (Matching Home Page Navbar) */}
          <div className="relative inline-flex shrink-0 items-center rounded-[20px] bg-white px-3.5 py-1.5 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-md active:scale-[0.98] dark:ring-white/15">
            <Image
              src="/logo.png"
              alt="Svi Infra Solutions Pvt. Ltd."
              width={282}
              height={83}
              quality={100}
              priority
              className="h-7 w-auto max-w-full object-contain transition-all duration-300 sm:h-8"
            />
          </div>

          <div className="hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-800" />

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                SVI Workspace
              </span>
              <span
                className={clsx(
                  'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  profile?.role === 'admin'
                    ? 'bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400'
                    : 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400'
                )}
              >
                {profile?.role === 'admin' ? 'Admin' : 'Staff'}
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
              tab.href === '/employee/attendance'
                ? pathname === '/employee/attendance'
                : pathname === tab.href ||
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
          {profile?.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              className="hidden items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-500/20 sm:inline-flex dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Console</span>
            </Link>
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
    </>
  );
}
