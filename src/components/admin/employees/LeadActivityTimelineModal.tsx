'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Clock, User, Phone, Building2, Loader2 } from 'lucide-react';
import type { LeadActivity } from '@/src/lib/leads/leadActivityStore';

interface LeadActivityTimelineModalProps {
  lead: {
    id: string;
    name: string;
    phone: string;
    project_interest?: string | null;
    lifecycle_status?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  token?: string;
}

export function LeadActivityTimelineModal({
  lead,
  isOpen,
  onClose,
  token,
}: LeadActivityTimelineModalProps) {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && lead?.id) {
      setLoading(true);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch(`/api/employee/work/leads/${lead.id}/activities`, { headers })
        .then((res) => res.json())
        .then((data) => {
          setActivities(data.activities || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, lead?.id, token]);

  if (!isOpen || !lead) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-gray-900"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                  {lead.name}
                </h2>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase dark:text-blue-400">
                  {lead.lifecycle_status || 'lead'}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="h-3 w-3" /> {lead.phone}
                </span>
                {lead.project_interest && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {lead.project_interest}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Timeline */}
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                <History className="h-3.5 w-3.5 text-amber-500" /> Chronological Updates (
                {activities.length})
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-[160px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : activities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500 dark:border-white/10">
                No activity records found for this lead.
              </div>
            ) : (
              <div className="relative space-y-4 pl-4 before:absolute before:top-2 before:bottom-2 before:left-1.5 before:w-0.5 before:bg-gray-200 dark:before:bg-white/10">
                {activities.map((act) => (
                  <div key={act.id} className="relative pl-3">
                    <div className="absolute top-1.5 -left-3 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500 dark:border-gray-900" />
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5 transition-all dark:border-white/5 dark:bg-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(act.created_at).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      {act.employee_name && (
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          <User className="h-3 w-3 text-gray-400" /> By {act.employee_name}
                        </p>
                      )}

                      {act.notes && (
                        <p className="mt-2 rounded-xl bg-white p-2 text-xs leading-relaxed text-gray-700 shadow-xs dark:bg-gray-800 dark:text-gray-200">
                          "{act.notes}"
                        </p>
                      )}

                      {act.follow_up_at && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            Follow-up Scheduled:{' '}
                            {new Date(act.follow_up_at).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl bg-gray-100 px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
