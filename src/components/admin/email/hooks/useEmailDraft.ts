import { useEffect } from 'react';
import { saveDraft, loadDraft, clearDraft } from '../helpers';

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
}: UseEmailDraftProps) {
  // Check if draft exists on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isPrefillUrl =
        params.get('prefillOffer') === 'true' ||
        params.get('prefillAllotment') === 'true' ||
        params.get('prefillBba') === 'true' ||
        params.get('prefillReceipt') === 'true' ||
        params.get('prefillRegistration') === 'true';

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
          (saved.templateVars && Object.keys(saved.templateVars).length > 0))
      ) {
        setHasDraft(true);
      }
    });
  }, [setHasDraft]);

  // Continuous auto-save (instant local + interval backend)
  useEffect(() => {
    const hasContent = Boolean(
      to ||
      subject ||
      html ||
      quotedHtml ||
      templateHtml ||
      selectedTemplate ||
      (templateVars && Object.keys(templateVars).length > 0)
    );
    if (!hasContent) return;

    // Immediate local save
    try {
      localStorage.setItem(
        'svi-email-active-draft',
        JSON.stringify({
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
          savedAt: Date.now(),
        })
      );
    } catch {
      // ignore
    }

    const timer = setInterval(() => {
      saveDraft({
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
      }).then();
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 5000);
    return () => clearInterval(timer);
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
      setEditorKey?.((prev: number) => prev + 1);
      setHasDraft(false);
    }
  };

  const handleClearDraft = async () => {
    await clearDraft();
    setHasDraft(false);
  };

  return { restoreDraft, handleClearDraft };
}
