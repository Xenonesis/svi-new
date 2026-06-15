'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  AlertCircle,
  Users,
  Mail,
  FileText,
  Calendar,
  Clock,
  Eye,
  Send,
  RefreshCw,
  Search,
  FileIcon,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { getToken } from '../helpers';
import { EMAIL_TEMPLATES } from '../constants';
import type { Campaign } from '../types';

interface CampaignFormModalProps {
  open: boolean;
  editingCampaign: Campaign | null;
  duplicateSource?: Campaign | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CampaignFormModal({
  open,
  editingCampaign,
  duplicateSource,
  onClose,
  onSaved,
}: CampaignFormModalProps) {
  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [recipientGroup, setRecipientGroup] = useState<
    'all_users' | 'lottery_participants' | 'custom'
  >('all_users');
  const [customEmailsInput, setCustomEmailsInput] = useState('');
  const [scheduledAtInput, setScheduledAtInput] = useState('');
  const [reminderAtInput, setReminderAtInput] = useState('');
  const [reminderSubject, setReminderSubject] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateImport, setShowTemplateImport] = useState(false);

  const toISTString = (utcString: string | null): string => {
    if (!utcString) return '';
    const date = new Date(utcString);
    const localDate = new Date(date.getTime() + 330 * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const toUTCString = (istString: string): string => {
    if (!istString) return '';
    const date = new Date(istString);
    const utcDate = new Date(date.getTime() - 330 * 60 * 1000);
    return utcDate.toISOString();
  };

  // Load campaign full data when editing
  const loadCampaignDetails = useCallback(async (campaign: Campaign) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.campaign) {
        const full = data.campaign;
        setTitle(full.title);
        setSubject(full.subject);
        setBodyHtml(full.body_html || '');
        setRecipientGroup(full.recipient_group);
        setCustomEmailsInput(full.custom_emails ? full.custom_emails.join(', ') : '');
        setScheduledAtInput(toISTString(full.scheduled_at));
        setReminderAtInput(toISTString(full.reminder_at));
        setReminderSubject(full.reminder_subject || '');
      }
    } catch (err) {
      console.error('Error fetching campaign details:', err);
    }
  }, []);

  const resetForm = useCallback(() => {
    setTitle('');
    setSubject('');
    setBodyHtml(`<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: #111827; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Exclusive Update from SVI Infra</h2>
  <p>Hello,</p>
  <p>We are delighted to bring you our latest updates, investment plans, and property details!</p>
  <div style="background: #f8f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #111827;">Current Hot Projects</h3>
    <p>Discover luxury living and high return investments on our standard pricing premium flats.</p>
  </div>
  <p>For more details, visit our dashboard or contact your account manager directly.</p>
  <p style="margin-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 10px;">
    SVI Infra Solutions. All rights reserved.
  </p>
</div>`);
    setRecipientGroup('all_users');
    setCustomEmailsInput('');
    setScheduledAtInput('');
    setReminderAtInput('');
    setReminderSubject('');
    setFormError('');
    setIsPreviewMode(false);
    setShowTemplateImport(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (editingCampaign) {
      loadCampaignDetails(editingCampaign);
    } else if (duplicateSource) {
      setTitle(`${duplicateSource.title} (Copy)`);
      setSubject(duplicateSource.subject);
      setRecipientGroup(duplicateSource.recipient_group);
      setCustomEmailsInput(
        duplicateSource.custom_emails ? duplicateSource.custom_emails.join(', ') : ''
      );
      setScheduledAtInput('');
      setReminderAtInput('');
      setReminderSubject('');
      setFormError('');
      setIsPreviewMode(false);
      setShowTemplateImport(false);
      // Fetch body_html from the source campaign
      (async () => {
        try {
          const token = await getToken();
          const res = await fetch(`/api/admin/campaigns/${duplicateSource.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.campaign?.body_html) {
            setBodyHtml(data.campaign.body_html);
          }
        } catch {
          /* ignore */
        }
      })();
    } else {
      resetForm();
    }
  }, [open, editingCampaign, duplicateSource, loadCampaignDetails, resetForm]);

  const importTemplate = (templateId: string) => {
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (tpl) {
      setBodyHtml(tpl.html);
      if (!subject) setSubject(tpl.subject);
      setShowTemplateImport(false);
      toast.success(`Template "${tpl.name}" imported`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !bodyHtml) {
      setFormError('Please fill in Title, Subject, and HTML Content.');
      return;
    }
    const customEmails =
      recipientGroup === 'custom'
        ? customEmailsInput
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean)
        : [];
    if (recipientGroup === 'custom' && customEmails.length === 0) {
      setFormError('Please enter at least one valid recipient email.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    const payload = {
      title,
      subject,
      body_html: bodyHtml,
      recipient_group: recipientGroup,
      custom_emails: recipientGroup === 'custom' ? customEmails : null,
      scheduled_at: scheduledAtInput ? toUTCString(scheduledAtInput) : null,
      reminder_at: reminderAtInput ? toUTCString(reminderAtInput) : null,
      reminder_subject: reminderSubject || null,
    };
    try {
      const token = await getToken();
      const url = editingCampaign
        ? `/api/admin/campaigns/${editingCampaign.id}`
        : '/api/admin/campaigns';
      const method = editingCampaign ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      onClose();
      onSaved();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="dark:bg-brand-dark-surface relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
              <div>
                <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                  {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
                </h2>
                <p className="mt-0.5 font-mono text-[10px] tracking-wider text-gray-400 uppercase">
                  Define subject, content and schedule
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6">
              {formError && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/15 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Summer Property Launch Alert"
                    className="focus-gold w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800/50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Exclusive pre-launch booking now open"
                    className="focus-gold w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800/50"
                  />
                </div>
              </div>

              {/* Recipient Targeting */}
              <div className="space-y-3 rounded-xl border border-gray-200/80 bg-gray-50/50 p-4 dark:border-gray-700/60 dark:bg-gray-800/20">
                <label className="block font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Target Recipients
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'all_users', label: 'All Users', icon: Users },
                    { value: 'lottery_participants', label: 'Lottery Participants', icon: Mail },
                    { value: 'custom', label: 'Custom List', icon: FileText },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                        recipientGroup === opt.value
                          ? 'border-brand-gold/40 bg-brand-gold/5 text-brand-gold'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="recipient_group"
                        value={opt.value}
                        checked={recipientGroup === opt.value}
                        onChange={() => setRecipientGroup(opt.value as any)}
                        className="sr-only"
                      />
                      <opt.icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {recipientGroup === 'custom' && (
                  <div className="mt-2 space-y-1">
                    <textarea
                      value={customEmailsInput}
                      onChange={(e) => setCustomEmailsInput(e.target.value)}
                      placeholder="client1@gmail.com, client2@outlook.com"
                      rows={2}
                      className="focus-gold dark:bg-brand-dark-surface w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs dark:border-gray-700"
                    />
                    <p className="font-mono text-[10px] text-gray-400">
                      Comma-separated email addresses
                    </p>
                  </div>
                )}
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    <Calendar className="text-brand-gold h-3 w-3" /> Schedule (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAtInput}
                    onChange={(e) => setScheduledAtInput(e.target.value)}
                    className="focus-gold w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800/50"
                  />
                  <p className="mt-1 font-mono text-[10px] text-gray-400">Blank = save as draft</p>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    <Clock className="text-brand-gold h-3 w-3" /> Reminder (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={reminderAtInput}
                    onChange={(e) => setReminderAtInput(e.target.value)}
                    className="focus-gold w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800/50"
                  />
                  <p className="mt-1 font-mono text-[10px] text-gray-400">
                    Optional auto follow-up
                  </p>
                </div>
              </div>

              {reminderAtInput && (
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    Reminder Subject Override
                  </label>
                  <input
                    type="text"
                    value={reminderSubject}
                    onChange={(e) => setReminderSubject(e.target.value)}
                    placeholder="e.g. Last chance: pre-launch offer ends today!"
                    className="focus-gold w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800/50"
                  />
                </div>
              )}

              {/* HTML Body */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    HTML Body
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTemplateImport(!showTemplateImport)}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        <FileText className="h-3 w-3" /> Import Template
                      </button>
                      {showTemplateImport && (
                        <div className="dark:bg-brand-dark-surface absolute top-full right-0 z-50 mt-1 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700">
                          <div className="scrollbar-gold max-h-60 overflow-y-auto">
                            {EMAIL_TEMPLATES.map((tpl) => (
                              <button
                                key={tpl.id}
                                type="button"
                                onClick={() => importTemplate(tpl.id)}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                              >
                                <FileText className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {tpl.name}
                                  </p>
                                  <p className="truncate text-[10px] text-gray-400">
                                    {tpl.category}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <Eye className="h-3 w-3" /> {isPreviewMode ? 'Edit' : 'Preview'}
                    </button>
                  </div>
                </div>
                {isPreviewMode ? (
                  <div className="min-h-[300px] overflow-auto rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/20">
                    <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                  </div>
                ) : (
                  <textarea
                    rows={12}
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    placeholder="HTML formatted email content..."
                    className="focus-gold w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 font-mono text-xs dark:border-gray-700 dark:bg-gray-800/50"
                  />
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-brand-gold text-brand-navy glow-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-sm transition-all hover:opacity-90 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {isSubmitting
                  ? 'Saving...'
                  : scheduledAtInput
                    ? 'Schedule Campaign'
                    : 'Save Campaign'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
