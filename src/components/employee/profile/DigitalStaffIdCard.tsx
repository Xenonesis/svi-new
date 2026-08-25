'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  Sparkles,
  QrCode,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  LogOut,
  Loader2,
} from 'lucide-react';

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department?: string | null;
  phone?: string | null;
  created_at?: string;
}

interface DigitalStaffIdCardProps {
  profile: ProfileData | null;
  employeeCode: string;
  loggingOut: boolean;
  onLogout: () => void;
}

export function DigitalStaffIdCard({
  profile,
  employeeCode,
  loggingOut,
  onLogout,
}: DigitalStaffIdCardProps) {
  return (
    <div className="space-y-6">
      {/* Digital Employee ID Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-white shadow-xl dark:border-slate-800"
      >
        {/* Background Accents */}
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />

        {/* Card Header with SVI Logo & Holographic Badge */}
        <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="SVI Infra Solutions"
              width={36}
              height={36}
              className="rounded-lg bg-white/10 p-1 backdrop-blur-md"
            />
            <div>
              <p className="text-xs font-black tracking-widest uppercase">SVI INFRA</p>
              <p className="text-[9px] font-medium tracking-wider text-slate-400">STAFF IDENTITY</p>
            </div>
          </div>

          <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-[9px] font-bold text-emerald-300">
            <Sparkles className="h-3 w-3" /> VERIFIED
          </span>
        </div>

        {/* Profile Avatar & Primary Info */}
        <div className="relative mt-5 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white/20 bg-gradient-to-tr from-blue-600 to-indigo-500 font-serif text-2xl font-black text-white shadow-lg">
            {profile?.full_name?.charAt(0) || 'E'}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {profile?.full_name || 'SVI Employee'}
            </h3>
            <p className="text-xs font-semibold text-blue-400 capitalize">
              {profile?.department || 'Operations'} • {profile?.role || 'Staff'}
            </p>
            <span className="mt-1 inline-block font-mono text-[10px] font-bold tracking-widest text-slate-400">
              {employeeCode}
            </span>
          </div>
        </div>

        {/* QR Code / Security Strip */}
        <div className="relative mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
          <div>
            <p className="text-[10px] font-semibold text-slate-300">Security Identification</p>
            <p className="text-[9px] text-slate-400">Access Key: {profile?.id.slice(0, 16)}...</p>
          </div>
          <QrCode className="h-7 w-7 text-slate-300 opacity-80" />
        </div>

        {/* Contact Snippets */}
        <div className="relative mt-4 space-y-1.5 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-blue-400" />
            <span>{profile?.email}</span>
          </div>
          {profile?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              <span>{profile.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Building className="h-3.5 w-3.5 text-purple-400" />
            <span>Jaipur Head Office & Site Network</span>
          </div>
        </div>
      </motion.div>

      {/* Logout Action */}
      <button
        onClick={onLogout}
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
  );
}
