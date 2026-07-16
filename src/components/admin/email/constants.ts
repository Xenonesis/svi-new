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

const ICON_MAP: Record<string, any> = {
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
