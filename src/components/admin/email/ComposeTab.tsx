'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Paperclip,
  PenLine,
  Save,
  Send,
  Sparkles,
  Trash2,
  X,
  Lightbulb,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { EMAIL_TEMPLATES } from './constants';
import { getToken, clearDraft, fileToBase64 } from './helpers';
import {
  extractTemplateVars as parseExtractTemplateVars,
  getPreviewHtml as parseGetPreviewHtml,
} from '@/src/lib/utils/templateParser';
import { RichTextEditor } from './RichTextEditor';
import { ComposeFields } from './compose/ComposeFields';
import { TemplateBanner } from './compose/TemplateBanner';
import { AttachmentList } from './compose/AttachmentList';
import { TemplatePicker } from './compose/TemplatePicker';
import { AIImprovePanel } from './compose/AIImprovePanel';
import type {
  ForwardData,
  ReplyData,
  EmailAttachment,
  TemplatePrefill,
  DraftData,
  Recipient,
  Contact,
} from './types';
import { isValidEmail } from '@/src/lib/utils/emailValidation';
import { ContactPicker } from './compose/ContactPicker';
import { useAIEmail } from './hooks/useAIEmail';
import { useEmailPrefill } from './hooks/useEmailPrefill';
import { useEmailDraft } from './hooks/useEmailDraft';

interface ComposeTabProps {
  adminEmail: string;
  forwardData?: ForwardData | null;
  replyData?: ReplyData | null;
  templatePrefill?: TemplatePrefill | null;
  draftData?: DraftData | null;
  onClearPrefill?: () => void;
}

export function ComposeTab({
  adminEmail,
  forwardData,
  replyData,
  templatePrefill,
  draftData,
  onClearPrefill,
}: ComposeTabProps) {
  const [toRecipients, setToRecipients] = useState<Recipient[]>([]);
  const toStr = toRecipients.map((r) => r.email).join(', ');
  const [pickerOpen, setPickerOpen] = useState(false);
  const contactsCache = useRef<Contact[] | null>(null);

  // Fetch contacts from API with caching
  const fetchContacts = useCallback(async (): Promise<Contact[]> => {
    if (contactsCache.current) return contactsCache.current;
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/contacts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      const data: { contacts?: Contact[] } = await res.json();
      contactsCache.current = data.contacts ?? null;
      return contactsCache.current ?? [];
    } catch {
      return [];
    }
  }, []);

  // Set of already-selected email addresses (lowercased for dedup)
  const selectedEmailSet = useMemo(
    () => new Set(toRecipients.map((r) => r.email.toLowerCase())),
    [toRecipients]
  );

  // Toggle a contact in the recipient list
  const handleToggleContact = useCallback(
    (contact: Contact) => {
      const emailLower = contact.email.toLowerCase();
      if (selectedEmailSet.has(emailLower)) {
        setToRecipients((prev) => prev.filter((r) => r.email.toLowerCase() !== emailLower));
      } else {
        setToRecipients((prev) => [
          ...prev,
          {
            email: contact.email,
            name: contact.full_name,
            type: contact.role as Recipient['type'],
            valid: true,
          },
        ]);
      }
    },
    [selectedEmailSet]
  );

  // Select all contacts from the picker
  const handleSelectAllContacts = useCallback(async () => {
    const allContacts = await fetchContacts();
    setToRecipients((prev) => {
      const existingEmails = new Set(prev.map((r) => r.email.toLowerCase()));
      const newOnes = allContacts
        .filter((c) => !existingEmails.has(c.email.toLowerCase()))
        .map(
          (c) =>
            ({
              email: c.email,
              name: c.full_name,
              type: c.role as Recipient['type'],
              valid: true,
            }) as Recipient
        );
      return [...prev, ...newOnes];
    });
  }, [fetchContacts]);

  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subjectTemplate, setSubjectTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [fromName, setFromName] = useState('SVI Infra');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [templateHtml, setTemplateHtml] = useState<string | null>(null);
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [draftSaved, setDraftSaved] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [inReplyToMessageId, setInReplyToMessageId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [showImprove, setShowImprove] = useState(false);
  const [autoComposeName, setAutoComposeName] = useState<string | null>(null);
  const { autoCompose, loading: aiLoading, suggestSubject, suggestFollowup } = useAIEmail();
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[] | null>(null);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [subjectSuggesting, setSubjectSuggesting] = useState(false);
  const [followUpSuggestion, setFollowUpSuggestion] = useState<{
    suggestedDays: number;
    reason: string;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Callback to convert a comma-separated string (from draft/prefill) to Recipient[]
  const handleToChange = useCallback((val: string) => {
    const parsed = val
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    setToRecipients(
      parsed.map((email) => ({
        email,
        type: 'manual' as const,
        valid: isValidEmail(email),
      }))
    );
  }, []);

  // Use custom hooks for prefill and drafts
  useEmailPrefill({
    adminEmail,
    forwardData,
    replyData,
    templatePrefill,
    draftData,
    replyTo,
    onClearPrefill,
    setters: {
      setTo: handleToChange,
      setCc,
      setBcc,
      setSubjectTemplate,
      setHtml,
      setTemplateHtml,
      setSelectedTemplate,
      setInReplyToMessageId,
      setAttachments,
      setEditorKey,
      setReplyTo,
      setFromName,
      setScheduledAt,
      setTemplateVars,
      setPreviewMode,
    },
  });

  const { restoreDraft, handleClearDraft } = useEmailDraft({
    to: toStr,
    cc,
    bcc,
    subject,
    html,
    replyTo,
    fromName,
    setDraftSaved,
    setHasDraft,
    setTo: handleToChange,
    setCc,
    setBcc,
    setSubjectTemplate,
    setHtml,
    setReplyTo,
    setFromName,
  });

  // Synchronize resolved subject with template variables and subject template
  useEffect(() => {
    setSubject(parseGetPreviewHtml(subjectTemplate, templateVars));
  }, [subjectTemplate, templateVars]);

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    setSubjectTemplate(val);
  };

  const extractTemplateVars = (html: string): string[] => {
    return parseExtractTemplateVars(html);
  };

  const getPreviewHtml = (): string => {
    return parseGetPreviewHtml(templateHtml || html, templateVars);
  };

  const loadTemplate = (templateId: string) => {
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setSubjectTemplate(tpl.subject);
    setTemplateHtml(tpl.html);
    const vars = extractTemplateVars(tpl.html);
    const initialVars: Record<string, string> = {};
    vars.forEach((v) => {
      initialVars[v] = templateVars[v] || '';
    });
    setTemplateVars(initialVars);
    setHtml('');
    setSelectedTemplate(templateId);
    setPreviewMode(true);
    setEditorKey((prev) => prev + 1);
  };

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

  const handleSend = async () => {
    const finalHtml = getPreviewHtml() || html;
    if (toRecipients.length === 0 || !subject.trim() || !finalHtml.trim()) {
      setError('Please fill in To, Subject, and Body fields.');
      return;
    }
    if (toRecipients.some((r) => !r.valid)) {
      setError('Some recipient email addresses are invalid.');
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
          to: toRecipients.map((r) => r.email),
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
          html: getPreviewHtml() || html,
          replyTo: replyTo || undefined,
          inReplyTo: inReplyToMessageId || undefined,
          from: `${fromName} <noreply@sviiinfrasolutions.com>`,
          attachments:
            attachments.length > 0
              ? attachments.map((a) => ({ filename: a.name, content: a.base64 }))
              : undefined,
          scheduledAt: scheduledAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to send email');
        toast.error(data.error || 'Failed to send email');
      } else {
        setSent(true);
        await clearDraft();
        toast.success('Email sent successfully');

        // Suggest follow-up in background
        const finalBody = getPreviewHtml() || html;
        const recipient = toRecipients[0]?.email;
        suggestFollowup(finalBody, recipient).then((followUp) => {
          if (followUp) setFollowUpSuggestion(followUp);
        });

        setTimeout(() => {
          setSent(false);
          setToRecipients([]);
          setCc('');
          setBcc('');
          setSubjectTemplate('');
          setHtml('');
          setReplyTo(
            `info@sviiinfrasolutions.com, ${adminEmail || 'hr.sviinfrasolutions@gmail.com'}`
          );
          setInReplyToMessageId(null);
          setSelectedTemplate(null);
          setAttachments([]);
          setScheduledAt(null);
        }, 3000);
      }
    } catch {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Auto Compose: subject → template or AI-generated
  const handleAutoCompose = async () => {
    if (!subject.trim() || aiLoading) return;
    setAutoComposeName(null);

    const result = await autoCompose({
      subject: subject.trim(),
      to: toStr,
      cc,
      onChunk: (html) => setHtml(html),
    });

    if (!result) return;

    if (result.action === 'template_match') {
      // Load existing template
      const tpl = EMAIL_TEMPLATES.find((t) => t.id === result.templateId);
      if (tpl) {
        setSubjectTemplate(tpl.subject);
        setTemplateHtml(tpl.html);
        setSelectedTemplate(result.templateId);
        // Fill variables from suggestion
        const vars: Record<string, string> = {};
        Object.keys(result.variables).forEach((k) => {
          vars[k] = result.variables[k] || '';
        });
        setTemplateVars(vars);
        setPreviewMode(true);
        setEditorKey((prev) => prev + 1);
      }
    } else {
      // AI-generated template
      setTemplateHtml(result.html);
      setSelectedTemplate('_ai_generated');
      setAutoComposeName(result.templateName);
      // Extract variables from the AI-generated HTML
      const vars = extractTemplateVars(result.html);
      const initialVars: Record<string, string> = {};
      vars.forEach((v) => {
        initialVars[v] = result.variables[v] || '';
      });
      setTemplateVars(initialVars);
      setPreviewMode(true);
      setEditorKey((prev) => prev + 1);
      setHtml(result.html);
    }
  };

  // Suggest subject lines based on email body
  const handleSuggestSubject = async () => {
    const bodyHtml = getPreviewHtml() || html;
    if (!bodyHtml.trim()) return;
    setSubjectSuggesting(true);
    setSubjectSuggestions(null);
    const suggestions = await suggestSubject(bodyHtml);
    if (suggestions && suggestions.length > 0) {
      setSubjectSuggestions(suggestions);
      setShowSubjectSuggestions(true);
    }
    setSubjectSuggesting(false);
  };

  const handleApplySubject = (suggestion: string) => {
    handleSubjectChange(suggestion);
    setShowSubjectSuggestions(false);
  };

  const discardAll = async () => {
    setToRecipients([]);
    setCc('');
    setBcc('');
    setSubjectTemplate('');
    setHtml('');
    setTemplateHtml(null);
    setSelectedTemplate(null);
    setPreviewMode(false);
    setError(null);
    setAttachments([]);
    setInReplyToMessageId(null);
    setScheduledAt(null);
    setReplyTo(`info@sviiinfrasolutions.com, ${adminEmail || 'hr.sviinfrasolutions@gmail.com'}`);
    await handleClearDraft();
  };

  return (
    <div className="mx-auto max-w-[920px]">
      {/* Draft restore banner */}
      <AnimatePresence>
        {hasDraft && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="border-brand-gold/20 bg-brand-gold/5 mb-4 flex flex-col items-start justify-between gap-3 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center sm:gap-0 sm:px-5"
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
                onClick={async () => {
                  await handleClearDraft();
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
      <div className="dark:bg-brand-dark-surface overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/60">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:gap-0 sm:px-6 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <PenLine className="text-brand-gold h-4 w-4" />
            <div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">New Email</span>
              {forwardData && (
                <span className="ml-2 rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-700 uppercase dark:bg-violet-500/15 dark:text-violet-400">
                  Forwarding
                </span>
              )}
              {replyData && (
                <span className="ml-2 rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-700 uppercase dark:bg-blue-500/15 dark:text-blue-400">
                  Replying
                </span>
              )}
            </div>
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
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> saved
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
              <span className="hidden sm:inline">{previewMode ? 'Edit' : 'Preview'}</span>
            </button>
          </div>
        </div>

        {/* Fields */}
        <ComposeFields
          to={toStr}
          cc={cc}
          bcc={bcc}
          subject={subject}
          fromName={fromName}
          replyTo={replyTo}
          adminEmail={adminEmail}
          forwardData={forwardData}
          replyData={replyData}
          scheduledAt={scheduledAt}
          autoComposing={aiLoading}
          onAutoCompose={handleAutoCompose}
          onToChange={handleToChange}
          onCcChange={setCc}
          onBccChange={setBcc}
          onSubjectChange={handleSubjectChange}
          onFromNameChange={setFromName}
          onReplyToChange={setReplyTo}
          onScheduledAtChange={setScheduledAt}
          toRecipients={toRecipients}
          onToRecipientsChange={setToRecipients}
          onOpenContactPicker={() => setPickerOpen(true)}
        />

        {/* Attachments */}
        <AttachmentList
          attachments={attachments}
          onRemove={(i) => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
        />

        {/* Template Banner */}
        <TemplateBanner
          selectedTemplate={selectedTemplate}
          templateVars={templateVars}
          templateName={
            selectedTemplate === '_ai_generated' ? autoComposeName || 'AI Generated' : undefined
          }
          recipientEmail={toStr}
          onEditTemplate={() => {
            if (!html && templateHtml) {
              setHtml(getPreviewHtml());
              setTemplateHtml(null);
              setSelectedTemplate(null);
            }
            setPreviewMode(false);
          }}
          onClearTemplate={() => {
            setTemplateHtml(null);
            setSelectedTemplate(null);
            setTemplateVars({});
            setPreviewMode(false);
          }}
          onVariableChange={(key, value) => setTemplateVars((prev) => ({ ...prev, [key]: value }))}
          onRemoveVariable={(key) => {
            setTemplateVars((prev) => {
              const next = { ...prev };
              delete next[key];
              return next;
            });
            if (templateHtml) {
              setTemplateHtml(templateHtml.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), ''));
            }
          }}
          onApplySuggestions={() => {
            // suggestions already applied via onVariableChange in TemplateBanner
          }}
        />

        {/* AI Improve Panel */}
        <AIImprovePanel
          open={showImprove}
          html={getPreviewHtml() || html}
          onClose={() => setShowImprove(false)}
          onApply={(improvedHtml) => {
            if (templateHtml) {
              // Template mode: apply to template HTML
              setTemplateHtml(improvedHtml);
            } else {
              setHtml(improvedHtml);
            }
            setEditorKey((prev) => prev + 1);
          }}
        />

        {/* Body */}
        <div className="relative">
          {previewMode ? (
            <div className="min-h-[400px] p-4 sm:p-6">
              <div
                className="mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-700 dark:text-gray-900"
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
            <div className="p-4">
              <RichTextEditor
                key={editorKey}
                value={html}
                onChange={setHtml}
                placeholder="Write your email here... Use the toolbar above to format text."
                recipientName={toStr.split(',')[0]?.trim()}
                subject={subject}
              />
            </div>
          )}
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
              <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 sm:mx-6 dark:border-red-800/40 dark:bg-red-900/15">
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

        {/* Follow-up Suggestion */}
        <AnimatePresence>
          {followUpSuggestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-4 mb-4 flex items-start gap-3 rounded-xl border border-blue-200/60 bg-blue-50/80 px-4 py-3 sm:mx-6 dark:border-blue-800/40 dark:bg-blue-900/15">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Follow up in {followUpSuggestion.suggestedDays} day
                    {followUpSuggestion.suggestedDays !== 1 ? 's' : ''}
                  </p>
                  <p className="mt-0.5 text-xs text-blue-600/80 dark:text-blue-300/80">
                    {followUpSuggestion.message}
                  </p>
                  <p className="mt-0.5 text-[10px] text-blue-500/60 dark:text-blue-400/60">
                    Reason: {followUpSuggestion.reason}
                  </p>
                </div>
                <button
                  onClick={() => setFollowUpSuggestion(null)}
                  className="shrink-0 text-blue-400 hover:text-blue-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer toolbar */}
        <div className="flex flex-col items-stretch justify-between gap-4 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:gap-0 sm:px-6 dark:border-gray-800">
          <div className="flex items-center justify-center gap-1 sm:justify-start">
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

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <TemplatePicker selectedTemplate={selectedTemplate} onSelect={loadTemplate} />

            <button
              onClick={() => setShowImprove(true)}
              disabled={!html && !templateHtml}
              className="text-brand-gold hover:bg-brand-gold/10 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Improve</span>
            </button>

            <div className="relative">
              <button
                onClick={handleSuggestSubject}
                disabled={!html && !templateHtml}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-600 transition-all hover:bg-amber-50 disabled:opacity-50 dark:hover:bg-amber-500/10"
              >
                {subjectSuggesting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Lightbulb className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Subject</span>
              </button>

              {showSubjectSuggestions && subjectSuggestions && (
                <div className="dark:bg-brand-dark-surface absolute right-0 bottom-full z-50 mb-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700">
                  <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
                    <span className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase">
                      Suggested Subjects
                    </span>
                  </div>
                  <div className="p-2">
                    {subjectSuggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleApplySubject(s)}
                        className="flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-gray-700 transition-colors hover:bg-amber-50 dark:text-gray-300 dark:hover:bg-amber-500/10"
                      >
                        <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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

      <ContactPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedEmails={selectedEmailSet}
        onToggle={handleToggleContact}
        onSelectAll={handleSelectAllContacts}
      />
    </div>
  );
}
