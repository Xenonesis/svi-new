'use client';

// import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import AdminHeader from '@/src/components/admin/AdminHeader';
import AdminSidebar from '@/src/components/admin/AdminSidebar';
import { AdminSessionProvider } from '@/src/components/admin/AdminSessionProvider';
import { supabase } from '@/src/lib/supabase/client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ThemeProvider, useTheme } from '@/src/components/ThemeProvider';

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState('Admin');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Get current user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        // Fetch admin profile
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.full_name) {
              setAdminName(data.full_name);
            }
          });
      }
    });
  }, []);

  // Update isDark based on theme and media query
  useEffect(() => {
    const updateIsDark = () => {
      if (theme === 'system') {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      } else {
        setIsDark(theme === 'dark');
      }
    };

    updateIsDark();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', updateIsDark);
      } else {
        mediaQuery.addListener(updateIsDark);
      }
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', updateIsDark);
        } else {
          mediaQuery.removeListener(updateIsDark);
        }
      };
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  // If on the admin login page, completely bypass the admin panel outer frame (header & sidebar)
  if (pathname === '/admin') {
    return (
      <AdminSessionProvider>
        <div className="min-h-screen w-full" style={{ visibility: mounted ? 'visible' : 'hidden' }}>
          {children}
        </div>
      </AdminSessionProvider>
    );
  }

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
            adminName={adminName}
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
