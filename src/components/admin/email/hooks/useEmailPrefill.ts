import { useEffect } from 'react';
import { EMAIL_TEMPLATES } from '../constants';
import type { ForwardData, ReplyData, TemplatePrefill, DraftData } from '../types';

export interface EmailPrefillSetters {
  setTo: (val: string) => void;
  setCc: (val: string) => void;
  setBcc: (val: string) => void;
  setSubjectTemplate: (val: string) => void;
  setHtml: (val: string) => void;
  setQuotedHtml: (val: string | null) => void;
  setTemplateHtml: (val: string | null) => void;
  setSelectedTemplate: (val: string | null) => void;
  setInReplyToMessageId: (val: string | null) => void;
  setAttachments: (val: any[]) => void;
  setEditorKey: (val: any) => void;
  setReplyTo: (val: string) => void;
  setFromName: (val: string) => void;
  setScheduledAt: (val: string | null) => void;
  setTemplateVars: (val: Record<string, string>) => void;
  setPreviewMode: (val: boolean) => void;
}

export interface UseEmailPrefillProps {
  adminEmail: string;
  forwardData?: ForwardData | null;
  replyData?: ReplyData | null;
  templatePrefill?: TemplatePrefill | null;
  draftData?: DraftData | null;
  replyTo: string;
  onClearPrefill?: () => void;
  setters: EmailPrefillSetters;
}

export function useEmailPrefill({
  adminEmail,
  forwardData,
  replyData,
  templatePrefill,
  draftData,
  replyTo,
  onClearPrefill,
  setters,
}: UseEmailPrefillProps) {
  const {
    setTo,
    setCc,
    setBcc,
    setSubjectTemplate,
    setHtml,
    setQuotedHtml,
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
  } = setters;

  // Prefill replyTo with default reply addresses
  useEffect(() => {
    if (adminEmail && !replyTo) {
      setReplyTo(`info@sviinfrasolutions.com, ${adminEmail}`);
    }
  }, [adminEmail, replyTo, setReplyTo]);

  // Apply forward prefill
  useEffect(() => {
    if (forwardData) {
      setTo('');
      setCc('');
      setBcc('');
      setSubjectTemplate(forwardData.subject);
      setHtml(forwardData.html);
      setQuotedHtml(null);
      setTemplateHtml(null);
      setSelectedTemplate(null);
      setInReplyToMessageId(null);
      setAttachments(forwardData.attachments || []);
      setEditorKey((prev: number) => prev + 1);
      onClearPrefill?.();
    }
  }, [
    forwardData,
    onClearPrefill,
    setTo,
    setCc,
    setBcc,
    setSubjectTemplate,
    setHtml,
    setQuotedHtml,
    setTemplateHtml,
    setSelectedTemplate,
    setInReplyToMessageId,
    setAttachments,
    setEditorKey,
  ]);

  // Apply reply prefill
  useEffect(() => {
    if (replyData) {
      setTo(replyData.to);
      setCc(replyData.cc?.join(', ') || '');
      setBcc('');
      setSubjectTemplate(replyData.subject);
      setHtml(replyData.html || '');
      setQuotedHtml(replyData.quotedHtml || null);
      setTemplateHtml(null);
      setSelectedTemplate(null);
      setInReplyToMessageId(replyData.originalMessageId || null);
      setAttachments(replyData.attachments || []);
      setEditorKey((prev: number) => prev + 1);
      onClearPrefill?.();
    }
  }, [
    replyData,
    onClearPrefill,
    setTo,
    setCc,
    setBcc,
    setSubjectTemplate,
    setHtml,
    setQuotedHtml,
    setTemplateHtml,
    setSelectedTemplate,
    setInReplyToMessageId,
    setAttachments,
    setEditorKey,
  ]);

  // Apply template prefill
  useEffect(() => {
    if (templatePrefill) {
      setSubjectTemplate(templatePrefill.subject);
      setHtml(templatePrefill.html);
      setQuotedHtml(null);
      setTemplateHtml(null);
      setSelectedTemplate(null);
      setInReplyToMessageId(null);
      setEditorKey((prev: number) => prev + 1);
      onClearPrefill?.();
    }
  }, [
    templatePrefill,
    onClearPrefill,
    setSubjectTemplate,
    setHtml,
    setQuotedHtml,
    setTemplateHtml,
    setSelectedTemplate,
    setInReplyToMessageId,
    setEditorKey,
  ]);

  // Apply draft prefill
  useEffect(() => {
    if (draftData) {
      setTo(draftData.to || '');
      setCc(draftData.cc || '');
      setBcc(draftData.bcc || '');
      setSubjectTemplate(draftData.subject || '');
      setHtml(draftData.html || '');
      setQuotedHtml(draftData.quotedHtml || null);
      setReplyTo(draftData.replyTo || '');
      setFromName(draftData.fromName || 'SVI Infra');
      setTemplateHtml(null);
      setSelectedTemplate(null);
      setInReplyToMessageId(null);
      setAttachments([]);
      setScheduledAt(null);
      setEditorKey((prev: number) => prev + 1);
      onClearPrefill?.();
    }
  }, [
    draftData,
    onClearPrefill,
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
    setInReplyToMessageId,
    setAttachments,
    setScheduledAt,
    setEditorKey,
  ]);

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
              const edc = parseFloat(fd.edc) || 0;
              const base = area * bsp;
              const totalCost = base + base * (plc / 100) + edc;
              const edcInEmi = String(fd.edcInEmi) === 'true';
              const baseCost = totalCost - edc;
              const bookingPercent = parseFloat(fd.bookingPaymentPercent) || 10;
              const initialPayment = (edcInEmi ? baseCost : totalCost) * (bookingPercent / 100);

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
                    ? `<tr><td style="padding:10px;color:#333333;">2</td><td style="padding:10px;color:#333333;">Second Instalment</td><td style="padding:10px;text-align:right;color:#333333;">20%</td><td style="padding:10px;text-align:right;font-weight:bold;color:#333333;">₹${((edcInEmi ? baseCost : totalCost) * 0.2).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td></tr>`
                    : '',
                remainingPercent:
                  fd.showSecondInstalment === 'true'
                    ? `${100 - bookingPercent - 20}`
                    : `${100 - bookingPercent}`,

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
              setEditorKey((prev: number) => prev + 1);

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
  }, [
    setSubjectTemplate,
    setTemplateHtml,
    setSelectedTemplate,
    setTemplateVars,
    setHtml,
    setPreviewMode,
    setEditorKey,
    setTo,
  ]);

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
              setEditorKey((prev: number) => prev + 1);
            } else {
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
              setEditorKey((prev: number) => prev + 1);
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
  }, [
    setSubjectTemplate,
    setTemplateHtml,
    setSelectedTemplate,
    setTemplateVars,
    setHtml,
    setPreviewMode,
    setEditorKey,
    setTo,
  ]);

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
            setEditorKey((prev: number) => prev + 1);

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
  }, [
    setSubjectTemplate,
    setTemplateHtml,
    setSelectedTemplate,
    setTemplateVars,
    setHtml,
    setPreviewMode,
    setEditorKey,
    setTo,
  ]);

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
            setEditorKey((prev: number) => prev + 1);

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
  }, [
    setSubjectTemplate,
    setTemplateHtml,
    setSelectedTemplate,
    setTemplateVars,
    setHtml,
    setPreviewMode,
    setEditorKey,
    setTo,
  ]);

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

            setEditorKey((prev: number) => prev + 1);

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
  }, [
    adminEmail,
    setSubjectTemplate,
    setTemplateHtml,
    setSelectedTemplate,
    setTemplateVars,
    setHtml,
    setPreviewMode,
    setEditorKey,
    setTo,
  ]);
}
