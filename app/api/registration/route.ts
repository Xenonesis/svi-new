import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, email, phone, property_interest, message } = body;

  if (!name || !email || !phone || !property_interest) {
    return NextResponse.json(
      { error: 'Name, email, phone, and property_interest are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('registrations')
    .insert({
      name,
      email,
      phone,
      property_interest,
      message: message || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Registration submission error:', error.message);
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
  }

  // Send email notification (non-blocking)
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@sviinfra.com';

      await resend.emails.send({
        from: 'SVI Infra <noreply@sviiinfrasolutions.com>',
        to: adminEmail,
        subject: `New Registration: ${name} - ${property_interest.replace(/_/g, ' ')}`,
        html: `
          <h2>New Property Registration</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold">Name:</td><td style="padding:8px">${name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Email:</td><td style="padding:8px">${email}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Phone:</td><td style="padding:8px">${phone}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Property Interest:</td><td style="padding:8px">${property_interest.replace(/_/g, ' ')}</td></tr>
          </table>
          ${message ? `<p style="margin-top:16px"><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>` : ''}
        `,
      });
    }
  } catch (emailError) {
    console.error('Registration email notification failed:', emailError);
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
