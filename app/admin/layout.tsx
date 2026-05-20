'use client';

// import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import AdminHeader from '@/src/components/admin/AdminHeader';
import AdminSidebar from '@/src/components/admin/AdminSidebar';
import { AdminSessionProvider } from '@/src/components/admin/AdminSessionProvider';
import { supabase } from '@/src/lib/supabase/client';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const stored = localStorage.getItem('svi-theme-v1');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored === 'dark' || (stored !== 'light' && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
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

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.classList.toggle('light', !next);
    localStorage.setItem('svi-theme-v1', next ? 'dark' : 'light');
  };

  return (
    <AdminSessionProvider>
      <div
        className="flex min-h-screen w-full bg-gray-50 font-sans text-gray-900 dark:bg-[#0a0a0f] dark:text-white"
        style={{ visibility: mounted ? 'visible' : 'hidden' }}
      >
        <AdminSidebar />
        <div className="relative flex h-screen w-full flex-1 flex-col overflow-x-hidden">
          <AdminHeader
            isDark={isDark}
            toggleTheme={toggleTheme}
            userId={userId || ''}
            adminName={adminName}
          />

          <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
        </div>
      </div>
    </AdminSessionProvider>
  );
}
