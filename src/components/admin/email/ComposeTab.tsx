'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DraftRestoreBanner } from './compose/DraftRestoreBanner';
import { EmailHeader } from './compose/EmailHeader';
import { EmailBodyEditor } from './compose/EmailBodyEditor';
import { EmailAlerts } from './compose/EmailAlerts';
import { EmailToolbar } from './compose/EmailToolbar';
import { toast } from 'sonner';
import { EMAIL_TEMPLATES } from './constants';
import { getToken, clearDraft, fileToBase64 } from './helpers';
import {
  extractTemplateVars as parseExtractTemplateVars,
  getPreviewHtml as parseGetPreviewHtml,
} from '@/src/lib/utils/templateParser';
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
      <DraftRestoreBanner hasDraft={hasDraft} onRestore={restoreDraft} onClear={handleClearDraft} />

      {/* Compose Card */}
      <div className="dark:bg-brand-dark-surface overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/60">
        {/* Header */}
        <EmailHeader
          forwardData={forwardData}
          replyData={replyData}
          draftSaved={draftSaved}
          previewMode={previewMode}
          onTogglePreview={() => setPreviewMode(!previewMode)}
        />

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
        <EmailBodyEditor
          previewMode={previewMode}
          html={html}
          templateHtml={templateHtml}
          subject={subject}
          toStr={toStr}
          editorKey={editorKey}
          setHtml={setHtml}
          getPreviewHtml={getPreviewHtml}
        />

        {/* Error & Follow-up Suggestion */}
        <EmailAlerts
          error={error}
          onErrorDismiss={() => setError(null)}
          followUpSuggestion={followUpSuggestion}
          onFollowUpDismiss={() => setFollowUpSuggestion(null)}
        />

        {/* Footer toolbar */}
        <EmailToolbar
          sending={sending}
          sent={sent}
          html={html}
          templateHtml={templateHtml}
          selectedTemplate={selectedTemplate}
          subjectSuggesting={subjectSuggesting}
          showSubjectSuggestions={showSubjectSuggestions}
          subjectSuggestions={subjectSuggestions}
          fileInputRef={fileInputRef}
          onSend={handleSend}
          onLoadTemplate={loadTemplate}
          onShowImprove={() => setShowImprove(true)}
          onSuggestSubject={handleSuggestSubject}
          onApplySubject={handleApplySubject}
          onFileSelect={handleFileSelect}
          onDiscardAll={discardAll}
        />
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
