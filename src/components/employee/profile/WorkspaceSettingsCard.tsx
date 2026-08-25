'use client';

import React from 'react';
import { Clock, Building, Shield, Smartphone, Globe, Sun, Moon } from 'lucide-react';

interface WorkspaceSettingsCardProps {
  theme: string | undefined;
  onThemeToggle: () => void;
}

export function WorkspaceSettingsCard({ theme, onThemeToggle }: WorkspaceSettingsCardProps) {
  return (
    <div className="space-y-6">
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
