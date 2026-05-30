import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, email, phone, subject, message } = body;

  if (!name || !email || !phone || !subject || !message) {
    return NextResponse.json(
      { error: 'All fields (name, email, phone, subject, message) are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('contact_submissions')
    .insert({ name, email, phone, subject, message })
    .select()
    .single();

  if (error) {
    console.error('Contact submission error:', error.message);
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }

  // Send email notification (non-blocking)
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);

      // Fetch dynamic admin email setting from database
      let adminEmail = process.env.ADMIN_EMAIL || 'admin@sviinfra.com';
      try {
        const { data: emailSetting } = await supabaseAdmin
          .from('portal_settings')
          .select('value')
          .eq('key', 'email_settings')
          .single();

        if (emailSetting?.value && typeof emailSetting.value === 'object') {
          const val = emailSetting.value as any;
          if (val.admin_email) adminEmail = val.admin_email;
        }
      } catch (settingsErr) {
        console.warn(
          'Failed to load email settings from DB for contact form, using fallback:',
          settingsErr
        );
      }

      await resend.emails.send({
        from: 'SVI Infra <noreply@sviiinfrasolutions.com>',
        to: adminEmail,
        subject: `New Contact Form: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold">Name:</td><td style="padding:8px">${name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Email:</td><td style="padding:8px">${email}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Phone:</td><td style="padding:8px">${phone}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Subject:</td><td style="padding:8px">${subject}</td></tr>
          </table>
          <p style="margin-top:16px"><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      });
    }
  } catch (emailError) {
    // Silently skip email failure — submission already succeeded
    console.error('Contact email notification failed:', emailError);
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
