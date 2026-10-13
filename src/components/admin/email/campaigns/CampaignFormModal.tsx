'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
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
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { getToken, fetchContacts } from '../helpers';
import { EMAIL_TEMPLATES } from '../constants';
import type { Campaign, Contact } from '../types';
import { ContactPicker } from '../compose/ContactPicker';
import { AIComposePopover } from '../compose/AIComposePopover';
import { ScheduleDateTimePicker } from '../compose/ScheduleDateTimePicker';
import { useCustomTemplates } from '../hooks/useCustomTemplates';
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
  const { customTemplates } = useCustomTemplates();
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
  const [contactPickerOpen, setContactPickerOpen] = useState(false);
  const [showAIPopover, setShowAIPopover] = useState(false);

  const handleAIInsert = useCallback(
    (html: string, generatedSubject?: string) => {
      setBodyHtml((prev) => (prev ? `${prev}\n\n${html}` : html));
      if (generatedSubject && !subject.trim()) {
        setSubject(generatedSubject);
      }
      setShowAIPopover(false);
      toast.success('AI content inserted into campaign');
    },
    [subject]
  );

  const handleAIReplace = useCallback((html: string, generatedSubject?: string) => {
    setBodyHtml(html);
    if (generatedSubject) {
      setSubject(generatedSubject);
    }
    setShowAIPopover(false);
    toast.success('Campaign content replaced with AI draft');
  }, []);

  const handleAIApplyTemplate = useCallback(
    (
      html: string,
      _templateName?: string,
      _variables?: Record<string, string>,
      generatedSubject?: string
    ) => {
      setBodyHtml(html);
      if (generatedSubject) {
        setSubject(generatedSubject);
      }
      setShowAIPopover(false);
      toast.success('AI template applied to campaign');
    },
    []
  );
  const selectedCustomEmails = useMemo(() => {
    return customEmailsInput
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
  }, [customEmailsInput]);

  const selectedCustomEmailSet = useMemo(() => {
    return new Set(selectedCustomEmails.map((e) => e.toLowerCase()));
  }, [selectedCustomEmails]);

  const handleToggleContact = useCallback((contact: Contact) => {
    const primary = (contact.real_email || contact.email).trim();
    const primaryLower = primary.toLowerCase();
    const altLower = (contact.email || '').trim().toLowerCase();

    setCustomEmailsInput((prev) => {
      const currentList = prev
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);

      const exists = currentList.some((e) => {
        const lower = e.toLowerCase();
        return lower === primaryLower || (altLower !== '' && lower === altLower);
      });

      if (exists) {
        return currentList
          .filter((e) => {
            const lower = e.toLowerCase();
            return lower !== primaryLower && (altLower === '' || lower !== altLower);
          })
          .join(', ');
      } else {
        return currentList.length > 0 ? `${currentList.join(', ')}, ${primary}` : primary;
      }
    });
  }, []);

  const handleSelectAllContacts = useCallback(async () => {
    const all = await fetchContacts();
    const emailsToAdd = all.map((c) => (c.real_email || c.email).trim()).filter(Boolean);

    setCustomEmailsInput((prev) => {
      const existing = prev
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      const set = new Set(existing.map((e) => e.toLowerCase()));
      const merged = [...existing];
      for (const email of emailsToAdd) {
        if (!set.has(email.toLowerCase())) {
          set.add(email.toLowerCase());
          merged.push(email);
        }
      }
      return merged.join(', ');
    });
  }, []);

  const handleSelectFilteredContacts = useCallback((contactsToSelect: Contact[]) => {
    const emailsToAdd = contactsToSelect
      .map((c) => (c.real_email || c.email).trim())
      .filter(Boolean);

    setCustomEmailsInput((prev) => {
      const existing = prev
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      const set = new Set(existing.map((e) => e.toLowerCase()));
      const merged = [...existing];
      for (const email of emailsToAdd) {
        if (!set.has(email.toLowerCase())) {
          set.add(email.toLowerCase());
          merged.push(email);
        }
      }
      return merged.join(', ');
    });
  }, []);

  const handleClearAllContacts = useCallback(() => {
    setCustomEmailsInput('');
  }, []);

  const handleRemoveSingleEmail = useCallback((emailToRemove: string) => {
    const target = emailToRemove.trim().toLowerCase();
    setCustomEmailsInput((prev) => {
      return prev
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.toLowerCase() !== target)
        .join(', ');
    });
  }, []);
  const toISTString = (utcString: string | null): string => {
    if (!utcString) return '';
    const date = new Date(utcString);
    if (isNaN(date.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const getPart = (t: string) => parts.find((p) => p.type === t)?.value || '';
    return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
  };

  const toUTCString = (istString: string): string => {
    if (!istString) return '';
    const isoWithTz =
      istString.includes('+') || istString.endsWith('Z')
        ? istString
        : istString.length === 16
          ? `${istString}:00+05:30`
          : `${istString}+05:30`;
    const d = new Date(isoWithTz);
    return isNaN(d.getTime()) ? '' : d.toISOString();
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
    const allTemplates = [...customTemplates, ...EMAIL_TEMPLATES];
    const tpl = allTemplates.find((t) => t.id === templateId);
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
      if (!res.ok) {
        let errorMsg = 'Failed to save campaign';
        if (typeof data.error === 'string') {
          errorMsg = data.error;
        } else if (data.details && Array.isArray(data.details)) {
          errorMsg = data.details
            .map((d: { message?: string }) => d.message)
            .filter(Boolean)
            .join(', ');
        }
        throw new Error(errorMsg);
      }
      onClose();
      onSaved();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
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
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    Target Recipients
                  </label>
                  {recipientGroup === 'custom' && selectedCustomEmails.length > 0 && (
                    <span className="text-brand-gold font-mono text-[11px] font-bold">
                      {selectedCustomEmails.length} recipient
                      {selectedCustomEmails.length === 1 ? '' : 's'} configured
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'all_users' as const, label: 'All Users', icon: Users },
                    {
                      value: 'lottery_participants' as const,
                      label: 'Lottery Participants',
                      icon: Mail,
                    },
                    { value: 'custom' as const, label: 'Custom List', icon: FileText },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                        recipientGroup === opt.value
                          ? 'border-brand-gold/40 bg-brand-gold/5 text-brand-gold shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="recipient_group"
                        value={opt.value}
                        checked={recipientGroup === opt.value}
                        onChange={() => setRecipientGroup(opt.value)}
                        className="sr-only"
                      />
                      <opt.icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </label>
                  ))}
                </div>

                {recipientGroup === 'custom' && (
                  <div className="mt-2 space-y-3 rounded-xl border border-gray-200/80 bg-white p-3.5 dark:border-gray-700/70 dark:bg-[#0c0c12]">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setContactPickerOpen(true)}
                          className="bg-brand-gold text-brand-navy flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-all hover:opacity-95"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Select Contacts</span>
                          {selectedCustomEmails.length > 0 && (
                            <span className="bg-brand-navy/20 py-0.2 ml-1 rounded-full px-1.5 text-[10px] font-black">
                              {selectedCustomEmails.length}
                            </span>
                          )}
                        </button>
                        {selectedCustomEmails.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAllContacts}
                            className="text-[11px] font-semibold text-gray-400 transition-colors hover:text-rose-500"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-gray-400">
                        Search team, clients, or admins
                      </span>
                    </div>

                    {/* Chips for Selected Contacts */}
                    {selectedCustomEmails.length > 0 && (
                      <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-gray-100/90 bg-gray-50/60 p-2 dark:border-gray-800 dark:bg-gray-900/40">
                        {selectedCustomEmails.map((email) => (
                          <span
                            key={email}
                            className="border-brand-gold/30 bg-brand-gold/10 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium text-gray-800 dark:text-gray-200"
                          >
                            <span className="max-w-[200px] truncate">{email}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSingleEmail(email)}
                              className="text-gray-400 transition-colors hover:text-rose-500"
                              title="Remove"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                        Or manual comma-separated email addresses:
                      </label>
                      <textarea
                        value={customEmailsInput}
                        onChange={(e) => setCustomEmailsInput(e.target.value)}
                        placeholder="client1@gmail.com, client2@outlook.com"
                        rows={2}
                        className="focus-gold w-full rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Scheduling */}
              <div className="space-y-4 rounded-xl border border-gray-200/80 bg-gray-50/50 p-4 dark:border-gray-700/60 dark:bg-gray-800/30">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    <Calendar className="text-brand-gold h-3 w-3" /> Schedule (IST)
                  </label>
                  <ScheduleDateTimePicker
                    value={scheduledAtInput}
                    onChange={(val) => setScheduledAtInput(val || '')}
                    helperText="Blank = save as draft (pick DD/MM/YYYY & time to schedule)"
                  />
                </div>
                <div className="border-t border-gray-200/60 pt-3 dark:border-gray-700/50">
                  <label className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    <Clock className="text-brand-gold h-3 w-3" /> Reminder (IST) — Optional
                  </label>
                  <ScheduleDateTimePicker
                    value={reminderAtInput}
                    onChange={(val) => setReminderAtInput(val || '')}
                    compact
                    helperText="Optional auto follow-up reminder"
                  />
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
                    <button
                      type="button"
                      onClick={() => setShowAIPopover(true)}
                      className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold hover:border-brand-gold/60 hover:bg-brand-gold/20 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold shadow-sm transition-all"
                      title="Compose with AI"
                    >
                      <Sparkles className="text-brand-gold h-3.5 w-3.5 animate-pulse" />
                      <span>AI Compose</span>
                    </button>
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
                            {customTemplates.length > 0 && (
                              <div className="border-b border-gray-100 bg-amber-50/50 px-3 py-1.5 font-mono text-[9px] font-bold text-amber-700 uppercase dark:border-gray-800 dark:bg-amber-500/10 dark:text-amber-400">
                                ✨ Custom AI Templates
                              </div>
                            )}
                            {customTemplates.map((tpl) => (
                              <button
                                key={tpl.id}
                                type="button"
                                onClick={() => importTemplate(tpl.id)}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-amber-50/60 dark:hover:bg-amber-500/10"
                              >
                                <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                                      {tpl.name}
                                    </p>
                                    <span className="py-0.2 rounded bg-amber-500/20 px-1 font-mono text-[9px] font-bold text-amber-500">
                                      AI
                                    </span>
                                  </div>
                                  <p className="truncate text-[10px] text-gray-400">
                                    {tpl.category}
                                  </p>
                                </div>
                              </button>
                            ))}
                            {customTemplates.length > 0 && (
                              <div className="border-t border-b border-gray-100 bg-gray-50/50 px-3 py-1.5 font-mono text-[9px] font-bold text-gray-400 uppercase dark:border-gray-800 dark:bg-gray-800/40">
                                Standard Templates
                              </div>
                            )}
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
                  <div className="min-h-[300px] overflow-auto rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm dark:border-gray-700 dark:text-gray-900">
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
          <ContactPicker
            open={contactPickerOpen}
            onClose={() => setContactPickerOpen(false)}
            selectedEmails={selectedCustomEmailSet}
            onToggle={handleToggleContact}
            onSelectAll={handleSelectAllContacts}
            onSelectFiltered={handleSelectFilteredContacts}
            onClearAll={handleClearAllContacts}
            title="Select Target Recipients"
          />
          <AIComposePopover
            open={showAIPopover}
            onClose={() => setShowAIPopover(false)}
            onInsert={handleAIInsert}
            onReplace={handleAIReplace}
            onApplyTemplate={handleAIApplyTemplate}
            onUpdateSubject={(newSubj) => setSubject(newSubj)}
            subject={subject}
            recipientName="Valued Client"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
