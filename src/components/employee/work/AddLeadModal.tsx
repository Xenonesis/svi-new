'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  FileText,
  Flame,
  Zap,
  Snowflake,
  Send,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { followUpAudio } from '@/src/lib/audio/followUpAudio';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded: () => void;
}

const PROJECTS = [
  'SVI Township 1',
  'SVI Township 2',
  'SVI Royal Enclave',
  'SVI Green City',
  'Commercial Plaza',
  'Farmhouse Plots',
  'Residential Plots',
  'Luxury Villas',
];

export function AddLeadModal({ isOpen, onClose, onLeadAdded }: AddLeadModalProps) {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [projectInterest, setProjectInterest] = useState('');
  const [budget, setBudget] = useState('');
  const [temperature, setTemperature] = useState<'hot' | 'warm' | 'cold'>('warm');
  const [lifecycleStatus, setLifecycleStatus] = useState<string>('new');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('11:00');
  const [notes, setNotes] = useState('');

  // Quick chips for follow-up
  const setQuickFollowUp = (daysAhead: number, defaultHour = 11) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const dateStr = d.toISOString().split('T')[0];
    setFollowUpDate(dateStr);
    setFollowUpTime(`${String(defaultHour).padStart(2, '0')}:00`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Client name is required');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      let combinedFollowUp: string | null = null;
      if (followUpDate) {
        combinedFollowUp = `${followUpDate}T${followUpTime || '10:00'}:00.000Z`;
      }

      const res = await fetch('/api/employee/work/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          email: email.trim() || undefined,
          project_interest: projectInterest || undefined,
          budget: budget.trim() || undefined,
          temperature,
          lifecycle_status: lifecycleStatus,
          follow_up_at: combinedFollowUp,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add lead');
      }

      // Success
      toast.success('Lead created and Admin notified!');
      followUpAudio.playChime();

      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setProjectInterest('');
      setBudget('');
      setTemperature('warm');
      setLifecycleStatus('new');
      setFollowUpDate('');
      setFollowUpTime('11:00');
      setNotes('');

      onLeadAdded();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error adding lead');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
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
          className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7 dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                Add New Client Lead
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct entry with follow-up reminder & instant admin alert
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Priority / Temperature Picker */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Lead Urgency & Interest
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTemperature('hot')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                    temperature === 'hot'
                      ? 'border-red-500 bg-red-500/15 text-red-600 dark:border-red-500/60 dark:text-red-400'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400'
                  }`}
                >
                  <Flame className="h-3.5 w-3.5 text-red-500" /> Hot (Ready)
                </button>
                <button
                  type="button"
                  onClick={() => setTemperature('warm')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                    temperature === 'warm'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:border-amber-500/60 dark:text-amber-400'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> Warm
                </button>
                <button
                  type="button"
                  onClick={() => setTemperature('cold')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                    temperature === 'cold'
                      ? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:border-blue-500/60 dark:text-blue-400'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400'
                  }`}
                >
                  <Snowflake className="h-3.5 w-3.5 text-blue-500" /> Cold
                </button>
              </div>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Client Name *
                </label>
                <div className="relative">
                  <User className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Project Interest & Budget */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Project Interest
                </label>
                <div className="relative">
                  <Building2 className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <select
                    value={projectInterest}
                    onChange={(e) => setProjectInterest(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                  >
                    <option value="">Select Project / Property</option>
                    {PROJECTS.map((proj) => (
                      <option key={proj} value={proj}>
                        {proj}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Budget / Req. (Optional)
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 40L - 60L / 200 sq.yd"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Status
                </label>
                <select
                  value={lifecycleStatus}
                  onChange={(e) => setLifecycleStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                >
                  <option value="new">New Lead</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="visit_requested">Site Visit Scheduled</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@gmail.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Follow-up Scheduler */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" /> Schedule Next Follow-up
                </span>
                <span className="text-[10px] text-slate-500">Audio reminder will sound</span>
              </div>

              {/* Quick Chips */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickFollowUp(0, 17)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Today 5:00 PM
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFollowUp(1, 11)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Tomorrow 11:00 AM
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFollowUp(3, 11)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  In 3 Days
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <div className="relative">
                    <Clock className="absolute top-2 left-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="time"
                      value={followUpTime}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pr-2.5 pl-8 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Notes */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Initial Discussion Notes / Remarks
              </label>
              <div className="relative">
                <FileText className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Client inquired about payment plan and possession date. Will confirm site visit."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-102 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> Save & Notify Admin
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
