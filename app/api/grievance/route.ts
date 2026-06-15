import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { validateBody } from '@/src/lib/api/validate';
import { grievanceSchema } from '@/src/lib/api/schemas';
import { created } from '@/src/lib/api/response';

function generateTicketId(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `SVI-${digits}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await validateBody(request, grievanceSchema);
    const { name, email, phone, category, subject, description } = body;
    const ticketId = generateTicketId();

    const { data, error } = await supabaseAdmin
      .from('grievances')
      .insert({
        name,
        email,
        phone,
        ticket_id: ticketId,
        category,
        subject,
        description,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Grievance submission error:', error.message);
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        const retryTicketId = generateTicketId();
        const { data: retryData, error: retryError } = await supabaseAdmin
          .from('grievances')
          .insert({
            name,
            email,
            phone,
            ticket_id: retryTicketId,
            category,
            subject,
            description,
            status: 'open',
          })
          .select()
          .single();

        if (retryError) {
          throw AppError.internal('Failed to submit grievance');
        }

        return await sendGrievanceResponse(retryData, retryTicketId);
      }
      throw AppError.internal('Failed to submit grievance');
    }

    return await sendGrievanceResponse(data, ticketId);
  } catch (err) {
    return handleApiError(err);
  }
}

async function sendGrievanceResponse(
  data: {
    id: string;
    ticket_id: string;
    name: string;
    email: string;
    phone: string;
    category: string;
    subject: string;
    description: string;
  },
  ticketId: string
) {
  // Send email notification (non-blocking)
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);

      // Fetch dynamic email settings from database
      let adminEmail = process.env.ADMIN_EMAIL || 'admin@sviinfra.com';
      let notifyOnGrievance = true;
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
          if (val.notify_on_grievance !== undefined) notifyOnGrievance = !!val.notify_on_grievance;
          if (val.sender_name) senderName = val.sender_name;
          if (val.sender_email) senderEmail = val.sender_email;
        }
      } catch (settingsErr) {
        console.warn(
          'Failed to load email settings from DB for grievance form, using fallback:',
          settingsErr
        );
      }

      // Trigger email send only if notify_on_grievance setting is enabled
      if (notifyOnGrievance) {
        const mailSubject = `[SYSTEM-AUTO] New Grievance #${ticketId}: ${data.subject}`;
        await resend.emails.send({
          from: `${senderName} <${senderEmail}>`,
          to: adminEmail,
          subject: mailSubject,
          headers: {
            'X-Auto-Response': 'true',
            'X-System-Generated': 'true',
            'X-SVI-Event': 'grievance_submission',
          },
          tags: [
            { name: 'category', value: 'system_automation' },
            { name: 'event', value: 'grievance_submission' },
          ],
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
              <div style="text-align: right; margin-bottom: 15px;">
                <span style="background-color: #d4af37; color: #ffffff; font-size: 9px; font-weight: bold; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; font-family: sans-serif;">
                  ✨ System Automated Notification
                </span>
              </div>
              <h2>New Grievance Submitted</h2>
              <p><strong>Ticket ID:</strong> ${ticketId}</p>
              <table style="border-collapse:collapse;width:100%">
                <tr><td style="padding:8px;font-weight:bold">Name:</td><td style="padding:8px">${data.name}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Email:</td><td style="padding:8px">${data.email}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Phone:</td><td style="padding:8px">${data.phone}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Category:</td><td style="padding:8px">${data.category}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Subject:</td><td style="padding:8px">${data.subject}</td></tr>
              </table>
              <p style="margin-top:16px"><strong>Description:</strong></p>
              <p>${data.description.replace(/\n/g, '<br>')}</p>
            </div>
          `,
        });

        // Trigger dynamic admin notification center alert
        try {
          await NotificationHelper.emailDispatched(adminEmail, mailSubject, ticketId);
        } catch (notifErr) {
          console.error('Failed to log email dispatched system alert:', notifErr);
        }
      } else {
        console.log(
          '[Email Audit] Grievance alerts are disabled in settings. Skipping email dispatch.'
        );
      }
    }
  } catch (emailError: any) {
    console.error('Grievance email notification failed:', emailError);
    // Log failure alert in notification center
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@sviinfra.com';
      await NotificationHelper.emailDispatchFailed(
        adminEmail,
        emailError.message || String(emailError),
        ticketId
      );
    } catch (notifErr) {
      console.error('Failed to log email dispatch failure system alert:', notifErr);
    }
  }

  return created({ success: true, id: data.id, ticket_id: data.ticket_id });
}
