'use client';

import { Menu, PanelLeft, PanelLeftClose, Moon, Search, Sun, Monitor } from 'lucide-react';
import { useUIStore } from '@/src/stores/uiStore';
import NotificationDropdown from './NotificationDropdown';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CommandPaletteModal } from './dashboard/executive/CommandPaletteModal';
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

  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);
  const [_loggingOut, _setLoggingOut] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const handleToggleNav = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onMenuClick?.();
    } else {
      toggleSidebarCollapsed();
    }
  };

  return (
    <header className="dark:border-brand-gold/15 relative sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-xl transition-colors duration-300 dark:bg-[#0d0d14]/75">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Unified Responsive Navigation / Sidebar Toggle */}
          <button
            onClick={handleToggleNav}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Toggle navigation menu'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Toggle navigation menu'}
            className="touch-target hover:text-brand-gold flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 active:scale-95 dark:text-gray-400 dark:hover:bg-white/10"
          >
            <span className="flex items-center justify-center md:hidden">
              <Menu className="h-5 w-5" />
            </span>
            <span className="hidden items-center justify-center md:flex">
              {sidebarCollapsed ? (
                <PanelLeft className="h-4.5 w-4.5" />
              ) : (
                <PanelLeftClose className="h-4.5 w-4.5" />
              )}
            </span>
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
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            aria-label="Quick search (Ctrl+K)"
            className="group hover:border-brand-gold/40 focus:border-brand-gold/50 focus:ring-brand-gold/20 mr-4 hidden w-full max-w-xs items-center gap-3 rounded-full border border-gray-200 bg-gray-100 px-4 py-1.5 text-xs text-gray-500 shadow-inner transition-all hover:bg-gray-200 hover:text-gray-900 focus:ring-2 focus:outline-none md:flex dark:border-white/10 dark:bg-[#090d16]/90 dark:text-gray-400 dark:hover:bg-[#0e1422] dark:hover:text-gray-200"
          >
            <Search className="group-hover:text-brand-gold h-3.5 w-3.5 text-gray-400 transition-colors dark:text-gray-400" />
            <span className="font-normal text-gray-500 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200">
              Quick search... (Ctrl+K)
            </span>
          </button>

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

        {/* Global Command Palette Spotlight */}
        <CommandPaletteModal isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      </div>
    </header>
  );
}
