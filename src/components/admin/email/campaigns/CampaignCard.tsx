'use client';

import { motion } from 'motion/react';
import {
  Mail,
  Calendar,
  Clock,
  Edit3,
  Play,
  Copy,
  Trash2,
  Trophy,
  Ticket,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { Campaign } from '../types';

const statusConfig: Record<string, { color: string; dot: string; accent: string }> = {
  draft: {
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    dot: 'bg-gray-400',
    accent: 'border-l-gray-300 dark:border-l-gray-600',
  },
  scheduled: {
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    dot: 'bg-blue-500',
    accent: 'border-l-blue-500',
  },
  sent: {
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    accent: 'border-l-emerald-500',
  },
  cancelled: {
    color: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    dot: 'bg-red-500',
    accent: 'border-l-red-400',
  },
};

const formatISTDisplay = (utcString: string | null): string => {
  if (!utcString) return 'Not set';
  return (
    new Date(utcString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }) + ' (IST)'
  );
};

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
  onEdit: () => void;
  onSendNow: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function CampaignCard({
  campaign: c,
  index,
  onEdit,
  onSendNow,
  onDuplicate,
  onDelete,
}: CampaignCardProps) {
  const cfg = statusConfig[c.status] || statusConfig.draft;

  const targetCount =
    c.target_count ??
    (c.recipient_group === 'custom' ? (c.custom_emails?.length ?? 0) : c.recipient_count);

  const attemptedCount =
    c.attempted_count ?? (c.status === 'sent' ? Math.max(targetCount, c.recipient_count) : 0);

  const successfulCount = c.successful_count ?? (c.status === 'sent' ? c.recipient_count : 0);

  const failedCount =
    c.failed_count ?? (c.status === 'sent' ? Math.max(0, attemptedCount - successfulCount) : 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`group dark:bg-brand-dark-surface relative overflow-hidden rounded-xl border border-gray-200/80 bg-white transition-all hover:shadow-md dark:border-gray-700/60 ${cfg.accent} border-l-[3px]`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                {c.title}
              </h3>
              {c.lottery_id && (
                <span
                  className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                  title={`Linked to lottery: ${c.lottery_title || c.lottery_id}`}
                >
                  <Ticket className="h-3 w-3" />
                  Lottery
                </span>
              )}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Mail className="text-brand-gold h-3 w-3" />
              <span className="truncate">{c.subject}</span>
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${cfg.color}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {c.status}
          </span>
        </div>

        {/* Delivery Analytics Matrix */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-xl border border-gray-100 bg-gray-50/70 p-3 sm:grid-cols-4 dark:border-gray-800 dark:bg-gray-800/30">
          <div>
            <span className="block font-mono text-[9px] font-semibold tracking-wider text-gray-400 uppercase">
              Target (Bhejne The)
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-sm font-bold text-gray-900 dark:text-white">{targetCount}</span>
              <span className="text-[10px] text-gray-500 capitalize">
                ({c.recipient_group.replace(/_/g, ' ')})
              </span>
            </div>
          </div>

          <div>
            <span className="block font-mono text-[9px] font-semibold tracking-wider text-gray-400 uppercase">
              Sent (Bheje Gaye)
            </span>
            <div className="mt-1">
              {c.status === 'sent' ? (
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {attemptedCount}
                </span>
              ) : c.status === 'scheduled' ? (
                <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  <Clock className="h-3 w-3" /> Scheduled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-gray-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  Draft
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="block font-mono text-[9px] font-semibold tracking-wider text-gray-400 uppercase">
              Successful
            </span>
            <div className="mt-1">
              {c.status === 'sent' ? (
                <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{successfulCount}</span>
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-400">--</span>
              )}
            </div>
          </div>

          <div>
            <span className="block font-mono text-[9px] font-semibold tracking-wider text-gray-400 uppercase">
              Failed
            </span>
            <div className="mt-1">
              {c.status === 'sent' ? (
                failedCount > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{failedCount} failed</span>
                  </span>
                ) : (
                  <span className="text-sm font-bold text-gray-400 dark:text-gray-500">0</span>
                )
              ) : (
                <span className="text-xs font-medium text-gray-400">--</span>
              )}
            </div>
          </div>
        </div>

        {/* Custom Recipients Preview Chips */}
        {c.recipient_group === 'custom' && c.custom_emails && c.custom_emails.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] text-gray-400">Recipients:</span>
            {c.custom_emails.slice(0, 3).map((email) => (
              <span
                key={email}
                className="inline-block max-w-[160px] truncate rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                title={email}
              >
                {email}
              </span>
            ))}
            {c.custom_emails.length > 3 && (
              <span className="bg-brand-gold/15 text-brand-gold rounded-md px-2 py-0.5 font-mono text-[10px] font-bold">
                +{c.custom_emails.length - 3} more
              </span>
            )}
          </div>
        )}

        {(c.scheduled_at || c.reminder_at) && (
          <div className="mt-3 space-y-1.5">
            {c.scheduled_at && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Calendar className="h-3 w-3" /> Send
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {formatISTDisplay(c.scheduled_at)}
                </span>
              </div>
            )}
            {c.reminder_at && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="h-3 w-3" /> Reminder
                </span>
                <span
                  className={`font-medium ${c.reminder_sent_at ? 'text-emerald-500' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {c.reminder_sent_at ? 'Sent' : formatISTDisplay(c.reminder_at)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          {c.lottery_id && (
            <a
              href="/admin/lottery"
              title="Go to Lottery"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-600 transition-colors hover:bg-amber-500 hover:text-white dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white"
            >
              <Trophy className="h-3 w-3" />
              Lottery
            </a>
          )}
          {c.status !== 'sent' && c.status !== 'cancelled' && (
            <>
              <button
                onClick={onEdit}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
                title="Edit"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onSendNow}
                className="bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors"
                title="Send Now"
              >
                <Play className="h-3 w-3" /> Send Now
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicate}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
