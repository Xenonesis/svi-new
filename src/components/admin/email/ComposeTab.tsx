'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Check, Eye, Loader2, PenLine, Send, Trash2, X } from 'lucide-react';
import { EMAIL_TEMPLATES } from './constants';
import { getToken } from './helpers';

export function ComposeTab({ adminEmail }: { adminEmail: string }) {
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
    <div className="grid grid-cols-1 gap-6 font-sans lg:grid-cols-4">
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
                    __html: html || '<p style="color:#999 font-sans">No content yet…</p>',
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
