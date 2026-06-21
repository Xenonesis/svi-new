'use client';

import { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { EMAIL_TEMPLATES } from './constants';
import { getToken, saveDraft, loadDraft, clearDraft, fileToBase64 } from './helpers';
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
import type { ForwardData, ReplyData, EmailAttachment, TemplatePrefill, DraftData } from './types';

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
  const [to, setTo] = useState('');
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved draft on mount
  useEffect(() => {
    loadDraft().then((saved) => {
      if (saved && saved.to) setHasDraft(true);
    });
  }, []);

  // Synchronize resolved subject with template variables and subject template
  useEffect(() => {
    setSubject(parseGetPreviewHtml(subjectTemplate, templateVars));
  }, [subjectTemplate, templateVars]);

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    setSubjectTemplate(val);
  };

  // Prefill replyTo with default reply addresses (both info@sviiinfrasolutions.com and adminEmail)
  useEffect(() => {
    if (adminEmail && !replyTo) {
      setReplyTo(`info@sviiinfrasolutions.com, ${adminEmail}`);
    }
  }, [adminEmail]);

  // Apply forward/reply prefills
  useEffect(() => {
    if (forwardData) {
      setTo('');
      setCc('');
      setBcc('');
      setSubjectTemplate(forwardData.subject);
      setHtml(forwardData.html);
      setTemplateHtml(null);
      setSelectedTemplate(null);
      setInReplyToMessageId(null);
      setAttachments(forwardData.attachments || []);
      setEditorKey((prev) => prev + 1);
      onClearPrefill?.();
    }
  }, [forwardData, onClearPrefill]);

  useEffect(() => {
    if (replyData) {
      setTo(replyData.to);
      setCc(replyData.cc?.join(', ') || '');
      setBcc('');
      setSubjectTemplate(replyData.subject);
      setHtml(replyData.html);
      setTemplateHtml(null);
      setSelectedTemplate(null);
      setInReplyToMessageId(replyData.originalMessageId || null);
      setAttachments(replyData.attachments || []);
      setEditorKey((prev) => prev + 1);
      onClearPrefill?.();
    }
  }, [replyData, onClearPrefill]);

  // Apply template prefill
  useEffect(() => {
    if (templatePrefill) {
      setSubjectTemplate(templatePrefill.subject);
      setHtml(templatePrefill.html);
      setTemplateHtml(null);
      setSelectedTemplate(null);
      setInReplyToMessageId(null);
      setEditorKey((prev) => prev + 1);
      onClearPrefill?.();
    }
  }, [templatePrefill, onClearPrefill]);

  // Apply draft prefill
  useEffect(() => {
    if (draftData) {
      setTo(draftData.to || '');
      setCc(draftData.cc || '');
      setBcc(draftData.bcc || '');
      setSubjectTemplate(draftData.subject || '');
      setHtml(draftData.html || '');
      setReplyTo(draftData.replyTo || '');
      setFromName(draftData.fromName || 'SVI Infra');
      setTemplateHtml(null);
      setSelectedTemplate(null);
      setInReplyToMessageId(null);
      setAttachments([]);
      setScheduledAt(null);
      setEditorKey((prev) => prev + 1);
      onClearPrefill?.();
    }
  }, [draftData, onClearPrefill]);

  // Handle prefill from Allotment Records
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('prefillAllotment') === 'true') {
        const stored = sessionStorage.getItem('emailPrefillRecord');
        if (stored) {
          try {
            const record = JSON.parse(stored);
            const fd = record.form_data;
            const tpl = EMAIL_TEMPLATES.find((t) => t.id === 'allotment_letter');

            if (tpl) {
              let processedSubject = tpl.subject;
              processedSubject = processedSubject.replace('{{projectName}}', fd.projectName || '');
              processedSubject = processedSubject.replace('{{unitNumber}}', fd.unitNumber || '');

              setSubjectTemplate(processedSubject);
              setTemplateHtml(tpl.html);
              setSelectedTemplate('allotment_letter');

              const area = parseFloat(fd.area) || 0;
              const bsp = parseFloat(fd.bsp) || 0;
              const plc = parseFloat(fd.plc) || 0;
              const base = area * bsp;
              const totalCost = base + base * (plc / 100);
              const initialPayment =
                totalCost * ((parseFloat(fd.bookingPaymentPercent) || 10) / 100);

              const vars: Record<string, string> = {
                salutation: fd.salutation || 'Mr.',
                clientName: fd.clientName || '',
                projectName: fd.projectName || '',
                ticketId: fd.ticketId || '',
                unitNumber: fd.unitNumber || '',
                area: fd.area || '',
                totalCost: totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
                paymentPlan: fd.paymentPlan || '',
                bookingDate: fd.bookingDate || '',
                bookingPercent: fd.bookingPaymentPercent || '10',
                initialPayment: initialPayment.toLocaleString('en-IN', {
                  maximumFractionDigits: 0,
                }),
                secondInstalmentRow:
                  fd.showSecondInstalment === 'true'
                    ? `<tr><td style="padding:10px;color:#333333;">2</td><td style="padding:10px;color:#333333;">Second Instalment</td><td style="padding:10px;text-align:right;color:#333333;">20%</td><td style="padding:10px;text-align:right;font-weight:bold;color:#333333;">₹${(totalCost * 0.2).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td></tr>`
                    : '',
                remainingPercent:
                  fd.showSecondInstalment === 'true'
                    ? `${100 - (parseFloat(fd.bookingPaymentPercent) || 10) - 20}`
                    : `${100 - (parseFloat(fd.bookingPaymentPercent) || 10)}`,
                emiCount: fd.emiCount || '12',
                advisorName: fd.advisorName || '',
                advisorNumber: fd.advisorNumber || '',
                advisorEmail: fd.advisorEmail || '',
                bankAccountName: 'Svi Infra Solutions Pvt. Ltd',
                bankAccountNo: '0894102000013837',
                bankName: 'IDBI BANK',
                bankIfsc: 'IBKL0000894',
              };

              setTemplateVars(vars);
              setHtml('');
              setPreviewMode(true);
              setEditorKey((prev) => prev + 1);

              if (fd.clientEmail) {
                setTo(fd.clientEmail);
              }
            }

            sessionStorage.removeItem('emailPrefillRecord');
            const newUrl = window.location.pathname + '?tab=compose';
            window.history.replaceState({}, '', newUrl);
          } catch (e) {
            console.error('Error prefilling allotment email:', e);
          }
        }
      }
    }
  }, []);

  // Handle prefill from Receipt Records
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('prefillReceipt') === 'true') {
        const stored = sessionStorage.getItem('emailPrefillRecord');
        if (stored) {
          try {
            const record = JSON.parse(stored);
            const fd = record.form_data;
            const tpl = EMAIL_TEMPLATES.find((t) => t.id === 'payment');

            const amountFormatted = parseFloat(fd.amount || '0').toLocaleString('en-IN', {
              maximumFractionDigits: 0,
            });

            if (tpl) {
              let processedSubject = tpl.subject;
              processedSubject = processedSubject.replace(
                '{{property_name}}',
                `Plot ${fd.plotNo || ''}`
              );
              processedSubject = processedSubject.replace('{{name}}', fd.name || '');

              setSubjectTemplate(processedSubject);
              setTemplateHtml(tpl.html);
              setSelectedTemplate('payment');

              const vars: Record<string, string> = {
                name: fd.salutation ? `${fd.salutation} ${fd.name}` : fd.name || '',
                property_name: `Plot ${fd.plotNo || ''} (${fd.plotSize || ''} Sq. Yds.)`,
                amount: amountFormatted,
                date: fd.date ? new Date(fd.date).toLocaleDateString('en-GB') : '',
                receipt_no: fd.receiptNo || '',
                portal_url: 'https://www.sviinfrasolutions.in',
              };

              setTemplateVars(vars);
              setHtml('');
              setPreviewMode(true);
              setEditorKey((prev) => prev + 1);
            } else {
              // Fallback: prefill subject + plain body with receipt details when no template
              setSubjectTemplate(`Payment Receipt - ${fd.receiptNo || ''} - ${fd.name || ''}`);
              setHtml(
                `
<div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:0 auto;">
  <h2 style="color:#111827;">Payment Receipt</h2>
  <p><strong>Receipt No:</strong> ${fd.receiptNo || 'N/A'}</p>
  <p><strong>Date:</strong> ${fd.date ? new Date(fd.date).toLocaleDateString('en-GB') : 'N/A'}</p>
  <p><strong>Client:</strong> ${fd.salutation ? `${fd.salutation} ` : ''}${fd.name || 'N/A'}</p>
  <p><strong>Amount:</strong> ₹${amountFormatted}</p>
  <p><strong>Payment Method:</strong> ${fd.paymentMethod || 'N/A'}</p>
  <p><strong>Plot No:</strong> ${fd.plotNo || 'N/A'} (${fd.plotSize || ''} Sq. Yds.)</p>
  <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
  <p style="color:#666;font-size:13px;">Please find the payment receipt attached for your records.</p>
</div>
`.trim()
              );
              setEditorKey((prev) => prev + 1);
            }

            sessionStorage.removeItem('emailPrefillRecord');
            const newUrl = window.location.pathname + '?tab=compose';
            window.history.replaceState({}, '', newUrl);
          } catch (e) {
            console.error('Error prefilling receipt email:', e);
          }
        }
      }
    }
  }, []);

  // Handle prefill from BBA Records
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('prefillBba') === 'true') {
        const stored = sessionStorage.getItem('emailPrefillRecord');
        if (stored) {
          try {
            const record = JSON.parse(stored);
            const fd = record.form_data;

            const area = parseFloat(fd.area) || 0;
            const bsp = parseFloat(fd.bsp) || 0;
            const plc = parseFloat(fd.plc) || 0;
            const totalCost = area * bsp + area * bsp * (plc / 100);
            const formattedCost = totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 });

            const tpl = EMAIL_TEMPLATES.find((t) => t.id === 'bba_document');

            if (tpl) {
              let processedSubject = tpl.subject;
              processedSubject = processedSubject.replace('{{projectName}}', fd.projectName || '');
              processedSubject = processedSubject.replace('{{unitNumber}}', fd.unitNumber || '');

              setSubjectTemplate(processedSubject);
              setTemplateHtml(tpl.html);
              setSelectedTemplate('bba_document');

              const vars: Record<string, string> = {
                salutation: fd.salutation || 'Mr.',
                clientName: fd.clientName || '',
                projectName: fd.projectName || '',
                unitNumber: fd.unitNumber || '',
                area: fd.area || '',
                totalCost: formattedCost,
                paymentPlan: fd.paymentPlan || '12',
                bookingDate: fd.bookingDate
                  ? new Date(fd.bookingDate).toLocaleDateString('en-GB')
                  : '',
                advisorName: fd.advisorName || '',
                advisorNumber: fd.advisorNumber || '',
                advisorEmail: fd.advisorEmail || '',
                bankAccountName: 'Svi Infra Solutions Pvt. Ltd',
                bankAccountNo: '0894102000013837',
                bankName: 'IDBI BANK',
                bankIfsc: 'IBKL0000894',
              };

              setTemplateVars(vars);
              setHtml('');
              setPreviewMode(true);
            } else {
              setSubjectTemplate(
                `BBA Document - ${fd.projectName || ''} - Unit ${fd.unitNumber || ''}`
              );
              setHtml(
                `
<div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:0 auto;">
  <h2 style="color:#111827;">Builder Buyer Agreement</h2>
  <p><strong>Client:</strong> ${fd.salutation ? `${fd.salutation} ` : ''}${fd.clientName || 'N/A'}</p>
  <p><strong>Project:</strong> ${fd.projectName || 'N/A'}</p>
  <p><strong>Unit / Plot:</strong> ${fd.unitNumber || 'N/A'} (${fd.area || ''} Sq. Yds.)</p>
  <p><strong>Total Cost:</strong> ₹${formattedCost}</p>
  <p><strong>Payment Plan:</strong> ${fd.paymentPlan || 'N/A'} Months</p>
  <p><strong>Booking Date:</strong> ${fd.bookingDate ? new Date(fd.bookingDate).toLocaleDateString('en-GB') : 'N/A'}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
  <p style="color:#666;font-size:13px;">Please find the BBA document attached for your records.</p>
</div>
`.trim()
              );
              setTemplateHtml(null);
              setSelectedTemplate(null);
              setPreviewMode(false);
            }
            setEditorKey((prev) => prev + 1);

            if (fd.email) {
              setTo(fd.email);
            }

            sessionStorage.removeItem('emailPrefillRecord');
            const newUrl = window.location.pathname + '?tab=compose';
            window.history.replaceState({}, '', newUrl);
          } catch (e) {
            console.error('Error prefilling BBA email:', e);
          }
        }
      }
    }
  }, []);

  // Handle prefill from Offer Letter Records
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('prefillOffer') === 'true') {
        const stored = sessionStorage.getItem('emailPrefillRecord');
        if (stored) {
          try {
            const record = JSON.parse(stored);
            const fd = record.form_data;

            const ctc = parseFloat(fd.salaryCtc) || 0;
            const formattedCtc = ctc.toLocaleString('en-IN', { maximumFractionDigits: 0 });

            const tpl = EMAIL_TEMPLATES.find((t) => t.id === 'offer_letter');

            if (tpl) {
              let processedSubject = tpl.subject;
              processedSubject = processedSubject.replace('{{designation}}', fd.designation || '');

              setSubjectTemplate(processedSubject);
              setTemplateHtml(tpl.html);
              setSelectedTemplate('offer_letter');

              const vars: Record<string, string> = {
                name: fd.name || '',
                designation: fd.designation || '',
                department: fd.department || '',
                reportingTo: fd.reportingTo || '',
                appointmentDate: fd.appointmentDate
                  ? new Date(fd.appointmentDate).toLocaleDateString('en-GB')
                  : '',
                location: fd.location || '',
                salaryCtc: formattedCtc,
                workingHoursStart: fd.workingHoursStart || '10:30 am',
                workingHoursEnd: fd.workingHoursEnd || '6:30 pm',
                workingDays: fd.workingDays || 'Wednesday to Monday',
                probationPeriod: fd.probationPeriod || '3',
              };

              setTemplateVars(vars);
              setHtml('');
              setPreviewMode(true);
            } else {
              setSubjectTemplate(`Offer Letter - ${fd.designation || ''} - ${fd.name || ''}`);
              setHtml(
                `
<div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:0 auto;">
  <h2 style="color:#111827;">Offer Letter</h2>
  <p><strong>Candidate:</strong> ${fd.name || 'N/A'}</p>
  <p><strong>Designation:</strong> ${fd.designation || 'N/A'}</p>
  <p><strong>Department:</strong> ${fd.department || 'N/A'}</p>
  <p><strong>Location:</strong> ${fd.location || 'N/A'}</p>
  <p><strong>Monthly CTC:</strong> ₹${formattedCtc}</p>
  <p><strong>Date of Joining:</strong> ${fd.appointmentDate ? new Date(fd.appointmentDate).toLocaleDateString('en-GB') : 'N/A'}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
  <p style="color:#666;font-size:13px;">Please find the offer letter attached.</p>
</div>
`.trim()
              );
              setTemplateHtml(null);
              setSelectedTemplate(null);
              setPreviewMode(false);
            }
            setEditorKey((prev) => prev + 1);

            if (fd.emailId) {
              setTo(fd.emailId);
            }

            sessionStorage.removeItem('emailPrefillRecord');
            const newUrl = window.location.pathname + '?tab=compose';
            window.history.replaceState({}, '', newUrl);
          } catch (e) {
            console.error('Error prefilling offer letter email:', e);
          }
        }
      }
    }
  }, []);

  // Handle prefill from Registration Records
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('prefillRegistration') === 'true') {
        const stored = sessionStorage.getItem('emailPrefillRegistration');
        if (stored) {
          try {
            const reg = JSON.parse(stored);
            const tpl = EMAIL_TEMPLATES.find((t) => t.id === 'registration_acknowledgment');

            if (tpl) {
              let processedSubject = tpl.subject;
              processedSubject = processedSubject.replace('firstName', reg.name || 'Client');
              processedSubject = processedSubject.replace(
                '{{submissionId}}',
                reg.submission_id || 'N/A'
              );

              setSubjectTemplate(processedSubject);
              setTemplateHtml(tpl.html);
              setSelectedTemplate('registration_acknowledgment');

              const vars: Record<string, string> = {
                firstName: reg.name || '',
                lastName: reg.last_name || '',
                submissionId: reg.submission_id || 'N/A',
                project: reg.project || reg.property_interest || 'N/A',
                propertyType: reg.property_type || 'N/A',
                propertySize: reg.property_size || 'N/A',
                advisorName: reg.advisor_name || 'N/A',
                paymentPlan: reg.payment_plan || 'N/A',
                schemeAmount: reg.scheme_amount || '0',
                adminEmail: adminEmail || 'hr.sviinfrasolutions@gmail.com',
              };

              setTemplateVars(vars);
              setHtml('');
              setPreviewMode(true);
            } else {
              setSubjectTemplate(`Registration Update - SVI Infra`);
              setHtml(
                `
<div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:0 auto;">
  <p>Dear ${reg.name || 'Client'},</p>
  <p>Thank you for registering with SVI Infra Solutions.</p>
  <p>Project Interest: ${reg.project || reg.property_interest || 'N/A'}</p>
  <br />
  <p>Best regards,<br>SVI Infra Team</p>
</div>
`.trim()
              );
              setTemplateHtml(null);
              setSelectedTemplate(null);
              setPreviewMode(false);
            }

            setEditorKey((prev) => prev + 1);

            if (reg.email) {
              setTo(reg.email);
            }

            sessionStorage.removeItem('emailPrefillRegistration');
            const newUrl = window.location.pathname + '?tab=compose';
            window.history.replaceState({}, '', newUrl);
          } catch (e) {
            console.error('Error prefilling registration email:', e);
          }
        }
      }
    }
  }, [adminEmail]);

  // Auto-save draft every 5s
  useEffect(() => {
    if (!to && !subject && !html) return;
    const timer = setInterval(() => {
      saveDraft({ to, cc, bcc, subject, html, replyTo, fromName }).then();
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 5000);
    return () => clearInterval(timer);
  }, [to, cc, bcc, subject, html, replyTo, fromName]);

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
    if (!to.trim() || !subject.trim() || !finalHtml.trim()) {
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
        setTimeout(() => {
          setSent(false);
          setTo('');
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

  const discardAll = async () => {
    setTo('');
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
    await clearDraft();
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
                onClick={async () => {
                  await clearDraft();
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
      <div className="dark:bg-brand-dark-surface overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
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
          to={to}
          cc={cc}
          bcc={bcc}
          subject={subject}
          fromName={fromName}
          replyTo={replyTo}
          adminEmail={adminEmail}
          forwardData={forwardData}
          replyData={replyData}
          scheduledAt={scheduledAt}
          onToChange={setTo}
          onCcChange={setCc}
          onBccChange={setBcc}
          onSubjectChange={handleSubjectChange}
          onFromNameChange={setFromName}
          onReplyToChange={setReplyTo}
          onScheduledAtChange={setScheduledAt}
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
          recipientEmail={to}
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
          onApplySuggestions={(suggestions) => {
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
            <div className="p-4">
              <RichTextEditor
                key={editorKey}
                value={html}
                onChange={setHtml}
                placeholder="Write your email here... Use the toolbar above to format text."
                recipientName={to.split(',')[0]?.trim()}
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

          <div className="flex items-center gap-2">
            <TemplatePicker selectedTemplate={selectedTemplate} onSelect={loadTemplate} />

            <button
              onClick={() => setShowImprove(true)}
              disabled={!html && !templateHtml}
              className="text-brand-gold hover:bg-brand-gold/10 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Improve</span>
            </button>

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
    </div>
  );
}
