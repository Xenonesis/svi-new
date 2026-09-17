'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useRouter } from '@/src/i18n/navigation';
import NextLink from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Briefcase, User, LogOut, ChevronDown, Settings } from 'lucide-react';
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
      badgeClass: 'bg-amber-400/15 text-amber-600 dark:text-amber-400 border-amber-400/30',
      dashboardPath: '/admin',
      dashboardLabel: t('adminPanel'),
      settingsPath: '/admin/settings',
      icon: ShieldCheck,
      unlocalized: true,
    },
    employee: {
      badge: t('roleEmployee'),
      badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      dashboardPath: '/employee/dashboard',
      dashboardLabel: t('staffPortal'),
      settingsPath: '/employee/profile',
      icon: Briefcase,
      unlocalized: true,
    },
    client: {
      badge: t('roleClient'),
      badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      dashboardPath: '/portal',
      dashboardLabel: t('myAccount'),
      settingsPath: '/portal/settings',
      icon: User,
      unlocalized: false,
    },
  }[role];

  const isUnlocalized = roleConfig.unlocalized;
  const DashboardLink = isUnlocalized ? NextLink : Link;
  const SettingsLink = isUnlocalized ? NextLink : Link;

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
      className={`relative flex items-center border-l pl-3 xl:pl-4 2xl:pl-5 ${
        isHomeTransparent ? 'border-white/25' : 'border-slate-200 dark:border-white/15'
      }`}
    >
      {/* Unified Luxury User Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User navigation menu"
        className={`group relative flex items-center gap-2 rounded-full py-1 pr-3 pl-1 transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          isOpen
            ? isHomeTransparent
              ? 'bg-white/20 ring-2 ring-white/30'
              : 'bg-slate-100 ring-2 ring-amber-400/30 dark:bg-white/10 dark:ring-amber-400/25'
            : isHomeTransparent
              ? 'border border-white/20 bg-white/10 hover:bg-white/15'
              : 'border border-slate-200/90 bg-white/80 shadow-sm hover:bg-slate-50 hover:shadow dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
        }`}
      >
        {/* Avatar Initials + Presence Indicator */}
        <div className="ring-1.5 relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 text-[11px] font-extrabold tracking-tight text-amber-400 shadow-sm ring-amber-400/40 transition-transform duration-200 group-hover:scale-105 dark:from-slate-900 dark:to-slate-800">
          {initials}
          <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
        </div>

        {/* Identity & Role Badge */}
        <div className="flex items-center gap-1.5 text-left">
          <span
            className={`max-w-[110px] truncate text-[12px] font-bold tracking-tight whitespace-nowrap 2xl:max-w-[130px] ${
              isHomeTransparent ? 'text-white' : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {roleConfig.dashboardLabel}
          </span>
          <span
            className={`hidden items-center rounded-full border px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase sm:inline-flex ${roleConfig.badgeClass}`}
          >
            {roleConfig.badge}
          </span>
        </div>

        {/* Chevron Indicator */}
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          } ${
            isHomeTransparent
              ? 'text-white/70 group-hover:text-white'
              : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
          }`}
        />
      </button>

      {/* Dropdown Menu Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="menu"
            aria-orientation="vertical"
            className="absolute top-full right-0 z-50 mt-2.5 w-72 origin-top-right rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c121e]/95"
          >
            {/* User Details Header */}
            <div className="border-b border-slate-100 px-3.5 py-3 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="ring-1.5 relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-slate-950 to-slate-800 text-[12px] font-extrabold text-amber-400 shadow-sm ring-amber-400/40 dark:from-slate-900 dark:to-slate-800">
                  {initials}
                  <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {displayName}
                    </span>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[9px] font-black tracking-wider uppercase ${roleConfig.badgeClass}`}
                    >
                      {roleConfig.badge}
                    </span>
                  </div>
                  {displayEmail && (
                    <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {displayEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Links */}
            <div className="py-1.5" role="none">
              <DashboardLink
                href={roleConfig.dashboardPath}
                prefetch={isUnlocalized ? false : undefined}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:text-slate-200 dark:hover:bg-amber-400/10 dark:hover:text-amber-400"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-slate-950 dark:bg-amber-400/15 dark:text-amber-400">
                  <QuickIcon className="h-4 w-4" />
                </div>
                <span className="font-semibold">{roleConfig.dashboardLabel}</span>
              </DashboardLink>

              <SettingsLink
                href={roleConfig.settingsPath}
                prefetch={isUnlocalized ? false : undefined}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-slate-200 group-hover:text-slate-900 dark:bg-white/5 dark:text-slate-400 dark:group-hover:bg-white/10 dark:group-hover:text-white">
                  <Settings className="h-4 w-4" />
                </div>
                <span className="font-semibold">{t('settings')}</span>
              </SettingsLink>
            </div>

            {/* Sign Out Button */}
            <div className="border-t border-slate-100 pt-1.5 dark:border-white/10" role="none">
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-rose-100 group-hover:text-rose-600 dark:bg-white/5 dark:text-slate-400 dark:group-hover:bg-rose-900/30 dark:group-hover:text-rose-400">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="font-semibold">{t('logout')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
