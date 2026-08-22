import {
  Check,
  Clock,
  FileText,
  FileSignature,
  Star,
  Trophy,
  Gift,
  AlertTriangle,
  Ban,
  FileWarning,
  Receipt,
} from 'lucide-react';
import rawTemplates from '@/src/data/email-templates.json';
import type { ElementType } from 'react';

const ICON_MAP: Record<string, ElementType> = {
  Check,
  Clock,
  FileText,
  FileSignature,
  Star,
  Trophy,
  Gift,
  AlertTriangle,
  Ban,
  FileWarning,
  Receipt,
};

export const EMAIL_TEMPLATES = rawTemplates.map((tpl) => ({
  ...tpl,
  icon: ICON_MAP[tpl.icon] || FileText,
}));

export interface TagDef {
  name: string;
  color: string;
  bg: string;
  border: string;
}

export const COMMON_TAGS: TagDef[] = [
  {
    name: 'Urgent',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
  },
  {
    name: 'Lead',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
  },
  {
    name: 'Site Visit',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
  },
  {
    name: 'Quotation',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/20',
  },
  {
    name: 'Payment',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    border: 'border-purple-200 dark:border-purple-500/20',
  },
  {
    name: 'VIP',
    color: 'text-yellow-700 dark:text-yellow-300',
    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
    border: 'border-yellow-200 dark:border-yellow-500/20',
  },
  {
    name: 'Follow Up',
    color: 'text-cyan-700 dark:text-cyan-300',
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
    border: 'border-cyan-200 dark:border-cyan-500/20',
  },
  {
    name: 'Support',
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
    border: 'border-orange-200 dark:border-orange-500/20',
  },
];

export function getTagStyle(tagName: string): TagDef {
  const found = COMMON_TAGS.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
  if (found) return found;
  return {
    name: tagName,
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
  };
}
