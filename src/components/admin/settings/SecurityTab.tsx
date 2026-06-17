'use client';

import { Lock, Eye, EyeOff, RefreshCw, Key, Smartphone, Laptop } from 'lucide-react';
import { getSettingsDensity, getSettingsInputClass, SETTINGS_LABEL_CLASS } from './helpers';

interface Security {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SessionDetails {
  ip: string;
  location: string;
  os: string;
  browser: string;
  isMobile: boolean;
}

interface SecurityTabProps {
  security: Security;
  setSecurity: React.Dispatch<React.SetStateAction<Security>>;
  showCurrentPass: boolean;
  setShowCurrentPass: React.Dispatch<React.SetStateAction<boolean>>;
  showNewPass: boolean;
  setShowNewPass: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPass: boolean;
  setShowConfirmPass: React.Dispatch<React.SetStateAction<boolean>>;
  saveLoading: boolean;
  handleUpdatePassword: (e: React.FormEvent) => Promise<void>;
  sessionDetails: SessionDetails;
  showToast: (type: 'success' | 'error', msg: string) => void;
  isCompact: boolean;
}

export function SecurityTab({
  security,
  setSecurity,
  showCurrentPass,
  setShowCurrentPass,
  showNewPass,
  setShowNewPass,
  showConfirmPass,
  setShowConfirmPass,
  saveLoading,
  handleUpdatePassword,
  sessionDetails,
  showToast,
  isCompact,
}: SecurityTabProps) {
  const { densityPadding, densityGridGap } = getSettingsDensity(isCompact);
  const inputClass = getSettingsInputClass(densityPadding);
  const labelClass = SETTINGS_LABEL_CLASS;

  return (
    <div className={isCompact ? 'space-y-6' : 'space-y-8'}>
      <div>
        <h2 className="text-brand-navy mb-1 font-sans font-serif text-xl font-bold dark:text-white">
          Security Settings
        </h2>
        <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
          Configure active login credentials, authentication keys, and inspect browser sessions.
        </p>
      </div>

      <form
        onSubmit={handleUpdatePassword}
        className={`space-y-5 rounded-xl border border-gray-100 bg-gray-50/50 dark:border-white/5 dark:bg-white/2 ${isCompact ? 'p-4' : 'p-5'}`}
      >
        <h3 className="flex items-center gap-2 font-sans text-sm font-bold text-gray-900 dark:text-white">
          <Lock className="text-brand-gold h-4 w-4" /> Change Portal Password
        </h3>

        <div className={`grid gap-5 md:grid-cols-3 ${densityGridGap}`}>
          <div className="relative">
            <label className={labelClass}>Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                value={security.currentPassword}
                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                placeholder="••••••••"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="hover:text-brand-gold absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400"
              >
                {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className={labelClass}>New Password</label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                value={security.newPassword}
                onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                placeholder="Min 8 chars"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="hover:text-brand-gold absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400"
              >
                {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className={labelClass}>Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={security.confirmPassword}
                onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                placeholder="Min 8 chars"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="hover:text-brand-gold absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400"
              >
                {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 font-sans">
          <button
            type="submit"
            disabled={saveLoading}
            className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-sans text-xs font-bold tracking-widest uppercase shadow-md transition-all disabled:opacity-60"
          >
            {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Update Password'}
          </button>
        </div>
      </form>

      {/* Active Sessions Visualizer */}
      <div className="space-y-4 font-sans">
        <h3 className="flex items-center gap-2 font-sans text-sm font-bold text-gray-900 dark:text-white">
          <Key className="text-brand-gold h-4 w-4" /> Active Device Sessions (Real-Time)
        </h3>
        <div className="space-y-3">
          {/* REAL DETECTED CURRENT SESSION */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-[#111118]/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                {sessionDetails.isMobile ? (
                  <Smartphone className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Laptop className="h-5 w-5 text-emerald-500" />
                )}
              </div>
              <div className="font-sans">
                <div className="flex items-center gap-2">
                  <h4 className="font-sans text-xs font-bold text-gray-900 dark:text-white">
                    {sessionDetails.os} ({sessionDetails.browser})
                  </h4>
                  <span className="rounded border border-emerald-500/25 bg-emerald-500/15 px-1.5 py-0.5 text-[7px] font-bold tracking-widest text-emerald-500 uppercase">
                    Active Now (This Device)
                  </span>
                </div>
                <p className="mt-0.5 font-sans text-[10px] text-gray-500">
                  IP: {sessionDetails.ip} • Location: {sessionDetails.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
