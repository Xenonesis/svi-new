'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useRouter } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Briefcase,
  User,
  LogOut,
  ChevronDown,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '@/src/stores/authStore';

interface UserNavDropdownProps {
  isHomeTransparent: boolean;
}

export function UserNavDropdown({ isHomeTransparent }: UserNavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations('nav');

  const profile = useAuthStore((s) => s.profile);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const signOut = useAuthStore((s) => s.signOut);

  const role =
    isAdmin || profile?.role === 'admin'
      ? 'admin'
      : profile?.role === 'employee'
        ? 'employee'
        : 'client';

  const roleConfig = {
    admin: {
      badge: t('roleAdmin'),
      badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      dashboardPath: '/admin',
      dashboardLabel: t('adminPanel'),
      settingsPath: '/admin/settings',
      icon: ShieldCheck,
      quickButtonClass:
        'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-amber-500/20',
    },
    employee: {
      badge: t('roleEmployee'),
      badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      dashboardPath: '/employee/dashboard',
      dashboardLabel: t('staffPortal'),
      settingsPath: '/employee/profile',
      icon: Briefcase,
      quickButtonClass:
        'bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-indigo-600/20',
    },
    client: {
      badge: t('roleClient'),
      badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      dashboardPath: '/portal',
      dashboardLabel: t('myAccount'),
      settingsPath: '/portal/settings',
      icon: User,
      quickButtonClass:
        'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-amber-500/20',
    },
  }[role];

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = useCallback(async () => {
    setIsOpen(false);
    await signOut();
    router.push('/');
    router.refresh();
  }, [signOut, router]);

  const displayName = profile?.full_name?.trim() || profile?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || '';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';

  const QuickIcon = roleConfig.icon;

  return (
    <div
      ref={dropdownRef}
      className={`relative flex items-center gap-2.5 border-l pl-3 xl:gap-3 xl:pl-4 2xl:gap-3.5 2xl:pl-5 ${
        isHomeTransparent ? 'border-white/25' : 'border-slate-200 dark:border-white/15'
      }`}
    >
      {/* Primary Quick Access Action Button */}
      <Link
        href={roleConfig.dashboardPath}
        className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-extrabold tracking-wider uppercase shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 2xl:px-4.5 2xl:py-2 2xl:text-[12px] ${roleConfig.quickButtonClass}`}
      >
        <QuickIcon className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
        <span className="whitespace-nowrap">{roleConfig.dashboardLabel}</span>
      </Link>

      {/* User Avatar & Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
        className={`group relative flex items-center gap-1.5 rounded-full p-1 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          isHomeTransparent ? 'hover:bg-white/15' : 'hover:bg-slate-100 dark:hover:bg-slate-800/80'
        }`}
      >
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 text-[11px] font-bold text-amber-400 shadow-sm ring-2 ring-amber-400/50 transition-transform duration-200 group-hover:scale-105 dark:from-slate-800 dark:to-slate-700">
          {initials}
          <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
            isHomeTransparent
              ? 'text-white/80 group-hover:text-white'
              : 'text-slate-600 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white'
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full right-0 z-50 mt-2.5 w-64 origin-top-right rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95"
          >
            {/* User Details Header */}
            <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800/80">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {displayName}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${roleConfig.badgeClass}`}
                >
                  {roleConfig.badge}
                </span>
              </div>
              {displayEmail && (
                <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {displayEmail}
                </p>
              )}
            </div>

            {/* Menu Links */}
            <div className="py-1.5">
              <Link
                href={roleConfig.dashboardPath}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:text-slate-200 dark:hover:bg-amber-400/10 dark:hover:text-amber-400"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-400 group-hover:text-amber-500" />
                <span>{roleConfig.dashboardLabel}</span>
              </Link>

              <Link
                href={roleConfig.settingsPath}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                <span>{t('settings')}</span>
              </Link>
            </div>

            {/* Sign Out Button */}
            <div className="border-t border-slate-100 pt-1.5 dark:border-slate-800/80">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
