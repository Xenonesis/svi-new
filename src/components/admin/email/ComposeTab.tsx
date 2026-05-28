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

  // Active focus tracker
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
          <p className="mb-3 text-[9px] font-extrabold tracking-widest text-gray-400 uppercase">
            Quick Templates
          </p>
          <div className="space-y-2">
            {EMAIL_TEMPLATES.map((tpl) => {
              const TplIcon = tpl.icon;
              const isActive = selectedTemplate === tpl.id;
              return (
                <motion.button
                  key={tpl.id}
                  onClick={() => loadTemplate(tpl.id)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all duration-300 ${
                    isActive
                      ? 'border-brand-gold/60 bg-brand-gold/5 text-brand-gold shadow-[0_0_12px_rgba(201,168,76,0.12)]'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TplIcon
                      className={`h-3.5 w-3.5 shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}
                    />
                    <span className="text-xs font-semibold">{tpl.name}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">{tpl.category}</p>
                </motion.button>
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
              <PenLine className="text-brand-gold h-4 w-4" />
              <span className="font-semibold text-gray-900 dark:text-white">New Email</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  previewMode
                    ? 'bg-brand-gold/10 text-brand-gold shadow-sm'
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
            <div
              className={`relative flex items-start gap-3 border-b border-gray-100 px-6 py-3 transition-all duration-300 dark:border-gray-700 ${
                focusedField === 'to'
                  ? 'border-l-brand-gold bg-brand-gold/[0.015] dark:bg-brand-gold/[0.01] border-l-2'
                  : 'border-l-2 border-l-transparent'
              }`}
            >
              <span className="mt-2 w-10 shrink-0 text-right text-xs font-semibold text-gray-400">
                To
              </span>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                onFocus={() => setFocusedField('to')}
                onBlur={() => setFocusedField(null)}
                placeholder="recipient@example.com, another@example.com"
                className="flex-1 bg-transparent py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
              />
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-brand-gold mt-1.5 text-[10px] font-bold hover:opacity-80"
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
                  transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                  className="overflow-hidden border-b border-gray-100 dark:border-gray-700"
                >
                  <div
                    className={`flex items-center gap-3 border-b border-gray-100/50 px-6 py-3 transition-all duration-300 dark:border-gray-700/50 ${
                      focusedField === 'cc'
                        ? 'border-l-brand-gold bg-brand-gold/[0.015] dark:bg-brand-gold/[0.01] border-l-2'
                        : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    <span className="w-10 shrink-0 text-right text-xs font-semibold text-gray-400">
                      CC
                    </span>
                    <input
                      type="text"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      onFocus={() => setFocusedField('cc')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="cc@example.com"
                      className="flex-1 bg-transparent py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
                    />
                  </div>
                  <div
                    className={`flex items-center gap-3 border-b border-gray-100/50 px-6 py-3 transition-all duration-300 dark:border-gray-700/50 ${
                      focusedField === 'bcc'
                        ? 'border-l-brand-gold bg-brand-gold/[0.015] dark:bg-brand-gold/[0.01] border-l-2'
                        : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    <span className="w-10 shrink-0 text-right text-xs font-semibold text-gray-400">
                      BCC
                    </span>
                    <input
                      type="text"
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                      onFocus={() => setFocusedField('bcc')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="bcc@example.com"
                      className="flex-1 bg-transparent py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
                    />
                  </div>
                  <div
                    className={`flex items-center gap-3 border-b border-gray-100/50 px-6 py-3 transition-all duration-300 dark:border-gray-700/50 ${
                      focusedField === 'fromName'
                        ? 'border-l-brand-gold bg-brand-gold/[0.015] dark:bg-brand-gold/[0.01] border-l-2'
                        : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    <span className="w-10 shrink-0 text-right text-xs font-semibold text-gray-400">
                      From
                    </span>
                    <input
                      type="text"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      onFocus={() => setFocusedField('fromName')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Sender Name"
                      className="w-36 bg-transparent py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
                    />
                    <span className="text-xs text-gray-400">
                      {'<noreply@sviiinfrasolutions.com>'}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-3 px-6 py-3 transition-all duration-300 ${
                      focusedField === 'replyTo'
                        ? 'border-l-brand-gold bg-brand-gold/[0.015] dark:bg-brand-gold/[0.01] border-l-2'
                        : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    <span className="w-10 shrink-0 text-right text-xs font-semibold text-gray-400">
                      Reply
                    </span>
                    <input
                      type="text"
                      value={replyTo}
                      onChange={(e) => setReplyTo(e.target.value)}
                      onFocus={() => setFocusedField('replyTo')}
                      onBlur={() => setFocusedField(null)}
                      placeholder={adminEmail || 'reply@example.com'}
                      className="flex-1 bg-transparent py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subject */}
            <div
              className={`flex items-center gap-3 border-b border-gray-100 px-6 py-3 transition-all duration-300 dark:border-gray-700 ${
                focusedField === 'subject'
                  ? 'border-l-brand-gold bg-brand-gold/[0.015] dark:bg-brand-gold/[0.01] border-l-2'
                  : 'border-l-2 border-l-transparent'
              }`}
            >
              <span className="w-10 shrink-0 text-right text-xs font-semibold text-gray-400">
                Subj
              </span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onFocus={() => setFocusedField('subject')}
                onBlur={() => setFocusedField(null)}
                placeholder="Email subject..."
                className="flex-1 bg-transparent py-1.5 text-sm font-semibold text-gray-900 placeholder-gray-400 outline-none dark:text-white"
              />
            </div>

            {/* Body */}
            <div
              className={`p-4 transition-all duration-300 ${
                focusedField === 'body'
                  ? 'border-l-brand-gold bg-brand-gold/[0.01] dark:bg-brand-gold/[0.005] border-l-2'
                  : 'border-l-2 border-l-transparent'
              }`}
            >
              {previewMode ? (
                <div
                  className="min-h-80 rounded-lg border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/30"
                  dangerouslySetInnerHTML={{
                    __html:
                      html || '<p style="color:#999; font-family:sans-serif">No content yet…</p>',
                  }}
                />
              ) : (
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  onFocus={() => setFocusedField('body')}
                  onBlur={() => setFocusedField(null)}
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mx-6 mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
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
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setTo('');
                setCc('');
                setBcc('');
                setSubject('');
                setHtml('');
                setSelectedTemplate(null);
                setError(null);
              }}
              className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
              Discard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSend}
              disabled={sending || sent}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold tracking-wide shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-70 ${
                sent
                  ? 'bg-emerald-500 text-white'
                  : 'bg-brand-gold text-brand-navy glow-gold hover:opacity-95'
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
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
