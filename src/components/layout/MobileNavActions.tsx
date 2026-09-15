'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link, useRouter } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Briefcase, User, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '@/src/stores/authStore';

interface MobileNavActionsProps {
  onClose: () => void;
}

export function MobileNavActions({ onClose }: MobileNavActionsProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const t = useTranslations('nav');

  const userId = useAuthStore((s) => s.userId);
  const loading = useAuthStore((s) => s.loading);
  const profile = useAuthStore((s) => s.profile);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const signOut = useAuthStore((s) => s.signOut);
  const initializeAuth = useAuthStore((s) => s.initialize);

  useEffect(() => {
    setMounted(true);
    initializeAuth();
  }, [initializeAuth]);

  const handleSignOut = useCallback(async () => {
    onClose();
    await signOut();
    router.push('/');
    router.refresh();
  }, [onClose, signOut, router]);

  // If authenticated, show role-aware user card and actions
  if (mounted && !loading && userId) {
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
        primaryButtonClass: 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold',
      },
      employee: {
        badge: t('roleEmployee'),
        badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        dashboardPath: '/employee/dashboard',
        dashboardLabel: t('staffPortal'),
        settingsPath: '/employee/profile',
        icon: Briefcase,
        primaryButtonClass: 'bg-indigo-600 text-white hover:bg-indigo-500 font-bold',
      },
      client: {
        badge: t('roleClient'),
        badgeClass:
          'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        dashboardPath: '/portal',
        dashboardLabel: t('myAccount'),
        settingsPath: '/portal/settings',
        icon: User,
        primaryButtonClass: 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold',
      },
    }[role];

    const displayName = profile?.full_name?.trim() || profile?.email?.split('@')[0] || 'User';
    const displayEmail = profile?.email || '';
    const initials =
      displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'U';

    const RoleIcon = roleConfig.icon;

    return (
      <div className="flex flex-col gap-3">
        {/* User Profile Card */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-amber-400 ring-2 ring-amber-400/40 dark:bg-slate-800">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                {displayName}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${roleConfig.badgeClass}`}
              >
                {roleConfig.badge}
              </span>
            </div>
            {displayEmail && (
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {displayEmail}
              </p>
            )}
          </div>
        </div>

        {/* Primary Role Button */}
        <Link
          href={roleConfig.dashboardPath}
          onClick={onClose}
          className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-center text-[clamp(12px,3.5vw,14px)] tracking-wider uppercase shadow-sm transition-all duration-200 ${roleConfig.primaryButtonClass}`}
        >
          <RoleIcon className="h-4 w-4" />
          <span>{roleConfig.dashboardLabel}</span>
        </Link>

        {/* Settings & Sign Out Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={roleConfig.settingsPath}
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 rounded-full border border-slate-200 py-2 text-center text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>{t('settings')}</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center justify-center gap-1.5 rounded-full border border-rose-200/80 py-2 text-center text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>
    );
  }

  // Visitor (Logged out)
  return (
    <>
      <Link
        href="/login"
        onClick={onClose}
        className="border-brand-navy dark:border-brand-gold/45 text-brand-navy dark:text-brand-gold block w-full rounded-full border py-2.5 text-center text-[clamp(12px,3.5vw,14px)] font-semibold tracking-widest uppercase transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900"
      >
        {t('clientLogin')}
      </Link>
      <Link
        href="/registration"
        onClick={onClose}
        className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy block w-full rounded-full py-2.5 text-center text-[clamp(12px,3.5vw,14px)] font-semibold tracking-widest text-white uppercase"
      >
        {t('registerNow')}
      </Link>
    </>
  );
}
