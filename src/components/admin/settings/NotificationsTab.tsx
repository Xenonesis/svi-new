'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Flame,
  Mail,
  Plus,
  Trash2,
  BellRing,
  Sparkles,
  Loader2,
  Clock,
  Zap,
  Send,
  Check,
  AlertTriangle,
  Bot,
  MessageCircle,
  Volume2,
  Save,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  HotLeadNotificationSettings,
  HotLeadRecipient,
  ChannelHealthStatus,
  NotificationDeliveryMode,
  LeadInterestFilter,
} from '@/src/lib/leads/hotLeadNotificationTypes';
import { DEFAULT_HOT_LEAD_SETTINGS } from '@/src/lib/leads/hotLeadNotificationTypes';

interface Notifications {
  emailAlerts: boolean;
  inAppAlerts: boolean;
  weeklyDigest: boolean;
}

interface GlobalEmailSharing {
  enabled: boolean;
}

interface NotificationsTabProps {
  notifications: Notifications;
  handleToggleNotification: (field: keyof Notifications) => Promise<void>;
  globalEmailSharing: GlobalEmailSharing;
  handleToggleGlobalEmailSharing: () => Promise<void>;
  isCompact: boolean;
}

const DIGEST_TIME_OPTIONS = [
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '19:30', label: '7:30 PM (Recommended)' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
];

const SLA_THRESHOLD_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
];

export function NotificationsTab({
  notifications,
  handleToggleNotification,
  globalEmailSharing,
  handleToggleGlobalEmailSharing,
  isCompact,
}: NotificationsTabProps) {
  const densitySecSpacing = isCompact ? 'space-y-6' : 'space-y-8';

  const [hotLeadSettings, setHotLeadSettings] =
    useState<HotLeadNotificationSettings>(DEFAULT_HOT_LEAD_SETTINGS);
  const [channelStatus, setChannelStatus] = useState<ChannelHealthStatus | null>(null);
  const [loadingHotSettings, setLoadingHotSettings] = useState(true);
  const [savingHotSettings, setSavingHotSettings] = useState(false);
  const [testingDigestId, setTestingDigestId] = useState<string | null>(null);

  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [savingTelegram, setSavingTelegram] = useState(false);

  const [slaTargetEmail, setSlaTargetEmail] = useState('');
  const [savingSla, setSavingSla] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Senior Advisor');
  const [newMode, setNewMode] = useState<NotificationDeliveryMode>('both');
  const [newTime, setNewTime] = useState('19:30');
  const [newTier, setNewTier] = useState<LeadInterestFilter>('hot_only');

  const fetchHotSettings = useCallback(async () => {
    try {
      setLoadingHotSettings(true);
      const res = await fetch('/api/admin/settings/hot-lead-alerts');
      if (res.ok) {
        const data = (await res.json()) as {
          settings?: HotLeadNotificationSettings;
          channel_status?: ChannelHealthStatus;
        };
        if (data.settings) {
          setHotLeadSettings(data.settings);
          setTelegramToken(data.settings.telegram_config?.bot_token || '');
          setTelegramChatId(data.settings.telegram_config?.target_chat_id || '');
          setSlaTargetEmail(
            data.settings.sla_config?.escalation_targets?.[0] || 'director@sviinfrasolutions.com'
          );
        }
        if (data.channel_status) {
          setChannelStatus(data.channel_status);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch alert settings');
    } finally {
      setLoadingHotSettings(false);
    }
  }, []);

  useEffect(() => {
    fetchHotSettings();
  }, [fetchHotSettings]);

  const persistHotSettings = async (updated: HotLeadNotificationSettings) => {
    setHotLeadSettings(updated);
    setSavingHotSettings(true);
    try {
      const res = await fetch('/api/admin/settings/hot-lead-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        channel_status?: ChannelHealthStatus;
      };

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update alert settings');
      }

      if (data.channel_status) {
        setChannelStatus(data.channel_status);
      }

      toast.success('Hot lead preferences saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings');
      fetchHotSettings();
    } finally {
      setSavingHotSettings(false);
    }
  };

  const handleToggleMasterAlerts = () => {
    const updated: HotLeadNotificationSettings = {
      ...hotLeadSettings,
      enabled: !hotLeadSettings.enabled,
    };
    persistHotSettings(updated);
  };

  const handleToggleChannel = (channel: keyof HotLeadNotificationSettings['channels']) => {
    const isAvailable = channelStatus ? channelStatus[channel]?.available : true;
    if (!isAvailable) {
      toast.error('Channel locked: Required credentials missing');
      return;
    }
    const updated: HotLeadNotificationSettings = {
      ...hotLeadSettings,
      channels: {
        ...hotLeadSettings.channels,
        [channel]: !hotLeadSettings.channels[channel],
      },
    };
    persistHotSettings(updated);
  };

  const handleToggleAudioSnippet = () => {
    const updated: HotLeadNotificationSettings = {
      ...hotLeadSettings,
      audio_snippet_config: {
        auto_extract_high_intent_clip:
          !hotLeadSettings.audio_snippet_config.auto_extract_high_intent_clip,
      },
    };
    persistHotSettings(updated);
  };

  const handleSelectSlaThreshold = (minutes: number) => {
    const updated: HotLeadNotificationSettings = {
      ...hotLeadSettings,
      sla_config: {
        ...hotLeadSettings.sla_config,
        sla_threshold_minutes: minutes,
      },
    };
    persistHotSettings(updated);
  };

  const handleToggleAutoReassign = () => {
    const updated: HotLeadNotificationSettings = {
      ...hotLeadSettings,
      sla_config: {
        ...hotLeadSettings.sla_config,
        auto_reassign_on_breach: !hotLeadSettings.sla_config.auto_reassign_on_breach,
      },
    };
    persistHotSettings(updated);
  };

  const handleSaveSlaTarget = async () => {
    const cleanEmail = slaTargetEmail.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      toast.error('Please enter a valid escalation email address');
      return;
    }
    setSavingSla(true);
    const updated: HotLeadNotificationSettings = {
      ...hotLeadSettings,
      sla_config: {
        ...hotLeadSettings.sla_config,
        escalation_targets: [cleanEmail],
      },
    };
    await persistHotSettings(updated);
    setSavingSla(false);
  };

  const handleSaveTelegramConfig = async () => {
    setSavingTelegram(true);
    const updated: HotLeadNotificationSettings = {
      ...hotLeadSettings,
      telegram_config: {
        bot_token: telegramToken.trim(),
        target_chat_id: telegramChatId.trim(),
      },
    };
    await persistHotSettings(updated);
    setSavingTelegram(false);
  };

  const handleUpdateRecipientMode = (email: string, mode: NotificationDeliveryMode) => {
    const updatedRecipients = hotLeadSettings.recipients.map((r) => {
      return r.email === email ? { ...r, delivery_mode: mode } : r;
    });
    persistHotSettings({ ...hotLeadSettings, recipients: updatedRecipients });
  };

  const handleUpdateRecipientTime = (email: string, time: string) => {
    const updatedRecipients = hotLeadSettings.recipients.map((r) => {
      return r.email === email ? { ...r, digest_time: time } : r;
    });
    persistHotSettings({ ...hotLeadSettings, recipients: updatedRecipients });
  };

  const handleUpdateRecipientTier = (email: string, tier: LeadInterestFilter) => {
    const updatedRecipients = hotLeadSettings.recipients.map((r) => {
      return r.email === email ? { ...r, lead_tier: tier } : r;
    });
    persistHotSettings({ ...hotLeadSettings, recipients: updatedRecipients });
  };

  const handleRemoveRecipient = (email: string) => {
    if (hotLeadSettings.recipients.length <= 1) {
      toast.error('At least one alert recipient must be configured.');
      return;
    }
    const updatedRecipients = hotLeadSettings.recipients.filter((r) => r.email !== email);
    persistHotSettings({ ...hotLeadSettings, recipients: updatedRecipients });
  };

  const handleSendTestDigest = async (recipient: HotLeadRecipient) => {
    try {
      setTestingDigestId(recipient.email);
      const res = await fetch('/api/admin/settings/hot-lead-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_test_digest',
          targetEmail: recipient.email,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        leadCount?: number;
      };

      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch test digest');
      }

      toast.success(
        `Preview Daily Digest sent to ${recipient.email} (${data.leadCount ?? 0} leads)`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send test digest');
    } finally {
      setTestingDigestId(null);
    }
  };

  const handleAddRecipient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    const cleanName = newName.trim() || 'Team Member';
    const cleanRole = newRole.trim() || 'Senior Advisor';

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (hotLeadSettings.recipients.some((r) => r.email.toLowerCase() === cleanEmail)) {
      toast.error('This email is already in the dispatch roster.');
      return;
    }

    const newRecipient: HotLeadRecipient = {
      name: cleanName,
      email: cleanEmail,
      role: cleanRole,
      delivery_mode: newMode,
      digest_time: newTime,
      lead_tier: newTier,
    };

    persistHotSettings({
      ...hotLeadSettings,
      recipients: [...hotLeadSettings.recipients, newRecipient],
    });

    setNewName('');
    setNewEmail('');
    setNewRole('Senior Advisor');
  };

  const channelDefinitions = [
    {
      id: 'in_app' as const,
      title: 'In-App Dashboard Alerts',
      badgeTitle: 'In-App',
      description: 'Real-time bell chime and floating badge updates in the admin command center.',
      icon: BellRing,
      available: channelStatus ? channelStatus.in_app.available : true,
      missingKey: null,
    },
    {
      id: 'email' as const,
      title: 'Obsidian Gold VIP Email',
      badgeTitle: 'Email Dispatch',
      description:
        'Luxury executive HTML dispatch via Resend with buyer intent score and call quotes.',
      icon: Mail,
      available: channelStatus ? channelStatus.email.available : false,
      missingKey: channelStatus?.email?.key || 'RESEND_API_KEY',
    },
    {
      id: 'telegram' as const,
      title: 'Telegram Bot Push',
      badgeTitle: 'Telegram Bot',
      description: 'Instant broadcast alerts to dedicated leadership channel with CRM deep link.',
      icon: Bot,
      available: channelStatus ? channelStatus.telegram.available : false,
      missingKey: channelStatus?.telegram?.key || 'TELEGRAM_BOT_TOKEN',
    },
    {
      id: 'whatsapp' as const,
      title: 'WhatsApp Business Dispatch',
      badgeTitle: 'WhatsApp Cloud',
      description: 'Direct priority dispatch to sales coordinator mobile devices via Meta API.',
      icon: MessageCircle,
      available: channelStatus ? channelStatus.whatsapp.available : false,
      missingKey: channelStatus?.whatsapp?.key || 'WHATSAPP_ACCESS_TOKEN',
    },
    {
      id: 'customer_warmup' as const,
      title: 'Customer Auto-Warmup',
      badgeTitle: 'Auto-Warmup',
      description:
        'Instant greeting and township brochure PDF dispatched to buyer within 60 seconds.',
      icon: Sparkles,
      available: channelStatus ? channelStatus.customer_warmup.available : false,
      missingKey: channelStatus?.customer_warmup?.key || 'WHATSAPP_ACCESS_TOKEN',
    },
  ];

  return (
    <div className={`space-y-8 ${densitySecSpacing}`}>
      <div>
        <h2 className="text-brand-navy mb-1 font-sans font-serif text-xl font-bold dark:text-white">
          Personal Notification Preferences
        </h2>
        <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
          Configure what system activities trigger communication dispatches.
        </p>

        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {[
            {
              id: 'emailAlerts' as const,
              title: 'Email Alert Notifications',
              description:
                'Receive full audit roundups and immediate alerts on major administrative adjustments.',
            },
            {
              id: 'inAppAlerts' as const,
              title: 'In-App Dashboard Alerts',
              description:
                'Show visual toasts and floating indicators directly in the active dashboard panel.',
            },
            {
              id: 'weeklyDigest' as const,
              title: 'Weekly Analytics digest',
              description:
                'Dispatch a weekly metric report comparing user accounts and documents created.',
            },
          ].map((channel) => {
            const isChecked = notifications[channel.id];
            return (
              <div
                key={channel.id}
                className={`flex items-center justify-between gap-6 ${isCompact ? 'py-3.5' : 'py-5'}`}
              >
                <div className="space-y-0.5 font-sans">
                  <h3 className="font-sans text-sm font-bold text-gray-900 dark:text-white">
                    {channel.title}
                  </h3>
                  <p className="max-w-lg font-sans text-xs text-gray-500 dark:text-gray-400">
                    {channel.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification(channel.id)}
                  className={`relative flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                    isChecked ? 'bg-brand-gold' : 'bg-gray-200 dark:bg-white/10'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      isChecked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-brand-gold/30 relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[#080b11] via-[#0e1422] to-[#080b11] p-6 shadow-xl dark:border-amber-500/20">
        <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <Flame className="h-6 w-6 animate-pulse text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-white">
                    VIP Hot Lead Multi-Channel Dispatch Suite
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                    <Sparkles className="h-3 w-3" /> Voice AI Radar
                  </span>
                </div>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-300">
                  Instant multi-channel fan-out across In-App, VIP Email, Telegram Bot, and WhatsApp
                  with SLA tracking and customer auto-warmup.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-xs font-semibold text-slate-300">
                {hotLeadSettings.enabled ? 'Radar Active' : 'Radar Paused'}
              </span>
              <button
                type="button"
                onClick={handleToggleMasterAlerts}
                disabled={loadingHotSettings || savingHotSettings}
                className={`relative flex h-7 w-12 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                  hotLeadSettings.enabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
                aria-label="Toggle Hot Lead Alerts"
              >
                <span
                  className={`absolute left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                    hotLeadSettings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold tracking-wider text-amber-300 uppercase">
                Channel Health & Multi-Channel Availability Locks
              </h4>
              {savingHotSettings && (
                <span className="flex items-center gap-1.5 text-xs text-amber-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving changes...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {channelDefinitions.map((ch) => {
                const isChecked = hotLeadSettings.channels[ch.id];
                const isAvailable = ch.available;

                return (
                  <div
                    key={ch.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-[#111622]/80 p-4 transition-all hover:border-slate-700 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-amber-400">
                        <ch.icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-white">{ch.title}</span>
                          {!isAvailable && ch.missingKey && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                              <AlertTriangle className="h-3 w-3 text-amber-400" />
                              ⚠️ Key Missing: {ch.missingKey}
                            </span>
                          )}
                          {isAvailable && isChecked && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                              <Check className="h-3 w-3" /> Active
                            </span>
                          )}
                          {isAvailable && !isChecked && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{ch.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleChannel(ch.id)}
                        disabled={!isAvailable || savingHotSettings}
                        aria-label={`Toggle ${ch.title}`}
                        className={`relative flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                          !isAvailable
                            ? 'pointer-events-none cursor-not-allowed bg-slate-800 opacity-50'
                            : isChecked
                              ? 'cursor-pointer bg-amber-500'
                              : 'cursor-pointer bg-slate-800'
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                            isAvailable && isChecked ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#080b11] via-[#111622] to-[#080b11] p-5 shadow-lg">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-wider text-white uppercase">
                    Speed-to-Lead SLA Escalation Controls
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Target maximum window for specialist outreach before automated executive
                    escalation.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-300">SLA Threshold:</span>
                <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/90 p-0.5">
                  {SLA_THRESHOLD_OPTIONS.map((opt) => {
                    const isSelected =
                      hotLeadSettings.sla_config.sla_threshold_minutes === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectSlaThreshold(opt.value)}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-slate-800/80 pt-2 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Director Escalation Target
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={slaTargetEmail}
                    onChange={(e) => setSlaTargetEmail(e.target.value)}
                    placeholder="director@sviinfrasolutions.com"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 font-mono text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveSlaTarget}
                    disabled={savingSla || savingHotSettings}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/20"
                  >
                    {savingSla ? (
                      <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                    <span>Save</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Auto-Reassign Lead on Breach</div>
                  <div className="text-[10px] text-slate-400">
                    Reallocate lead to next available sales manager if SLA expires.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleAutoReassign}
                  className={`relative flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                    hotLeadSettings.sla_config.auto_reassign_on_breach
                      ? 'bg-amber-500'
                      : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      hotLeadSettings.sla_config.auto_reassign_on_breach
                        ? 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#080b11] via-[#111622] to-[#080b11] p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-wider text-white uppercase">
                    Telegram Bot Push Credentials
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Configure your dedicated executive channel bot token and chat ID.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveTelegramConfig}
                disabled={savingTelegram || savingHotSettings}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition-colors hover:bg-amber-400"
              >
                {savingTelegram ? (
                  <Loader2 className="h-3 w-3 animate-spin text-slate-950" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                <span>Save Telegram Config</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Bot Token
                </label>
                <input
                  type="password"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 font-mono text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Target Chat ID
                </label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="-1001234567890"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 font-mono text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#080b11] via-[#111622] to-[#080b11] p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
                <Volume2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Auto-Extract High-Intent Audio Snippets
                </div>
                <div className="text-[11px] text-slate-400">
                  Automatically trim buyer quote audio clips for instant in-CRM playback and
                  assessment.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleAudioSnippet}
              className={`relative flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                hotLeadSettings.audio_snippet_config.auto_extract_high_intent_clip
                  ? 'bg-amber-500'
                  : 'bg-slate-800'
              }`}
            >
              <span
                className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  hotLeadSettings.audio_snippet_config.auto_extract_high_intent_clip
                    ? 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                Subscribed Email Dispatch Roster ({hotLeadSettings.recipients.length})
              </h4>
            </div>

            <div className="space-y-3">
              {hotLeadSettings.recipients.map((rec) => {
                const deliveryMode = rec.delivery_mode || 'both';
                const digestTime = rec.digest_time || '19:30';
                const leadTier = rec.lead_tier || 'hot_only';
                const isTesting = testingDigestId === rec.email;

                return (
                  <div
                    key={rec.email}
                    className="flex flex-col gap-3.5 rounded-xl border border-slate-800 bg-[#111622]/90 p-4 transition-all hover:border-slate-700"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300">
                          <Mail className="h-4 w-4 text-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{rec.name}</span>
                            <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                              {rec.role || 'Advisor'}
                            </span>
                          </div>
                          <div className="font-mono text-xs text-slate-400">{rec.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleSendTestDigest(rec)}
                          disabled={isTesting || savingHotSettings}
                          className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-300 transition-colors hover:border-amber-500/50 hover:text-white"
                          title="Send a sample Daily Digest to this email right now"
                        >
                          {isTesting ? (
                            <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
                          ) : (
                            <Send className="h-3 w-3 text-amber-400" />
                          )}
                          <span>Preview Digest</span>
                        </button>

                        <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                          Active
                        </span>

                        {hotLeadSettings.recipients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipient(rec.email)}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                            title="Remove this email"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 border-t border-slate-800/80 pt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-400">Mode:</span>
                        <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/90 p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateRecipientMode(rec.email, 'instant')}
                            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                              deliveryMode === 'instant'
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Zap className="h-3 w-3" /> Instant
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateRecipientMode(rec.email, 'daily_digest')}
                            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                              deliveryMode === 'daily_digest'
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Clock className="h-3 w-3" /> Daily Digest
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateRecipientMode(rec.email, 'both')}
                            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                              deliveryMode === 'both'
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Check className="h-3 w-3" /> Both
                          </button>
                        </div>
                      </div>

                      {(deliveryMode === 'daily_digest' || deliveryMode === 'both') && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-400">
                            Digest Time:
                          </span>
                          <select
                            value={digestTime}
                            onChange={(e) => handleUpdateRecipientTime(rec.email, e.target.value)}
                            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-amber-300 outline-none focus:border-amber-500"
                          >
                            {DIGEST_TIME_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-400">Leads:</span>
                        <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/90 p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateRecipientTier(rec.email, 'hot_only')}
                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                              leadTier === 'hot_only'
                                ? 'border border-red-500/40 bg-red-500/20 text-red-300'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Hot Only
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateRecipientTier(rec.email, 'hot_and_warm')}
                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                              leadTier === 'hot_and_warm'
                                ? 'border border-amber-500/40 bg-amber-500/20 text-amber-300'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Hot & Warm
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form
            onSubmit={handleAddRecipient}
            className="space-y-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-300 uppercase">
              <Plus className="h-3.5 w-3.5" /> Add New Recipient With Custom Schedule
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="text"
                placeholder="Recipient Name (e.g. Rahul Sharma)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
              />
              <input
                type="email"
                required
                placeholder="Email Address (e.g. rahul@sviinfrasolutions.com)"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Role (e.g. Sales Head)"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-400">Delivery:</span>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value as NotificationDeliveryMode)}
                    className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-amber-300"
                  >
                    <option value="both">Both (Instant + Daily Digest)</option>
                    <option value="instant">Instant Only</option>
                    <option value="daily_digest">Daily Digest Only</option>
                  </select>
                </div>

                {(newMode === 'daily_digest' || newMode === 'both') && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-400">Digest Time:</span>
                    <select
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-amber-300"
                    >
                      {DIGEST_TIME_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-400">Filter:</span>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as LeadInterestFilter)}
                    className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                  >
                    <option value="hot_only">Hot Leads Only</option>
                    <option value="hot_and_warm">Hot & Warm Leads</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingHotSettings}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition-colors hover:bg-amber-400 active:scale-98"
              >
                <Plus className="h-3.5 w-3.5" /> Add Recipient
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-4 border-t border-gray-100 pt-6 dark:border-white/5">
        <div>
          <h2 className="text-brand-navy mb-1 font-sans font-serif text-xl font-bold dark:text-white">
            Global Portal Settings
          </h2>
          <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
            Configure system-wide automatic client communication dispatches (applies to all users).
          </p>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-white/5">
          <div className="flex items-center justify-between gap-6 py-3.5">
            <div className="space-y-0.5">
              <h3 className="font-sans text-sm font-bold text-gray-900 dark:text-white">
                Share Action Emails to Real Estate Clients
              </h3>
              <p className="max-w-lg font-sans text-xs text-gray-500 dark:text-gray-400">
                Automatically forward transactional action emails (milestone notices, booking
                receipts, agreement copies) to the verified real email address of clients.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleGlobalEmailSharing}
              className={`relative flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                globalEmailSharing.enabled ? 'bg-brand-gold' : 'bg-gray-200 dark:bg-white/10'
              }`}
            >
              <span
                className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  globalEmailSharing.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
