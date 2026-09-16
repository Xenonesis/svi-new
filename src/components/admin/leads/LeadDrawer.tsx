'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Phone,
  Calendar,
  Clock,
  Send,
  MessageSquare,
  Car,
  UserCheck,
  Tag,
  FileText,
  Loader2,
  Flame,
} from 'lucide-react';
import type { LeadInteraction } from '@/src/lib/leads/leadInteractionsStore';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import { toast } from 'sonner';

export type PipelineStage =
  'new' | 'contacted' | 'visit_scheduled' | 'visited' | 'negotiation' | 'booked' | 'lost';

const STAGES: Array<{ key: PipelineStage; label: string }> = [
  { key: 'new', label: 'New Lead' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'visit_scheduled', label: 'Visit Scheduled' },
  { key: 'visited', label: 'Site Visited' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'booked', label: 'Booked' },
  { key: 'lost', label: 'Lost / Dropped' },
];

interface LeadDrawerProps {
  phone: string | null;
  clientName?: string;
  assignedAdvisorId?: string | null;
  assignedAdvisorName?: string | null;
  temperature?: 'hot' | 'warm' | 'cold';
  currentStage?: PipelineStage;
  employees: Employee[];
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated?: () => void;
  token?: string;
}

export function LeadDrawer({
  phone,
  clientName,
  assignedAdvisorId,
  temperature = 'warm',
  currentStage = 'new',
  employees,
  isOpen,
  onClose,
  onLeadUpdated,
  token,
}: LeadDrawerProps) {
  const [activeStage, setActiveStage] = useState<PipelineStage>(currentStage);
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [activeActionTab, setActiveActionTab] = useState<'note' | 'follow_up' | 'visit'>('note');
  const [noteContent, setNoteContent] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [siteVisitDate, setSiteVisitDate] = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState(assignedAdvisorId || '');

  useEffect(() => {
    setActiveStage(currentStage);
    setSelectedAdvisor(assignedAdvisorId || '');
  }, [currentStage, assignedAdvisorId]);

  const fetchTimeline = useCallback(async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${phone}/interactions`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setInteractions(data.interactions || []);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    if (isOpen && phone) {
      fetchTimeline();
    }
  }, [isOpen, phone, fetchTimeline]);

  if (!isOpen || !phone) return null;

  const handleStageChange = async (newStage: PipelineStage) => {
    setActiveStage(newStage);
    try {
      const res = await fetch(`/api/admin/leads/${phone}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ pipeline_stage: newStage }),
      });
      if (res.ok) {
        toast.success(`Pipeline stage updated to ${newStage}`);
        fetchTimeline();
        onLeadUpdated?.();
      }
    } catch {
      toast.error('Failed to update stage');
    }
  };

  const handleAdvisorChange = async (advisorId: string) => {
    setSelectedAdvisor(advisorId);
    const emp = employees.find((e) => e.id === advisorId);
    const advisorName = emp?.full_name || 'Unassigned';
    try {
      const res = await fetch(`/api/admin/leads/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phone_numbers: [phone],
          action: 'reassign',
          advisor_id: advisorId || null,
          advisor_name: advisorName,
        }),
      });
      if (res.ok) {
        toast.success(`Assigned to ${advisorName}`);
        fetchTimeline();
        onLeadUpdated?.();
      }
    } catch {
      toast.error('Failed to reassign');
    }
  };

  const handleAddNote = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/leads/${phone}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: 'note',
          content: noteContent.trim(),
        }),
      });
      if (res.ok) {
        toast.success('Note added to timeline');
        setNoteContent('');
        fetchTimeline();
        onLeadUpdated?.();
      }
    } catch {
      toast.error('Failed adding note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleFollowUp = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!followUpDate) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/leads/${phone}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          follow_up_at: new Date(followUpDate).toISOString(),
        }),
      });
      if (res.ok) {
        toast.success('Follow-up scheduled');
        setFollowUpDate('');
        fetchTimeline();
        onLeadUpdated?.();
      }
    } catch {
      toast.error('Failed scheduling follow-up');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleVisit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!siteVisitDate) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/leads/${phone}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          site_visit_at: new Date(siteVisitDate).toISOString(),
          site_visit_project: 'Shivani Vatika - 11',
          pipeline_stage: 'visit_scheduled',
        }),
      });
      if (res.ok) {
        setActiveStage('visit_scheduled');
        toast.success('Site visit booked & stage moved!');
        setSiteVisitDate('');
        fetchTimeline();
        onLeadUpdated?.();
      }
    } catch {
      toast.error('Failed booking site visit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="flex w-screen max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e0e15]"
          >
            {/* Header */}
            <div className="relative border-b border-gray-100 p-5 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                      {clientName || `Lead +91 ${phone}`}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        temperature === 'hot'
                          ? 'border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : temperature === 'warm'
                            ? 'border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <Flame className="h-2.5 w-2.5" />
                      {temperature}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Phone className="text-brand-gold h-3 w-3" />
                    <span className="font-mono font-medium">+91 {phone}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Advisor Selector */}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 p-2.5 dark:border-white/5 dark:bg-white/5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <UserCheck className="text-brand-gold h-3.5 w-3.5" />
                  <span>Advisor:</span>
                </div>
                <select
                  value={selectedAdvisor}
                  onChange={(e) => handleAdvisorChange(e.target.value)}
                  style={{ colorScheme: 'dark light' }}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow-xs focus:outline-none dark:border-white/10 dark:bg-[#161622] dark:text-white [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#161622] dark:[&>option]:text-white"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stage Stepper Horizontal Carousel */}
            <div className="border-b border-gray-100 px-5 py-3 dark:border-white/5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                  Pipeline Stage
                </span>
                <span className="text-brand-gold text-xs font-bold">
                  {STAGES.find((s) => s.key === activeStage)?.label}
                </span>
              </div>
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
                {STAGES.map((s) => {
                  const isCurrent = activeStage === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => handleStageChange(s.key)}
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        isCurrent
                          ? 'border-brand-gold/40 bg-brand-gold/15 text-brand-gold border shadow-xs'
                          : 'border border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Tabs */}
            <div className="border-b border-gray-100 px-5 py-3 dark:border-white/5">
              <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 p-1 dark:border-white/5 dark:bg-white/5">
                <button
                  type="button"
                  onClick={() => setActiveActionTab('note')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    activeActionTab === 'note'
                      ? 'bg-white text-gray-900 shadow-xs dark:bg-[#1a1a25] dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <FileText className="text-brand-gold h-3.5 w-3.5" />
                  Note
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActionTab('follow_up')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    activeActionTab === 'follow_up'
                      ? 'bg-white text-gray-900 shadow-xs dark:bg-[#1a1a25] dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                  Follow-up
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActionTab('visit')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    activeActionTab === 'visit'
                      ? 'bg-white text-gray-900 shadow-xs dark:bg-[#1a1a25] dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Car className="h-3.5 w-3.5 text-emerald-500" />
                  Site Visit
                </button>
              </div>

              {/* Action Form */}
              <div className="mt-3">
                {activeActionTab === 'note' && (
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      rows={2}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Type call note, client budget, plot size preference..."
                      className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none dark:border-white/10 dark:bg-[#151520] dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !noteContent.trim()}
                      className="bg-brand-gold text-brand-navy flex w-full items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Save Note
                    </button>
                  </form>
                )}

                {activeActionTab === 'follow_up' && (
                  <form onSubmit={handleScheduleFollowUp} className="space-y-2">
                    <input
                      type="datetime-local"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      required
                      className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#151520] dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !followUpDate}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-1.5 text-xs font-bold text-white shadow-xs transition-opacity hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Calendar className="h-3.5 w-3.5" />
                      )}
                      Schedule Callback
                    </button>
                  </form>
                )}

                {activeActionTab === 'visit' && (
                  <form onSubmit={handleScheduleVisit} className="space-y-2">
                    <input
                      type="datetime-local"
                      value={siteVisitDate}
                      onChange={(e) => setSiteVisitDate(e.target.value)}
                      required
                      className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#151520] dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !siteVisitDate}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-1.5 text-xs font-bold text-white shadow-xs transition-opacity hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Car className="h-3.5 w-3.5" />
                      )}
                      Book Site Visit (Free Cab)
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Timeline Feed */}
            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                <Clock className="text-brand-gold h-3.5 w-3.5" />
                Activity Timeline ({interactions.length})
              </h3>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="text-brand-gold h-5 w-5 animate-spin" />
                </div>
              ) : interactions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400 dark:border-white/10">
                  No activity logged yet. Add the first note above!
                </div>
              ) : (
                <div className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5 before:bg-gray-200 dark:before:bg-white/10">
                  {interactions.map((item) => (
                    <div key={item.id} className="relative flex items-start gap-3 pl-2">
                      <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-xs dark:border-white/10 dark:bg-[#161622] dark:text-gray-200">
                        {item.type === 'note' && (
                          <FileText className="text-brand-gold h-3.5 w-3.5" />
                        )}
                        {item.type === 'follow_up_scheduled' && (
                          <Calendar className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        {item.type === 'visit_booked' && (
                          <Car className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                        {item.type === 'whatsapp_sent' && (
                          <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                        {item.type === 'stage_changed' && (
                          <Tag className="h-3.5 w-3.5 text-purple-500" />
                        )}
                        {item.type === 'reassigned' && (
                          <UserCheck className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        {item.type === 'call_logged' && (
                          <Phone className="h-3.5 w-3.5 text-blue-400" />
                        )}
                      </div>

                      <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-900 capitalize dark:text-white">
                            {item.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(item.created_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                          {item.content}
                        </p>
                        {item.advisor_name && (
                          <div className="text-brand-gold mt-1 text-[10px] font-medium">
                            By {item.advisor_name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
