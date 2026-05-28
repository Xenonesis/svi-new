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
} from 'lucide-react';
import { getToken } from './helpers';

export function SettingsTab({ adminEmail }: { adminEmail: string }) {
  const [testTo, setTestTo] = useState(adminEmail);
  const [sending, setSending] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const sendTest = async () => {
    if (!testTo.trim()) return;
    setSending(true);
    setTestResult(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'send',
          to: testTo,
          subject: '✅ SVI Admin – Resend Test Email',
          html: `<div style="font-family:Arial,sans-serif;padding:32px;background:#f5f5f5;"><div style="background:#fff;border-radius:12px;padding:32px;max-width:480px;margin:auto;"><h2 style="color:#1a2744;margin:0 0 16px;">Resend Test Successful 🎉</h2><p style="color:#555;">This test email confirms that your Resend integration is working correctly.</p><p style="color:#999;font-size:12px;margin-top:24px;">Sent from SVI Infra Admin Panel</p></div></div>`,
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
        : 're_••••••••',
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
    <div className="grid grid-cols-1 gap-6 font-sans lg:grid-cols-2">
      {/* Config overview */}
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[#0e0e14]">
          <h3 className="mb-5 font-sans font-semibold text-gray-900 dark:text-white">
            Resend Configuration
          </h3>
          <div className="space-y-3">
            {configItems.map((item) => {
              const ItemIcon = item.icon;
              const statusColor =
                item.status === 'configured' || item.status === 'active'
                  ? 'text-emerald-500'
                  : 'text-amber-500';
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <ItemIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-sans text-sm text-gray-600 dark:text-gray-300">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-gray-700 dark:text-gray-300">{item.value}</code>
                    <Check className={`h-3.5 w-3.5 ${statusColor}`} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-900/10">
            <p className="font-sans text-xs text-amber-700 dark:text-amber-400">
              <strong>Note:</strong> API key is stored in <code>.env.local</code> as{' '}
              <code>RESEND_API_KEY</code>. Update it in your environment for production.
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[#0e0e14]">
          <h3 className="mb-4 font-sans font-semibold text-gray-900 dark:text-white">
            Resend Resources
          </h3>
          <div className="space-y-2">
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
                  className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-sans text-sm text-gray-700 dark:text-gray-300">
                      {link.label}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Test email */}
      <div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[#0e0e14]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-gray-900 dark:text-white">
                Send Test Email
              </h3>
              <p className="font-sans text-xs text-gray-400">Verify your Resend setup is working</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block font-sans text-xs font-medium text-gray-600 dark:text-gray-400">
                Send test to
              </label>
              <input
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="your@email.com"
                className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 font-sans text-sm text-gray-900 placeholder-gray-400 transition-colors outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <AnimatePresence>
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-start gap-2 rounded-lg border px-4 py-3 font-sans text-sm ${
                    testResult.ok
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/15 dark:text-emerald-400'
                      : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-900/15 dark:text-red-400'
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
              className="bg-brand-gold text-brand-navy flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-sans text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sending ? 'Sending…' : 'Send Test Email'}
            </button>
          </div>
        </div>

        {/* Rate limits info */}
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[#0e0e14]">
          <h3 className="mb-4 font-sans font-semibold text-gray-900 dark:text-white">
            Resend Free Plan Limits
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Emails per month', value: '3,000', max: 3000, current: 0 },
              { label: 'Emails per day', value: '100', max: 100, current: 0 },
              { label: 'Domains', value: '1', max: 1, current: 1 },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between font-sans text-xs text-gray-600 dark:text-gray-400">
                  <span>{item.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
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
          <p className="mt-4 font-sans text-xs text-gray-400">
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
      </div>
    </div>
  );
}
