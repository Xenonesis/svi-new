import { useEffect } from 'react';
import { saveDraft, loadDraft, clearDraft } from '../helpers';

export interface UseEmailDraftProps {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  html: string;
  replyTo: string;
  fromName: string;
  setDraftSaved: (val: boolean) => void;
  setHasDraft: (val: boolean) => void;
  setTo: (val: string) => void;
  setCc: (val: string) => void;
  setBcc: (val: string) => void;
  setSubjectTemplate: (val: string) => void;
  setHtml: (val: string) => void;
  setReplyTo: (val: string) => void;
  setFromName: (val: string) => void;
}

export function useEmailDraft({
  to,
  cc,
  bcc,
  subject,
  html,
  replyTo,
  fromName,
  setDraftSaved,
  setHasDraft,
  setTo,
  setCc,
  setBcc,
  setSubjectTemplate,
  setHtml,
  setReplyTo,
  setFromName,
}: UseEmailDraftProps) {
  // Load saved draft on mount
  useEffect(() => {
    loadDraft().then((saved) => {
      if (saved && saved.to) setHasDraft(true);
    });
  }, [setHasDraft]);

  // Auto-save draft every 5s
  useEffect(() => {
    if (!to && !subject && !html) return;
    const timer = setInterval(() => {
      saveDraft({ to, cc, bcc, subject, html, replyTo, fromName }).then();
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 5000);
    return () => clearInterval(timer);
  }, [to, cc, bcc, subject, html, replyTo, fromName, setDraftSaved]);

  const restoreDraft = async () => {
    const saved = await loadDraft();
    if (saved) {
      setTo(saved.to || '');
      setCc(saved.cc || '');
      setBcc(saved.bcc || '');
      setSubjectTemplate(saved.subject || '');
      setHtml(saved.html || '');
      setReplyTo(saved.replyTo || '');
      setFromName(saved.fromName || 'SVI Infra');
      setHasDraft(false);
    }
  };

  const handleClearDraft = async () => {
    await clearDraft();
    setHasDraft(false);
  };

  return { restoreDraft, handleClearDraft };
}
