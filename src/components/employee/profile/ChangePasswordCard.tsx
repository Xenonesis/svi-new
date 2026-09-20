'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/src/lib/supabase/client';

export function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation
  const hasMinLength = newPassword.length >= 8;
  const hasMixedChars = /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (!hasMinLength) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch('/api/employee/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || data?.error?.message || 'Failed to update password.');
      }

      setSuccessMessage('Password updated successfully! Admin has been notified.');
      toast.success('Password updated successfully', {
        description: 'Your workspace password is now updated and secure.',
      });

      // Reset form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred while updating password.';
      setError(msg);
      toast.error('Password Update Failed', { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Security & Change Password
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update your temporary or current password to keep your account secure
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <div>
            <p className="font-semibold">{successMessage}</p>
            <p className="mt-0.5 text-[11px] opacity-90">
              System administrators have received an automated verification notice.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Current Password */}
        <div>
          <label
            htmlFor="emp-current-password"
            className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Current or Temporary Password
          </label>
          <div className="relative">
            <input
              id="emp-current-password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current / temporary password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-10 pl-3.5 text-xs text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="emp-new-password"
            className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="emp-new-password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new strong password"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-10 pl-3.5 text-xs text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="emp-confirm-password"
            className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="emp-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-10 pl-3.5 text-xs text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Password Strength Checklist */}
        {newPassword && (
          <div className="space-y-1.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-[11px] dark:border-slate-800/80 dark:bg-slate-950/40">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`h-3.5 w-3.5 ${hasMinLength ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}
              />
              <span
                className={
                  hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                }
              >
                At least 8 characters long
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`h-3.5 w-3.5 ${hasMixedChars ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}
              />
              <span
                className={
                  hasMixedChars ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                }
              >
                Includes both letters and numbers
              </span>
            </div>
            {confirmPassword && (
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-3.5 w-3.5 ${passwordsMatch ? 'text-emerald-500' : 'text-rose-400'}`}
                />
                <span
                  className={
                    passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                  }
                >
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Encrypted with Supabase Auth</span>
          </div>

          <button
            type="submit"
            disabled={loading || !currentPassword || !hasMinLength || !passwordsMatch}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm transition-all hover:bg-amber-400 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
