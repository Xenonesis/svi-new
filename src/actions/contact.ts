'use server';

import { contactSchema } from '@/src/lib/api/schemas';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { escapeHtml } from '@/src/lib/utils/escape';

interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

export async function submitContactForm(formData: FormData): Promise<ActionResult> {
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat()[0];
    return { success: false, error: firstError || 'Validation failed' };
  }

  const { name, email, phone, subject, message } = parsed.data;

  const { data: inserted, error } = await supabaseAdmin
    .from('contact_submissions')
    .insert({ name, email, phone, subject, message })
    .select()
    .single();

  if (error) {
    console.error('Contact submission error:', error.message);
    return { success: false, error: 'Failed to submit form. Please try again.' };
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);

      let adminEmail = process.env.ADMIN_EMAIL || 'admin@sviinfra.com';
      let notifyOnContact = true;
      let senderName = 'SVI Infra';
      let senderEmail = 'noreply@sviiinfrasolutions.com';

      try {
        const { data: emailSetting } = await supabaseAdmin
          .from('portal_settings')
          .select('value')
          .eq('key', 'email_settings')
          .single();

        if (emailSetting?.value && typeof emailSetting.value === 'object') {
          const val = emailSetting.value as any;
          if (val.admin_email) adminEmail = val.admin_email;
          if (val.notify_on_contact !== undefined) notifyOnContact = !!val.notify_on_contact;
          if (val.sender_name) senderName = val.sender_name;
          if (val.sender_email) senderEmail = val.sender_email;
        }
      } catch (settingsErr) {
        console.warn('Failed to load email settings, using fallback:', settingsErr);
      }

      if (notifyOnContact) {
        const mailSubject = `[SYSTEM-AUTO] New Contact Form: ${subject}`;
        await resend.emails.send({
          from: `${senderName} <${senderEmail}>`,
          to: adminEmail,
          subject: mailSubject,
          headers: {
            'X-Auto-Response': 'true',
            'X-System-Generated': 'true',
            'X-SVI-Event': 'contact_form',
          },
          tags: [
            { name: 'category', value: 'system_automation' },
            { name: 'event', value: 'contact_form' },
          ],
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
              <div style="text-align: right; margin-bottom: 15px;">
                <span style="background-color: #d4af37; color: #ffffff; font-size: 9px; font-weight: bold; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                  ✨ System Automated Notification
                </span>
              </div>
              <h2>New Contact Form Submission</h2>
              <table style="border-collapse:collapse;width:100%">
                <tr><td style="padding:8px;font-weight:bold">Name:</td><td style="padding:8px">${escapeHtml(name)}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Email:</td><td style="padding:8px">${escapeHtml(email)}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Phone:</td><td style="padding:8px">${escapeHtml(phone)}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Subject:</td><td style="padding:8px">${escapeHtml(subject)}</td></tr>
              </table>
              <p style="margin-top:16px"><strong>Message:</strong></p>
              <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
            </div>
          `,
        });

        try {
          await NotificationHelper.emailDispatched(adminEmail, mailSubject, inserted.id);
        } catch (notifErr) {
          console.error('Failed to log email dispatched system alert:', notifErr);
        }
      }
    }
  } catch (emailError: any) {
    console.error('Contact email notification failed:', emailError);
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@sviinfra.com';
      await NotificationHelper.emailDispatchFailed(
        adminEmail,
        emailError.message || String(emailError),
        inserted.id
      );
    } catch (notifErr) {
      console.error('Failed to log email dispatch failure:', notifErr);
    }
  }

  return { success: true, id: inserted.id };
}
