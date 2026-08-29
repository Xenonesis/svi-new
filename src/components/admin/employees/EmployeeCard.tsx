'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import {
  Trash2,
  Pencil,
  Mail,
  Phone,
  Calendar,
  FileText,
  Copy,
  CheckCircle2,
  KeyRound,
  BarChart3,
  Clock,
  MessageSquare,
  PhoneCall,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import type { EmployeeLiveStatus } from '@/src/lib/supabase/types';
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

/**
 * Builds a standard WhatsApp chat URL for the employee.
 */
export function getWhatsAppUrl(phone: string, name: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  const cleanPhone = digits.length === 10 ? `91${digits}` : digits;
  const text = encodeURIComponent(`Hi ${name},`);
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

interface EmployeeCardProps {
  employee: Employee;
  liveStatus?: EmployeeLiveStatus | null;
  onEdit: () => void;
  onDelete: () => void;
  onResetPassword: () => void;
  onViewPerformance: () => void;
}

export function EmployeeCard({
  employee,
  liveStatus,
  onEdit,
  onDelete,
  onResetPassword,
  onViewPerformance,
}: EmployeeCardProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const sviEmail = getSviEmail(employee);
  const cleanNotes = employee.notes || '';
  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success('Employee ID copied');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    toast.success('Phone number copied');
    setTimeout(() => setCopiedPhone(false), 2000);
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
          <div className="absolute top-4 right-4 flex items-center gap-1">
            <button
              onClick={onEdit}
              className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
              title="Edit Profile & Details"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={onDelete}
              className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
              title="Delete Employee"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Live Attendance Status Badge */}
        <div className="mb-4">
          {!liveStatus || liveStatus.status === 'not_punched' ? (
            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-500 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />
                <span>Not Checked In Today</span>
              </div>
              <Clock size={12} className="text-slate-400" />
            </div>
          ) : liveStatus.status === 'punched_in' ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400">
              <div className="flex min-w-0 items-center gap-2">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="truncate">
                  Punched In
                  {liveStatus.punch_in_time ? (
                    <span className="font-normal opacity-90">
                      {' '}
                      • {format(new Date(liveStatus.punch_in_time), 'hh:mm a')}
                    </span>
                  ) : null}
                </span>
              </div>
              {liveStatus.is_late ? (
                <span className="shrink-0 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 uppercase dark:text-amber-300">
                  Late
                </span>
              ) : (
                <span className="shrink-0 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Active Now
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 transition-colors dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                <span className="truncate">
                  Punched Out
                  {liveStatus.punch_out_time ? (
                    <span className="opacity-90">
                      {' '}
                      • {format(new Date(liveStatus.punch_out_time), 'hh:mm a')}
                    </span>
                  ) : null}
                </span>
              </div>
              {liveStatus.total_hours != null && (
                <span className="shrink-0 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  {liveStatus.total_hours.toFixed(1)}h logged
                </span>
              )}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2.5">
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
            <div className="flex shrink-0 items-center gap-1">
              <a
                href={`mailto:${sviEmail}`}
                className="rounded p-1 text-gray-400 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                title={`Send email to ${sviEmail}`}
              >
                <Send size={12} />
              </a>
              <button
                onClick={() => handleCopyEmail(sviEmail)}
                className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                title="Copy SVI Email"
              >
                {copiedEmail ? (
                  <CheckCircle2 size={12} className="text-emerald-500" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </div>
          </div>

          {/* Personal Real Email (if exists and different from SVI email) */}
          {employee.real_email && employee.real_email.toLowerCase() !== sviEmail.toLowerCase() && (
            <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="truncate" title={employee.real_email}>
                Personal: {employee.real_email}
              </span>
            </div>
          )}

          {/* Phone & Quick Communication Actions */}
          {employee.phone && (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-gray-50/50 px-3 py-2 text-xs text-gray-700 dark:bg-white/[0.03] dark:text-gray-200">
              <div className="flex min-w-0 items-center gap-2">
                <Phone size={13} className="shrink-0 text-gray-400" />
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                  {employee.phone}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <a
                  href={getWhatsAppUrl(employee.phone, employee.full_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20 active:scale-95 dark:bg-emerald-500/15 dark:text-emerald-400"
                  title="Chat on WhatsApp"
                >
                  <MessageSquare size={11} />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${employee.phone}`}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-600 transition-all hover:bg-blue-500/20 active:scale-95 dark:bg-blue-500/15 dark:text-blue-400"
                  title="Direct Call"
                >
                  <PhoneCall size={11} />
                  <span>Call</span>
                </a>
                <button
                  onClick={() => handleCopyPhone(employee.phone!)}
                  className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                  title="Copy Phone Number"
                >
                  {copiedPhone ? (
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
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
