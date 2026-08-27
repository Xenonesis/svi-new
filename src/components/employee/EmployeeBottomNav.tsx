'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Clock, CheckSquare, CalendarDays, User, Banknote } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  {
    name: 'Home',
    href: '/employee/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Punch',
    href: '/employee/attendance',
    icon: Clock,
  },
  {
    name: 'Work',
    href: '/employee/work',
    icon: CheckSquare,
  },
  {
    name: 'History',
    href: '/employee/attendance/history',
    icon: CalendarDays,
  },
  {
    name: 'Salary',
    href: '/employee/payroll',
    icon: Banknote,
  },
  {
    name: 'Profile',
    href: '/employee/profile',
    icon: User,
  },
];

export default function EmployeeBottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on login page
  if (pathname === '/employee/login') {
    return null;
  }

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/employee/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-150',
                isActive
                  ? 'font-semibold text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <div
                className={clsx(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-all',
                  isActive &&
                    'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950/60 dark:text-blue-400'
                )}
              >
                <Icon className={clsx('h-5 w-5', isActive && 'stroke-[2.2]')} />
              </div>
              <span className="mt-0.5 text-[11px] tracking-tight">{item.name}</span>
              {isActive && (
                <span className="absolute bottom-1 h-1 w-4 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
