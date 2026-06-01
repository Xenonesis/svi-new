'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Megaphone,
  Plus,
  Search,
  Calendar,
  Mail,
  Trash2,
  Edit3,
  Send,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Play,
  Eye,
  Users,
  FileText,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { getToken } from './helpers';
import { ConfirmDialog } from './ConfirmDialog';
import { EMAIL_TEMPLATES } from './constants';
import type { Campaign } from './types';

const statusConfig = {
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

export function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

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
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'default';
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);
  const [showTemplateImport, setShowTemplateImport] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch('/api/admin/campaigns', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

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

  const openModal = async (campaign: Campaign | null = null) => {
    setFormError('');
    setIsPreviewMode(false);
    if (campaign) {
      try {
        const token = await getToken();
        const res = await fetch(`/api/admin/campaigns/${campaign.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.campaign) {
          const full = data.campaign;
          setEditingCampaign(full);
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
    } else {
      setEditingCampaign(null);
      setTitle('');
      setSubject('');
      setBodyHtml(`<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: #1a2744; border-bottom: 2px solid #c9a84c; padding-bottom: 10px;">Exclusive Update from SVI Infra</h2>
  <p>Hello,</p>
  <p>We are delighted to bring you our latest updates, investment plans, and property details!</p>
  <div style="background: #f8f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1a2744;">Current Hot Projects</h3>
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
    }
    setIsModalOpen(true);
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
      setIsModalOpen(false);
      fetchCampaigns();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const doSendImmediately = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/campaigns/${id}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Failed to send: ' + data.error);
      } else {
        toast.success(`Sent to ${data.sent} recipients`);
        fetchCampaigns();
      }
    } catch (err) {
      console.error(err);
      toast.error('Error sending campaign');
    }
  };

  const handleSendImmediately = (id: string) => {
    setConfirmState({
      open: true,
      title: 'Send campaign now?',
      message:
        'This will immediately send the email to all group members. This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Send Now',
      onConfirm: () => {
        doSendImmediately(id);
        setConfirmState(null);
      },
    });
  };

  const doDelete = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Campaign deleted');
        fetchCampaigns();
      } else {
        const data = await res.json();
        toast.error('Failed to delete: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting campaign');
    }
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      open: true,
      title: 'Delete campaign?',
      message: 'This will permanently delete the campaign. This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: () => {
        doDelete(id);
        setConfirmState(null);
      },
    });
  };

  const handleDuplicate = (campaign: Campaign) => {
    setEditingCampaign(null);
    setTitle(`${campaign.title} (Copy)`);
    setSubject(campaign.subject);
    setBodyHtml('');
    setRecipientGroup(campaign.recipient_group);
    setCustomEmailsInput(campaign.custom_emails ? campaign.custom_emails.join(', ') : '');
    setScheduledAtInput('');
    setReminderAtInput('');
    setReminderSubject('');
    setFormError('');
    setIsPreviewMode(false);
    setIsModalOpen(true);
    toast.info('Duplicating campaign...');
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/admin/campaigns/${campaign.id}`, {
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
  };

  const importTemplate = (templateId: string) => {
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (tpl) {
      setBodyHtml(tpl.html);
      if (!subject) setSubject(tpl.subject);
      setShowTemplateImport(false);
      toast.success(`Template "${tpl.name}" imported`);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: campaigns.length,
    draft: campaigns.filter((c) => c.status === 'draft').length,
    scheduled: campaigns.filter((c) => c.status === 'scheduled').length,
    sent: campaigns.filter((c) => c.status === 'sent').length,
  };

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Total',
            value: stats.total,
            icon: Megaphone,
            color: 'text-gray-600 dark:text-gray-300',
          },
          {
            label: 'Drafts',
            value: stats.draft,
            icon: FileText,
            color: 'text-gray-500 dark:text-gray-400',
          },
          { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'text-blue-500' },
          { label: 'Sent', value: stats.sent, icon: CheckCircle2, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-700/60 dark:bg-[#0e0e14]"
          >
            <div className="flex items-center justify-between">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </span>
            </div>
            <p className="mt-1 font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200/80 bg-white p-4 sm:flex-row sm:items-center dark:border-gray-700/60 dark:bg-[#0e0e14]">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus-gold w-full rounded-lg border border-gray-200 bg-gray-50/80 py-2.5 pr-4 pl-10 text-sm dark:border-gray-700 dark:bg-gray-800/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'draft', 'scheduled', 'sent', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-all ${
                statusFilter === status
                  ? 'bg-brand-gold/10 text-brand-gold font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <button
          onClick={() => openModal()}
          className="bg-brand-gold text-brand-navy glow-gold inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create
        </button>
      </div>

      {/* Campaign Cards */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="border-brand-gold h-8 w-8 animate-spin rounded-full border-[3px] border-t-transparent" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-16 text-center dark:border-gray-800">
          <Mail className="mx-auto mb-4 h-10 w-10 text-gray-300 dark:text-gray-700" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No campaigns found</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Create your first campaign to start sending bulk emails.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredCampaigns.map((c, i) => {
            const cfg = statusConfig[c.status];
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className={`group relative overflow-hidden rounded-xl border border-gray-200/80 bg-white transition-all hover:shadow-md dark:border-gray-700/60 dark:bg-[#0e0e14] ${cfg.accent} border-l-[3px]`}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                        {c.title}
                      </h3>
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

                  {/* Meta */}
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50/80 p-3 dark:bg-gray-800/30">
                    <div>
                      <span className="block font-mono text-[9px] tracking-wider text-gray-400 uppercase">
                        Recipients
                      </span>
                      <span className="mt-0.5 block text-xs font-semibold text-gray-700 capitalize dark:text-gray-300">
                        {c.recipient_group.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="block font-mono text-[9px] tracking-wider text-gray-400 uppercase">
                        Sent To
                      </span>
                      <span className="mt-0.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {c.status === 'sent' ? `${c.recipient_count} people` : '--'}
                      </span>
                    </div>
                  </div>

                  {/* Schedule info */}
                  {(c.scheduled_at || c.reminder_at) && (
                    <div className="mt-3 space-y-1.5">
                      {c.scheduled_at && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <Calendar className="h-3 w-3" />
                            Send
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {formatISTDisplay(c.scheduled_at)}
                          </span>
                        </div>
                      )}
                      {c.reminder_at && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <Clock className="h-3 w-3" />
                            Reminder
                          </span>
                          <span
                            className={`font-medium ${
                              c.reminder_sent_at
                                ? 'text-emerald-500'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {c.reminder_sent_at ? 'Sent' : formatISTDisplay(c.reminder_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 dark:border-gray-800">
                  <div className="flex items-center gap-1.5">
                    {c.status !== 'sent' && c.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => openModal(c)}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleSendImmediately(c.id)}
                          className="bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors"
                          title="Send Now"
                        >
                          <Play className="h-3 w-3" />
                          Send Now
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(c)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Slide-over Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl dark:bg-[#0e0e14]"
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
                  onClick={() => setIsModalOpen(false)}
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

                {/* Title & Subject */}
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
                        className="focus-gold w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs dark:border-gray-700 dark:bg-[#0e0e14]"
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
                      <Calendar className="text-brand-gold h-3 w-3" />
                      Schedule (IST)
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAtInput}
                      onChange={(e) => setScheduledAtInput(e.target.value)}
                      className="focus-gold w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800/50"
                    />
                    <p className="mt-1 font-mono text-[10px] text-gray-400">
                      Blank = save as draft
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                      <Clock className="text-brand-gold h-3 w-3" />
                      Reminder (IST)
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
                          <FileText className="h-3 w-3" />
                          Import Template
                        </button>
                        {showTemplateImport && (
                          <div className="absolute top-full right-0 z-50 mt-1 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-[#0e0e14]">
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
                        <Eye className="h-3 w-3" />
                        {isPreviewMode ? 'Edit' : 'Preview'}
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
                  onClick={() => setIsModalOpen(false)}
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

      {/* Confirm Dialog */}
      {confirmState && (
        <ConfirmDialog
          open={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          variant={confirmState.variant}
          confirmLabel={confirmState.confirmLabel}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}
