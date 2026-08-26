'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellRing,
  Phone,
  Clock,
  ChevronRight,
  Volume2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { followUpAudio } from '@/src/lib/audio/followUpAudio';
import type { LeadItem } from './types';

interface FollowUpReminderBannerProps {
  leads: LeadItem[];
  onSelectLead: (lead: LeadItem) => void;
}

export function FollowUpReminderBanner({ leads, onSelectLead }: FollowUpReminderBannerProps) {
  const [activeReminder, setActiveReminder] = useState<LeadItem | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const soundPlayedRef = useRef<Set<string>>(new Set());

  // Check for follow-ups due today or overdue
  useEffect(() => {
    if (!leads || leads.length === 0) {
      setActiveReminder(null);
      return;
    }

    const now = new Date();
    // Leads that have follow_up_at, not won/lost, and not dismissed
    const pendingFollowups = leads.filter((lead) => {
      if (
        !lead.follow_up_at ||
        lead.lifecycle_status === 'won' ||
        lead.lifecycle_status === 'lost'
      ) {
        return false;
      }
      if (dismissedIds.has(lead.id)) return false;

      const fDate = new Date(lead.follow_up_at);
      // If overdue or due within the next 4 hours
      const diffHours = (fDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours <= 4;
    });

    // Pick the most urgent follow-up
    if (pendingFollowups.length > 0) {
      // Sort by earliest follow-up
      pendingFollowups.sort(
        (a, b) => new Date(a.follow_up_at!).getTime() - new Date(b.follow_up_at!).getTime()
      );
      const urgent = pendingFollowups[0];
      setActiveReminder(urgent);

      // Play chime if not already played for this lead in this session
      if (!soundPlayedRef.current.has(urgent.id)) {
        followUpAudio.playChime();
        soundPlayedRef.current.add(urgent.id);

        followUpAudio.triggerSystemNotification(
          `🔔 Follow-up Due: ${urgent.name}`,
          `You have a scheduled follow-up for ${urgent.project_interest || 'Client Enquiry'}.`
        );
      }
    } else {
      setActiveReminder(null);
    }
  }, [leads, dismissedIds]);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const handleTestSound = () => {
    followUpAudio.playChime();
  };

  if (!activeReminder) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <Bell className="h-3.5 w-3.5 text-slate-400" /> Follow-up Audio Alert System Active
        </span>
        <button
          onClick={handleTestSound}
          className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
          title="Test audio chime"
        >
          <Volume2 className="h-3.5 w-3.5" /> Test Sound
        </button>
      </div>
    );
  }

  const isOverdue = new Date(activeReminder.follow_up_at!) < new Date();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`relative overflow-hidden rounded-2xl border p-4 shadow-md ${
          isOverdue
            ? 'border-red-500/40 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent dark:border-red-500/30'
            : 'border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-blue-500/5 to-transparent dark:border-amber-500/30'
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isOverdue ? 'animate-pulse bg-red-500 text-white' : 'bg-amber-500 text-white'
              }`}
            >
              <BellRing className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isOverdue ? '⚠️ Overdue Client Follow-up' : '🔔 Follow-up Reminder Due'}
                </span>
                <span className="rounded-md bg-white/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  {new Date(activeReminder.follow_up_at!).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                Call{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeReminder.name}
                </span>{' '}
                {activeReminder.project_interest ? `for ${activeReminder.project_interest}` : ''}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleTestSound}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              title="Test audio chime"
            >
              <Volume2 className="h-4 w-4" />
            </button>

            <a
              href={`tel:${activeReminder.phone}`}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-500"
            >
              <Phone className="h-3.5 w-3.5" /> Call Now
            </a>

            <button
              onClick={() => onSelectLead(activeReminder)}
              className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Track <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => handleDismiss(activeReminder.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Dismiss reminder"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
