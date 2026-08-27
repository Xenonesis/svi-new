'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Trash2,
  Mail,
  Phone,
  Calendar,
  FileText,
  Copy,
  CheckCircle2,
  KeyRound,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  real_email?: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

/**
 * Returns the official SVI Corporate Email address for an employee.
 * If the email is already an SVI domain, returns it.
 * If the email is a personal domain (e.g. Gmail), derives the official SVI email.
 */
export function getSviEmail(employee: {
  email: string;
  full_name?: string;
  real_email?: string | null;
}): string {
  const rawEmail = (employee.email || '').trim();
  if (
    /@svi(?:infra|infrasolutions)?\.(?:com|in)/i.test(rawEmail) ||
    rawEmail.toLowerCase().includes('@svi')
  ) {
    return rawEmail.toLowerCase();
  }

  const prefix = rawEmail.split('@')[0] || '';
  if (prefix) {
    const clean = prefix.replace(/\.sviinfrasolutions$/i, '').replace(/\.svi$/i, '');
    return `${clean.toLowerCase()}@sviinfra.com`;
  }

  if (employee.full_name) {
    const slug = employee.full_name.trim().toLowerCase().replace(/\s+/g, '.');
    return `${slug}@sviinfra.com`;
  }

  return rawEmail;
}

interface EmployeeCardProps {
  employee: Employee;
  onDelete: () => void;
  onResetPassword: () => void;
  onViewPerformance: () => void;
}

export function EmployeeCard({
  employee,
  onDelete,
  onResetPassword,
  onViewPerformance,
}: EmployeeCardProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const cleanNotes = employee.notes || '';
  const sviEmail = getSviEmail(employee);

  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success('Employee ID copied');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    toast.success('Employee Login Email copied');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="dark:bg-brand-dark-surface relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/10"
    >
      <div className="via-brand-gold/30 absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent to-transparent" />

      <div>
        {/* Top Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex w-full items-center gap-3 overflow-hidden pr-8">
            <div className="bg-brand-gold/10 text-brand-gold flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-serif text-xl font-bold">
              {employee.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="w-full overflow-hidden">
              <h3 className="line-clamp-1 font-semibold text-gray-900 dark:text-white">
                {employee.full_name}
              </h3>
              <div className="mt-0.5 flex items-center gap-2">
                <p className="text-brand-gold truncate font-mono text-[11px] font-bold tracking-wider uppercase">
                  ID: {employee.id.slice(0, 8)}...
                </p>
                <button
                  onClick={() => handleCopyId(employee.id)}
                  className="hover:text-brand-gold shrink-0 text-gray-400 transition-colors"
                  title="Copy Full ID"
                >
                  {copiedId ? (
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onDelete}
            className="absolute top-4 right-4 shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            title="Delete Employee"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-5 space-y-2.5">
          {/* SVI Corporate Email */}
          <div className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-200">
            <div className="flex min-w-0 items-center gap-2.5">
              <Mail size={14} className="shrink-0 text-amber-500" />
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className="truncate text-xs font-semibold text-gray-900 dark:text-white"
                  title={sviEmail}
                >
                  {sviEmail}
                </span>
                <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[9px] font-bold tracking-wider text-amber-600 uppercase dark:bg-amber-400/15 dark:text-amber-300">
                  SVI
                </span>
              </div>
            </div>
            <button
              onClick={() => handleCopyEmail(sviEmail)}
              className="shrink-0 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-white"
              title="Copy SVI Email"
            >
              {copiedEmail ? (
                <CheckCircle2 size={13} className="text-emerald-500" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>

          {/* Personal Real Email (if exists and different from SVI email) */}
          {employee.real_email && employee.real_email.toLowerCase() !== sviEmail.toLowerCase() && (
            <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="truncate" title={employee.real_email}>
                Personal: {employee.real_email}
              </span>
            </div>
          )}

          {employee.phone && (
            <div className="flex items-center gap-2.5 px-1 text-xs text-gray-600 dark:text-gray-400">
              <Phone size={13} className="text-gray-400" />
              <span>{employee.phone}</span>
            </div>
          )}

          {cleanNotes && (
            <div className="mt-3 border-t border-gray-100 pt-3 dark:border-white/10">
              <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                <FileText size={13} className="mt-0.5 shrink-0 text-gray-400" />
                <p className="line-clamp-2 leading-relaxed">{cleanNotes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance & Actions Footer */}
      <div className="mt-5 space-y-3 border-t border-gray-100 pt-4 dark:border-white/10">
        {/* Performance Dashboard Button */}
        <button
          onClick={onViewPerformance}
          className="via-brand-gold/15 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-amber-500/15 px-3 py-2 text-xs font-bold text-amber-700 transition-all hover:bg-amber-500/25 active:scale-98 dark:text-amber-300"
        >
          <BarChart3 size={14} className="text-amber-500" />
          <span>Performance & Leads Dashboard</span>
        </button>

        {/* Secondary Actions Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
            <Calendar size={12} />
            <span>Joined {new Date(employee.created_at).toLocaleDateString()}</span>
          </div>
          <button
            onClick={onResetPassword}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-600 transition-all hover:bg-gray-100 active:scale-95 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
          >
            <KeyRound size={11} />
            <span>Reset Password</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
