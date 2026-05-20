import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

function generateTicketId(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `SVI-${digits}`;
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, email, phone, category, subject, description } = body;

  if (!name || !email || !phone || !category || !subject || !description) {
    return NextResponse.json(
      { error: 'All fields (name, email, phone, category, subject, description) are required' },
      { status: 400 }
    );
  }

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
    // If it's a duplicate ticket_id, retry once
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
        return NextResponse.json({ error: 'Failed to submit grievance' }, { status: 500 });
      }

      return await sendGrievanceResponse(retryData, retryTicketId);
    }
    return NextResponse.json({ error: 'Failed to submit grievance' }, { status: 500 });
  }

  return await sendGrievanceResponse(data, ticketId);
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
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@sviinfra.com';

      await resend.emails.send({
        from: 'SVI Infra <noreply@sviiinfrasolutions.com>',
        to: adminEmail,
        subject: `New Grievance #${ticketId}: ${data.subject}`,
        html: `
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
        `,
      });
    }
  } catch (emailError) {
    console.error('Grievance email notification failed:', emailError);
  }

  return NextResponse.json(
    { success: true, id: data.id, ticket_id: data.ticket_id },
    { status: 201 }
  );
}
