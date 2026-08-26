'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Phone,
  MessageSquare,
  Building2,
  Calendar,
  Clock,
  Flame,
  Zap,
  Snowflake,
  Send,
  Loader2,
  CheckCircle2,
  History,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { followUpAudio } from '@/src/lib/audio/followUpAudio';
import type { LeadItem } from './types';

interface LeadTrackerDrawerProps {
  lead: LeadItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
}

interface ActivityItem {
  id: string;
  activity_type: string;
  title: string;
  notes?: string | null;
  follow_up_at?: string | null;
  created_at: string;
  employee_name?: string | null;
}

const LIFECYCLE_STAGES = [
  { id: 'new', label: 'New Lead' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'visit_requested', label: 'Site Visit' },
  { id: 'won', label: 'Won / Converted' },
  { id: 'lost', label: 'Lost / Closed' },
];

export function LeadTrackerDrawer({
  lead,
  isOpen,
  onClose,
  onLeadUpdated,
}: LeadTrackerDrawerProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Form states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(lead?.lifecycle_status || 'new');
  const [temperature, setTemperature] = useState<'hot' | 'warm' | 'cold'>(
    (lead?.lead_temperature as any) || 'warm'
  );

  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('11:00');
  const [actionNote, setActionNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (lead) {
      setCurrentStatus(lead.lifecycle_status || 'new');
      setTemperature((lead.lead_temperature as any) || 'warm');
      if (lead.follow_up_at) {
        try {
          const d = new Date(lead.follow_up_at);
          setFollowUpDate(d.toISOString().split('T')[0]);
          setFollowUpTime(
            `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
          );
        } catch {
          // ignore date parse
        }
      } else {
        setFollowUpDate('');
        setFollowUpTime('11:00');
      }
    }
  }, [lead]);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    if (!lead?.id) return;
    try {
      setLoadingActivities(true);
      const res = await fetch(`/api/employee/work/leads/${lead.id}/activities`);
      if (res.ok) {
        const json = await res.json();
        setActivities(json.activities || []);
      }
    } catch {
      // silent
    } finally {
      setLoadingActivities(false);
    }
  }, [lead?.id]);

  useEffect(() => {
    if (isOpen && lead?.id) {
      fetchActivities();
    }
  }, [isOpen, lead?.id, fetchActivities]);

  // Handle status / temperature change
  const handleUpdateStatusOrTemp = async (
    newStatus?: string,
    newTemp?: 'hot' | 'warm' | 'cold'
  ) => {
    if (!lead) return;
    try {
      setUpdatingStatus(true);
      const payload: Record<string, any> = { id: lead.id };
      if (newStatus) payload.lifecycle_status = newStatus;
      if (newTemp) payload.temperature = newTemp;

      const res = await fetch('/api/employee/work/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (newStatus) setCurrentStatus(newStatus);
        if (newTemp) setTemperature(newTemp);
        toast.success('Lead updated');
        fetchActivities();
        onLeadUpdated();
      } else {
        toast.error('Failed to update lead');
      }
    } catch {
      toast.error('Error updating lead');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Add Note & Reschedule Follow-up
  const handleSaveInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    if (!actionNote.trim() && !followUpDate) {
      toast.error('Please enter a note or choose a follow-up time');
      return;
    }

    try {
      setSavingNote(true);

      let combinedFollowUp: string | null = null;
      if (followUpDate) {
        combinedFollowUp = `${followUpDate}T${followUpTime || '10:00'}:00.000Z`;
      }

      const res = await fetch('/api/employee/work/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          activity_note: actionNote.trim() || undefined,
          notes: actionNote.trim() || undefined,
          follow_up_at: combinedFollowUp,
        }),
      });

      if (res.ok) {
        toast.success('Interaction logged & Admin notified!');
        followUpAudio.playChime();
        setActionNote('');
        fetchActivities();
        onLeadUpdated();
      } else {
        toast.error('Failed to log interaction');
      }
    } catch {
      toast.error('Error saving interaction');
    } finally {
      setSavingNote(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 p-5 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{lead.name}</h2>
                {/* Temperature Pill */}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                    temperature === 'hot'
                      ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                      : temperature === 'warm'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {temperature === 'hot'
                    ? '🔥 Hot'
                    : temperature === 'warm'
                      ? '⚡ Warm'
                      : '❄️ Cold'}
                </span>
              </div>
              {lead.project_interest && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                  <Building2 className="h-3.5 w-3.5" /> {lead.project_interest}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Actions (Call & WhatsApp) */}
          <div className="grid grid-cols-2 gap-2 border-b border-slate-100 p-4 dark:border-slate-800">
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95"
            >
              <Phone className="h-4 w-4" /> Call Client
            </a>
            <a
              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-500 active:scale-95"
            >
              <MessageSquare className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {/* Pipeline Stage Stepper */}
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Lifecycle Stage Pipeline
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {LIFECYCLE_STAGES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatusOrTemp(st.id, undefined)}
                    className={`rounded-xl border px-2 py-1.5 text-[11px] font-bold transition-all ${
                      currentStatus === st.id
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Change Priority / Temperature */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Urgency Temperature
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatusOrTemp(undefined, 'hot')}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-xl border py-1.5 text-xs font-bold ${
                    temperature === 'hot'
                      ? 'border-red-500 bg-red-500/15 text-red-600'
                      : 'border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Flame className="h-3.5 w-3.5" /> Hot
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatusOrTemp(undefined, 'warm')}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-xl border py-1.5 text-xs font-bold ${
                    temperature === 'warm'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-600'
                      : 'border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" /> Warm
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatusOrTemp(undefined, 'cold')}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-xl border py-1.5 text-xs font-bold ${
                    temperature === 'cold'
                      ? 'border-blue-500 bg-blue-500/15 text-blue-600'
                      : 'border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Snowflake className="h-3.5 w-3.5" /> Cold
                </button>
              </div>
            </div>

            {/* Log Call / Note Form */}
            <form
              onSubmit={handleSaveInteraction}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/30"
            >
              <h3 className="mb-2 text-xs font-bold text-slate-900 dark:text-white">
                Log Call / Update Note & Follow-up
              </h3>

              <textarea
                rows={2}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="What was discussed with the client? e.g. Client interested in 200 sq.yd plot..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

              <div className="mt-3">
                <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Next Follow-up Date & Time (Alerts Admin & Employee)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <input
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingNote}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                {savingNote ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> Save Interaction
                  </>
                )}
              </button>
            </form>

            {/* Activity History Timeline */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <History className="h-4 w-4 text-slate-400" /> Interaction & Update History
                </span>
                <span className="text-[10px] text-slate-400">{activities.length} entries</span>
              </div>

              {loadingActivities ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : activities.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400 dark:border-slate-800">
                  No interactions logged yet. Log the first update above!
                </div>
              ) : (
                <div className="relative space-y-3 pl-4 before:absolute before:top-2 before:bottom-2 before:left-1.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {activities.map((act) => (
                    <div key={act.id} className="relative pl-3">
                      <div className="absolute top-1 -left-3 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600 dark:border-slate-900" />
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            {act.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(act.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {act.notes && (
                          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                            {act.notes}
                          </p>
                        )}
                        {act.follow_up_at && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            <Clock className="h-3 w-3" /> Next Follow-up:{' '}
                            {new Date(act.follow_up_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
