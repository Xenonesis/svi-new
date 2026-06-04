'use client';

import React from 'react';
import { Calendar, Mail, User, Zap } from 'lucide-react';

/* ─── Constants ─── */
export const PAGE_SIZE = 50;

export type SortField = 'date' | 'subject' | 'recipient' | 'status';
export type SortDir = 'asc' | 'desc';
export type DatePreset = 'all' | 'today' | '7d' | '30d' | '90d';

export interface SortOption {
  field: SortField;
  label: string;
  icon: React.ElementType;
}

export const SORT_OPTIONS: SortOption[] = [
  { field: 'date', label: 'Date', icon: Calendar },
  { field: 'subject', label: 'Subject', icon: Mail },
  { field: 'recipient', label: 'Recipient', icon: User },
  { field: 'status', label: 'Status', icon: Zap },
];

export const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'all', label: 'All time' },
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
];

export const STATUS_FILTER_OPTIONS = [
  { value: 'delivered', color: 'bg-emerald-500' },
  { value: 'opened', color: 'bg-violet-500' },
  { value: 'clicked', color: 'bg-indigo-500' },
  { value: 'bounced', color: 'bg-red-500' },
  { value: 'failed', color: 'bg-red-500' },
  { value: 'complained', color: 'bg-amber-500' },
  { value: 'sent', color: 'bg-blue-500' },
];

/* ─── Animation variants ─── */
export const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

export const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 26 } },
};

/* ─── Helpers ─── */
export function getInitials(email: string): string {
  const name = email.split('@')[0] || '';
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function getAvatarColor(email: string): string {
  const colors = [
    'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  ];
  let hash = 0;
  for (const ch of email) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

export function getStatusLabel(status: string): string {
  const s = status?.toLowerCase() || 'sent';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function StatusDot({ status }: { status: string }) {
  const s = status?.toLowerCase() || 'sent';
  const color = STATUS_FILTER_OPTIONS.find((o) => o.value === s)?.color || 'bg-blue-500';
  return <div className={`h-2 w-2 rounded-full ${color}`} />;
}
