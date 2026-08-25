'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Phone,
  Building,
  Clock,
  Shield,
  LogOut,
  Moon,
  Sun,
  CheckCircle2,
  QrCode,
  Sparkles,
  Loader2,
  Smartphone,
  Globe,
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { useTheme } from '@/src/components/ThemeProvider';
import { toast } from 'sonner';

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

        const { data } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, department, phone, created_at')
          .eq('id', user.id)
          .single();

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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-xs font-medium text-slate-500">Loading your profile...</p>
      </div>
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
          {/* Digital Employee ID Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-white shadow-xl dark:border-slate-800"
          >
            {/* Background Accents */}
            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />

            {/* Card Header */}
            <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 p-1.5 backdrop-blur-md">
                  <Image
                    src="/logo.png"
                    alt="SVI Logo"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wider text-white/90 uppercase">
                    SVI Infra Solutions
                  </p>
                  <p className="text-[10px] font-medium text-blue-300">Official Staff Badge</p>
                </div>
              </div>

              <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> Active
              </span>
            </div>

            {/* Employee Info */}
            <div className="relative my-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl font-black text-white shadow-lg">
                {profile?.full_name?.charAt(0) || 'E'}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-bold text-white">
                  {profile?.full_name || 'Staff Member'}
                </h2>
                <p className="text-xs font-medium text-blue-300">
                  {profile?.department || 'Operations & Field Sales'}
                </p>
                <p className="mt-1 font-mono text-[11px] text-white/70">ID: {employeeCode}</p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 p-2 text-white/80">
                <QrCode className="h-8 w-8" />
              </div>
            </div>

            {/* Details Footer */}
            <div className="relative grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-xs text-white/80">
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 shrink-0 text-blue-300" />
                <span className="truncate text-[11px]">{profile?.email}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                <span className="text-[11px] capitalize">{profile?.role || 'Employee'} Access</span>
              </div>
            </div>
          </motion.div>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 py-3.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-500/10 dark:bg-red-950/20 dark:text-red-400"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogOut className="h-4 w-4" /> Sign Out of Workspace
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Guidelines, Preferences & Access (7 Columns) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Shift & Work Timings Card */}
          <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Shift & Department Guidelines
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Regular Shift Window</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  09:00 AM – 06:00 PM
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Building className="h-4 w-4 text-emerald-500" />
                  <span>Base Station</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  SVI Central Office / Sites
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span>Geofencing Radius</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  200m GPS Verified
                </span>
              </div>
            </div>
          </div>

          {/* Unified Access Card (Web & App) */}
          <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Unified Multi-Device Access
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <Globe className="h-4 w-4" /> Web Workspace
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Full desktop access on any browser via sviinfrasolutions.com/employee
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Smartphone className="h-4 w-4" /> Android App
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Native GPS geofencing & shift push alerts on SVI Workspace APK
                </p>
              </div>
            </div>
          </div>

          {/* Preferences & Settings */}
          <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Workspace Preferences
            </h3>

            {/* Theme Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Interface Appearance
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {theme === 'dark' ? 'Dark theme active' : 'Light theme active'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
