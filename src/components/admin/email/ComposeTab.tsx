'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Paperclip,
  FileIcon,
  PenLine,
  Save,
  Send,
  Trash2,
  X,
  Search,
  LayoutTemplate,
} from 'lucide-react';
import { toast } from 'sonner';
import { EMAIL_TEMPLATES } from './constants';
import { getToken, saveDraft, loadDraft, clearDraft, fileToBase64 } from './helpers';
import { RichTextEditor } from './RichTextEditor';
import type { ForwardData, ReplyData, EmailAttachment, TemplatePrefill } from './types';

interface ComposeTabProps {
  adminEmail: string;
  forwardData?: ForwardData | null;
  replyData?: ReplyData | null;
  templatePrefill?: TemplatePrefill | null;
  onClearPrefill?: () => void;
}

export function ComposeTab({
  adminEmail,
  forwardData,
  replyData,
  templatePrefill,
  onClearPrefill,
}: ComposeTabProps) {
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
  const [editorKey, setEditorKey] = useState(0);
  // Store raw template HTML separately (preserves full email HTML)
  const [templateHtml, setTemplateHtml] = useState<string | null>(null);
  // Template variables (for {{name}}, {{amount}}, etc.)
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});
  // Track if user is editing template (converting to custom)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [draftSaved, setDraftSaved] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);

  // Close template picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) {
        setShowTemplatePicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load saved draft on mount
  useEffect(() => {
    const saved = loadDraft();
    if (saved && saved.to) setHasDraft(true);
  }, []);

  // Apply forward/reply prefill
  useEffect(() => {
    if (forwardData) {
      setTo('');
      setCc('');
      setBcc('');
      setSubject(forwardData.subject);
      setHtml(forwardData.html);
      setTemplateHtml(null); // Clear template
      setSelectedTemplate(null);
      setShowAdvanced(false);
      setEditorKey((prev) => prev + 1);
      onClearPrefill?.();
    }
  }, [forwardData, onClearPrefill]);

  useEffect(() => {
    if (replyData) {
      setTo(replyData.to);
      setCc(replyData.cc?.join(', ') || '');
      setBcc('');
      setSubject(replyData.subject);
      setHtml(replyData.html);
      setTemplateHtml(null); // Clear template
      setSelectedTemplate(null);
      setShowAdvanced(true);
      setEditorKey((prev) => prev + 1);
      onClearPrefill?.();
    }
  }, [replyData, onClearPrefill]);

  // Apply template prefill from TemplatesTab
  useEffect(() => {
    if (templatePrefill) {
      setSubject(templatePrefill.subject);
      setHtml(templatePrefill.html);
      setTemplateHtml(null); // Clear template
      setSelectedTemplate(null);
      setEditorKey((prev) => prev + 1);
      onClearPrefill?.();
    }
  }, [templatePrefill, onClearPrefill]);

  // Auto-save draft every 5s
  useEffect(() => {
    if (!to && !subject && !html) return;
    const timer = setInterval(() => {
      saveDraft({ to, cc, bcc, subject, html, replyTo, fromName });
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 5000);
    return () => clearInterval(timer);
  }, [to, cc, bcc, subject, html, replyTo, fromName]);

  const restoreDraft = () => {
    const saved = loadDraft();
    if (saved) {
      setTo(saved.to || '');
      setCc(saved.cc || '');
      setBcc(saved.bcc || '');
      setSubject(saved.subject || '');
      setHtml(saved.html || '');
      setReplyTo(saved.replyTo || '');
      setFromName(saved.fromName || 'SVI Infra');
      setHasDraft(false);
    }
  };

  // Extract {{variables}} from template HTML
  const extractTemplateVars = (html: string): string[] => {
    const matches = html.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))];
  };

  // Get preview HTML with variables replaced
  const getPreviewHtml = (): string => {
    const sourceHtml = templateHtml || html;
    if (!sourceHtml) return '';
    let result = sourceHtml;
    // Replace template variables
    Object.entries(templateVars).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\{\{${key}\}\}`, 'g'), value || `{{${key}}}`);
    });
    return result;
  };

  const loadTemplate = (templateId: string) => {
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setSubject(tpl.subject);
    // Store raw template HTML for preview/sending
    setTemplateHtml(tpl.html);
    // Extract and initialize template variables
    const vars = extractTemplateVars(tpl.html);
    const initialVars: Record<string, string> = {};
    vars.forEach((v) => {
      initialVars[v] = templateVars[v] || '';
    });
    setTemplateVars(initialVars);
    // Clear editor content
    setHtml('');
    setSelectedTemplate(templateId);
    setIsEditingTemplate(false);
    setShowTemplatePicker(false);
    setTemplateSearch('');
    // Force preview mode when template is loaded
    setPreviewMode(true);
    // Force editor re-mount
    setEditorKey((prev) => prev + 1);
  };

  // Attachments
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: EmailAttachment[] = [];
    for (const file of Array.from(files)) {
      if (attachments.length + newAttachments.length >= 10) break;
      const base64 = await fileToBase64(file);
      newAttachments.push({ file, name: file.name, size: file.size, base64 });
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Send
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
          // Use template with variables replaced, or editor HTML
          html: getPreviewHtml() || html,
          replyTo: replyTo || undefined,
          from: `${fromName} <noreply@sviiinfrasolutions.com>`,
          attachments:
            attachments.length > 0
              ? attachments.map((a) => ({ filename: a.name, content: a.base64 }))
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to send email');
        toast.error(data.error || 'Failed to send email');
      } else {
        setSent(true);
        clearDraft();
        toast.success('Email sent successfully');
        setTimeout(() => {
          setSent(false);
          setTo('');
          setCc('');
          setBcc('');
          setSubject('');
          setHtml('');
          setReplyTo('');
          setSelectedTemplate(null);
          setAttachments([]);
        }, 3000);
      }
    } catch {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const discardAll = () => {
    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setHtml('');
    setTemplateHtml(null);
    setSelectedTemplate(null);
    setPreviewMode(false);
    setError(null);
    setAttachments([]);
    clearDraft();
  };

  const filteredTemplates = EMAIL_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(templateSearch.toLowerCase())
  );

  // Group templates by category
  const templateCategories = [...new Set(EMAIL_TEMPLATES.map((t) => t.category))];

  return (
    <div className="mx-auto max-w-[920px]">
      {/* Draft restore banner */}
      <AnimatePresence>
        {hasDraft && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="border-brand-gold/20 bg-brand-gold/5 mb-4 flex items-center justify-between rounded-xl border px-5 py-3.5"
          >
            <div className="flex items-center gap-3">
              <Save className="text-brand-gold h-4 w-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                You have an unsaved draft
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={restoreDraft}
                className="bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors"
              >
                Restore
              </button>
              <button
                onClick={() => {
                  clearDraft();
                  setHasDraft(false);
                }}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/60 dark:bg-[#0e0e14]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <PenLine className="text-brand-gold h-4 w-4" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">New Email</span>
            {forwardData && (
              <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-700 uppercase dark:bg-violet-500/15 dark:text-violet-400">
                Forwarding
              </span>
            )}
            {replyData && (
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-700 uppercase dark:bg-blue-500/15 dark:text-blue-400">
                Replying
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {draftSaved && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-500"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  saved
                </motion.span>
              )}
            </AnimatePresence>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                previewMode
                  ? 'bg-brand-gold/10 text-brand-gold'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-400'
              }`}
            >
              {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {previewMode ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>

        {/* Fields */}
        <div>
          {/* To */}
          <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
            <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
              To
            </label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 bg-transparent py-3.5 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
            />
            {!showAdvanced && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setShowAdvanced(true);
                    setTimeout(() => document.getElementById('cc-input')?.focus(), 100);
                  }}
                  className="rounded-md border border-dashed border-gray-300 px-2 py-0.5 text-[10px] font-bold tracking-wide text-gray-400 transition-all hover:border-blue-400 hover:text-blue-500 dark:border-gray-700 dark:hover:border-blue-500"
                >
                  +CC
                </button>
                <button
                  onClick={() => {
                    setShowAdvanced(true);
                    setTimeout(() => document.getElementById('bcc-input')?.focus(), 100);
                  }}
                  className="rounded-md border border-dashed border-gray-300 px-2 py-0.5 text-[10px] font-bold tracking-wide text-gray-400 transition-all hover:border-violet-400 hover:text-violet-500 dark:border-gray-700 dark:hover:border-violet-500"
                >
                  +BCC
                </button>
              </div>
            )}
          </div>

          {/* CC / BCC / From / Reply-To — expandable */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                className="overflow-hidden"
              >
                {[
                  {
                    id: 'cc-input',
                    label: 'CC',
                    value: cc,
                    setter: setCc,
                    placeholder: 'cc@example.com',
                  },
                  {
                    id: 'bcc-input',
                    label: 'BCC',
                    value: bcc,
                    setter: setBcc,
                    placeholder: 'bcc@example.com',
                  },
                ].map((field) => (
                  <div
                    key={field.label}
                    className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800"
                  >
                    <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                      {field.label}
                    </label>
                    <input
                      id={field.id}
                      type="text"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      placeholder={field.placeholder}
                      className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
                    />
                    {field.value && (
                      <button
                        onClick={() => field.setter('')}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {/* From Name */}
                <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
                  <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                    From
                  </label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Sender Name"
                    className="w-40 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
                  />
                  <span className="font-mono text-xs text-gray-400/70">
                    {'<noreply@sviiinfrasolutions.com>'}
                  </span>
                </div>
                {/* Reply-To */}
                <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
                  <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                    Reply
                  </label>
                  <input
                    type="text"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    placeholder={adminEmail || 'reply@example.com'}
                    className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subject */}
          <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
            <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Subj
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="flex-1 bg-transparent py-3.5 text-sm font-semibold text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
            />
          </div>

          {/* Attachments */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-gray-100 px-6 py-3 dark:border-gray-800"
              >
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att, i) => (
                    <motion.div
                      key={`${att.name}-${i}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 py-1.5 pr-2 pl-3 dark:border-gray-700 dark:bg-gray-800/50"
                    >
                      <FileIcon className="h-3.5 w-3.5 text-gray-400" />
                      <span className="max-w-[160px] truncate text-xs text-gray-700 dark:text-gray-300">
                        {att.name}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400">
                        {formatFileSize(att.size)}
                      </span>
                      <button
                        onClick={() => removeAttachment(i)}
                        className="ml-0.5 rounded p-0.5 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Template Selected Banner */}
          {selectedTemplate && templateHtml && !isEditingTemplate && (
            <div className="border-b border-gray-100 bg-blue-50/50 px-6 py-3 dark:border-gray-800 dark:bg-blue-900/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                    Template: {EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate)?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsEditingTemplate(true);
                      setPreviewMode(false);
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    Edit Template
                  </button>
                  <button
                    onClick={() => {
                      setTemplateHtml(null);
                      setSelectedTemplate(null);
                      setTemplateVars({});
                      setIsEditingTemplate(false);
                      setPreviewMode(false);
                    }}
                    className="text-xs font-medium text-blue-500 hover:text-blue-700 dark:text-blue-300"
                  >
                    ✏️ Write Custom
                  </button>
                </div>
              </div>
              {/* Template Variables Form */}
              {Object.keys(templateVars).length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.entries(templateVars).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <label className="mb-1 text-[10px] font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setTemplateVars((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder={`Enter ${key.replace(/_/g, ' ')}...`}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Body */}
          <div className="relative">
            {previewMode ? (
              /* Preview Mode - Shows rendered HTML email */
              <div className="min-h-[400px] p-6">
                <div
                  className="mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700"
                  style={{ maxWidth: '700px' }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        getPreviewHtml() ||
                        '<div style="padding:40px;text-align:center;color:#999;font-family:sans-serif;">No content yet...<br>Select a template or write your email below.</div>',
                    }}
                  />
                </div>
              </div>
            ) : (
              /* Edit Mode - Rich Text Editor (normal text, no HTML) */
              <div className="p-4">
                <RichTextEditor
                  key={editorKey}
                  value={html}
                  onChange={setHtml}
                  placeholder="Write your email here... Use the toolbar above to format text."
                />
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-6 mb-4 flex items-center gap-3 rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 dark:border-red-800/40 dark:bg-red-900/15">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer toolbar */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-1">
            {/* Send */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSend}
              disabled={sending || sent}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold tracking-wide shadow-sm transition-all duration-300 disabled:opacity-70 ${
                sent
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
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
              {sent ? 'Sent!' : sending ? 'Sending...' : 'Send'}
            </motion.button>
          </div>

          <div className="flex items-center gap-1">
            {/* Template picker */}
            <div ref={templateRef} className="relative">
              <button
                onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  selectedTemplate
                    ? 'text-brand-gold bg-brand-gold/5'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5'
                }`}
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {selectedTemplate
                    ? EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate)?.name || 'Template'
                    : 'Templates'}
                </span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${showTemplatePicker ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {showTemplatePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 bottom-full z-50 mb-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-[#0e0e14]"
                  >
                    {/* Search */}
                    <div className="border-b border-gray-100 p-3 dark:border-gray-800">
                      <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={templateSearch}
                          onChange={(e) => setTemplateSearch(e.target.value)}
                          placeholder="Search templates..."
                          autoFocus
                          className="focus:border-brand-gold focus:ring-brand-gold/20 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-xs text-gray-900 placeholder-gray-400 outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500"
                        />
                      </div>
                    </div>
                    {/* List */}
                    <div className="scrollbar-gold max-h-72 overflow-y-auto">
                      {templateCategories.map((cat) => {
                        const catTemplates = filteredTemplates.filter((t) => t.category === cat);
                        if (catTemplates.length === 0) return null;
                        return (
                          <div key={cat}>
                            <div className="bg-gray-50/80 px-4 py-2 dark:bg-gray-800/30">
                              <span className="font-mono text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                                {cat}
                              </span>
                            </div>
                            {catTemplates.map((tpl) => {
                              const TplIcon = tpl.icon;
                              const isActive = selectedTemplate === tpl.id;
                              return (
                                <button
                                  key={tpl.id}
                                  onClick={() => loadTemplate(tpl.id)}
                                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                    isActive
                                      ? 'bg-brand-gold/5'
                                      : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                                  }`}
                                >
                                  <TplIcon
                                    className={`h-3.5 w-3.5 shrink-0 ${
                                      isActive ? 'text-brand-gold' : 'text-gray-400'
                                    }`}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={`truncate text-xs font-medium ${
                                        isActive
                                          ? 'text-brand-gold'
                                          : 'text-gray-700 dark:text-gray-300'
                                      }`}
                                    >
                                      {tpl.name}
                                    </p>
                                    <p className="truncate text-[10px] text-gray-400">
                                      {tpl.subject}
                                    </p>
                                  </div>
                                  {isActive && <Check className="text-brand-gold h-3.5 w-3.5" />}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                      {filteredTemplates.length === 0 && (
                        <div className="px-4 py-8 text-center text-xs text-gray-400">
                          No templates match your search
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Attach */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Attach</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.zip,.rar"
            />

            {/* Discard */}
            <button
              onClick={discardAll}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Discard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
