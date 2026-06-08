'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { getToken } from './helpers';
import { ResendUsageDashboard } from './ResendUsageDashboard';
import { DashboardCardSkeleton } from './Skeletons';

export function SettingsTab({ adminEmail }: { adminEmail: string }) {
  const [testTo, setTestTo] = useState(adminEmail);
  const [sending, setSending] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const isDev =
    process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SHOW_RESEND !== 'false';

  const sendTest = async () => {
    if (!testTo.trim()) return;
    setSending(true);
    setTestResult(null);

    const testSubject = isDev
      ? 'SVI Admin - Resend Test Email'
      : 'SVI Admin - Connection Test Email';

    const testHtml = isDev
      ? `<div style="font-family:Arial,sans-serif;padding:32px;background:#f5f5f5;"><div style="background:#fff;border-radius:12px;padding:32px;max-width:480px;margin:auto;"><h2 style="color:#1a2744;margin:0 0 16px;">Resend Test Successful</h2><p style="color:#555;">This test email confirms that your Resend integration is working correctly.</p><p style="color:#999;font-size:12px;margin-top:24px;">Sent from SVI Infra Admin Panel</p></div></div>`
      : `<div style="font-family:Arial,sans-serif;padding:32px;background:#f5f5f5;"><div style="background:#fff;border-radius:12px;padding:32px;max-width:480px;margin:auto;"><h2 style="color:#1a2744;margin:0 0 16px;">Connection Test Successful</h2><p style="color:#555;">This test email confirms that your admin portal email connection is active and working correctly.</p><p style="color:#999;font-size:12px;margin-top:24px;">Sent from SVI Infra Admin Panel</p></div></div>`;

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
        <div className="rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-700/60 dark:bg-[#0e0e14]">
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
        {isDev && (
          <div className="mt-4 rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-700/60 dark:bg-[#0e0e14]">
            <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">
              Resend Resources
            </h3>
            <div className="space-y-1">
              {[
                { label: 'Dashboard', url: 'https://resend.com/overview', icon: BarChart3 },
                { label: 'Email Logs', url: 'https://resend.com/emails', icon: Inbox },
                { label: 'Domains', url: 'https://resend.com/domains', icon: Globe },
                { label: 'API Keys', url: 'https://resend.com/api-keys', icon: Shield },
                { label: 'Documentation', url: 'https://resend.com/docs', icon: FileText },
              ].map((link) => {
                const LinkIcon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {link.label}
                      </span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Test email & Limits */}
      <div className={isDev ? 'space-y-4' : 'space-y-4 lg:col-span-2'}>
        <div className="rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-700/60 dark:bg-[#0e0e14]">
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
          <div className="rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-700/60 dark:bg-[#0e0e14]">
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

      {/* Usage Dashboard - full width below */}
      {isDev && (
        <div className="lg:col-span-5">
          <ResendUsageDashboard />
        </div>
      )}
    </div>
  );
}
