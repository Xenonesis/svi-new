'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Send,
  Inbox,
  Settings,
  RefreshCw,
  Search,
  Eye,
  X,
  Check,
  AlertTriangle,
  Clock,
  Trash2,
  Copy,
  ExternalLink,
  Loader2,
  Globe,
  Shield,
  Zap,
  BarChart3,
  FileText,
  ChevronRight,
  User,
  AtSign,
  PenLine,
  Hash,
  Star,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase/client';

// ─── Auth helper ──────────────────────────────────────────────────────────────
async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SentEmail {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  last_event: string;
}

interface EmailDetail {
  id: string;
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  created_at: string;
  last_event: string;
  headers?: Record<string, string>[];
  cc?: string[];
  bcc?: string[];
  reply_to?: string[];
}

interface Domain {
  id: string;
  name: string;
  status: string;
  created_at: string;
  region: string;
  records?: DnsRecord[];
}

interface DnsRecord {
  record: string;
  name: string;
  type: string;
  ttl: string;
  status: string;
  value: string;
  priority?: number;
}

type Tab = 'compose' | 'sent' | 'templates' | 'domains' | 'settings';

// ─── Email Templates ──────────────────────────────────────────────────────────

const EMAIL_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to SVI Infra Solutions!',
    category: 'Onboarding',
    icon: Star,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#1a2744,#2d4080);padding:40px;text-align:center;">
          <h1 style="color:#D4AF37;font-size:28px;margin:0;font-family:Georgia,serif;">SVI Infra Solutions</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;letter-spacing:2px;">WELCOME ABOARD</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#1a2744;font-size:22px;margin:0 0 16px;">Hello {{name}},</h2>
          <p style="color:#555;line-height:1.7;margin:0 0 24px;">Thank you for choosing SVI Infra Solutions. We are delighted to have you as part of our growing family of property owners.</p>
          <p style="color:#555;line-height:1.7;margin:0 0 32px;">Your journey towards owning your dream property starts here. Our team is committed to making this experience seamless and rewarding for you.</p>
          <div style="text-align:center;">
            <a href="{{portal_url}}" style="background:#D4AF37;color:#1a2744;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">Access Your Portal</a>
          </div>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:24px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">© 2025 SVI Infra Solutions · All rights reserved</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'payment',
    name: 'Payment Confirmation',
    subject: 'Payment Received – {{property_name}}',
    category: 'Transactions',
    icon: Check,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Payment Confirmation</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#1a2744,#2d4080);padding:40px;text-align:center;">
          <h1 style="color:#D4AF37;font-size:28px;margin:0;font-family:Georgia,serif;">SVI Infra Solutions</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;letter-spacing:2px;">PAYMENT CONFIRMED</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <div style="background:#e8f5e9;border-left:4px solid #4caf50;padding:16px;border-radius:4px;margin-bottom:24px;">
            <p style="margin:0;color:#2e7d32;font-weight:bold;">✓ Payment Successfully Received</p>
          </div>
          <h2 style="color:#1a2744;margin:0 0 24px;">Dear {{name}},</h2>
          <p style="color:#555;line-height:1.7;">We have received your payment for <strong>{{property_name}}</strong>.</p>
          <table width="100%" style="border-collapse:collapse;margin:24px 0;">
            <tr style="background:#f9f9f9;"><td style="padding:12px 16px;font-weight:bold;color:#1a2744;width:40%;">Amount Paid</td><td style="padding:12px 16px;color:#555;">₹{{amount}}</td></tr>
            <tr><td style="padding:12px 16px;font-weight:bold;color:#1a2744;">Payment Date</td><td style="padding:12px 16px;color:#555;">{{date}}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:12px 16px;font-weight:bold;color:#1a2744;">Receipt No.</td><td style="padding:12px 16px;color:#555;">{{receipt_no}}</td></tr>
          </table>
          <p style="color:#555;line-height:1.7;">Please keep this email for your records. A detailed receipt will be sent separately.</p>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:24px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">© 2025 SVI Infra Solutions</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'reminder',
    name: 'Payment Reminder',
    subject: 'Payment Due Reminder – {{property_name}}',
    category: 'Reminders',
    icon: Clock,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Payment Reminder</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#1a2744,#2d4080);padding:40px;text-align:center;">
          <h1 style="color:#D4AF37;font-size:28px;margin:0;font-family:Georgia,serif;">SVI Infra Solutions</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;letter-spacing:2px;">PAYMENT REMINDER</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <div style="background:#fff8e1;border-left:4px solid #ffc107;padding:16px;border-radius:4px;margin-bottom:24px;">
            <p style="margin:0;color:#f57c00;font-weight:bold;">⚠ Payment Due on {{due_date}}</p>
          </div>
          <h2 style="color:#1a2744;margin:0 0 16px;">Dear {{name}},</h2>
          <p style="color:#555;line-height:1.7;">This is a friendly reminder that your installment payment for <strong>{{property_name}}</strong> is due on <strong>{{due_date}}</strong>.</p>
          <table width="100%" style="border-collapse:collapse;margin:24px 0;">
            <tr style="background:#f9f9f9;"><td style="padding:12px 16px;font-weight:bold;color:#1a2744;width:40%;">Amount Due</td><td style="padding:12px 16px;color:#555;">₹{{amount}}</td></tr>
            <tr><td style="padding:12px 16px;font-weight:bold;color:#1a2744;">Due Date</td><td style="padding:12px 16px;color:#f57c00;font-weight:bold;">{{due_date}}</td></tr>
          </table>
          <p style="color:#555;line-height:1.7;">Please make the payment before the due date to avoid any late fees. Contact us at <a href="mailto:hr.sviinfrasolutions@gmail.com" style="color:#D4AF37;">hr.sviinfrasolutions@gmail.com</a> if you need assistance.</p>
          <div style="text-align:center;margin-top:32px;">
            <a href="{{portal_url}}" style="background:#D4AF37;color:#1a2744;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">Pay Now</a>
          </div>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:24px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">© 2025 SVI Infra Solutions</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'contact_reply',
    name: 'Contact Form Reply',
    subject: 'Re: {{original_subject}} – SVI Infra Solutions',
    category: 'Support',
    icon: FileText,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Contact Reply</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#1a2744,#2d4080);padding:40px;text-align:center;">
          <h1 style="color:#D4AF37;font-size:28px;margin:0;font-family:Georgia,serif;">SVI Infra Solutions</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#1a2744;margin:0 0 16px;">Dear {{name}},</h2>
          <p style="color:#555;line-height:1.7;">Thank you for contacting SVI Infra Solutions. We have received your inquiry and our team is reviewing it.</p>
          <div style="background:#f9f9f9;padding:20px;border-radius:8px;margin:24px 0;border-left:3px solid #D4AF37;">
            <p style="margin:0;color:#666;font-size:13px;font-style:italic;">Your message: "{{original_message}}"</p>
          </div>
          <p style="color:#555;line-height:1.7;">{{reply_message}}</p>
          <p style="color:#555;line-height:1.7;">If you have any further questions, feel free to reach us at <a href="mailto:hr.sviinfrasolutions@gmail.com" style="color:#D4AF37;">hr.sviinfrasolutions@gmail.com</a> or call us at <strong>+91 XXXXX XXXXX</strong>.</p>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:24px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">© 2025 SVI Infra Solutions</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-400',
      };
    case 'sent':
      return { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400' };
    case 'opened':
      return {
        bg: 'bg-violet-100 dark:bg-violet-500/15',
        text: 'text-violet-700 dark:text-violet-400',
      };
    case 'clicked':
      return {
        bg: 'bg-indigo-100 dark:bg-indigo-500/15',
        text: 'text-indigo-700 dark:text-indigo-400',
      };
    case 'bounced':
    case 'failed':
      return { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-700 dark:text-red-400' };
    case 'complained':
      return {
        bg: 'bg-amber-100 dark:bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-400',
      };
    default:
      return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabButton({
  id,
  label,
  icon: Icon,
  active,
  onClick,
  badge,
}: {
  id: Tab;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
        active
          ? 'bg-brand-gold/10 text-brand-gold'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-brand-gold text-brand-navy flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Compose Tab ──────────────────────────────────────────────────────────────

function ComposeTab({ adminEmail }: { adminEmail: string }) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [fromName, setFromName] = useState('SVI Infra');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const loadTemplate = (templateId: string) => {
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setSubject(tpl.subject);
    setHtml(tpl.html);
    setSelectedTemplate(templateId);
  };

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !html.trim()) {
      setError('Please fill in To, Subject, and Body fields.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'send',
          to: to
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean),
          cc: cc
            ? cc
                .split(',')
                .map((e) => e.trim())
                .filter(Boolean)
            : undefined,
          bcc: bcc
            ? bcc
                .split(',')
                .map((e) => e.trim())
                .filter(Boolean)
            : undefined,
          subject,
          html,
          replyTo: replyTo || undefined,
          from: `${fromName} <noreply@sviiinfrasolutions.com>`,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to send email');
      } else {
        setSent(true);
        setTimeout(() => {
          setSent(false);
          setTo('');
          setCc('');
          setBcc('');
          setSubject('');
          setHtml('');
          setReplyTo('');
          setSelectedTemplate(null);
        }, 3000);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Left: Template picker */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[#0e0e14]">
          <p className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Quick Templates
          </p>
          <div className="space-y-2">
            {EMAIL_TEMPLATES.map((tpl) => {
              const TplIcon = tpl.icon;
              return (
                <button
                  key={tpl.id}
                  onClick={() => loadTemplate(tpl.id)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all ${
                    selectedTemplate === tpl.id
                      ? 'border-brand-gold/50 bg-brand-gold/5 text-brand-gold'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TplIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <span className="text-xs font-medium">{tpl.name}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">{tpl.category}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Compose form */}
      <div className="lg:col-span-3">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#0e0e14]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <PenLine className="h-4 w-4 text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">New Email</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  previewMode
                    ? 'bg-brand-gold/10 text-brand-gold'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
            </div>
          </div>

          <div className="space-y-0">
            {/* To */}
            <div className="flex items-start gap-3 border-b border-gray-100 px-6 py-3 dark:border-gray-700">
              <span className="mt-2 w-10 shrink-0 text-right text-xs font-medium text-gray-400">
                To
              </span>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com, another@example.com"
                className="flex-1 bg-transparent py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
              />
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="mt-1.5 text-[10px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showAdvanced ? 'Less' : 'CC/BCC'}
              </button>
            </div>

            {/* CC/BCC */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-3 dark:border-gray-700">
                    <span className="w-10 shrink-0 text-right text-xs font-medium text-gray-400">
                      CC
                    </span>
                    <input
                      type="text"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      placeholder="cc@example.com"
                      className="flex-1 bg-transparent py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-3 dark:border-gray-700">
                    <span className="w-10 shrink-0 text-right text-xs font-medium text-gray-400">
                      BCC
                    </span>
                    <input
                      type="text"
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                      placeholder="bcc@example.com"
                      className="flex-1 bg-transparent py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-3 dark:border-gray-700">
                    <span className="w-10 shrink-0 text-right text-xs font-medium text-gray-400">
                      From
                    </span>
                    <input
                      type="text"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      placeholder="Sender Name"
                      className="w-36 bg-transparent py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
                    />
                    <span className="text-xs text-gray-400">
                      {'<noreply@sviiinfrasolutions.com>'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-3 dark:border-gray-700">
                    <span className="w-10 shrink-0 text-right text-xs font-medium text-gray-400">
                      Reply
                    </span>
                    <input
                      type="text"
                      value={replyTo}
                      onChange={(e) => setReplyTo(e.target.value)}
                      placeholder={adminEmail || 'reply@example.com'}
                      className="flex-1 bg-transparent py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subject */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-3 dark:border-gray-700">
              <span className="w-10 shrink-0 text-right text-xs font-medium text-gray-400">
                Subj
              </span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="flex-1 bg-transparent py-1.5 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none dark:text-white"
              />
            </div>

            {/* Body */}
            <div className="p-4">
              {previewMode ? (
                <div
                  className="min-h-80 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30"
                  dangerouslySetInnerHTML={{
                    __html: html || '<p style="color:#999">No content yet…</p>',
                  }}
                />
              ) : (
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="Write your email HTML here, or choose a template from the left…"
                  rows={16}
                  className="w-full resize-none bg-transparent font-mono text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-200"
                />
              )}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-6 mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
                <button onClick={() => setError(null)} className="ml-auto">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-gray-700">
            <button
              onClick={() => {
                setTo('');
                setCc('');
                setBcc('');
                setSubject('');
                setHtml('');
                setSelectedTemplate(null);
                setError(null);
              }}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <Trash2 className="h-4 w-4" />
              Discard
            </button>
            <button
              onClick={handleSend}
              disabled={sending || sent}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold tracking-wide transition-all disabled:opacity-70 ${
                sent
                  ? 'bg-emerald-500 text-white'
                  : 'bg-brand-gold text-brand-navy hover:opacity-90'
              }`}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : sent ? (
                <Check className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sent ? 'Sent!' : sending ? 'Sending…' : 'Send Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sent Tab ─────────────────────────────────────────────────────────────────

function SentTab() {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EmailDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setEmails(data.emails || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const fetchDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/email?action=email&id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelected(data.email);
    } catch {
      /* noop */
    } finally {
      setLoadingDetail(false);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const filtered = emails.filter(
    (e) =>
      e.subject?.toLowerCase().includes(search.toLowerCase()) ||
      e.to?.join(',').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* List */}
      <div className={`${selected ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#0e0e14]">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-700">
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-sm text-gray-900 placeholder-gray-400 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>
            <button
              onClick={fetchEmails}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 dark:border-gray-600 dark:text-gray-400"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="text-brand-gold mb-3 h-7 w-7 animate-spin" />
              <p className="text-sm text-gray-500">Loading emails from Resend…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle className="mb-3 h-8 w-8 text-red-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{error}</p>
              <button
                onClick={fetchEmails}
                className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-500 hover:border-gray-300 dark:border-gray-600"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Inbox className="mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">No sent emails found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((email) => {
                const statusStyle = getStatusColor(email.last_event);
                return (
                  <button
                    key={email.id}
                    onClick={() => fetchDetail(email.id)}
                    className={`group w-full px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${
                      selected?.id === email.id ? 'bg-brand-gold/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {email.subject || '(no subject)'}
                          </p>
                        </div>
                        <p className="mt-1 truncate text-xs text-gray-500">
                          To: {email.to?.join(', ')}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {email.last_event || 'sent'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatTime(email.created_at)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="lg:col-span-2"
          >
            <div className="sticky top-4 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#0e0e14]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Email Detail
                  </span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {loadingDetail ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="text-brand-gold h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="p-5">
                  {/* Meta */}
                  <div className="mb-5 space-y-3">
                    <div>
                      <p className="mb-0.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Subject
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {selected.subject}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="mb-0.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          From
                        </p>
                        <p className="truncate text-xs text-gray-600 dark:text-gray-300">
                          {selected.from}
                        </p>
                      </div>
                      <div>
                        <p className="mb-0.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Status
                        </p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${getStatusColor(selected.last_event).bg} ${getStatusColor(selected.last_event).text}`}
                        >
                          {selected.last_event || 'sent'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="mb-0.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        To
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selected.to?.map((addr) => (
                          <span
                            key={addr}
                            className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          >
                            {addr}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-0.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Email ID
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="truncate rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {selected.id}
                        </code>
                        <button
                          onClick={() => copyId(selected.id)}
                          className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          {copied === selected.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="mb-0.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Sent
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {new Date(selected.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Body preview */}
                  {selected.html && (
                    <div>
                      <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Preview
                      </p>
                      <div
                        className="max-h-80 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs dark:border-gray-700 dark:bg-gray-900/30"
                        dangerouslySetInnerHTML={{ __html: selected.html }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Templates Tab ────────────────────────────────────────────────────────────

function TemplatesTab() {
  const [selected, setSelected] = useState<(typeof EMAIL_TEMPLATES)[0] | null>(null);
  const [copied, setCopied] = useState(false);

  const copyHtml = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Template list */}
      <div className="space-y-3 lg:col-span-1">
        {EMAIL_TEMPLATES.map((tpl) => {
          const TplIcon = tpl.icon;
          return (
            <button
              key={tpl.id}
              onClick={() => setSelected(tpl)}
              className={`w-full rounded-xl border p-4 text-left transition-all ${
                selected?.id === tpl.id
                  ? 'border-brand-gold/40 bg-brand-gold/5'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-[#0e0e14] dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${selected?.id === tpl.id ? 'bg-brand-gold/15 text-brand-gold' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                  <TplIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {tpl.name}
                  </p>
                  <p className="text-xs text-gray-400">{tpl.category}</p>
                </div>
                <ChevronRight
                  className={`ml-auto h-4 w-4 shrink-0 text-gray-400 transition-transform ${selected?.id === tpl.id ? 'text-brand-gold rotate-90' : ''}`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Template detail */}
      <div className="lg:col-span-2">
        {!selected ? (
          <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center dark:border-gray-700">
            <FileText className="mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">Select a template to preview</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#0e0e14]">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{selected.name}</h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  Subject:{' '}
                  <span className="text-gray-600 dark:text-gray-300">{selected.subject}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyHtml}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 dark:border-gray-600 dark:text-gray-400"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Copied!' : 'Copy HTML'}
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Visual Preview
              </p>
              <div
                className="max-h-[500px] overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                dangerouslySetInnerHTML={{ __html: selected.html }}
              />
            </div>
            <div className="border-t border-gray-100 px-4 pb-4 dark:border-gray-700">
              <p className="mt-4 mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Available Variables
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(selected.html.matchAll(/\{\{(\w+)\}\}/g)).map(([, v], i) => (
                  <span
                    key={i}
                    className="rounded-md bg-amber-50 px-2 py-0.5 font-mono text-[11px] text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Domains Tab ──────────────────────────────────────────────────────────────

function DomainsTab() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email?action=domains', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch domains');
      setDomains(Array.isArray(data.domains) ? data.domains : []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const getDomainStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-500/15',
          text: 'text-emerald-700 dark:text-emerald-400',
          dot: 'bg-emerald-500',
        };
      case 'pending':
        return {
          bg: 'bg-amber-100 dark:bg-amber-500/15',
          text: 'text-amber-700 dark:text-amber-400',
          dot: 'bg-amber-500',
        };
      case 'failed':
        return {
          bg: 'bg-red-100 dark:bg-red-500/15',
          text: 'text-red-700 dark:text-red-400',
          dot: 'bg-red-500',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-700',
          text: 'text-gray-600 dark:text-gray-400',
          dot: 'bg-gray-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[#0e0e14]">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Verified Domains</h3>
            <p className="mt-1 text-sm text-gray-500">
              Domains verified in your Resend account for sending emails.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://resend.com/domains"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 dark:border-gray-600 dark:text-gray-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Resend Dashboard
            </a>
            <button
              onClick={fetchDomains}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 dark:border-gray-600 dark:text-gray-400"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-brand-gold h-7 w-7 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="mb-3 h-8 w-8 text-amber-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          <button onClick={fetchDomains} className="mt-3 text-xs text-gray-500 underline">
            Retry
          </button>
        </div>
      ) : domains.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
          <Globe className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No domains found</p>
          <p className="mt-1 text-xs text-gray-400">
            Add a domain in your{' '}
            <a
              href="https://resend.com/domains"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold underline"
            >
              Resend Dashboard
            </a>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => {
            const statusStyle = getDomainStatusColor(domain.status);
            return (
              <div
                key={domain.id}
                className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-[#0e0e14]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                    {domain.status}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{domain.name}</h4>
                <p className="mt-0.5 text-xs text-gray-400">
                  Region: {domain.region || 'us-east-1'}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  Added: {new Date(domain.created_at).toLocaleDateString('en-IN')}
                </p>

                {/* DNS Records */}
                {domain.records && domain.records.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      DNS Records
                    </p>
                    <div className="space-y-2">
                      {domain.records.map((rec, i) => {
                        const recStatus =
                          rec.status === 'verified'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400';
                        return (
                          <div key={i} className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/50">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-500 uppercase">
                                {rec.type} · {rec.record}
                              </span>
                              <span className={`text-[10px] font-bold ${recStatus}`}>
                                {rec.status}
                              </span>
                            </div>
                            <p className="mt-1 font-mono text-[10px] break-all text-gray-500">
                              {rec.value}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ adminEmail }: { adminEmail: string }) {
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Config overview */}
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[#0e0e14]">
          <h3 className="mb-5 font-semibold text-gray-900 dark:text-white">Resend Configuration</h3>
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
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
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
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Note:</strong> API key is stored in <code>.env.local</code> as{' '}
              <code>RESEND_API_KEY</code>. Update it in your environment for production.
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[#0e0e14]">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Resend Resources</h3>
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
                    <span className="text-sm text-gray-700 dark:text-gray-300">{link.label}</span>
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
              <h3 className="font-semibold text-gray-900 dark:text-white">Send Test Email</h3>
              <p className="text-xs text-gray-400">Verify your Resend setup is working</p>
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
                className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <AnimatePresence>
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
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
              className="bg-brand-gold text-brand-navy flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
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
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Resend Free Plan Limits
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Emails per month', value: '3,000', max: 3000, current: 0 },
              { label: 'Emails per day', value: '100', max: 100, current: 0 },
              { label: 'Domains', value: '1', max: 1, current: 1 },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
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
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminEmailPage() {
  const [activeTab, setActiveTab] = useState<Tab>('compose');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setAdminEmail(data.user.email);
    });
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'compose', label: 'Compose', icon: PenLine },
    { id: 'sent', label: 'Sent', icon: Inbox },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'domains', label: 'Domains', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen">
      {/* ─── Page Header ─── */}
      <div className="mb-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl text-gray-900 md:text-4xl dark:text-white">
                Email Center
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage emails via Resend · Compose, send & track
              </p>
            </div>
          </div>

          {/* Resend badge */}
          <a
            href="https://resend.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-[#0e0e14] dark:text-gray-300 dark:hover:border-gray-600"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded bg-black">
              <Hash className="h-3 w-3 text-white" />
            </div>
            Powered by Resend
            <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
          </a>
        </div>
      </div>

      {/* ─── Tab Navigation ─── */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1.5 dark:border-gray-700 dark:bg-[#0e0e14]">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* ─── Tab Content ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'compose' && <ComposeTab adminEmail={adminEmail} />}
          {activeTab === 'sent' && <SentTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'domains' && <DomainsTab />}
          {activeTab === 'settings' && <SettingsTab adminEmail={adminEmail} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
