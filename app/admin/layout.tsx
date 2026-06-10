'use client';

import { useEffect } from 'react';

import AdminHeader from '@/src/components/admin/AdminHeader';
import AdminSidebar from '@/src/components/admin/AdminSidebar';
import { AdminSessionProvider } from '@/src/components/admin/AdminSessionProvider';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/src/components/ThemeProvider';
import { useAuthStore } from '@/src/stores/authStore';
import { useUIStore } from '@/src/stores/uiStore';

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Auth store
  const userId = useAuthStore((s) => s.userId);
  const loading = useAuthStore((s) => s.loading);
  const profile = useAuthStore((s) => s.profile);
  const initialize = useAuthStore((s) => s.initialize);

  // UI store
  const isDark = useUIStore((s) => s.isDark);
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Sync isDark with system preference when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const updateDark = () => {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      useUIStore.getState().setIsDark(isSystemDark);
    };

    updateDark();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', updateDark);
    return () => mq.removeEventListener('change', updateDark);
  }, [theme]);

  // If on the admin login page, completely bypass the admin panel outer frame (header & sidebar)
  if (pathname === '/admin') {
    return (
      <AdminSessionProvider>
        <div className="min-h-screen w-full">{children}</div>
      </AdminSessionProvider>
    );
  }

  const mounted = !loading;

  return (
    <AdminSessionProvider>
      <div
        className="flex min-h-screen w-full bg-gray-50 font-sans text-gray-900 dark:bg-[#0a0a0f] dark:text-white"
        style={{ visibility: mounted ? 'visible' : 'hidden' }}
      >
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div className="relative flex h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
          <AdminHeader
            isDark={isDark}
            toggleTheme={toggleTheme}
            userId={userId || ''}
            adminName={profile?.full_name || 'Admin'}
            onMenuClick={() => setMobileSidebarOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </AdminSessionProvider>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ThemeProvider>
  );
}
