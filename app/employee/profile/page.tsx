'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { useTheme } from '@/src/components/ThemeProvider';
import { toast } from 'sonner';
import { DigitalStaffIdCard } from '@/src/components/employee/profile/DigitalStaffIdCard';
import { WorkspaceSettingsCard } from '@/src/components/employee/profile/WorkspaceSettingsCard';
import { BrandedLoadingState } from '@/src/components/employee/BrandedLoadingState';

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department?: string | null;
  phone?: string | null;
  created_at?: string;
}

export default function EmployeeProfilePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace('/employee/login');
          return;
        }

        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      toast.success('Signed out of SVI Workspace');
      router.replace('/employee/login');
    } catch {
      toast.error('Logout failed');
      setLoggingOut(false);
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (loading) {
    return (
      <BrandedLoadingState
        message="Loading Staff Identity..."
        subMessage="Retrieving verified employee badge & settings"
      />
    );
  }

  const employeeCode = profile?.id ? `SVI-${profile.id.slice(0, 6).toUpperCase()}` : 'SVI-EMP';

  return (
    <div className="space-y-6 pb-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
          Employee Identity & Settings
        </h1>
        <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Official staff badge, shift guidelines, and workspace preferences
        </p>
      </div>

      {/* 2-Column Desktop Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Digital ID Card & Quick Logout (5 Columns) */}
        <div className="space-y-6 lg:col-span-5">
          <DigitalStaffIdCard
            profile={profile}
            employeeCode={employeeCode}
            loggingOut={loggingOut}
            onLogout={handleLogout}
          />
        </div>

        {/* RIGHT COLUMN: Shift Guidelines & Preferences (7 Columns) */}
        <div className="space-y-6 lg:col-span-7">
          <WorkspaceSettingsCard
            theme={theme}
            onThemeToggle={handleThemeToggle}
            profile={profile}
          />
        </div>
      </div>
    </div>
  );
}
