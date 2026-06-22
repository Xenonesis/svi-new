'use client';

import {
  Activity,
  Server,
  ShieldCheck,
  Database,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { SystemHealth } from './hooks/useSettings';

interface OverviewTabProps {
  systemHealth: SystemHealth;
  profile: { fullName: string; email: string; role: string };
  sessionDetails: { ip: string; location: string };
  isCompact: boolean;
}

function StatusDot({ ok }: { ok: string | boolean }) {
  if (ok === 'loading') return <Loader2 className="h-3 w-3 animate-spin text-gray-400" />;
  if (ok === true || ok === 'ok') return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
  return <XCircle className="h-3 w-3 text-red-500" />;
}

export function OverviewTab({
  systemHealth,
  profile,
  sessionDetails,
  isCompact,
}: OverviewTabProps) {
  const spacing = isCompact ? 'space-y-4' : 'space-y-6';

  const cards = [
    {
      icon: Database,
      label: 'Supabase Connection',
      status: systemHealth.supabase,
      detail: 'Backend data layer',
    },
    {
      icon: Mail,
      label: 'Resend API (Email)',
      status: systemHealth.resend,
      detail: 'Transactional email service',
    },
    {
      icon: ShieldCheck,
      label: 'System Version',
      status: true as const,
      detail: systemHealth.version || 'svi-infra',
    },
  ];

  return (
    <div className={spacing}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-brand-navy mb-1 flex items-center gap-2 font-serif text-xl font-bold dark:text-white">
          <Activity className="text-brand-gold h-5 w-5" />
          System Overview
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Real-time platform health, environment info, and quick actions.
        </p>
      </motion.div>

      {/* Health cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-white/8"
          >
            <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
            <div className="mb-3 flex items-center justify-between">
              <card.icon className="text-brand-gold h-5 w-5" />
              <StatusDot ok={card.status} />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{card.label}</p>
            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">{card.detail}</p>
          </motion.div>
        ))}
      </div>

      {/* Admin info card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-white/8"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
          <Server className="text-brand-gold h-4 w-4" />
          Active Session Info
        </h3>
        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Admin
            </span>
            <p className="font-semibold text-gray-900 dark:text-white">{profile.fullName}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Role
            </span>
            <p className="font-semibold text-gray-900 dark:text-white">{profile.role}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              IP Address
            </span>
            <p className="font-semibold text-gray-900 dark:text-white">{sessionDetails.ip}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Location
            </span>
            <p className="font-semibold text-gray-900 dark:text-white">{sessionDetails.location}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
