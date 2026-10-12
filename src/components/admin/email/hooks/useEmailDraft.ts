import { useEffect, useRef } from 'react';
import { saveDraft, loadDraft, clearDraft } from '../helpers';
import type { EmailAttachment } from '../types';

export interface UseEmailDraftProps {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  html: string;
  quotedHtml?: string | null;
  replyTo: string;
  fromName: string;
  templateHtml?: string | null;
  selectedTemplate?: string | null;
  templateVars?: Record<string, string>;
  previewMode?: boolean;
  subjectTemplate?: string;
  toRecipients?: any[];
  ccRecipients?: any[];
  bccRecipients?: any[];
  inReplyToMessageId?: string | null;
  attachments?: EmailAttachment[];
  setDraftSaved: (val: boolean) => void;
  setHasDraft: (val: boolean) => void;
  setTo: (val: string) => void;
  setCc: (val: string) => void;
  setBcc: (val: string) => void;
  setSubjectTemplate: (val: string) => void;
  setHtml: (val: string) => void;
  setQuotedHtml?: (val: string | null) => void;
  setReplyTo: (val: string) => void;
  setFromName: (val: string) => void;
  setTemplateHtml?: (val: string | null) => void;
  setSelectedTemplate?: (val: string | null) => void;
  setTemplateVars?: (val: Record<string, string>) => void;
  setPreviewMode?: (val: boolean) => void;
  setEditorKey?: (val: any) => void;
  setInReplyToMessageId?: (val: string | null) => void;
  setAttachments?: (val: EmailAttachment[]) => void;
}

export function useEmailDraft({
  to,
  cc,
  bcc,
  subject,
  html,
  quotedHtml,
  replyTo,
  fromName,
  templateHtml,
  selectedTemplate,
  templateVars,
  previewMode,
  subjectTemplate,
  toRecipients,
  ccRecipients,
  bccRecipients,
  inReplyToMessageId,
  attachments,
  setDraftSaved,
  setHasDraft,
  setTo,
  setCc,
  setBcc,
  setSubjectTemplate,
  setHtml,
  setQuotedHtml,
  setReplyTo,
  setFromName,
  setTemplateHtml,
  setSelectedTemplate,
  setTemplateVars,
  setPreviewMode,
  setEditorKey,
  setInReplyToMessageId,
  setAttachments,
}: UseEmailDraftProps) {
  const lastSavedFingerprintRef = useRef<string>('');

  // Check if draft exists on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isPrefillUrl =
        params.get('prefillOffer') === 'true' ||
        params.get('prefillAllotment') === 'true' ||
        params.get('prefillBba') === 'true' ||
        params.get('prefillReceipt') === 'true' ||
        params.get('prefillRegistration') === 'true' ||
        params.get('prefillQuotation') === 'true';
      if (isPrefillUrl) {
        return;
      }
    }

    loadDraft().then((saved) => {
      if (
        saved &&
        (saved.to ||
          saved.subject ||
          saved.html ||
          saved.quotedHtml ||
          saved.templateHtml ||
          saved.selectedTemplate ||
          (saved.templateVars && Object.keys(saved.templateVars).length > 0) ||
          (saved.attachments && saved.attachments.length > 0))
      ) {
        setHasDraft(true);
      }
    });
  }, [setHasDraft]);

  // Continuous auto-save (instant local + debounced dirty-check backend)
  useEffect(() => {
    const hasContent = Boolean(
      to ||
      subject ||
      html ||
      quotedHtml ||
      templateHtml ||
      selectedTemplate ||
      (templateVars && Object.keys(templateVars).length > 0) ||
      (attachments && attachments.length > 0)
    );
    if (!hasContent) return;

    const draftPayload = {
      to,
      cc,
      bcc,
      subject,
      html,
      quotedHtml,
      replyTo,
      fromName,
      templateHtml,
      selectedTemplate,
      templateVars,
      previewMode,
      subjectTemplate,
      toRecipients,
      ccRecipients,
      bccRecipients,
      inReplyToMessageId,
      attachments,
    };

    // Immediate local save
    try {
      localStorage.setItem(
        'svi-email-active-draft',
        JSON.stringify({
          ...draftPayload,
          savedAt: Date.now(),
        })
      );
    } catch {
      // ignore
    }

    // Compute fingerprint to avoid redundant database writes
    const currentFingerprint = JSON.stringify(draftPayload);
    if (currentFingerprint === lastSavedFingerprintRef.current) {
      return;
    }

    // Debounced backend save: fires 1500ms after user stops typing
    const timer = setTimeout(async () => {
      try {
        await saveDraft(draftPayload);
        lastSavedFingerprintRef.current = currentFingerprint;
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch {
        // Network or session error handled gracefully
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    to,
    cc,
    bcc,
    subject,
    html,
    quotedHtml,
    replyTo,
    fromName,
    templateHtml,
    selectedTemplate,
    templateVars,
    previewMode,
    subjectTemplate,
    toRecipients,
    ccRecipients,
    bccRecipients,
    inReplyToMessageId,
    attachments,
    setDraftSaved,
  ]);

  const restoreDraft = async () => {
    const saved = await loadDraft();
    if (saved) {
      setTo(saved.to || '');
      setCc(saved.cc || '');
      setBcc(saved.bcc || '');
      setSubjectTemplate(saved.subjectTemplate || saved.subject || '');
      setHtml(saved.html || '');
      setQuotedHtml?.(saved.quotedHtml || null);
      setReplyTo(saved.replyTo || '');
      setFromName(saved.fromName || 'SVI Infra');
      if (saved.templateHtml || saved.selectedTemplate) {
        setTemplateHtml?.(saved.templateHtml || null);
        setSelectedTemplate?.(saved.selectedTemplate || null);
        setTemplateVars?.(saved.templateVars || {});
        setPreviewMode?.(saved.previewMode ?? true);
      } else {
        setTemplateHtml?.(null);
        setSelectedTemplate?.(null);
        setTemplateVars?.({});
        setPreviewMode?.(false);
      }
      if (saved.inReplyToMessageId !== undefined) {
        setInReplyToMessageId?.(saved.inReplyToMessageId);
      }
      if (saved.attachments && saved.attachments.length > 0) {
        setAttachments?.(saved.attachments);
      }
      setEditorKey?.((prev: number) => prev + 1);
      // Update fingerprint so restore doesn't immediately re-save to backend
      lastSavedFingerprintRef.current = JSON.stringify({
        to: saved.to || '',
        cc: saved.cc || '',
        bcc: saved.bcc || '',
        subject: saved.subjectTemplate || saved.subject || '',
        html: saved.html || '',
        quotedHtml: saved.quotedHtml || null,
        replyTo: saved.replyTo || '',
        fromName: saved.fromName || 'SVI Infra',
        templateHtml: saved.templateHtml || null,
        selectedTemplate: saved.selectedTemplate || null,
        templateVars: saved.templateVars || {},
        previewMode: saved.previewMode ?? false,
        subjectTemplate: saved.subjectTemplate || saved.subject || '',
        toRecipients: saved.toRecipients,
        ccRecipients: saved.ccRecipients,
        bccRecipients: saved.bccRecipients,
        inReplyToMessageId: saved.inReplyToMessageId,
        attachments: saved.attachments,
      });
      setHasDraft(false);
    }
  };

  const handleClearDraft = async () => {
    await clearDraft();
    lastSavedFingerprintRef.current = '';
    setHasDraft(false);
  };

  return { restoreDraft, handleClearDraft };
}
