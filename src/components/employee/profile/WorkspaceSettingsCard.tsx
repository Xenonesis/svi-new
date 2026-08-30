'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Building,
  Shield,
  Smartphone,
  Globe,
  Sun,
  Moon,
  Banknote,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { supabase } from '@/src/lib/supabase/client';
import { biometricAuth } from '@/src/lib/auth/biometricAuth';

interface WorkspaceSettingsCardProps {
  theme: string | undefined;
  onThemeToggle: () => void;
  profile?: { id: string; email: string; full_name?: string } | null;
}

export function WorkspaceSettingsCard({
  theme,
  onThemeToggle,
  profile,
}: WorkspaceSettingsCardProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(profile?.id || null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(profile?.email || null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [togglingBiometric, setTogglingBiometric] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      setCurrentUserId(profile.id);
      setCurrentUserEmail(profile.email);
    } else {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setCurrentUserId(data.user.id);
          setCurrentUserEmail(data.user.email || '');
        }
      });
    }
  }, [profile]);

  useEffect(() => {
    if (currentUserId) {
      setBiometricEnabled(biometricAuth.isRegistered(currentUserId));
    }
  }, [currentUserId]);

  const handleBiometricToggle = async () => {
    if (!currentUserId || togglingBiometric) return;
    setTogglingBiometric(true);

    try {
      if (!biometricEnabled) {
        const email = currentUserEmail || 'employee@svi.internal';
        const result = await biometricAuth.registerWithFeedback(currentUserId, email);
        if (result.success) {
          setBiometricEnabled(true);
          toast.success('Biometric Quick Punch Enabled', {
            description: 'You can now punch in with Fingerprint, Face ID, or Windows Hello.',
          });
        } else if (result.reason === 'canceled') {
          toast.info('Biometric setup closed', {
            description: 'No changes made. You can enable Fingerprint/Face ID anytime.',
          });
        } else if (result.reason === 'unsupported') {
          toast.info('Biometric Sensor Not Detected', {
            description:
              'Device biometric sensor was not found. Standard GPS punch remains active.',
          });
        } else {
          toast.error('Could not complete biometric setup', {
            description: 'Please check your device screen lock / security settings and retry.',
          });
        }
      } else {
        biometricAuth.unregister(currentUserId);
        setBiometricEnabled(false);
        toast.success('Biometric Quick Punch disabled', {
          description: 'Passkey credentials removed from this device.',
        });
      }
    } catch {
      toast.error('Failed to update biometric settings');
    } finally {
      setTogglingBiometric(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Compensation & Payslips Link Card */}
      <Link
        href="/employee/payroll"
        className="group flex items-center justify-between rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-xs transition-all hover:bg-amber-500/10 dark:border-amber-500/20 dark:bg-amber-500/5 dark:hover:bg-amber-500/10"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-sm transition-transform group-hover:scale-105">
            <Banknote className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              My Salary & Monthly Payslips
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              View agreed package, attendance LOP, and download released payslips
            </p>
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-xs transition-transform group-hover:translate-x-1 dark:bg-slate-800 dark:text-slate-200">
          <ArrowRight className="h-4 w-4" />
        </div>
      </Link>

      {/* Official Shift & Guidelines */}
      <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          Shift & Base Guidelines
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Shift Timing</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              09:00 AM – 06:00 PM (IST)
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Building className="h-4 w-4 text-purple-500" />
              <span>Assigned Base Station</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">Jaipur Head Office</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>Geofence Policy</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              200m Verification Radius
            </span>
          </div>
        </div>
      </div>

      {/* Biometric Quick-Punch Passkey Settings */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Biometric Quick Punch
                </p>
                {biometricEnabled && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Verify identity with Fingerprint, Face ID, or Windows Hello
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={biometricEnabled}
            disabled={togglingBiometric || !currentUserId}
            onClick={handleBiometricToggle}
            className={clsx(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50',
              biometricEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            )}
          >
            <span
              aria-hidden="true"
              className={clsx(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                biometricEnabled ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
      </div>

      {/* Cross-Platform Access */}
      <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          Unified Multi-Device Access
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Smartphone className="h-4 w-4 text-blue-500" />
              <span>Android Workspace App</span>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Supported
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Globe className="h-4 w-4 text-purple-500" />
              <span>Desktop & Mobile Web</span>
            </div>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
              Active Sync
            </span>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-blue-400" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Workspace Appearance
              </p>
              <p className="text-[10px] text-slate-500">
                Currently using {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
          </div>

          <button
            onClick={onThemeToggle}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </div>
  );
}
