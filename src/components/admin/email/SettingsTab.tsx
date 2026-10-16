'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  BarChart3,
  Check,
  ExternalLink,
  FileText,
  Globe,
  Inbox,
  Loader2,
  Send,
  Shield,
  AtSign,
  User,
  Zap,
  Calendar,
  Mail,
  Bot,
  Clock,
  Sparkles,
  Save,
} from 'lucide-react';
import { getToken } from './helpers';
import {
  DEFAULT_AUTO_REPLY_SETTINGS,
  isWithinBusinessHours,
  getISTDateTime,
  type AutoReplySettings,
} from '@/src/lib/email/autoReplyEvaluator';
import dynamic from 'next/dynamic';
const ResendUsageDashboard = dynamic(
  () => import('./ResendUsageDashboard').then((mod) => mod.ResendUsageDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
    ),
  }
);
import { DashboardCardSkeleton } from './Skeletons';

export function SettingsTab({ adminEmail }: { adminEmail: string }) {
  const [testTo, setTestTo] = useState(adminEmail);
  const [sending, setSending] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Auto-Reply Bot State
  const [autoReply, setAutoReply] = useState<AutoReplySettings>(DEFAULT_AUTO_REPLY_SETTINGS);
  const [savingAutoReply, setSavingAutoReply] = useState(false);
  const [autoReplySaved, setAutoReplySaved] = useState(false);
  const [currentTimeIST, setCurrentTimeIST] = useState(getISTDateTime());

  const isDev =
    process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SHOW_RESEND !== 'false';

  // Load Auto-Reply settings on mount
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeIST(getISTDateTime());
    }, 15000);

    getToken().then((token) => {
      fetch('/api/admin/settings?key=email_auto_reply_settings', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.setting && data.setting.value) {
            setAutoReply(data.setting.value);
          }
        })
        .catch(() => {});
    });

    return () => clearInterval(timer);
  }, []);

  const saveAutoReplySettings = async () => {
    setSavingAutoReply(true);
    setAutoReplySaved(false);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          key: 'email_auto_reply_settings',
          value: autoReply,
        }),
      });
      if (res.ok) {
        setAutoReplySaved(true);
        setTimeout(() => setAutoReplySaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save auto-reply settings:', err);
    } finally {
      setSavingAutoReply(false);
    }
  };
  const sendTest = async () => {
    if (!testTo.trim()) return;
    setSending(true);
    setTestResult(null);

    const testSubject = isDev
      ? 'SVI Admin - Resend Test Email'
      : 'SVI Admin - Connection Test Email';

    const testHtml = isDev
      ? `<div style="font-family:Arial,sans-serif;padding:32px;background:#f5f5f5;"><div style="background:#fff;border-radius:12px;padding:32px;max-width:480px;margin:auto;"><h2 style="color:#111827;margin:0 0 16px;">Resend Test Successful</h2><p style="color:#555;">This test email confirms that your Resend integration is working correctly.</p><p style="color:#999;font-size:12px;margin-top:24px;">Sent from SVI Infra Admin Panel</p></div></div>`
      : `<div style="font-family:Arial,sans-serif;padding:32px;background:#f5f5f5;"><div style="background:#fff;border-radius:12px;padding:32px;max-width:480px;margin:auto;"><h2 style="color:#111827;margin:0 0 16px;">Connection Test Successful</h2><p style="color:#555;">This test email confirms that your admin portal email connection is active and working correctly.</p><p style="color:#999;font-size:12px;margin-top:24px;">Sent from SVI Infra Admin Panel</p></div></div>`;

    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'send',
          to: testTo,
          subject: testSubject,
          html: testHtml,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setTestResult({ ok: false, message: data.error || 'Failed to send' });
      } else {
        setTestResult({ ok: true, message: `Email sent! ID: ${data.id}` });
      }
    } catch {
      setTestResult({ ok: false, message: 'Network error' });
    } finally {
      setSending(false);
    }
  };

  const configItems = [
    {
      label: 'API Key',
      value: process.env.RESEND_API_KEY
        ? '••••••••' + (process.env.RESEND_API_KEY?.slice(-4) || '')
        : isDev
          ? 're_••••••••'
          : '••••••••',
      icon: Shield,
      status: 'configured',
    },
    { label: 'From Domain', value: 'sviiinfrasolutions.com', icon: Globe, status: 'active' },
    {
      label: 'Admin Email',
      value: adminEmail || 'Not set',
      icon: AtSign,
      status: adminEmail ? 'configured' : 'warning',
    },
    { label: 'Default From Name', value: 'SVI Infra', icon: User, status: 'configured' },
  ];

  return (
    <div className={`grid grid-cols-1 gap-6 ${isDev ? 'lg:grid-cols-2' : 'lg:grid-cols-5'}`}>
      {/* Config overview */}
      <div className={isDev ? '' : 'lg:col-span-3'}>
        <div className="dark:bg-brand-dark-surface rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-700/60">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {isDev ? 'Resend Configuration' : 'Connection Configuration'}
              </h3>
              <p className="mt-1 font-mono text-[10px] tracking-wider text-gray-400 uppercase">
                Email service credentials and settings
              </p>
            </div>
          </div>

          {/* Show skeleton while checking config */}
          {!adminEmail && isDev ? (
            <DashboardCardSkeleton />
          ) : (
            <div className="space-y-2.5">
              {configItems.map((item) => {
                const ItemIcon = item.icon;
                const isOk = item.status === 'configured' || item.status === 'active';
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/30"
                  >
                    <div className="flex items-center gap-3">
                      <ItemIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs text-gray-700 dark:text-gray-300">
                        {item.value}
                      </code>
                      <Check
                        className={`h-3.5 w-3.5 ${isOk ? 'text-emerald-500' : 'text-amber-500'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isDev && (
            <div className="mt-4 rounded-lg border border-amber-200/60 bg-amber-50/80 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/5">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                API key is stored in <code className="font-mono">.env.local</code> as{' '}
                <code className="font-mono">RESEND_API_KEY</code>.
              </p>
            </div>
          )}
        </div>

        {/* Quick links */}
        {/* Quick links & Internal SVI Email Navigation */}
        <div className="dark:bg-brand-dark-surface mt-4 rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-700/60">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              SVI Email Command Hub
            </h3>
            <span className="bg-brand-gold/15 text-brand-gold rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
              In-House Portal
            </span>
          </div>
          <div className="space-y-1">
            {[
              {
                label: 'Executive Analytics & Usage',
                href: '#usage-dashboard',
                icon: BarChart3,
                internal: true,
                badge: 'Built-in',
              },
              {
                label: 'Sent Mail & Delivery Logs',
                href: '/admin/email?tab=sent',
                icon: Inbox,
                internal: true,
                badge: 'Live Logs',
              },
              {
                label: 'Verified Sending Domains',
                href: '/admin/email?tab=domains',
                icon: Globe,
                internal: true,
                badge: 'DNS Hub',
              },
              {
                label: 'Client Out-of-Office & Bot',
                href: '#bot-settings',
                icon: Bot,
                internal: true,
                badge: 'Active',
              },
              {
                label: 'Resend Cloud Console',
                href: 'https://resend.com/overview',
                icon: Shield,
                internal: false,
                badge: 'Cloud API',
              },
            ].map((link) => {
              const LinkIcon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.internal ? undefined : '_blank'}
                  rel={link.internal ? undefined : 'noopener noreferrer'}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="text-brand-gold h-4 w-4" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {link.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9.5px] font-bold text-gray-600 dark:bg-white/5 dark:text-gray-400">
                      {link.badge}
                    </span>
                    {link.internal ? (
                      <span className="text-brand-gold text-xs font-bold">→</span>
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Test email & Limits */}
      <div className={isDev ? 'space-y-4' : 'space-y-4 lg:col-span-2'}>
        <div className="dark:bg-brand-dark-surface rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-700/60">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <Zap className="text-brand-gold h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Send Test Email</h3>
              <p className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">
                {isDev ? 'verify resend setup' : 'verify email connection'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Send test to
              </label>
              <input
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="your@email.com"
                className="focus-gold w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none dark:border-gray-700 dark:bg-gray-800/30"
              />
            </div>

            <AnimatePresence>
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                    testResult.ok
                      ? 'border-emerald-200/60 bg-emerald-50/80 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'border-red-200/60 bg-red-50/80 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'
                  }`}
                >
                  {testResult.ok ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  {testResult.message}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={sendTest}
              disabled={sending || !testTo.trim()}
              className="bg-brand-gold text-brand-navy glow-gold flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition-all hover:opacity-90 disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sending ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        </div>

        {/* Rate limits */}
        {isDev && (
          <div className="dark:bg-brand-dark-surface rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-700/60">
            <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">
              Free Plan Limits
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Emails per month', value: '3,000', max: 3000, current: 0 },
                { label: 'Emails per day', value: '100', max: 100, current: 0 },
                { label: 'Domains', value: '1', max: 1, current: 1 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      {item.value}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="bg-brand-gold h-full rounded-full"
                      style={{ width: `${(item.current / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Upgrade on{' '}
              <a
                href="https://resend.com/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold underline"
              >
                resend.com/pricing
              </a>{' '}
              for higher limits.
            </p>
          </div>
        )}
      </div>

      {/* Out of Office & Business Hours Bot Card */}
      <div
        id="bot-settings"
        className="dark:bg-brand-dark-surface overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm lg:col-span-5 dark:border-gray-700/60"
      >
        <div className="border-b border-gray-100 p-6 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Out-of-Office & Business Hours Bot
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically acknowledge incoming client emails outside corporate hours (9:30 AM
                  – 6:30 PM IST).
                </p>
              </div>
            </div>

            {/* Live IST Status Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                <Clock className="text-brand-gold h-3.5 w-3.5" />
                <span>IST: {currentTimeIST.timeString}</span>
                <span
                  className={`ml-1 h-2 w-2 rounded-full ${
                    isWithinBusinessHours(new Date(), autoReply.business_hours)
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="text-[11px] font-bold">
                  {isWithinBusinessHours(new Date(), autoReply.business_hours)
                    ? 'Office Open'
                    : 'Out of Office'}
                </span>
              </div>

              {/* Master Toggle */}
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={autoReply.enabled}
                  onChange={(e) => setAutoReply({ ...autoReply, enabled: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer peer-checked:bg-brand-gold h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700" />
              </label>
            </div>
          </div>
        </div>

        {/* Bot Settings Form */}
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Mode Selector */}
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                Auto-Reply Mode
              </label>
              <select
                value={autoReply.mode}
                onChange={(e) =>
                  setAutoReply({
                    ...autoReply,
                    mode: e.target.value as 'out_of_office' | 'always' | 'vacation',
                  })
                }
                className="focus:border-brand-gold w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 shadow-xs focus:outline-none dark:border-gray-700 dark:bg-white/5 dark:text-gray-200"
              >
                <option value="out_of_office">🌙 Outside Business Hours Only (Recommended)</option>
                <option value="always">⚡ 24/7 Always Auto-Acknowledge</option>
                <option value="vacation">🏖️ Vacation / Extended Holiday Notice</option>
              </select>
            </div>

            {/* Office Hours Range */}
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                Business Hours (Start - End)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={autoReply.business_hours.start}
                  onChange={(e) =>
                    setAutoReply({
                      ...autoReply,
                      business_hours: { ...autoReply.business_hours, start: e.target.value },
                    })
                  }
                  className="focus:border-brand-gold w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-white/5 dark:text-gray-200"
                />
                <span className="font-bold text-gray-400">to</span>
                <input
                  type="time"
                  value={autoReply.business_hours.end}
                  onChange={(e) =>
                    setAutoReply({
                      ...autoReply,
                      business_hours: { ...autoReply.business_hours, end: e.target.value },
                    })
                  }
                  className="focus:border-brand-gold w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-white/5 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Helpline Phone */}
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                Helpline Phone
              </label>
              <input
                type="text"
                value={autoReply.emergency_phone}
                onChange={(e) => setAutoReply({ ...autoReply, emergency_phone: e.target.value })}
                className="focus:border-brand-gold w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-white/5 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Working Days Selector */}
          <div>
            <label className="mb-2 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Working Days
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 1, label: 'Mon' },
                { id: 2, label: 'Tue' },
                { id: 3, label: 'Wed' },
                { id: 4, label: 'Thu' },
                { id: 5, label: 'Fri' },
                { id: 6, label: 'Sat' },
                { id: 7, label: 'Sun' },
              ].map((d) => {
                const isActive = autoReply.business_hours.working_days.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      const updated = isActive
                        ? autoReply.business_hours.working_days.filter((x) => x !== d.id)
                        : [...autoReply.business_hours.working_days, d.id];
                      setAutoReply({
                        ...autoReply,
                        business_hours: { ...autoReply.business_hours, working_days: updated },
                      });
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-brand-gold text-brand-navy shadow-xs'
                        : 'border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-white/5 dark:bg-white/5 dark:text-gray-400'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject & Body */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                Auto-Reply Subject Line
              </label>
              <input
                type="text"
                value={autoReply.subject}
                onChange={(e) => setAutoReply({ ...autoReply, subject: e.target.value })}
                className="focus:border-brand-gold w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-white/5 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                Out-of-Office Body Message
              </label>
              <textarea
                rows={3}
                value={autoReply.body_text}
                onChange={(e) => setAutoReply({ ...autoReply, body_text: e.target.value })}
                className="focus:border-brand-gold w-full rounded-xl border border-gray-300 bg-white p-3 text-xs leading-relaxed text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-white/5 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/10">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Cooldown: {autoReply.cooldown_hours}h per client to prevent spam loops.
            </span>
            <button
              type="button"
              onClick={saveAutoReplySettings}
              disabled={savingAutoReply}
              className="bg-brand-gold text-brand-navy inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all hover:opacity-95 disabled:opacity-50"
            >
              {savingAutoReply ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : autoReplySaved ? (
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{autoReplySaved ? 'Rules Saved!' : 'Save Auto-Reply Rules'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Usage Dashboard - full width below */}
      <div id="usage-dashboard" className="lg:col-span-5">
        <ResendUsageDashboard />
      </div>
    </div>
  );
}
