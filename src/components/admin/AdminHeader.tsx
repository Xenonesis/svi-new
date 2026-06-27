'use client';

import { Menu, Moon, Search, Sun, Monitor } from 'lucide-react';

import NotificationDropdown from './NotificationDropdown';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface AdminHeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  adminName?: string;
  userId?: string;
  onMenuClick?: () => void;
  theme?: 'light' | 'dark' | 'system';
}

export default function AdminHeader({
  isDark,
  toggleTheme,
  adminName = 'Admin',
  userId,
  onMenuClick,
  theme,
}: AdminHeaderProps) {
  const pathname = usePathname();
  // const router = useRouter();

  // Format pathname for breadcrumb (e.g., /admin/payment-receipt -> Payment Receipt)
  const pathParts = pathname.split('/').filter(Boolean);
  let breadcrumb = 'Dashboard';
  if (pathParts.length > 1) {
    const lastPart = pathParts[pathParts.length - 1];
    breadcrumb = lastPart
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const [_loggingOut, _setLoggingOut] = useState(false);

  return (
    <header className="dark:border-brand-gold/15 relative sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-xl transition-colors duration-300 dark:bg-[#0d0d14]/75">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Hamburger button — mobile only */}
          <button
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="hover:text-brand-gold flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-white/10"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <span className="hover:text-brand-gold hidden cursor-pointer transition-colors sm:inline">
              Admin
            </span>
            <span className="hidden sm:inline">/</span>
            <span className="font-bold tracking-wide text-gray-900 dark:text-white">
              {breadcrumb}
            </span>
          </div>
        </div>

        {/* Global Search & Actions */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="relative mr-4 hidden w-full max-w-xs md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Quick search... (Ctrl+K)"
              className="focus:border-brand-gold focus:ring-brand-gold/30 w-full rounded-full border border-transparent bg-gray-100 py-1.5 pr-4 pl-9 text-xs text-gray-900 placeholder-gray-500 transition-all focus:ring-1 focus:outline-none dark:border-white/5 dark:bg-[#111118] dark:text-white"
            />
          </div>

          {/* Notifications */}
          {userId && <NotificationDropdown userId={userId} />}

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="hover:text-brand-gold cursor-pointer p-2 text-gray-500 transition-colors"
          >
            {theme === 'system' ? (
              <Monitor className="h-5 w-5" />
            ) : theme === 'dark' || (theme === undefined && isDark) ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>

          <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-white/10"></div>

          <div className="group flex cursor-pointer items-center gap-2.5 pl-1">
            <div className="bg-brand-gold/20 border-brand-gold/40 text-brand-gold group-hover:bg-brand-gold/30 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold uppercase transition-colors">
              {adminName.substring(0, 2)}
            </div>
            <span className="group-hover:text-brand-gold hidden text-sm font-semibold text-gray-700 transition-colors sm:block dark:text-gray-200">
              {adminName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
