'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/src/lib/supabase/client';
import { Moon, Sun, Bell, User } from 'lucide-react';
import { useTheme } from '@/src/components/ThemeProvider';

export default function EmployeeHeader() {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<{
    full_name?: string;
    department?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name, department, email')
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

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      <Link href="/employee/dashboard" className="flex items-center gap-2.5">
        <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-slate-900 p-1 dark:bg-slate-800">
          <Image
            src="/logo.png"
            alt="SVI Logo"
            width={28}
            height={28}
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            SVI Workspace
          </span>
          <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
            {profile?.department || 'Employee Portal'}
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>

        <Link
          href="/employee/profile"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <User className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
